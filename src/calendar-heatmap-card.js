import { LitElement, html, css } from 'lit';
import { CARD_VERSION, DEFAULT_CONFIG } from './constants.js';
import { fetchHistory } from './services/history-service.js';
import { 
  processDailyTotals, 
  calculateMaxValue, 
  buildGameColorMap,
  calculateOverallTotals,
  findMostPlayedGame
} from './data/data-processor.js';
import { getHeatmapStartDate, buildWeeksArray, groupWeeksByMonth } from './utils/date-utils.js';
import { getThemeColors, createElement } from './utils/dom-utils.js';
import { createMonthHeader } from './ui/components/month-header.js';
import { createDayLabels } from './ui/components/day-labels.js';
import { createHeatmapGrid } from './ui/components/heatmap-grid.js';
import { updateDetailViewWithSummary, updateDetailViewWithDayDetails } from './ui/components/detail-view.js';
import { getStyles } from './ui/styles.js';

/**
 * Calendar Heatmap Card
 * A custom card for Home Assistant showing a calendar heatmap of entity activity
 */
class CalendarHeatmapCard extends LitElement {
  static get properties() {
    return {
      _config: { type: Object },
      _hass: { type: Object },
      _selectedDate: { type: String },
      _dailyTotals: { type: Object },
      _gameColorMap: { type: Object },
      _maxValue: { type: Number },
      _overallTotals: { type: Object },
      _bestGame: { type: String },
      _bestSec: { type: Number },
    };
  }

  static get styles() {
    return css`
      :host {
        display: block;
      }
      /* Styles will be loaded dynamically based on theme */
    `;
  }

  constructor() {
    super();
    this._hasConnected = false;
    this._interval = null;
    this._selectedDate = null;
    this._dailyTotals = {};
    this._gameColorMap = {};
    this._maxValue = 0;
    this._overallTotals = {};
    this._bestGame = "";
    this._bestSec = 0;
  }

  setConfig(config) {
    if (!config.entity) {
      throw new Error("You need to define an entity in your card configuration.");
    }
    // Merge defaults with user config
    this._config = {
      ...DEFAULT_CONFIG,
      ...config,
    };
    
    // If include_unknown is set to true, remove 'unknown' from ignored_states
    if (this._config.include_unknown === true && this._config.ignored_states.includes('unknown')) {
      this._config.ignored_states = this._config.ignored_states.filter(state => state !== 'unknown');
      console.log('Calendar Heatmap: Including unknown states, ignored states are now:', this._config.ignored_states);
    }
  }

  set hass(hass) {
    const oldHass = this._hass;
    this._hass = hass;
    
    // Debug logging for entity state
    if (this._config && this._config.entity && hass.states[this._config.entity]) {
      console.log('Calendar Heatmap: Entity state', this._config.entity, hass.states[this._config.entity].state);
    } else if (this._config && this._config.entity) {
      console.warn('Calendar Heatmap: Entity not found', this._config.entity);
    }
    
    // Only update if this is the first time setting hass or if the entity state has changed
    if (!oldHass || 
        !oldHass.states[this._config.entity] || 
        oldHass.states[this._config.entity].state !== hass.states[this._config.entity].state) {
      this._fetchData();
    }
  }

  getCardSize() {
    return 6;
  }

