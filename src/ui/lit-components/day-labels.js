import { LitElement, html, css } from 'lit';
import { getLocalizedDayNames } from '../../utils/date-utils.js';
import { CELL_DIMENSIONS } from '../cell-dimensions.js';

/**
 * DayLabels component
 * A LitElement component that renders the day labels for the heatmap
 */
export class DayLabels extends LitElement {
  static get properties() {
    return {
      startDayOfWeek: { type: String },
    };
  }

  static get styles() {
    const { cellWidth, cellMargin } = CELL_DIMENSIONS;
    
    return css`
      :host {
        display: block;
      }
      
      .day-labels {
        display: flex;
        flex-direction: column;
        margin-right: 4px;
        font-size: 0.75em;
        color: var(--secondary-text-color);
        position: sticky;
        left: 0;
        z-index: 2;
        background-color: var(--card-background-color);
        width: 32px;
        text-align: right;
        padding-top: 6px;
        box-sizing: border-box;
        margin-top: 0;
        margin-bottom: 0;
      }
      
      .day-label {
        height: ${cellWidth}px;
        margin-bottom: ${cellMargin}px;
        padding-right: 4px;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        box-sizing: border-box;
      }
    `;
  }

  constructor() {
    super();
    this.startDayOfWeek = 'monday';
  }

  render() {
    // Get localized day names
    const dayNamesArr = getLocalizedDayNames(this.startDayOfWeek);
    
    // Only show Monday (index 0), Wednesday (index 2) and Friday (index 4) when starting with Monday
    // Or Sunday (index 0), Tuesday (index 2) and Thursday (index 4) when starting with Sunday
    const displayIndices = [0, 2, 4];
    
    return html`
      <div class="day-labels">
        ${Array(7).fill(0).map((_, i) => html`
          <div class="day-label">
            ${displayIndices.includes(i) ? dayNamesArr[i] : ''}
          </div>
        `)}
      </div>
    `;
  }
}

customElements.define('day-labels', DayLabels); 