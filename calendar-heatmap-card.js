const CARD_VERSION = "1.0.0";

class CalendarHeatmapCard extends HTMLElement {
  setConfig(config) {
    if (!config.entity) {
      throw new Error('You need to define an entity in your card configuration.');
    }
    // Default configuration + user config
    this._config = Object.assign(
      {
        title: 'Game Activity',
        days_to_show: 365,
        ignored_states: ['unknown', 'idle', 'offline', ''],
      },
      config
    );
    if (!this.shadowRoot) {
      this.attachShadow({ mode: "open" });
    }
  }

  set hass(hass) {
    this._hass = hass;
    this._update();
  }

  getCardSize() {
    return 4; // approximate
  }

  async _fetchHistory() {
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
      console.error("Error fetching history data", err);
      return [];
    }
  }

  async _update() {
    // Create container
    const container = document.createElement("div");
    container.style.padding = "16px";
    container.style.fontFamily = "Arial, sans-serif";

    // Title
    const title = document.createElement("h3");
    title.textContent = this._config.title;
    container.appendChild(title);

    // Fetch sensor history
    const historyData = await this._fetchHistory();
    let dailyTotals = {}; 
    if (historyData && historyData[0]) {
      const entityHistory = historyData[0];
      for (let i = 0; i < entityHistory.length - 1; i++) {
        const current = entityHistory[i];
        const next = entityHistory[i + 1];

        // If current state's not in the ignored states, treat it as a "playing" state
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
          dailyTotals[dayStr][stateName] = (dailyTotals[dayStr][stateName] || 0) + diffSeconds;
        }
      }
    }

    // Build the weeks array, from the earliest Sunday to today
    const now = new Date();
    let startDate = new Date(now.getTime() - this._config.days_to_show * 24 * 60 * 60 * 1000);
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

    // Calculate the maximum total time for any day
    let maxValue = 0;
    for (const dayStr in dailyTotals) {
      const statesObj = dailyTotals[dayStr];
      const sumSeconds = Object.values(statesObj).reduce((acc, val) => acc + val, 0);
      if (sumSeconds > maxValue) maxValue = sumSeconds;
    }

    // GitHub color scheme
    const colors = [
      "#ebedf0", // 0 or no data
      "#c6e48b",
      "#7bc96f",
      "#239a3b",
      "#196127",
    ];

    const heatmapContainer = document.createElement("div");
    heatmapContainer.style.display = "flex";

    weeks.forEach((week) => {
      const col = document.createElement("div");
      col.style.display = "flex";
      col.style.flexDirection = "column";
      col.style.marginRight = "2px";

      week.forEach((date) => {
        const dayStr = date.toISOString().split("T")[0];
        const statesObj = dailyTotals[dayStr] || {};
        const sumSeconds = Object.values(statesObj).reduce((acc, val) => acc + val, 0);

        // Determine color
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
        cell.style.pointerEvents = "auto"; // Ensure pointer events are enabled
        
        // Build tooltip
        if (sumSeconds > 0) {
          let tooltipLines = [`${dayStr}: ${Math.round(sumSeconds)} sec total`];
          for (const [gameName, secs] of Object.entries(statesObj)) {
            tooltipLines.push(`  ${gameName}: ${Math.round(secs)} sec`);
          }
          cell.title = tooltipLines.join('\n');
        } else {
          cell.title = `${dayStr}: No data`;
        }
        col.appendChild(cell);
      });
      heatmapContainer.appendChild(col);
    });

    container.appendChild(heatmapContainer);

    // Add version text at the bottom for debugging
    const versionText = document.createElement("div");
    versionText.style.marginTop = "8px";
    versionText.style.fontSize = "0.8em";
    versionText.style.color = "#666";
    versionText.textContent = `Calendar Heatmap Card – Version: ${CARD_VERSION}`;
    container.appendChild(versionText);

    // Render into shadow DOM
    this.shadowRoot.innerHTML = "";
    this.shadowRoot.appendChild(container);
  }

  connectedCallback() {
    this._interval = setInterval(() => this._update(), 5 * 60 * 1000);
  }

  disconnectedCallback() {
    if (this._interval) clearInterval(this._interval);
  }
}

customElements.define("calendar-heatmap-card", CalendarHeatmapCard);
