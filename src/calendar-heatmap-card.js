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
      return;
    }
    
    const entityId = this._config.entity;
    const daysToShow = this._config.days_to_show || DEFAULT_CONFIG.days_to_show;
    
    console.log('Calendar Heatmap: Fetching data for', entityId, 'with config:', this._config);
    
    try {
      // Fetch history data
      const historyData = await fetchHistory(this._hass, entityId, daysToShow);
      
      if (!historyData || historyData.length === 0 || !historyData[0] || historyData[0].length === 0) {
        console.warn('Calendar Heatmap: No history data returned for', entityId);
        return;
      }
      
      console.log('Calendar Heatmap: Successfully fetched history with', historyData[0].length, 'entries');
      
      // Process the data
      const ignoredStates = this._config.ignored_states || DEFAULT_CONFIG.ignored_states;
      console.log('Calendar Heatmap: Using ignored states:', ignoredStates);
      
      const dailyTotals = processDailyTotals(historyData, ignoredStates);
      
      if (Object.keys(dailyTotals).length === 0) {
        console.warn('Calendar Heatmap: No daily totals generated. Check if all states are being filtered out.');
        return;
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
    } catch (error) {
      console.error('Calendar Heatmap: Error fetching or processing data', error);
    }
  }

  _onCellHover(data) {
    const detailView = this.shadowRoot.querySelector('.detail-view');
    if (!detailView) return;

    if (data) {
      // Always show details for the hovered cell, regardless of selection
      updateDetailViewWithDayDetails(detailView, data);
    } else if (!this._selectedDate) {
      // Only revert to summary if no cell is selected
      const defaultData = {
        overallTotals: this._overallTotals,
        gameColorMap: this._gameColorMap,
        bestGame: this._bestGame,
        bestSec: this._bestSec
      };
      updateDetailViewWithSummary(detailView, defaultData);
    } else {
      // If a cell is selected and we're not hovering, show the selected cell's details
      const selectedData = {
        date: this._selectedDate,
        statesObj: this._dailyTotals[this._selectedDate] || {},
        gameColorMap: this._gameColorMap
      };
      updateDetailViewWithDayDetails(detailView, selectedData);
    }
  }

  _onCellClick(data) {
    // If clicking the already selected cell, deselect it
    if (this._selectedDate === data.date) {
      this._selectedDate = null;
      const defaultData = {
        overallTotals: this._overallTotals,
        gameColorMap: this._gameColorMap,
        bestGame: this._bestGame,
        bestSec: this._bestSec
      };
      const detailView = this.shadowRoot.querySelector('.detail-view');
      if (detailView) {
        updateDetailViewWithSummary(detailView, defaultData);
      }
    } else {
      this._selectedDate = data.date;
      const detailView = this.shadowRoot.querySelector('.detail-view');
      if (detailView) {
        updateDetailViewWithDayDetails(detailView, data);
      }
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
      className: 'card-content'
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

    // Default data for detail view
    const defaultData = {
      overallTotals: this._overallTotals,
      gameColorMap: this._gameColorMap,
      bestGame: this._bestGame,
      bestSec: this._bestSec
    };
    
    // Initialize detail view with summary
    updateDetailViewWithSummary(detailView, defaultData);

    // Create UI components
    const monthHeader = createMonthHeader(monthGroups, getComputedStyle(this));
    heatmapContainer.appendChild(monthHeader);

    // Build Main Grid: Day Labels + Heatmap
    const gridContainer = createElement('div', {}, {
      className: 'grid-container'
    });
    
    // Day labels column
    const dayLabels = createDayLabels(getComputedStyle(this), this._config.start_day_of_week);
    gridContainer.appendChild(dayLabels);

    // Heatmap grid
    const heatmapGrid = createHeatmapGrid(
      weeks, 
      this._dailyTotals, 
      this._maxValue, 
      this._gameColorMap, 
      this._config.theme,
      (data) => this._onCellHover(data),
      (data) => this._onCellClick(data),
      this._selectedDate
    );
    gridContainer.appendChild(heatmapGrid);
    heatmapContainer.appendChild(gridContainer);

    // Add a subtle label to the detail view to indicate it's secondary
    const detailHeader = createElement('div', {}, {
      className: 'detail-header',
      textContent: 'Details'
    });
    detailView.insertBefore(detailHeader, detailView.firstChild);

    // Version/debug text - positioned at the bottom
    const secondaryTextColor = getComputedStyle(this).getPropertyValue("--secondary-text-color").trim() || "#888";
    const versionText = createElement('div', {}, {
      className: 'version-text',
      textContent: `Calendar Heatmap Card – Version: ${CARD_VERSION}`
    });
    detailView.appendChild(versionText);

    // Add panels to container
    container.appendChild(heatmapContainer);
    container.appendChild(detailView);

    card.appendChild(container);
    
    // Clear existing content and append new elements
    const shadowRoot = this.shadowRoot;
    shadowRoot.innerHTML = '';
    shadowRoot.appendChild(styleElement);
    shadowRoot.appendChild(card);
    
    return html``;
  }
}

export default CalendarHeatmapCard; 