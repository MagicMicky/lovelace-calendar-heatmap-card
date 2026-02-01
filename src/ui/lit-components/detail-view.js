import { LitElement, html, css } from 'lit';
import { formatDuration } from '../../utils/format-utils.js';
import { adjustColor } from '../../utils/color-utils.js';

/**
 * DetailView component
 * A LitElement component that renders the detail view for the heatmap
 */
export class DetailView extends LitElement {
  static get properties() {
    return {
      selectedDate: { type: String },
      dayData: { type: Object },
      summaryData: { type: Object },
      showSummary: { type: Boolean },
      _showAllGames: { type: Boolean, state: true },
      _maxGamesToShow: { type: Number, state: true },
      // Binary mode properties
      binaryMode: { type: Boolean },
      binaryStats: { type: Object },
    };
  }

  static get styles() {
    return css`
      :host {
        display: flex;
        flex-direction: column;
        height: 100%;
        overflow: hidden;
      }

      /* Content area with scrolling */
      .content-area {
        flex: 1;
        overflow-y: auto;
        overflow-x: hidden;
      }

      /* Button area */
      .button-area {
        flex-shrink: 0;
        display: flex;
        justify-content: center;
        padding: 0 8px 0px 8px;
      }

      /* Text elements */
      .header {
        font-size: 0.9em;
        font-weight: 500;
        margin-bottom: 8px;
        opacity: 0.7;
        text-transform: uppercase;
      }

      .date {
        font-size: 1.1em;
        font-weight: 500;
        margin-bottom: 8px;
        color: var(--primary-text-color);
      }

      .total {
        font-size: 0.9em;
        margin-bottom: 12px;
        color: var(--secondary-text-color);
      }

      .games-list {
        margin-top: 8px;
      }

      /* Game item */
      .game-item {
        display: flex;
        align-items: center;
        margin-bottom: 6px;
        padding-bottom: 6px;
        border-bottom: 1px solid var(--divider-color);
      }

      .game-item:last-child {
        border-bottom: none;
        margin-bottom: 0;
      }

      .color-indicator {
        width: 12px;
        height: 12px;
        border-radius: 3px;
        margin-right: 8px;
        flex-shrink: 0;
        border: 1px solid rgba(0, 0, 0, 0.1);
      }

      .name {
        flex: 1;
        font-size: 0.9em;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        color: var(--primary-text-color);
      }

      .time {
        font-size: 0.8em;
        color: var(--secondary-text-color);
        margin-left: 8px;
        flex-shrink: 0;
      }

      .percentage {
        font-size: 0.75em;
        color: var(--secondary-text-color);
        margin-left: 4px;
        flex-shrink: 0;
      }

      .no-data {
        color: var(--secondary-text-color);
        font-style: italic;
        text-align: center;
        margin-top: 16px;
      }

      /* Button styling */
      .toggle-button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 0.75em;
        color: rgb(var(--rgb-primary-color));
        cursor: pointer;
        border-radius: 10px;
        background-color: rgba(var(--rgb-primary-color), 0.1);
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        transition: all 0.2s ease;
        max-width: 100%;
      }

      .toggle-button:hover {
        background-color: rgba(var(--rgb-primary-color), 0.15);
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
      }

      .more-info {
        color: var(--secondary-text-color);
        margin-right: 4px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .show-text {
        font-weight: 500;
        white-space: nowrap;
      }

      /* Scrollbar styling */
      .content-area::-webkit-scrollbar {
        width: 6px;
      }

      .content-area::-webkit-scrollbar-track {
        background: var(--secondary-background-color);
      }

      .content-area::-webkit-scrollbar-thumb {
        background-color: var(--secondary-text-color);
        border-radius: 3px;
      }
    `;
  }

  constructor() {
    super();
    this.selectedDate = null;
    this.dayData = null;
    this.summaryData = null;
    this.showSummary = true;
    this._showAllGames = false;
    this._maxGamesToShow = 4; // Show 4 games by default
    // Binary mode properties
    this.binaryMode = false;
    this.binaryStats = null;
  }

  _toggleShowAllGames() {
    this._showAllGames = !this._showAllGames;
  }

  _renderGameItem(game, secs, color, totalSecs) {
    const percentage = totalSecs > 0 ? secs / totalSecs : 0;
    const intensity = Math.min(1, Math.sqrt(percentage) * 1.2);
    const adjustedColor = adjustColor(color, intensity);
    const percentValue =
      totalSecs > 0 ? Math.round((secs / totalSecs) * 100) : 0;

    return html`
      <div class="game-item">
        <div
          class="color-indicator"
          style="background: ${adjustedColor};"
        ></div>
        <div class="name">${game}</div>
        <div class="time">${formatDuration(secs)}</div>
      </div>
    `;
  }

