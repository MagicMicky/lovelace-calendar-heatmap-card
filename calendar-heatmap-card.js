const CARD_VERSION = "3.1.0";

// Material-inspired color palette.
const materialColors = [
  "#F44336", // red
  "#E91E63", // pink
  "#9C27B0", // purple
  "#673AB7", // deep purple
  "#3F51B5", // indigo
  "#2196F3", // blue
  "#03A9F4", // light blue
  "#00BCD4", // cyan
  "#009688", // teal
  "#4CAF50"  // green
];

function getGameColor(gameName) {
  let hash = 0;
  for (let i = 0; i < gameName.length; i++) {
    hash = gameName.charCodeAt(i) + ((hash << 5) - hash);
  }
  hash = Math.abs(hash);
  const index = hash % materialColors.length;
  return materialColors[index];
}

function adjustColor(hex, factor, theme = "dark") {
  if (hex.startsWith("#")) {
    hex = hex.slice(1);
  }
  let r = parseInt(hex.slice(0, 2), 16);
  let g = parseInt(hex.slice(2, 4), 16);
  let b = parseInt(hex.slice(4, 6), 16);
  if (theme === "dark") {
    r = Math.round(0 * (1 - factor) + r * factor);
    g = Math.round(0 * (1 - factor) + g * factor);
    b = Math.round(0 * (1 - factor) + b * factor);
  } else {
    r = Math.round(255 * (1 - factor) + r * factor);
    g = Math.round(255 * (1 - factor) + g * factor);
    b = Math.round(255 * (1 - factor) + b * factor);
  }
  return `rgb(${r}, ${g}, ${b})`;
}

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
    this._config = {
      title: "Game Activity",
      days_to_show: 365,
      ignored_states: ["unknown", "idle", "offline", ""],
      refresh_interval: 5 * 60, // seconds.
      theme: "dark",
      // detail_view_width is now relative.
      ...config,
    };
  }
  
  set hass(hass) {
    this._hass = hass;
  }
  
  getCardSize() {
    return 6;
  }
  
  connectedCallback() {
    if (!this._hasConnected) {
      this._hasConnected = true;
      this._update();
      const intervalMs = this._config.refresh_interval * 1000;
      if (intervalMs > 0) {
        this._interval = setInterval(() => this._update(), intervalMs);
      }
    } else if (!this._interval) {
      const intervalMs = this._config.refresh_interval * 1000;
      if (intervalMs > 0) {
        this._interval = setInterval(() => this._update(), intervalMs);
      }
    }
  }
  
  disconnectedCallback() {
    if (this._interval) {
      clearInterval(this._interval);
      this._interval = null;
    }
  }
  
  async _fetchHistory() {
    if (!this._hass) return [];
    const now = new Date();
    const start = new Date(now.getTime() - this._config.days_to_show * 24 * 60 * 60 * 1000);
    const startISOString = start.toISOString();
    const endISOString = now.toISOString();
    try {
      const history = await this._hass.callApi(
        "GET",
        `history/period/${startISOString}?filter_entity_id=${this._config.entity}&end_time=${endISOString}`
      );
      return history;
    } catch (err) {
      console.error("Calendar Heatmap: Error fetching history data", err);
      return [];
    }
  }
  
  _formatTime(seconds) {
    if (seconds < 60) {
      return `${Math.round(seconds)} sec`;
    }
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.round((seconds % 3600) / 60);
    let result = "";
    if (hours > 0) {
      result += `${hours}h`;
    }
    if (minutes > 0) {
      result += ` ${minutes}m`;
    }
    return result.trim();
  }
  
  // Updates the detail panel content.
  _updateDetailView(detailViewElement, data, defaultData) {
    // If no data provided, show default.
    if (!data) {
      detailViewElement.innerHTML = `<h2>Overall Summary</h2>
        <div>Total: ${this._formatTime(Object.values(defaultData.overallTotals).reduce((a, b) => a + b, 0))}</div>
        <div>Most Played: ${defaultData.bestGame} (${this._formatTime(defaultData.bestSec)})</div>`;
      // Also display breakdown list.
      let breakdown = "";
      const games = Object.entries(defaultData.overallTotals).sort((a, b) => b[1] - a[1]);
      games.forEach(([game, secs]) => {
        breakdown += `<div style="display: flex; align-items: center; margin-bottom: 4px;">
          <div style="width: 12px; height: 12px; background: ${defaultData.gameColorMap[game]}; margin-right: 8px;"></div>
          <div style="flex:1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${game}</div>
          <div>${this._formatTime(secs)}</div>
        </div>`;
      });
      detailViewElement.innerHTML += `<h3>Breakdown</h3>${breakdown}`;
      return;
    }
    
    // For a specific day.
    detailViewElement.innerHTML = `<h2>${new Date(data.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</h2>
      <div>Total: ${this._formatTime(Object.values(data.statesObj).reduce((a, b) => a + b, 0))}</div>`;
    let dominantGame = "";
    let dominantSec = 0;
    for (const [game, secs] of Object.entries(data.statesObj)) {
      if (secs > dominantSec) {
        dominantSec = secs;
        dominantGame = game;
      }
    }
    detailViewElement.innerHTML += `<div>Dominant: ${dominantGame} (${this._formatTime(dominantSec)})</div>`;
    let breakdown = "";
    const games = Object.entries(data.statesObj).sort((a, b) => b[1] - a[1]);
    games.forEach(([game, secs]) => {
      breakdown += `<div style="display: flex; align-items: center; margin-bottom: 4px;">
        <div style="width: 12px; height: 12px; background: ${data.gameColorMap[game]}; margin-right: 8px;"></div>
        <div style="flex:1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${game}</div>
        <div>${this._formatTime(secs)}</div>
      </div>`;
    });
    detailViewElement.innerHTML += `<h3>Breakdown</h3>${breakdown}`;
  }
  
  async _update() {
    if (!this._hass) return;
    this.shadowRoot.innerHTML = "";
    
    const computedStyle = getComputedStyle(this);
    
    // Responsive CSS: Using Flexbox with wrap and media queries.
    const styleElement = document.createElement("style");
    styleElement.textContent = `
      ha-card {
        box-shadow: var(--ha-card-box-shadow, 0 2px 5px rgba(0,0,0,0.26));
        border-radius: var(--ha-card-border-radius, 4px);
        color: var(--primary-text-color, ${this._config.theme === "light" ? "#333" : "#c9d1d9"});
        overflow: hidden;
        position: relative;
      }
      .card-content {
        font-family: var(--paper-font-common-base, sans-serif);
        display: flex;
        flex-wrap: wrap;
      }
      .heatmap-container {
        flex: 2;
        min-width: 0;
        padding-right: 16px;
        border-right: 1px solid var(--divider-color, #CCC);
      }
      .detail-view {
        flex: 1;
        min-width: 240px;
        padding: 16px;
        margin-left: 16px;
        background-color: var(--ha-card-background);
        border-radius: 4px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }
      .detail-view h2 {
        margin-top: 0;
        font-size: 1em;
      }
      .detail-view h3 {
        margin: 8px 0 4px;
        font-size: 0.9em;
      }
      .month-header {
        display: flex;
        margin-left: 40px;
        margin-bottom: 4px;
        font-size: 0.75em;
        color: var(--primary-text-color, ${this._config.theme === "light" ? "#333" : "#c9d1d9"});
      }
      .month-header div {
        text-align: center;
      }
      .day-labels {
        display: flex;
        flex-direction: column;
        margin-right: 4px;
        font-size: 0.75em;
        color: var(--secondary-text-color, #888);
      }
      .day-labels div {
        height: 12px;
        margin-bottom: 2px;
      }
      .heatmap-grid {
        display: flex;
        flex-wrap: nowrap;
      }
      @media (max-width: 500px) {
        .card-content {
          flex-direction: column;
        }
        .heatmap-container {
          border-right: none;
          border-bottom: 1px solid var(--divider-color, #CCC);
          padding-right: 0;
          margin-bottom: 16px;
        }
        .detail-view {
          margin-left: 0;
        }
      }
    `;
    this.shadowRoot.appendChild(styleElement);
    
    // Create ha-card (letting it inherit HA background).
    const card = document.createElement("ha-card");
    card.header = this._config.title || "Calendar Heatmap";
    
    // Main container.
    const container = document.createElement("div");
    container.classList.add("card-content");
    container.style.padding = "16px";
    
    // Left Panel: Heatmap Container.
    const heatmapContainer = document.createElement("div");
    heatmapContainer.classList.add("heatmap-container");
    
    // Right Panel: Detail View.
    const detailView = document.createElement("div");
    detailView.classList.add("detail-view");
    
    // Process sensor history.
    const historyData = await this._fetchHistory();
    let dailyTotals = {};
    if (historyData && historyData[0]) {
      const entityHistory = historyData[0];
      for (let i = 0; i < entityHistory.length - 1; i++) {
        const current = entityHistory[i];
        const next = entityHistory[i + 1];
        const stateLower = current.state.toLowerCase();
        if (!this._config.ignored_states.includes(stateLower)) {
          const startTime = new Date(current.last_changed);
          const endTime = new Date(next.last_changed);
          const diffSeconds = (endTime - startTime) / 1000;
          const dayStr = startTime.toISOString().split("T")[0];
          if (!dailyTotals[dayStr]) {
            dailyTotals[dayStr] = {};
          }
          const stateName = current.state;
          dailyTotals[dayStr][stateName] =
            (dailyTotals[dayStr][stateName] || 0) + diffSeconds;
        }
      }
    }
    
    // Build unique game mapping.
    let gameSet = new Set();
    for (const day in dailyTotals) {
      for (const game in dailyTotals[day]) {
        gameSet.add(game);
      }
    }
    let uniqueGames = Array.from(gameSet);
    uniqueGames.sort();
    let gameColorMap = {};
    uniqueGames.forEach((game, index) => {
      gameColorMap[game] = materialColors[index % materialColors.length];
    });
    
    // Compute overall totals for default detail.
    let overallTotals = {};
    for (const day in dailyTotals) {
      for (const game in dailyTotals[day]) {
        overallTotals[game] = (overallTotals[game] || 0) + dailyTotals[day][game];
      }
    }
    let bestGame = "";
    let bestSec = 0;
    for (const game in overallTotals) {
      if (overallTotals[game] > bestSec) {
        bestSec = overallTotals[game];
        bestGame = game;
      }
    }
    let defaultDetail = "No data";
    if (bestGame) {
      defaultDetail = `Most played: ${bestGame}\n(${this._formatTime(bestSec)})`;
    }
    
    // Prepare default data object for detail view.
    const defaultData = {
      overallTotals,
      gameColorMap,
      bestGame,
      bestSec
    };
    
    // Initialize detail view.
    this._updateDetailView(detailView, null, defaultData);
    
    // Build weeks array.
    const now = new Date();
    let startDate = new Date(now.getTime() - this._config.days_to_show * 24 * 60 * 60 * 1000);
    const dayOfWeek = startDate.getDay();
    startDate.setDate(startDate.getDate() - dayOfWeek);
    const weeks = [];
    let currentDate = new Date(startDate);
    while (currentDate <= now) {
      const week = [];
      for (let d = 0; d < 7; d++) {
        if (currentDate <= now) {
          week.push(new Date(currentDate));
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
      weeks.push(week);
    }
    
    // Determine maximum total seconds for scaling.
    let maxValue = 0;
    for (const dayStr in dailyTotals) {
      const statesObj = dailyTotals[dayStr];
      const sumSeconds = Object.values(statesObj).reduce((acc, val) => acc + val, 0);
      if (sumSeconds > maxValue) {
        maxValue = sumSeconds;
      }
    }
    
    // Cell dimensions.
    const cellWidth = 12;
    const cellMargin = 2;
    const weekColWidth = cellWidth + cellMargin;
    
    // Build Month Header.
    const monthHeader = document.createElement("div");
    monthHeader.classList.add("month-header");
    monthHeader.style.marginLeft = "40px";
    monthHeader.style.marginBottom = "4px";
    let groups = [];
    let currentGroupObj = null;
    weeks.forEach((week) => {
      const firstDay = week[0];
      const month = firstDay.getMonth();
      const monthName = firstDay.toLocaleString("default", { month: "short" });
      if (!currentGroupObj) {
        currentGroupObj = { month, monthName, count: 1 };
      } else if (currentGroupObj.month === month) {
        currentGroupObj.count++;
      } else {
        groups.push(currentGroupObj);
        currentGroupObj = { month, monthName, count: 1 };
      }
    });
    if (currentGroupObj) {
      groups.push(currentGroupObj);
    }
    groups.forEach((group) => {
      const label = document.createElement("div");
      label.style.width = `${group.count * weekColWidth}px`;
      label.style.textAlign = "center";
      label.textContent = group.monthName;
      monthHeader.appendChild(label);
    });
    heatmapContainer.appendChild(monthHeader);
    
    // Build Main Grid: Day Labels + Heatmap Grid.
    const gridContainer = document.createElement("div");
    gridContainer.style.display = "flex";
    
    // Day Labels Column.
    const dayLabels = document.createElement("div");
    dayLabels.classList.add("day-labels");
    const dayNamesArr = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    for (let i = 0; i < 7; i++) {
      const label = document.createElement("div");
      label.textContent = (i === 1 || i === 3 || i === 5) ? dayNamesArr[i] : "";
      dayLabels.appendChild(label);
    }
    gridContainer.appendChild(dayLabels);
    
    // Heatmap Grid.
    const heatmapGrid = document.createElement("div");
    heatmapGrid.classList.add("heatmap-grid");
    const cells = [];
    let cellCounter = 0;
    weeks.forEach((week) => {
      const col = document.createElement("div");
      col.style.display = "flex";
      col.style.flexDirection = "column";
      col.style.marginRight = `${cellMargin}px`;
      for (let i = 0; i < 7; i++) {
        let cell;
        let cellDetail = "";
        if (i < week.length) {
          const date = week[i];
          const dayStr = date.toISOString().split("T")[0];
          const statesObj = dailyTotals[dayStr] || {};
          const sumSeconds = Object.values(statesObj).reduce((acc, val) => acc + val, 0);
          
          let dominantGame = "";
          let dominantSec = 0;
          for (const [game, secs] of Object.entries(statesObj)) {
            if (secs > dominantSec) {
              dominantSec = secs;
              dominantGame = game;
            }
          }
          const defaultNoDataColor = this._config.theme === "dark" ? "#757575" : "#E0E0E0";
          const baseColor = dominantGame ? gameColorMap[dominantGame] : defaultNoDataColor;
          const intensity = maxValue > 0 ? dominantSec / maxValue : 0;
          const cellColor = adjustColor(baseColor, intensity, this._config.theme);
          
          cell = document.createElement("div");
          cell.style.width = `${cellWidth}px`;
          cell.style.height = `${cellWidth}px`;
          cell.style.marginBottom = `${cellMargin}px`;
          cell.style.backgroundColor = cellColor;
          cell.style.borderRadius = "2px";
          cell.style.cursor = "pointer";
          cell.style.transition = "box-shadow 0.2s ease";
          cell._data = {
            date: dayStr,
            statesObj,
            gameColorMap
          };
          cells.push(cell);
          
          if (sumSeconds > 0) {
            cellDetail = `${dayStr}\nTotal: ${this._formatTime(sumSeconds)}\nDominant: ${dominantGame} (${this._formatTime(dominantSec)})`;
            for (const [gameName, secs] of Object.entries(statesObj)) {
              cellDetail += `\n${gameName}: ${this._formatTime(secs)}`;
            }
          } else {
            cellDetail = `${dayStr}\nNo data`;
          }
        } else {
          cell = document.createElement("div");
          cell.style.width = `${cellWidth}px`;
          cell.style.height = `${cellWidth}px`;
          cell.style.marginBottom = `${cellMargin}px`;
          cellDetail = "";
        }
        cell.id = "heatmap-cell-" + cellCounter;
        cellCounter++;
        
        cell.addEventListener("mouseenter", () => {
          this._updateDetailView(detailView, cell._data, defaultData);
        });
        cell.addEventListener("mouseleave", () => {
          this._updateDetailView(detailView, null, defaultData);
        });
        col.appendChild(cell);
      }
      heatmapGrid.appendChild(col);
    });
    gridContainer.appendChild(heatmapGrid);
    heatmapContainer.appendChild(gridContainer);
    
    // Add version info to detail panel.
    const versionText = document.createElement("div");
    versionText.style.marginTop = "8px";
    versionText.style.fontSize = "0.8em";
    versionText.style.color = computedStyle.getPropertyValue("--secondary-text-color").trim() || "#888";
    versionText.textContent = `Calendar Heatmap Card – Version: ${CARD_VERSION}`;
    detailView.appendChild(versionText);
    
    // Append panels to main container.
    const mainContainer = document.createElement("div");
    mainContainer.classList.add("card-content");
    mainContainer.style.padding = "16px";
    mainContainer.style.display = "flex";
    mainContainer.style.flexWrap = "wrap";
    mainContainer.appendChild(heatmapContainer);
    mainContainer.appendChild(detailView);
    
    card.appendChild(mainContainer);
    this.shadowRoot.appendChild(card);
  }
  
  _updateDetailView(detailViewElement, data, defaultData) {
    if (!data) {
      // Default view.
      detailViewElement.innerHTML = `<h2 style="margin-top:0;">Overall Summary</h2>
        <div>Total: ${this._formatTime(Object.values(defaultData.overallTotals).reduce((a, b) => a + b, 0))}</div>
        <div>Most Played: ${defaultData.bestGame} (${this._formatTime(defaultData.bestSec)})</div>`;
      let breakdown = "";
      const games = Object.entries(defaultData.overallTotals).sort((a, b) => b[1] - a[1]);
      games.forEach(([game, secs]) => {
        breakdown += `<div style="display: flex; align-items: center; margin-bottom: 4px;">
          <div style="width: 12px; height: 12px; background: ${defaultData.gameColorMap[game]}; margin-right: 8px;"></div>
          <div style="flex:1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${game}</div>
          <div>${this._formatTime(secs)}</div>
        </div>`;
      });
      detailViewElement.innerHTML += `<h3 style="margin-bottom:4px;">Breakdown</h3>${breakdown}`;
    } else {
      // Specific day view.
      detailViewElement.innerHTML = `<h2 style="margin-top:0;">${new Date(data.date).toLocaleDateString(undefined, { weekday:'short', month:'short', day:'numeric' })}</h2>
        <div>Total: ${this._formatTime(Object.values(data.statesObj).reduce((a, b) => a + b, 0))}</div>`;
      let dominantGame = "";
      let dominantSec = 0;
      for (const [game, secs] of Object.entries(data.statesObj)) {
        if (secs > dominantSec) {
          dominantSec = secs;
          dominantGame = game;
        }
      }
      detailViewElement.innerHTML += `<div>Dominant: ${dominantGame} (${this._formatTime(dominantSec)})</div>`;
      let breakdown = "";
      const games = Object.entries(data.statesObj).sort((a, b) => b[1] - a[1]);
      games.forEach(([game, secs]) => {
        breakdown += `<div style="display: flex; align-items: center; margin-bottom: 4px;">
          <div style="width: 12px; height: 12px; background: ${data.gameColorMap[game]}; margin-right: 8px;"></div>
          <div style="flex:1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${game}</div>
          <div>${this._formatTime(secs)}</div>
        </div>`;
      });
      detailViewElement.innerHTML += `<h3 style="margin-bottom:4px;">Breakdown</h3>${breakdown}`;
    }
  }
}

customElements.define("calendar-heatmap-card", CalendarHeatmapCard);
