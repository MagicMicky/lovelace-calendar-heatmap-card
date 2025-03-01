import { LitElement, html, css } from 'lit';
import { CARD_VERSION, DEFAULT_CONFIG } from './constants.js';
import { fetchHistory } from './services/history-service.js';
import { subscribeToEntity } from './services/entity-subscription.js';
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
    this._unsubscribe = null; // Store the unsubscribe function
    this._selectedDate = null;
    this._dailyTotals = {};
    this._gameColorMap = {};
    this._maxValue = 0;
    this._overallTotals = {};
    this._bestGame = "";
    this._bestSec = 0;
    this._lastEntityState = null;
    this._lastHistoryTimestamp = 0;
    this._themeObserver = null; // MutationObserver for theme changes
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
    }
  }

  set hass(hass) {
    const oldHass = this._hass;
    this._hass = hass;
    
    // Only fetch data on first connection or if hass connection changes
    // The subscription will handle updates when the entity state changes
    if (!oldHass || !this._hasConnected) {
      this._fetchData();
      
      // If we already have a connection, make sure our subscription is using it
      if (this._hasConnected) {
        this._setupSubscription();
      }
    }
  }

  getCardSize() {
    return 6;
  }

  connectedCallback() {
    super.connectedCallback();
    this._hasConnected = true;
    
    if (this._hass) {
      this._setupSubscription();
    }
    
    // Set up theme observer
    this._setupThemeObserver();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._unsubscribeFromEntity();
    
    // Clean up theme observer
    this._removeThemeObserver();
  }
  
  /**
   * Sets up a MutationObserver to detect theme changes in the document
   * This allows the card to automatically adapt to theme changes
   */
  _setupThemeObserver() {
    // Clean up any existing observer
    this._removeThemeObserver();
    
    // Create a new observer to watch for theme changes
    this._themeObserver = new MutationObserver((mutations) => {
      // When theme attributes change, re-render the card
      this.requestUpdate();
    });
    
    // Start observing the document for theme changes
    if (document.documentElement) {
      this._themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class', 'style'],
      });
    }
    
    // Also observe the card's parent elements for theme changes
    // This is needed for cards inside dashboards with different themes
    setTimeout(() => {
      try {
        // Find the card element in the DOM
        const card = this.shadowRoot?.querySelector('ha-card');
        if (card) {
          // Walk up the DOM tree to find theme-able parents
          let parent = card.parentElement;
          while (parent && parent !== document.documentElement) {
            this._themeObserver.observe(parent, {
              attributes: true,
              attributeFilter: ['class', 'style'],
            });
            parent = parent.parentElement;
          }
        }
      } catch (error) {
        console.warn('Calendar Heatmap: Error setting up parent theme observers', error);
      }
    }, 100);
  }
  
  /**
   * Removes the theme observer
   */
  _removeThemeObserver() {
    if (this._themeObserver) {
      this._themeObserver.disconnect();
      this._themeObserver = null;
    }
  }

  async _setupSubscription() {
    // Unsubscribe from any existing subscription
    this._unsubscribeFromEntity();
    
    // Subscribe to entity changes
    if (this._hass && this._config && this._config.entity) {
      this._unsubscribe = await subscribeToEntity(
        this._hass,
        this._config.entity,
        (newState) => {
          // Only update if the state has actually changed
          if (!this._lastEntityState || newState.state !== this._lastEntityState.state) {
            this._lastEntityState = newState;
            
            // Check if we should refresh history data
            const now = Date.now();
            const refreshInterval = (this._config.refresh_interval || 300) * 1000; // Convert to ms
            
            if (now - this._lastHistoryTimestamp > refreshInterval) {
              this._fetchData();
            }
          }
        }
      );
    }
  }

  _unsubscribeFromEntity() {
    if (this._unsubscribe) {
      this._unsubscribe();
      this._unsubscribe = null;
    }
  }

  async _fetchData() {
    if (!this._hass || !this._config) return;
    
    try {
      // Get history data for the entity
      const startDate = getHeatmapStartDate(this._config.days_to_show, this._config.start_day_of_week);
      const endDate = new Date(); // Current time
      
      // Fetch history with proper date validation
      const historyData = await fetchHistory(
        this._hass, 
        this._config.entity, 
        startDate, 
        endDate
      );
      
      // Process the data
      const ignoredStates = this._config.ignored_states || [];
      this._dailyTotals = processDailyTotals(historyData, ignoredStates);
      this._maxValue = calculateMaxValue(this._dailyTotals);
      
      // Create a color map for games/states
      const states = Object.values(this._dailyTotals)
        .flatMap(day => Object.keys(day))
        .filter(state => !ignoredStates.includes(state));
      
      this._gameColorMap = buildGameColorMap(states);
      
      // Calculate overall totals and find the most played game
      this._overallTotals = calculateOverallTotals(this._dailyTotals);
      const { dominantGame, dominantSec } = findMostPlayedGame(this._overallTotals);
      this._bestGame = dominantGame;
      this._bestSec = dominantSec;
      
      // Update timestamp of last history fetch
      this._lastHistoryTimestamp = Date.now();
      
      // Request an update to re-render with new data
      this.requestUpdate();
    } catch (error) {
      console.error("Calendar Heatmap: Error fetching history data", error);
    }
  }

  _createSummaryData() {
    return {
      overallTotals: this._overallTotals,
      bestGame: this._bestGame,
      bestSec: this._bestSec,
      gameColorMap: this._gameColorMap,
      maxValue: this._maxValue
    };
  }

  _createDayData(date) {
    return {
      date,
      statesObj: this._dailyTotals[date] || {},
      gameColorMap: this._gameColorMap,
      maxValue: this._maxValue
    };
  }

  _updateDetailView(dateToShow) {
    const detailView = this.shadowRoot.querySelector('.detail-view');
    if (!detailView) return;
    
    // Clear existing content
    detailView.innerHTML = '';
    
    if (dateToShow) {
      // Show details for the selected date
      const dayData = this._createDayData(dateToShow);
      updateDetailViewWithDayDetails(detailView, dayData);
    } else {
      // Show summary data
      const summaryData = this._createSummaryData();
      updateDetailViewWithSummary(detailView, summaryData);
    }
    
    // Update selected cell styling
    this._updateSelectedCellClasses();
  }

  _onCellHover(data) {
    // We could implement hover effects here if needed
    // For now, we'll just use the hover styles in CSS
  }

  _onCellClick(data) {
    if (!data) return;
    
    const { date } = data;
    
    // Toggle selection
    if (this._selectedDate === date) {
      // Deselect if already selected
      this._selectedDate = null;
    } else {
      // Select the new date
      this._selectedDate = date;
    }
    
    // Update the detail view
    this._updateDetailView(this._selectedDate);
  }

  _updateSelectedCellClasses() {
    // Remove selected class from all cells
    const cells = this.shadowRoot.querySelectorAll('.day-cell');
    cells.forEach(cell => {
      if (cell._data && cell._data.date === this._selectedDate) {
        cell.classList.add('selected');
      } else {
        cell.classList.remove('selected');
      }
    });
  }

  render() {
    if (!this._config || !this._hass) {
      return html``;
    }

    // Add dynamic styles
    const styleText = getStyles();
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