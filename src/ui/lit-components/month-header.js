import { LitElement, html, css } from 'lit';
import { CELL_DIMENSIONS } from '../cell-dimensions.js';

/**
 * MonthHeader component
 * A LitElement component that renders the month header for the heatmap
 */
export class MonthHeader extends LitElement {
  static get properties() {
    return {
      monthGroups: { type: Array },
    };
  }

  static get styles() {
    return css`
      :host {
        display: block;
      }
      
      .month-header {
        display: flex;
        margin-left: 36px;
        margin-bottom: 4px;
        font-size: 0.8em;
        font-weight: 500;
        color: var(--primary-text-color);
        position: sticky;
        left: 36px;
        background-color: var(--card-background-color);
        z-index: 1;
        white-space: nowrap;
        padding-left: 3px;
      }
      
      .month-label {
        text-align: center;
        display: inline-block;
        overflow: hidden;
        box-sizing: border-box;
      }
    `;
  }

  constructor() {
    super();
    this.monthGroups = [];
  }

  render() {
    const { weekColWidth } = CELL_DIMENSIONS;
    
    // Calculate total width to ensure proper alignment
    const totalWidth = this.monthGroups.reduce((total, group) => {
      return total + (group.count * weekColWidth);
    }, 0);
    
    return html`
      <div class="month-header" style="min-width: ${totalWidth}px;">
        ${this.monthGroups.map(group => {
          const width = group.count * weekColWidth;
          return html`
            <div class="month-label" style="width: ${width}px;">
              ${group.monthName}
            </div>
          `;
        })}
      </div>
    `;
  }
}

customElements.define('month-header', MonthHeader); 