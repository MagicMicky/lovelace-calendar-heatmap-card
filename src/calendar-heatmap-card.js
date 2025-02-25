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
import { getCardStyles, COMMON_STYLES } from './ui/styles.js';

/**
 * Calendar Heatmap Card
 * A custom card for Home Assistant showing a calendar heatmap of entity activity
 */
class CalendarHeatmapCard extends HTMLElement {
  constructor() {
    super();
    this._hasConnected = false;
    this._interval = null;
    this._selectedDay = null;
    this.attachShadow({ mode: "open" });
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
  }

  set hass(hass) {
    // Store the hass object; do not trigger render on every update.
    this._hass = hass;
  }

  getCardSize() {
    return 6;
  }

  connectedCallback() {
    if (!this._hasConnected) {
      this._hasConnected = true;
      this._update();
      this._setupRefreshInterval();
    } else {
      this._setupRefreshInterval();
    }
  }

  disconnectedCallback() {
    this._clearRefreshInterval();
  }

  _setupRefreshInterval() {
    if (!this._interval) {
      const intervalMs = this._config.refresh_interval * 1000;
      if (intervalMs > 0) {
        this._interval = setInterval(() => this._update(), intervalMs);
      }
    }
  }

  _clearRefreshInterval() {
    if (this._interval) {
      clearInterval(this._interval);
      this._interval = null;
    }
  }

  async _update() {
    if (!this._hass) return;
    this.shadowRoot.innerHTML = "";

    // Add styles
    const styleElement = document.createElement("style");
    styleElement.textContent = getCardStyles(this._config.theme);
    this.shadowRoot.appendChild(styleElement);

    // Create main card container
    const card = createElement('ha-card', {});

    // Main content container
    const container = createElement('div', {
      ...COMMON_STYLES.container,
    });
    container.classList.add('card-content');

    // Left Panel: Heatmap Container
    const heatmapContainer = createElement('div', {
      ...COMMON_STYLES.heatmapContainer,
    });
    heatmapContainer.classList.add('heatmap-container');

    // Add title to the left panel
    const cardHeader = createElement('div', {
      ...COMMON_STYLES.cardHeader,
    });
    cardHeader.classList.add('card-header');
    cardHeader.textContent = this._config.title || "Calendar Heatmap";
    heatmapContainer.appendChild(cardHeader);

    // Right Panel: Detail View
    const detailView = createElement('div', {
      ...COMMON_STYLES.detailView,
    });
    detailView.classList.add('detail-view');

    // Fetch and process data
    const historyData = await fetchHistory(
      this._hass, 
      this._config.entity, 
      this._config.days_to_show
    );
    
    const dailyTotals = processDailyTotals(historyData, this._config.ignored_states);
    const maxValue = calculateMaxValue(dailyTotals);
    const gameColorMap = buildGameColorMap(dailyTotals);
    
    // Calculate overall totals and find most played game
    const overallTotals = calculateOverallTotals(dailyTotals);
    const { bestGame, bestSec } = findMostPlayedGame(overallTotals);
    
    // Prepare default data for detail view
    const defaultData = {
      overallTotals,
      gameColorMap,
      bestGame,
      bestSec
    };
    
    // Initialize detail view with summary
    updateDetailViewWithSummary(detailView, defaultData);

    // Build calendar data
    const startDate = getHeatmapStartDate(this._config.days_to_show);
    const weeks = buildWeeksArray(startDate);
    const monthGroups = groupWeeksByMonth(weeks);

    // Create UI components
    const monthHeader = createMonthHeader(monthGroups, getComputedStyle(this));
    heatmapContainer.appendChild(monthHeader);

    // Build Main Grid: Day Labels + Heatmap
    const gridContainer = createElement('div', COMMON_STYLES.gridContainer);
    
    // Day labels column
    const dayLabels = createDayLabels(getComputedStyle(this));
    gridContainer.appendChild(dayLabels);

    // Cell hover handler
    const onCellHover = (data) => {
      if (data) {
        updateDetailViewWithDayDetails(detailView, data);
      } else {
        updateDetailViewWithSummary(detailView, defaultData);
      }
    };

    // Heatmap grid
    const heatmapGrid = createHeatmapGrid(
      weeks, 
      dailyTotals, 
      maxValue, 
      gameColorMap, 
      this._config.theme,
      onCellHover
    );
    gridContainer.appendChild(heatmapGrid);
    heatmapContainer.appendChild(gridContainer);

    // Add a subtle label to the detail view to indicate it's secondary
    const detailHeader = createElement('div', {
      fontSize: '0.9em',
      fontWeight: '500',
      marginBottom: '8px',
      opacity: '0.7',
      textTransform: 'uppercase',
    }, {
      textContent: 'Details'
    });
    detailView.insertBefore(detailHeader, detailView.firstChild);

    // Version/debug text
    const secondaryTextColor = getComputedStyle(this).getPropertyValue("--secondary-text-color").trim() || "#888";
    const versionText = createElement('div', {
      ...COMMON_STYLES.versionText,
      color: secondaryTextColor,
      opacity: '0.6',
    }, {
      textContent: `Calendar Heatmap Card – Version: ${CARD_VERSION}`
    });
    detailView.appendChild(versionText);

    // Add panels to container
    container.appendChild(heatmapContainer);
    container.appendChild(detailView);

    card.appendChild(container);
    this.shadowRoot.appendChild(card);
  }
}

export default CalendarHeatmapCard; 