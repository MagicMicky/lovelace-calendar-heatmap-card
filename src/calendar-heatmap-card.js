import { LitElement, html, css } from 'lit';
import { CARD_VERSION, DEFAULT_CONFIG } from './constants.js';
import { fetchHistory } from './services/history-service.js';
import { subscribeToEntity } from './services/entity-subscription.js';
import {
  processDailyTotals,
  calculateMaxValue,
  buildGameColorMap,
  calculateOverallTotals,
  findMostPlayedGame,
} from './data/data-processor.js';
import {
  getHeatmapStartDate,
  buildWeeksArray,
  groupWeeksByMonth,
  calculateMaxWeeks,
} from './utils/date-utils.js';
import { CELL_DIMENSIONS } from './ui/cell-dimensions.js';

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
      _isLoading: { type: Boolean },
      _containerWidth: { type: Number },
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
        --heatmap-card-background: var(
          --ha-card-background,
          var(--card-background-color)
        );
        --heatmap-secondary-background: var(--secondary-background-color);

        /* RGB versions of colors for opacity support */
        --disabled-text-color-rgb: 117, 117, 117;
        --rgb-primary-color: var(--rgb-primary-color, 33, 150, 243);

        /* Heatmap specific colors */
        --heatmap-no-data-color: var(
          --calendar-heatmap-no-data-color,
          var(--disabled-text-color)
        );
        --heatmap-level-1: var(
          --calendar-heatmap-level-1,
          var(--success-color)
        );
        --heatmap-level-2: var(
          --calendar-heatmap-level-2,
          var(--primary-color)
        );
        --heatmap-level-3: var(--calendar-heatmap-level-3, var(--accent-color));
        --heatmap-level-4: var(
          --calendar-heatmap-level-4,
          var(--state-active-color)
        );

        /* UI elements */
        --heatmap-divider-color: var(--divider-color);
        --heatmap-box-shadow: var(
          --ha-card-box-shadow,
          0 2px 5px rgba(0, 0, 0, 0.26)
        );
        --heatmap-border-radius: var(--ha-card-border-radius, 4px);

        /* Height variable for card */
        --heatmap-card-height: 235px;
      }

      ha-card {
        overflow: hidden;
        box-shadow: var(--heatmap-box-shadow);
        border-radius: var(--heatmap-border-radius);
        color: var(--heatmap-primary-text);
        background: var(--heatmap-card-background);
        /* Fixed height for the card */
        height: var(--heatmap-card-height);
        position: relative;
      }

      .card-content {
        display: flex;
        flex-wrap: nowrap; /* Prevent wrapping to ensure proper layout */
        padding: 0;
        height: 100%;
        box-sizing: border-box;
        font-family: var(--primary-font-family, var(--paper-font-common-base));
        overflow: hidden; /* Prevent overflow */
      }

      .loading-container {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        background: rgba(var(--rgb-card-background-color, 0, 0, 0), 0.3);
        z-index: 2;
        backdrop-filter: blur(2px);
      }

      .loading {
        opacity: 0.6;
      }

      .heatmap-container {
        flex: 3;
        min-width: 0; /* Allow container to shrink below content size */
        padding: 16px;
        background-color: var(--heatmap-card-background);
        overflow: hidden;
        position: relative;
        display: flex;
        flex-direction: column;
        height: 100%;
        box-sizing: border-box;
      }

      .detail-view-container {
        flex: 1;
        min-width: 200px;
        max-width: 280px;
        padding: 16px 16px 8px 12px;
        background-color: var(--heatmap-secondary-background);
        border-left: 1px solid var(--heatmap-divider-color);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        opacity: 0.9;
        height: 100%;
        box-sizing: border-box;
        z-index: 1; /* Ensure detail panel is above the heatmap */
      }

      .card-header {
        padding: 8px 0 8px;
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
        /* Prevent content from overflowing */
        max-width: 100%;
        width: 100%;
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
          flex-wrap: nowrap;
          height: auto;
          min-height: var(--heatmap-card-height);
        }

        ha-card {
          height: auto;
          min-height: var(--heatmap-card-height);
        }

        .heatmap-container {
          height: 180px;
          min-height: 180px;
        }

        .detail-view-container {
          max-width: none;
          border-left: none;
          border-top: 1px solid var(--heatmap-divider-color);
          height: auto;
          min-height: 100px;
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
    this._bestGame = '';
    this._bestSec = 0;
    this._lastEntityState = null;
    this._lastHistoryTimestamp = 0;
    this._themeObserver = null; // MutationObserver for theme changes
    this._isLoading = true;
    this._containerWidth = 0; // Initialize container width
    this._config = {}; // Initialize config

    // Bind the resize handler to this instance
    this._handleResize = this._handleResize.bind(this);
  }

  setConfig(config) {
    if (!config.entity) {
      throw new Error(
        'You need to define an entity in your card configuration.',
      );
    }
    // Merge defaults with user config
    this._config = {
      ...DEFAULT_CONFIG,
      ...config,
    };

    // If include_unknown is set to true, remove 'unknown' from ignored_states
    if (
      this._config.include_unknown === true &&
      this._config.ignored_states.includes('unknown')
    ) {
      this._config.ignored_states = this._config.ignored_states.filter(
        (state) => state !== 'unknown',
      );
    }
  }

  set hass(hass) {
    const oldHass = this._hass;
    this._hass = hass;

    if (!this._config || !this._config.entity) return;

    // Get current entity state
    const entityState = hass.states[this._config.entity];
    if (!entityState) return;

    // Check if this is a meaningful state change
    const oldEntityState = oldHass?.states[this._config.entity];
    const stateChanged =
      !oldEntityState ||
      entityState.state !== oldEntityState.state ||
      entityState.last_changed !== oldEntityState.last_changed;

    if (stateChanged) {
      // Only update if entity state has actually changed
      this._handleEntityUpdate(entityState);
    }
  }

  _handleEntityUpdate(entityState) {
    // Update immediate UI if needed
    this._currentState = entityState.state;

    // Only fetch history if enough time has passed since last fetch
    const now = Date.now();
    const timeSinceLastFetch = now - (this._lastHistoryTimestamp || 0);
    const minTimeBetweenFetches = 60000; // 1 minute minimum between fetches

    if (timeSinceLastFetch > minTimeBetweenFetches) {
      this._fetchHistoryData();
    } else {
      // Schedule a fetch after the minimum time has passed
      if (!this._pendingFetch) {
        this._pendingFetch = setTimeout(() => {
          this._fetchHistoryData();
          this._pendingFetch = null;
        }, minTimeBetweenFetches - timeSinceLastFetch);
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
      // Initial data fetch
      this._fetchHistoryData();

      // Set up refresh timer
      this._setupRefreshTimer();
    }

    // Set up theme observer
    this._setupThemeObserver();

    // Set up entity subscription
    this._setupSubscription();

    // Add resize event listener
    window.addEventListener('resize', this._handleResize);
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    // Clear refresh timer
    this._clearRefreshTimer();

    // Remove theme observer
    this._removeThemeObserver();

    // Unsubscribe from entity
    this._unsubscribeFromEntity();

    // Remove resize event listener
    window.removeEventListener('resize', this._handleResize);
  }

  /**
   * Called after the component's first render
   * @param {Map} changedProperties - Changed properties
   */
  firstUpdated(changedProperties) {
    super.firstUpdated(changedProperties);

    // Initialize container width
    setTimeout(() => {
      const heatmapContainer =
        this.shadowRoot.querySelector('.heatmap-container');
      if (heatmapContainer) {
        this._containerWidth = heatmapContainer.clientWidth;
        this.requestUpdate();
      }
    }, 0);
  }

  /**
   * Sets up a timer to periodically refresh the history data
   * @private
   */
  _setupRefreshTimer() {
    // Clear existing timer
    this._clearRefreshTimer();

    // Set up new timer if refresh_interval is valid
    const interval = this._config.refresh_interval || 600; // Default 10 minutes
    if (interval > 0) {
      // Add a small random offset to prevent all cards refreshing simultaneously
      const randomOffset = Math.floor(Math.random() * 10000); // Random 0-10 second offset

      this._refreshTimerId = window.setTimeout(() => {
        this._fetchHistoryData();
        // Set up recurring interval after first fetch
        this._refreshTimerId = window.setInterval(() => {
          this._fetchHistoryData();
        }, interval * 1000);
      }, randomOffset);
    }
  }

  /**
   * Clears any active refresh timers
   * @private
   */
  _clearRefreshTimer() {
    if (this._refreshTimerId) {
      clearInterval(this._refreshTimerId);
      this._refreshTimerId = null;
    }

    if (this._pendingFetch) {
      clearTimeout(this._pendingFetch);
      this._pendingFetch = null;
    }
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
        console.warn(
          'Calendar Heatmap: Error setting up parent theme observers',
          error,
        );
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
          if (
            !this._lastEntityState ||
            newState.state !== this._lastEntityState.state
          ) {
            this._lastEntityState = newState;

            // Check if we should refresh history data
            const now = Date.now();
            const refreshInterval =
              (this._config.refresh_interval || 300) * 1000; // Convert to ms

            if (now - this._lastHistoryTimestamp > refreshInterval) {
              this._fetchHistoryData();
            }
          }
        },
      );
    }
  }

  /**
   * Unsubscribe from entity updates
   * @private
   */
  _unsubscribeFromEntity() {
    // Clean up entity subscription if exists
    if (this._unsubscribe) {
      this._unsubscribe();
      this._unsubscribe = null;
    }

    // Clear any cached data to prevent memory leaks
    this._dailyTotals = null;
    this._gameColorMap = null;
    this._overallTotals = null;
  }

  async _fetchHistoryData() {
    if (!this._hass || !this._config || !this._config.entity) return;

    try {
      // Update timestamp before fetch to prevent duplicate requests
      this._lastHistoryTimestamp = Date.now();

      // Show loading state if needed
      this._isLoading = true;
      this.requestUpdate();

      // Calculate max weeks based on container width
      const maxWeeks = this._calculateMaxWeeks();

      // Get history data for the entity
      const startDate = getHeatmapStartDate(
        maxWeeks,
        this._config.start_day_of_week,
      );
      const endDate = new Date(); // Current time

      // Fetch history with proper date validation
      const historyData = await fetchHistory(
        this._hass,
        this._config.entity,
        startDate,
        endDate,
      );

      // Process data only if we got a valid response
      if (historyData && historyData.length > 0) {
        // Process the data
        const ignoredStates = this._config.ignored_states || [];
        this._dailyTotals = processDailyTotals(historyData, ignoredStates);
        this._maxValue = calculateMaxValue(this._dailyTotals);

        // Create a list of all unique states/games
        const allStates = [];
        for (const day in this._dailyTotals) {
          allStates.push(...Object.keys(this._dailyTotals[day]));
        }

        // Filter out ignored states and create a unique set
        const uniqueStates = [...new Set(allStates)].filter(
          (state) => !ignoredStates.includes(state),
        );

        // Build color map and calculate totals
        this._gameColorMap = buildGameColorMap(uniqueStates);
        this._overallTotals = calculateOverallTotals(this._dailyTotals);
        const { dominantGame, dominantSec } = findMostPlayedGame(
          this._overallTotals,
        );
        this._bestGame = dominantGame;
        this._bestSec = dominantSec;
      }
    } catch (error) {
      console.error('Calendar Heatmap: Error fetching history data', error);
    } finally {
      // Always clear loading state
      this._isLoading = false;
      this.requestUpdate();
    }
  }

  _createSummaryData() {
    return {
      overallTotals: this._overallTotals || {},
      bestGame: this._bestGame || '',
      bestSec: this._bestSec || 0,
      gameColorMap: this._gameColorMap || {},
      maxValue: this._maxValue || 0,
    };
  }

  _createDayData(date) {
    return {
      date,
      statesObj: this._dailyTotals && date ? this._dailyTotals[date] || {} : {},
      gameColorMap: this._gameColorMap || {},
      maxValue: this._maxValue || 0,
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

  /**
   * Handle window resize event
   * @private
   */
  _handleResize() {
    // Use requestAnimationFrame to avoid excessive updates
    requestAnimationFrame(() => {
      // Get the container width
      const heatmapContainer =
        this.shadowRoot.querySelector('.heatmap-container');
      if (heatmapContainer) {
        const newWidth = heatmapContainer.clientWidth;
        // Only update if width has changed
        if (newWidth !== this._containerWidth) {
          this._containerWidth = newWidth;
          // Force re-render
          this.requestUpdate();
        }
      }
    });
  }

  /**
   * Calculate the maximum number of weeks that can be displayed
   * @returns {number} Maximum number of weeks
   * @private
   */
  _calculateMaxWeeks() {
    // Get the container width
    if (!this._containerWidth || this._containerWidth <= 0) {
      // If we don't have a valid width yet, use a default
      return 26; // Default to half a year as a safer default
    }

    // Get the detail panel width to account for it
    const detailPanel = this.shadowRoot?.querySelector(
      '.detail-view-container',
    );
    const detailPanelWidth = detailPanel?.offsetWidth || 0;

    // Calculate the actual available width for the heatmap
    // Subtract some padding to ensure we don't overflow
    const availableWidth = this._containerWidth - 30; // 30px for padding and day labels

    // Calculate max weeks based on available width
    const maxWeeks = calculateMaxWeeks(
      availableWidth,
      CELL_DIMENSIONS.weekColWidth,
    );

    // Ensure we show at least 4 weeks and at most 52 weeks (1 year)
    return Math.max(4, Math.min(52, maxWeeks));
  }

  render() {
    if (!this._config || !this._hass) {
      return html``;
    }

    // Update container width if not set yet
    if (!this._containerWidth) {
      // Use setTimeout to ensure the DOM is ready
      setTimeout(() => {
        const heatmapContainer =
          this.shadowRoot.querySelector('.heatmap-container');
        if (heatmapContainer) {
          this._containerWidth = heatmapContainer.clientWidth;
          this.requestUpdate();
        }
      }, 0);
    }

    // Calculate max weeks based on container width
    const maxWeeks = this._calculateMaxWeeks();

    // Build calendar data
    const startDate = getHeatmapStartDate(
      maxWeeks,
      this._config.start_day_of_week,
    );
    const weeks = buildWeeksArray(startDate);
    const monthGroups = groupWeeksByMonth(weeks);

    // Calculate visible weeks based on available space
    // Ensure the current week is always visible by taking the most recent weeks
    const visibleWeeks = weeks.slice(-maxWeeks);

    // Create day data or summary data based on selection
    const dayData = this._selectedDate
      ? this._createDayData(this._selectedDate)
      : null;
    const summaryData = this._createSummaryData();

    // Show loading indicator when fetching data
    const loadingIndicator = this._isLoading
      ? html`<div class="loading-container">
          <ha-circular-progress active></ha-circular-progress>
        </div>`
      : html``;

    return html`
      <ha-card>
        ${loadingIndicator}
        <div class="card-content ${this._isLoading ? 'loading' : ''}">
          <!-- Left Panel: Heatmap Container -->
          <div class="heatmap-container">
            <div class="card-header">
              ${this._config.title || 'Calendar Heatmap'}
            </div>

            <!-- Month Header -->
            <month-header .monthGroups=${monthGroups}></month-header>

            <!-- Grid Container -->
            <div class="grid-container">
              <!-- Day Labels -->
              <day-labels
                .startDayOfWeek=${this._config.start_day_of_week || 'monday'}
              ></day-labels>

              <!-- Heatmap Grid Wrapper -->
              <div class="heatmap-grid-wrapper">
                <heatmap-grid
                  .weeks=${visibleWeeks}
                  .dailyTotals=${this._dailyTotals || {}}
                  .maxValue=${this._maxValue || 0}
                  .gameColorMap=${this._gameColorMap || {}}
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
