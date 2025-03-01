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

// Import LitElement components
import './ui/lit-components/heatmap-grid.js';
import './ui/lit-components/day-labels.js';
import './ui/lit-components/month-header.js';
import './ui/lit-components/detail-view.js';

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
        
        /* Text colors */
        --heatmap-primary-text: var(--primary-text-color);
        --heatmap-secondary-text: var(--secondary-text-color);
        
        /* Background colors */
        --heatmap-card-background: var(--ha-card-background, var(--card-background-color));
        --heatmap-secondary-background: var(--secondary-background-color);
        
        /* RGB versions of colors for opacity support */
        --disabled-text-color-rgb: 117, 117, 117;
        
        /* Heatmap specific colors */
        --heatmap-no-data-color: var(--calendar-heatmap-no-data-color, var(--disabled-text-color));
        --heatmap-level-1: var(--calendar-heatmap-level-1, var(--success-color));
        --heatmap-level-2: var(--calendar-heatmap-level-2, var(--primary-color));
        --heatmap-level-3: var(--calendar-heatmap-level-3, var(--accent-color));
        --heatmap-level-4: var(--calendar-heatmap-level-4, var(--state-active-color));
        
        /* UI elements */
        --heatmap-divider-color: var(--divider-color);
        --heatmap-box-shadow: var(--ha-card-box-shadow, 0 2px 5px rgba(0,0,0,0.26));
        --heatmap-border-radius: var(--ha-card-border-radius, 4px);
      }
      
      ha-card {
        overflow: hidden;
        box-shadow: var(--heatmap-box-shadow);
        border-radius: var(--heatmap-border-radius);
        color: var(--heatmap-primary-text);
        background: var(--heatmap-card-background);
      }
      
      .card-content {
        display: flex;
        flex-wrap: wrap;
        padding: 0;
        height: auto;
        min-height: 220px;
        font-family: var(--primary-font-family, var(--paper-font-common-base));
      }
      
      .heatmap-container {
        flex: 3;
        min-width: 0;
        padding: 16px 16px 24px 16px;
        background-color: var(--heatmap-card-background);
        min-height: 220px;
        overflow: hidden;
        position: relative;
        display: flex;
        flex-direction: column;
        height: 100%;
      }
      
      .detail-view-container {
        flex: 1;
        min-width: 200px;
        max-width: 280px;
        padding: 16px 16px 16px 12px;
        background-color: var(--heatmap-secondary-background);
        border-left: 1px solid var(--heatmap-divider-color);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        opacity: 0.9;
        min-height: 220px;
        height: 100%;
      }
      
      .card-header {
        padding: 8px 0 16px;
        font-size: var(--ha-card-header-font-size, 1.4em);
        font-weight: var(--ha-card-header-font-weight, 500);
        color: var(--ha-card-header-color, var(--primary-text-color));
        position: sticky;
        left: 0;
        background-color: var(--heatmap-card-background);
        z-index: 1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        margin-bottom: 4px;
      }
      
      .grid-container {
        display: flex;
        min-width: min-content;
        overflow: visible;
        margin-top: 0;
        flex: 1;
        align-items: flex-start;
        position: relative;
        box-sizing: border-box;
        margin-left: 0;
        margin-right: 0;
      }
      
      .heatmap-grid-wrapper {
        overflow-x: auto;
        overflow-y: hidden;
        margin-bottom: 0;
        padding-bottom: 0;
        box-sizing: border-box;
        flex: 1;
      }
      
      /* Scrollbar styling */
      .heatmap-grid-wrapper::-webkit-scrollbar {
        height: 6px;
      }
      
      .heatmap-grid-wrapper::-webkit-scrollbar-track {
        background: var(--heatmap-card-background);
      }
      
      .heatmap-grid-wrapper::-webkit-scrollbar-thumb {
        background-color: var(--heatmap-secondary-text);
        border-radius: 3px;
      }
      
      /* Responsive adjustments */
      @media (max-width: 600px) {
        .card-content {
          flex-direction: column;
        }
        
        .detail-view-container {
          max-width: none;
          border-left: none;
          border-top: 1px solid var(--heatmap-divider-color);
        }
      }
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

  /**
   * Handle cell click event
   * @param {CustomEvent} event - Cell click event
   * @private
   */
  _onCellClick(event) {
    const data = event.detail;
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
    
    // Request an update to re-render with new selection
    this.requestUpdate();
  }

  /**
   * Handle cell hover event
   * @param {CustomEvent} event - Cell hover event
   * @private
   */
  _onCellHover(event) {
    // We could implement hover effects here if needed
    // For now, we'll just use the hover styles in CSS
  }

  render() {
    if (!this._config || !this._hass) {
      return html``;
    }
    
    // Build calendar data
    const startDate = getHeatmapStartDate(this._config.days_to_show, this._config.start_day_of_week);
    const weeks = buildWeeksArray(startDate);
    const monthGroups = groupWeeksByMonth(weeks);

    // Calculate visible weeks based on available space
    const maxWeeks = Math.min(weeks.length, 52); // Limit to 52 weeks (1 year) maximum
    const visibleWeeks = weeks.slice(0, maxWeeks);

    // Create day data or summary data based on selection
    const dayData = this._selectedDate ? this._createDayData(this._selectedDate) : null;
    const summaryData = this._createSummaryData();

    return html`
      <ha-card>
        <div class="card-content">
          <!-- Left Panel: Heatmap Container -->
          <div class="heatmap-container">
            <div class="card-header">${this._config.title || "Calendar Heatmap"}</div>
            
            <!-- Month Header -->
            <month-header .monthGroups=${monthGroups}></month-header>
            
            <!-- Grid Container -->
            <div class="grid-container">
              <!-- Day Labels -->
              <day-labels .startDayOfWeek=${this._config.start_day_of_week}></day-labels>
              
              <!-- Heatmap Grid Wrapper -->
              <div class="heatmap-grid-wrapper">
                <heatmap-grid
                  .weeks=${visibleWeeks}
                  .dailyTotals=${this._dailyTotals}
                  .maxValue=${this._maxValue}
                  .gameColorMap=${this._gameColorMap}
                  .selectedDate=${this._selectedDate}
                  @cell-click=${this._onCellClick}
                  @cell-hover=${this._onCellHover}
                ></heatmap-grid>
              </div>
            </div>
          </div>
          
          <!-- Right Panel: Detail View -->
          <div class="detail-view-container">
            <detail-view
              .selectedDate=${this._selectedDate}
              .dayData=${dayData}
              .summaryData=${summaryData}
              .showSummary=${!this._selectedDate}
            ></detail-view>
          </div>
        </div>
      </ha-card>
    `;
  }
}

export default CalendarHeatmapCard; 