  /**
   * Render binary mode content (summary or day view)
   * @returns {TemplateResult} Lit-html template result
   * @private
   */
  _renderBinaryContent() {
    if (this.showSummary) {
      // Binary summary view
      if (!this.binaryStats) {
        return html`
          <div class="content-area">
            <div class="no-data">No data available</div>
          </div>
        `;
      }

      const { activeDays, totalDays, percentage } = this.binaryStats;

      return html`
        <div class="content-area">
          <div class="header">Activity Summary</div>
          <div class="total">
            ${activeDays} / ${totalDays} days (${percentage}% active)
          </div>
        </div>
      `;
    } else {
      // Binary day view
      if (!this.dayData) {
        return html`
          <div class="content-area">
            <div class="no-data">No data available</div>
          </div>
        `;
      }

      const { date, statesObj = {}, isActive } = this.dayData;
      const dateObj = date ? new Date(date) : new Date();
      const states = Object.keys(statesObj);

      return html`
        <div class="content-area">
          <div class="date">
            ${dateObj.toLocaleDateString(undefined, {
              weekday: 'long',
              month: 'short',
              day: 'numeric',
            })}
          </div>
          <div class="total">${isActive ? 'Active' : 'No activity'}</div>

          ${isActive && states.length > 0
            ? html`
                <div class="games-list">
                  ${states.map(
                    (state) => html`
                      <div class="game-item">
                        <div class="name">${state}</div>
                      </div>
                    `,
                  )}
                </div>
              `
            : ''}
        </div>
      `;
    }
  }

  _renderContent() {
    // Handle no data cases
    if (
      (this.showSummary && !this.summaryData) ||
      (!this.showSummary && !this.dayData)
    ) {
      return html`
        <div class="content-area">
          <div class="no-data">No data available</div>
        </div>
      `;
    }

    // Get the appropriate data based on view type
    const { title, totalSeconds, games, gameColorMap } = this._prepareData();

    // Determine which games to show
    const gamesToShow = this._showAllGames
      ? games
      : games.slice(0, this._maxGamesToShow);
    const hasMoreGames = games.length > this._maxGamesToShow;

    // Calculate additional games info
    const additionalGamesTime =
      hasMoreGames && !this._showAllGames
        ? games
            .slice(this._maxGamesToShow)
            .reduce((total, [_, secs]) => total + secs, 0)
        : 0;
    const additionalGamesCount = hasMoreGames
      ? games.length - this._maxGamesToShow
      : 0;

    return html`
      <div class="content-area">
        ${title}
        <div class="total">Total: ${formatDuration(totalSeconds)}</div>

        ${games.length > 0
          ? html`
              <div class="games-list">
                ${gamesToShow.map(([game, secs]) =>
                  this._renderGameItem(
                    game,
                    secs,
                    gameColorMap[game],
                    totalSeconds,
                  ),
                )}
              </div>
            `
          : html` <div class="no-data">No activity data available</div> `}
      </div>

      ${hasMoreGames
        ? html`
            <div class="button-area">
              <div class="toggle-button" @click=${this._toggleShowAllGames}>
                ${this._showAllGames
                  ? html`<span class="show-text">Show less</span>`
                  : html`
                      <span class="more-info"
                        >${additionalGamesCount} more items</span
                      >
                      <span class="show-text">Show all</span>
                    `}
              </div>
            </div>
          `
        : ''}
    `;
  }

  _prepareData() {
    if (this.showSummary) {
      // Summary view data
      const { overallTotals = {}, gameColorMap = {} } = this.summaryData || {};
      const totalSeconds = overallTotals
        ? Object.values(overallTotals).reduce((a, b) => a + b, 0)
        : 0;
      const games = overallTotals
        ? Object.entries(overallTotals).sort((a, b) => b[1] - a[1])
        : [];
      const title = html`<div class="header">Overall Summary</div>`;

      return { title, totalSeconds, games, gameColorMap };
    } else {
      // Day details view data
      const { date, statesObj = {}, gameColorMap = {} } = this.dayData || {};
      const dateObj = date ? new Date(date) : new Date();
      const totalSeconds = statesObj
        ? Object.values(statesObj).reduce((a, b) => a + b, 0)
        : 0;
      const games = statesObj
        ? Object.entries(statesObj).sort((a, b) => b[1] - a[1])
        : [];

      const title = html`
        <div class="date">
          ${dateObj.toLocaleDateString(undefined, {
            weekday: 'long',
            month: 'short',
            day: 'numeric',
          })}
        </div>
      `;

      return { title, totalSeconds, games, gameColorMap };
    }
  }

  updated(changedProperties) {
    if (
      changedProperties.has('showSummary') ||
      changedProperties.has('selectedDate')
    ) {
      this._showAllGames = false;
    }
  }

  render() {
    // Use binary mode rendering if enabled
    if (this.binaryMode) {
      return this._renderBinaryContent();
    }
    return this._renderContent();
  }
}

customElements.define('detail-view', DetailView);
