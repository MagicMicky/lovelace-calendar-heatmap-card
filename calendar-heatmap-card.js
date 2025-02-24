const CARD_VERSION = "1.0.1";

class CalendarHeatmapCard extends HTMLElement {
  setConfig(config) {
    if (!config.entity) {
      throw new Error("You need to define an entity in your card configuration.");
    }
    this._config = {
      title: "Game Activity",
      days_to_show: 365,
      ignored_states: ["unknown", "idle", "offline", ""],
      ...config,
    };
    if (!this.shadowRoot) {
      this.attachShadow({ mode: "open" });
    }
  }

  set hass(hass) {
    this._hass = hass;
    this._update();
  }

  getCardSize() {
    // Approximate number of rows the card might occupy
    return 5;
  }

  connectedCallback() {
    // Refresh data every 5 minutes
    this._interval = setInterval(() => this._update(), 5 * 60 * 1000);
  }

  disconnectedCallback() {
    if (this._interval) clearInterval(this._interval);
  }

  async _fetchHistory() {
    const now = new Date();
    const start = new Date(now.getTime() - this._config.days_to_show * 24 * 60 * 60 * 1000);
    const startISOString = start.toISOString();
    const endISOString = now.toISOString();

    try {
      // Note: callApi automatically prefixes /api, so we don't include it ourselves
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
    // Clear existing content
    this.shadowRoot.innerHTML = "";

    // Create the ha-card, which applies standard styling/theme
    const card = document.createElement("ha-card");
    // Use the standard header if you want the typical Lovelace card title area
    card.header = this._config.title || "Calendar Heatmap";

    // Create a container for the card content
    const container = document.createElement("div");
    container.classList.add("card-content");
    // A bit of padding so we have space for the heatmap
    container.style.padding = "16px";
    container.style.display = "flex";
    container.style.flexDirection = "column";

    // Fetch history data
    const historyData = await this._fetchHistory();
    let dailyTotals = {};

    // Process the sensor history
    if (historyData && historyData[0]) {
      const entityHistory = historyData[0];
      for (let i = 0; i < entityHistory.length - 1; i++) {
        const current = entityHistory[i];
        const next = entityHistory[i + 1];

        // If the current state isn't in the ignored list, count it as "active/playing"
        const stateLower = current.state.toLowerCase();
        if (!this._config.ignored_states.includes(stateLower)) {
          const startTime = new Date(current.last_changed);
          const endTime = new Date(next.last_changed);
          const diffSeconds = (endTime - startTime) / 1000;

          // Use the startTime's date for grouping
          const dayStr = startTime.toISOString().split("T")[0];
          if (!dailyTotals[dayStr]) {
            dailyTotals[dayStr] = {};
          }
          // Accumulate time under the specific state (e.g. "Overwatch")
          const stateName = current.state;
          dailyTotals[dayStr][stateName] = (dailyTotals[dayStr][stateName] || 0) + diffSeconds;
        }
      }
    }

    // Build an array of weeks (each with 7 days) from the earliest Sunday to "now"
    const now = new Date();
    let startDate = new Date(now.getTime() - this._config.days_to_show * 24 * 60 * 60 * 1000);
    // Align to Sunday (GitHub style)
    const dayOfWeek = startDate.getDay();
    startDate.setDate(startDate.getDate() - dayOfWeek);

    const weeks = [];
    const currentDate = new Date(startDate);
    while (currentDate <= now) {
      const week = [];
      for (let d = 0; d < 7; d++) {
        week.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }
      weeks.push(week);
    }

    // Find the max total time in seconds across all days for color scaling
    let maxValue = 0;
    for (const dayStr in dailyTotals) {
      const statesObj = dailyTotals[dayStr];
      const sumSeconds = Object.values(statesObj).reduce((acc, val) => acc + val, 0);
      if (sumSeconds > maxValue) {
        maxValue = sumSeconds;
      }
    }

    // GitHub-like color palette
    const colors = [
      "#ebedf0", // no data
      "#c6e48b",
      "#7bc96f",
      "#239a3b",
      "#196127",
    ];

    // Create a container for the heatmap grid
    const heatmapContainer = document.createElement("div");
    heatmapContainer.style.display = "flex";
    heatmapContainer.style.flexWrap = "nowrap";

    // Build the columns (weeks)
    weeks.forEach((week) => {
      const col = document.createElement("div");
      col.style.display = "flex";
      col.style.flexDirection = "column";
      col.style.marginRight = "2px";

      week.forEach((date) => {
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

        const cell = document.createElement("div");
        cell.style.width = "12px";
        cell.style.height = "12px";
        cell.style.marginBottom = "2px";
        cell.style.backgroundColor = colors[colorIndex];
        cell.style.borderRadius = "2px";
        // Enable pointer events so native tooltips work
        cell.style.pointerEvents = "auto";
        cell.style.cursor = "pointer";

        // Build the tooltip text
        if (sumSeconds > 0) {
          const dayTotal = Math.round(sumSeconds);
          const lines = [`${dayStr}: ${dayTotal} sec total`];
          for (const [gameName, secs] of Object.entries(statesObj)) {
            lines.push(`  ${gameName}: ${Math.round(secs)} sec`);
          }
          cell.title = lines.join("\n");
        } else {
          cell.title = `${dayStr}: No data`;
        }

        col.appendChild(cell);
      });

      heatmapContainer.appendChild(col);
    });

    container.appendChild(heatmapContainer);

    // Add a small version label for debugging
    const versionText = document.createElement("div");
    versionText.style.marginTop = "8px";
    versionText.style.fontSize = "0.8em";
    versionText.style.color = "var(--secondary-text-color)";
    versionText.textContent = `Calendar Heatmap Card – Version: ${CARD_VERSION}`;
    container.appendChild(versionText);

    card.appendChild(container);
    this.shadowRoot.appendChild(card);
  }
}

customElements.define("calendar-heatmap-card", CalendarHeatmapCard);
