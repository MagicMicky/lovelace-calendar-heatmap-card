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
    };
  }

  static get styles() {
    return css`
      :host {
        display: block;
      }
      
      .detail-view {
        display: flex;
        flex-direction: column;
        overflow: hidden;
        height: 100%;
      }
      
      .detail-content {
        flex: 1;
        overflow-y: auto;
        overflow-x: hidden;
      }
      
      .detail-header {
        font-size: 0.9em;
        font-weight: 500;
        margin-bottom: 8px;
        opacity: 0.7;
        text-transform: uppercase;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .detail-date {
        font-size: 1.1em;
        font-weight: 500;
        margin-bottom: 12px;
        color: var(--primary-text-color);
      }
      
      .detail-total {
        font-size: 0.9em;
        margin-bottom: 16px;
        color: var(--secondary-text-color);
      }
      
      .detail-games {
        margin-top: 8px;
      }
      
      .game-item {
        display: flex;
        align-items: center;
        margin-bottom: 8px;
        padding-bottom: 8px;
        border-bottom: 1px solid var(--divider-color);
      }
      
      .game-item:last-child {
        border-bottom: none;
      }
      
      .game-color {
        width: 12px;
        height: 12px;
        border-radius: 3px;
        margin-right: 8px;
        flex-shrink: 0;
      }
      
      .game-name {
        flex: 1;
        font-size: 0.9em;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        color: var(--primary-text-color);
      }
      
      .game-time {
        font-size: 0.8em;
        color: var(--secondary-text-color);
        margin-left: 8px;
        flex-shrink: 0;
      }
      
      .summary-percentage {
        font-size: 0.75em;
        color: var(--secondary-text-color);
        margin-left: 4px;
        flex-shrink: 0;
      }
      
      .no-data-message {
        color: var(--secondary-text-color);
        font-style: italic;
        text-align: center;
        margin-top: 16px;
      }
      
      /* Scrollbar styling */
      .detail-content::-webkit-scrollbar {
        width: 6px;
      }
      
      .detail-content::-webkit-scrollbar-track {
        background: var(--secondary-background-color);
      }
      
      .detail-content::-webkit-scrollbar-thumb {
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
  }

  /**
   * Render a game item
   * @param {string} game - Game name
   * @param {number} secs - Seconds played
   * @param {string} color - Color for the game
   * @param {number} totalSecs - Total seconds (for percentage calculation)
   * @returns {TemplateResult} Lit-html template result
   * @private
   */
  _renderGameItem(game, secs, color, totalSecs) {
    // Calculate the intensity based on percentage of total
    const percentage = totalSecs > 0 ? (secs / totalSecs) : 0;
    const intensity = Math.min(1, Math.sqrt(percentage) * 1.2);
    
    // Use adjustColor to ensure the color has good contrast and is theme-aware
    const adjustedColor = adjustColor(color, intensity);
    
    // Calculate percentage if totalSecs is provided
    const percentValue = totalSecs > 0 ? Math.round((secs / totalSecs) * 100) : 0;
    
    return html`
      <div class="game-item">
        <div class="game-color" style="background: ${adjustedColor}; border: 1px solid rgba(0,0,0,0.1);"></div>
        <div class="game-name">${game}</div>
        <div class="game-time">${formatDuration(secs)}</div>
        ${totalSecs > 0 ? html`<div class="summary-percentage">(${percentValue}%)</div>` : ''}
      </div>
    `;
  }

  /**
   * Render the day details view
   * @returns {TemplateResult} Lit-html template result
   * @private
   */
  _renderDayDetails() {
    if (!this.dayData) {
      return html`<div class="no-data-message">No data available</div>`;
    }
    
    const { date, statesObj, gameColorMap } = this.dayData;
    const dateObj = new Date(date);
    
    // Calculate total seconds
    const totalSeconds = Object.values(statesObj).reduce((a, b) => a + b, 0);
    
    // Sort games by time (descending)
    const games = Object.entries(statesObj).sort((a, b) => b[1] - a[1]);
    
    return html`
      <div class="detail-content">
        <div class="detail-date">
          ${dateObj.toLocaleDateString(undefined, { 
            weekday: 'long', 
            month: 'short', 
            day: 'numeric' 
          })}
        </div>
        
        <div class="detail-total">
          Total: ${formatDuration(totalSeconds)}
        </div>
        
        ${games.length > 0 ? html`
          <div class="detail-games">
            ${games.map(([game, secs]) => 
              this._renderGameItem(game, secs, gameColorMap[game], totalSeconds)
            )}
          </div>
        ` : html`
          <div class="no-data-message">No activity data for this day</div>
        `}
      </div>
    `;
  }

  /**
   * Render the summary view
   * @returns {TemplateResult} Lit-html template result
   * @private
   */
  _renderSummary() {
    if (!this.summaryData) {
      return html`<div class="no-data-message">No data available</div>`;
    }
    
    const { overallTotals, gameColorMap } = this.summaryData;
    
    // Calculate total seconds
    const totalSeconds = Object.values(overallTotals).reduce((a, b) => a + b, 0);
    
    // Sort games by time (descending)
    const games = Object.entries(overallTotals).sort((a, b) => b[1] - a[1]);
    
    return html`
      <div class="detail-content">
        <div class="detail-header">Overall Summary</div>
        
        <div class="detail-total">
          Total: ${formatDuration(totalSeconds)}
        </div>
        
        ${games.length > 0 ? html`
          <div class="detail-games">
            ${games.map(([game, secs]) => 
              this._renderGameItem(game, secs, gameColorMap[game], totalSeconds)
            )}
          </div>
        ` : html`
          <div class="no-data-message">No activity data available</div>
        `}
      </div>
    `;
  }

  render() {
    return html`
      <div class="detail-view">
        ${this.showSummary ? this._renderSummary() : this._renderDayDetails()}
      </div>
    `;
  }
}

customElements.define('detail-view', DetailView); 