  connectedCallback() {
    super.connectedCallback();
    if (!this._hasConnected) {
      this._hasConnected = true;
      this._setupRefreshInterval();
      
      // Ensure data is fetched and detail view is populated on first connection
      this._fetchData().then(() => {
        if (this.shadowRoot) {
          const detailView = this.shadowRoot.querySelector('.detail-view');
          if (detailView) {
            this._updateDetailView(this._selectedDate || null);
          }
        }
      });
    } else {
      this._setupRefreshInterval();
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._clearRefreshInterval();
  }

  _setupRefreshInterval() {
    if (!this._interval) {
      const intervalMs = this._config.refresh_interval * 1000;
      if (intervalMs > 0) {
        this._interval = setInterval(() => this._fetchData(), intervalMs);
      }
    }
  }

  _clearRefreshInterval() {
    if (this._interval) {
      clearInterval(this._interval);
      this._interval = null;
    }
  }

  async _fetchData() {
    if (!this._hass || !this._config) {
      console.warn('Calendar Heatmap: No hass or config available');
      return Promise.resolve();
    }
    
    const entityId = this._config.entity;
    const daysToShow = this._config.days_to_show || DEFAULT_CONFIG.days_to_show;
    
    console.log('Calendar Heatmap: Fetching data for', entityId, 'with config:', this._config);
    
    try {
      // Fetch history data
      const historyData = await fetchHistory(this._hass, entityId, daysToShow);
      
      if (!historyData || historyData.length === 0 || !historyData[0] || historyData[0].length === 0) {
        console.warn('Calendar Heatmap: No history data returned for', entityId);
        return Promise.resolve();
      }
      
      console.log('Calendar Heatmap: Successfully fetched history with', historyData[0].length, 'entries');
      
      // Process the data
      const ignoredStates = this._config.ignored_states || DEFAULT_CONFIG.ignored_states;
      console.log('Calendar Heatmap: Using ignored states:', ignoredStates);
      
      const dailyTotals = processDailyTotals(historyData, ignoredStates);
      
      if (Object.keys(dailyTotals).length === 0) {
        console.warn('Calendar Heatmap: No daily totals generated. Check if all states are being filtered out.');
        return Promise.resolve();
      }
      
      // Calculate derived data
      this._dailyTotals = dailyTotals;
      this._maxValue = calculateMaxValue(dailyTotals);
      this._gameColorMap = buildGameColorMap(dailyTotals);
      this._overallTotals = calculateOverallTotals(dailyTotals);
      
      const { bestGame, bestSec } = findMostPlayedGame(this._overallTotals);
      this._bestGame = bestGame;
      this._bestSec = bestSec;
      
      console.log('Calendar Heatmap: Data processing complete', {
        dailyTotals: this._dailyTotals,
        maxValue: this._maxValue,
        gameColorMap: this._gameColorMap,
        overallTotals: this._overallTotals,
        bestGame: this._bestGame,
        bestSec: this._bestSec
      });
      
      // Request an update to render with new data
      this.requestUpdate();
      return Promise.resolve();
    } catch (error) {
      console.error('Calendar Heatmap: Error fetching or processing data', error);
      return Promise.reject(error);
    }
  }

  /**
   * Creates data object for the summary view
   * @returns {Object} Data for summary view
   * @private
   */
  _createSummaryData() {
    return {
      overallTotals: this._overallTotals,
      gameColorMap: this._gameColorMap,
      bestGame: this._bestGame,
      bestSec: this._bestSec
    };
  }

  /**
   * Creates data object for a specific day's details
   * @param {string} date - The date string (YYYY-MM-DD)
   * @returns {Object} Data for day details view
   * @private
   */
  _createDayData(date) {
    return {
      date: date,
      statesObj: this._dailyTotals[date] || {},
      gameColorMap: this._gameColorMap
    };
  }

  /**
   * Updates the detail view based on current state
   * @param {string|null} dateToShow - Date to show details for, or null for summary
   * @private
   */
  _updateDetailView(dateToShow) {
    const detailView = this.shadowRoot.querySelector('.detail-view');
    if (!detailView) return;

    if (dateToShow) {
      // Show specific day details
      const dayData = this._createDayData(dateToShow);
      updateDetailViewWithDayDetails(detailView, dayData);
    } else {
      // Show overall summary
      const summaryData = this._createSummaryData();
      updateDetailViewWithSummary(detailView, summaryData);
    }
  }

  /**
   * Handles cell hover events
   * Priority: Hover > Selection > Summary
   * @param {Object|null} data - Cell data or null when not hovering
   * @private
   */
  _onCellHover(data) {
    const detailView = this.shadowRoot.querySelector('.detail-view');
    if (!detailView) return;

    if (data) {
      // Always show details for the hovered cell, regardless of selection
      updateDetailViewWithDayDetails(detailView, data);
    } else if (!this._selectedDate) {
      // If no cell is selected and not hovering, show summary
      this._updateDetailView(null);
    } else {
      // If a cell is selected and we're not hovering, show the selected cell's details
      this._updateDetailView(this._selectedDate);
    }
  }

  /**
   * Handles cell click events
   * Toggles selection and updates detail view
   * @param {Object} data - Cell data
   * @private
   */
  _onCellClick(data) {
    // If clicking the already selected cell, deselect it
    if (this._selectedDate === data.date) {
      this._selectedDate = null;
      this._updateDetailView(null);
    } else {
      this._selectedDate = data.date;
      this._updateDetailView(data.date);
    }
    
    // Update the selected cell classes
    this._updateSelectedCellClasses();
    this.requestUpdate();
  }

  _updateSelectedCellClasses() {
    const heatmapGrid = this.shadowRoot.querySelector('.heatmap-grid');
    if (!heatmapGrid) return;

    // Remove 'selected' class from all cells
    const allCells = heatmapGrid.querySelectorAll('.day-cell');
    allCells.forEach(cell => {
      cell.classList.remove('selected');
    });
    
    // Add 'selected' class to the selected cell
    if (this._selectedDate) {
      const selectedCell = Array.from(allCells).find(cell => 
        cell._data && cell._data.date === this._selectedDate
      );
      if (selectedCell) {
        selectedCell.classList.add('selected');
      }
    }
  }

  render() {
    if (!this._config || !this._hass) {
      return html``;
    }

    // Add dynamic styles based on theme
    const styleText = getStyles(this._config.theme);
    const styleElement = document.createElement('style');
    styleElement.textContent = styleText;

    // Build calendar data
    const startDate = getHeatmapStartDate(this._config.days_to_show, this._config.start_day_of_week);
    const weeks = buildWeeksArray(startDate);
    const monthGroups = groupWeeksByMonth(weeks);

    // Create main card container
    const card = createElement('ha-card', {}, {});

    // Main content container
    const container = createElement('div', {}, {
      className: 'card-content flex-container flex-align-stretch'
    });

    // Left Panel: Heatmap Container
    const heatmapContainer = createElement('div', {}, {
      className: 'heatmap-container'
    });

    // Add title to the left panel
    const cardHeader = createElement('div', {}, {
      className: 'card-header',
      textContent: this._config.title || "Calendar Heatmap"
    });
    heatmapContainer.appendChild(cardHeader);

    // Right Panel: Detail View
    const detailView = createElement('div', {}, {
      className: 'detail-view'
    });

    // Create UI components
    const monthHeader = createMonthHeader(monthGroups, getComputedStyle(this));
    heatmapContainer.appendChild(monthHeader);

    // Build Main Grid: Day Labels + Heatmap
    const gridContainer = createElement('div', {}, {
      className: 'grid-container flex-container flex-align-start grid-container-spacing'
    });
    
    // Day labels column
    const dayLabels = createDayLabels(getComputedStyle(this), this._config.start_day_of_week);
    gridContainer.appendChild(dayLabels);

    // Calculate visible weeks based on available space
    // We'll limit the number of weeks to show to prevent scrolling
    const maxWeeks = Math.min(weeks.length, 52); // Limit to 52 weeks (1 year) maximum
    const visibleWeeks = weeks.slice(0, maxWeeks);

    // Create a wrapper for the heatmap grid to handle overflow better
    const heatmapGridWrapper = createElement('div', {}, {
      className: 'heatmap-grid-wrapper position-relative'
    });

    // Heatmap grid
    const heatmapGrid = createHeatmapGrid(
      visibleWeeks, 
      this._dailyTotals, 
      this._maxValue, 
      this._gameColorMap, 
      this._config.theme,
      (data) => this._onCellHover(data),
      (data) => this._onCellClick(data),
      this._selectedDate
    );
    
    heatmapGridWrapper.appendChild(heatmapGrid);
    gridContainer.appendChild(heatmapGridWrapper);
    heatmapContainer.appendChild(gridContainer);

    // Initialize detail view based on selection state
    if (this._selectedDate) {
      this._updateDetailView(this._selectedDate);
    } else {
      this._updateDetailView(null);
    }

    // Add panels to container
    container.appendChild(heatmapContainer);
    container.appendChild(detailView);

    card.appendChild(container);
    
    // Clear existing content and append new elements
    const shadowRoot = this.shadowRoot;
    shadowRoot.innerHTML = '';
    shadowRoot.appendChild(styleElement);
    shadowRoot.appendChild(card);
    
    // Ensure the detail view is populated immediately after rendering
    // This fixes the issue where the detail view is empty on initial load
    setTimeout(() => {
      if (this._selectedDate) {
        this._updateDetailView(this._selectedDate);
      } else {
        this._updateDetailView(null);
      }
    }, 0);
    
    return html``;
  }
}

export default CalendarHeatmapCard; 