const CARD_VERSION = "1.0.6";

class CalendarHeatmapCard extends HTMLElement {
  constructor() {
    super();
    this._hasConnected = false;
    this._interval = null;
    this.attachShadow({ mode: "open" });
  }

  setConfig(config) {
    if (!config.entity) {
      throw new Error("You need to define an entity in your card configuration.");
    }
    // Merge defaults with user config
    this._config = {
      title: "Game Activity",
      days_to_show: 365,
      ignored_states: ["unknown", "idle", "offline", ""],
      refresh_interval: 5 * 60, // seconds
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
      const intervalMs = this._config.refresh_interval * 1000;
      if (intervalMs > 0) {
        this._interval = setInterval(() => this._update(), intervalMs);
      }
    } else {
      if (!this._interval) {
        const intervalMs = this._config.refresh_interval * 1000;
        if (intervalMs > 0) {
          this._interval = setInterval(() => this._update(), intervalMs);
        }
      }
    }
  }

  disconnectedCallback() {
    if (this._interval) {
      clearInterval(this._interval);
      this._interval = null;
    }
    // Do not reset _hasConnected so we avoid duplicate renders on reattachment.
  }

  async _fetchHistory() {
    if (!this._hass) return [];
    const now = new Date();
    const start = new Date(
      now.getTime() - this._config.days_to_show * 24 * 60 * 60 * 1000
    );
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

  async _update() {
    if (!this._hass) return;
    this.shadowRoot.innerHTML = "";

    // Helper function to format duration.
    function formatDuration(sec) {
      if (sec < 60) {
        return `${Math.round(sec)} sec`;
      } else if (sec < 3600) {
        return `${Math.round(sec / 60)} min`;
      } else {
        const hours = Math.floor(sec / 3600);
        const remainder = sec % 3600;
        const minutes = Math.round(remainder / 60);
        return minutes > 0 ? `${hours}h ${minutes}min` : `${hours}h`;
      }
    }

    // Create ha-card for standard theming.
    const card = document.createElement("ha-card");
    card.header = this._config.title || "Calendar Heatmap";

    // Main container
    const container = document.createElement("div");
    container.classList.add("card-content");
    container.style.padding = "16px";
    container.style.display = "flex";
    container.style.flexDirection = "column";

    // Use CSS variables from theme if available.
    const style = getComputedStyle(this);
    const colors = [
      style.getPropertyValue("--calendar-heatmap-no-data-color").trim() || "#ebedf0",
      style.getPropertyValue("--calendar-heatmap-level-1").trim() || "#c6e48b",
      style.getPropertyValue("--calendar-heatmap-level-2").trim() || "#7bc96f",
      style.getPropertyValue("--calendar-heatmap-level-3").trim() || "#239a3b",
      style.getPropertyValue("--calendar-heatmap-level-4").trim() || "#196127",
    ];

    // Fetch sensor history and process data.
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

    // Build weeks array (each week is an array of days) from earliest Monday to today.
    const now = new Date();
    let startDate = new Date(
      now.getTime() - this._config.days_to_show * 24 * 60 * 60 * 1000
    );
    // Adjust startDate to the previous Monday.
    const day = startDate.getDay(); // 0 (Sun) to 6 (Sat)
    const diff = day === 0 ? -6 : 1 - day;
    startDate.setDate(startDate.getDate() + diff);

    const weeks = [];
    const currentDate = new Date(startDate);
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

    // Determine max total seconds for scaling.
    let maxValue = 0;
    for (const dayStr in dailyTotals) {
      const statesObj = dailyTotals[dayStr];
      const sumSeconds = Object.values(statesObj).reduce((acc, val) => acc + val, 0);
      if (sumSeconds > maxValue) maxValue = sumSeconds;
    }

    // Constants for cell dimensions.
    const cellWidth = 12;
    const cellMargin = 2;
    const weekColWidth = cellWidth + cellMargin; // total width per week column

    // --- Build Month Header with Grouping ---
    const monthHeader = document.createElement("div");
    monthHeader.style.display = "flex";
    monthHeader.style.marginLeft = "40px"; // space for day labels
    monthHeader.style.marginBottom = "4px";
    monthHeader.style.fontSize = "0.75em";
    monthHeader.style.color = style.getPropertyValue("--primary-text-color").trim() || "#555";

    // Group weeks by month.
    let groups = [];
    let currentGroup = null;
    weeks.forEach((week) => {
      // Use the first day of the week.
      const firstDay = week[0];
      const month = firstDay.getMonth();
      const monthName = firstDay.toLocaleString("default", { month: "short" });
      if (!currentGroup) {
        currentGroup = { month, monthName, count: 1 };
      } else if (currentGroup.month === month) {
        currentGroup.count++;
      } else {
        groups.push(currentGroup);
        currentGroup = { month, monthName, count: 1 };
      }
    });
    if (currentGroup) {
      groups.push(currentGroup);
    }

    groups.forEach((group) => {
      const label = document.createElement("div");
      label.style.width = `${group.count * weekColWidth}px`;
      label.style.textAlign = "center";
      label.textContent = group.monthName;
      monthHeader.appendChild(label);
    });
    container.appendChild(monthHeader);

    // --- Build Main Grid: Day Labels + Heatmap ---
    const gridContainer = document.createElement("div");
    gridContainer.style.display = "flex";

    // Day labels column.
    const dayLabels = document.createElement("div");
    dayLabels.style.display = "flex";
    dayLabels.style.flexDirection = "column";
    dayLabels.style.marginRight = "4px";
    dayLabels.style.fontSize = "0.75em";
    dayLabels.style.color = style.getPropertyValue("--secondary-text-color").trim() || "#888";
    // Using a known Monday as a base date to localize the weekday names.
    const baseMonday = new Date(1970, 0, 5);
    for (let i = 0; i < 7; i++) {
      const label = document.createElement("div");
      label.style.height = `${cellWidth}px`;
      label.style.marginBottom = `${cellMargin}px`;
      // Only label Monday (i=0), Wednesday (i=2) and Friday (i=4)
      if (i === 0 || i === 2 || i === 4) {
        label.textContent = new Date(
          baseMonday.getTime() + i * 86400000
        ).toLocaleDateString("default", { weekday: "short" });
      } else {
        label.textContent = "";
      }
      dayLabels.appendChild(label);
    }
    gridContainer.appendChild(dayLabels);

    // Heatmap grid container.
    const heatmapGrid = document.createElement("div");
    heatmapGrid.style.display = "flex";
    heatmapGrid.style.flexWrap = "nowrap";

    weeks.forEach((week) => {
      const col = document.createElement("div");
      col.style.display = "flex";
      col.style.flexDirection = "column";
      col.style.marginRight = `${cellMargin}px`;
      // Create one cell per day.
      for (let i = 0; i < 7; i++) {
        let cell;
        if (i < week.length) {
          const date = week[i];
          const dayStr = date.toISOString().split("T")[0];
          const statesObj = dailyTotals[dayStr] || {};
          const sumSeconds = Object.values(statesObj).reduce((acc, val) => acc + val, 0);
          let colorIndex = 0;
          if (maxValue > 0 && sumSeconds > 0) {
            const fraction = sumSeconds / maxValue;
            if (fraction > 0.75) {
              colorIndex = 4;
            } else if (fraction > 0.5) {
              colorIndex = 3;
            } else if (fraction > 0.25) {
              colorIndex = 2;
            } else {
              colorIndex = 1;
            }
          }
          cell = document.createElement("div");
          cell.style.width = `${cellWidth}px`;
          cell.style.height = `${cellWidth}px`;
          cell.style.marginBottom = `${cellMargin}px`;
          cell.style.backgroundColor = colors[colorIndex];
          cell.style.borderRadius = "2px";
          cell.style.pointerEvents = "auto";
          cell.style.cursor = "pointer";
          if (sumSeconds > 0) {
            const lines = [`${dayStr}: ${formatDuration(sumSeconds)} total`];
            for (const [gameName, secs] of Object.entries(statesObj)) {
              lines.push(`  ${gameName}: ${formatDuration(secs)}`);
            }
            cell.title = lines.join("\n");
          } else {
            cell.title = `${dayStr}: No data`;
          }
        } else {
          cell = document.createElement("div");
          cell.style.width = `${cellWidth}px`;
          cell.style.height = `${cellWidth}px`;
          cell.style.marginBottom = `${cellMargin}px`;
        }
        col.appendChild(cell);
      }
      heatmapGrid.appendChild(col);
    });
    gridContainer.appendChild(heatmapGrid);
    container.appendChild(gridContainer);

    // Version/debug text.
    const versionText = document.createElement("div");
    versionText.style.marginTop = "8px";
    versionText.style.fontSize = "0.8em";
    versionText.style.color = style.getPropertyValue("--secondary-text-color").trim() || "#888";
    versionText.textContent = `Calendar Heatmap Card – Version: ${CARD_VERSION}`;
    container.appendChild(versionText);

    card.appendChild(container);
    this.shadowRoot.appendChild(card);
  }
}

customElements.define("calendar-heatmap-card", CalendarHeatmapCard);
