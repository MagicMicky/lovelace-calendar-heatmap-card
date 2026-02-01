import { LitElement, html, css } from 'lit';
import { formatDuration } from '../../utils/format-utils.js';
import { findDominantGame } from '../../data/data-processor.js';
import {
  adjustColor,
  getNoDataColorWithOpacity,
} from '../../utils/color-utils.js';
import { CELL_DIMENSIONS } from '../cell-dimensions.js';
import { DEFAULT_CONFIG } from '../../constants.js';

/**
 * HeatmapGrid component
 * A LitElement component that renders the heatmap grid
 */
export class HeatmapGrid extends LitElement {
  static get properties() {
    return {
      weeks: { type: Array },
      dailyTotals: { type: Object },
      maxValue: { type: Number },
      gameColorMap: { type: Object },
      selectedDate: { type: String },
      // Binary mode properties
      binaryMode: { type: Boolean },
      binaryTotals: { type: Object },
      binaryColor: { type: String },
    };
  }

  static get styles() {
    const { cellWidth, cellMargin, weekColWidth } = CELL_DIMENSIONS;

    return css`
      :host {
        display: block;
      }

      .heatmap-grid {
        display: flex;
        flex-direction: row;
        overflow: visible;
        margin-top: 0;
        margin-bottom: 0;
        padding-top: 6px;
        box-sizing: border-box;
      }

      .week-column {
        display: flex;
        flex-direction: column;
        width: ${weekColWidth}px;
        box-sizing: border-box;
      }

      .week-column-spacing {
        margin-right: 0;
      }

      .day-cell {
        width: ${cellWidth}px;
        height: ${cellWidth}px;
        margin-bottom: ${cellMargin}px;
        border-radius: 2px;
        box-sizing: border-box;
        cursor: pointer;
        transition:
          transform 0.1s ease-in-out,
          box-shadow 0.1s ease-in-out,
          border-color 0.1s ease-in-out;
        border: 1px solid rgba(0, 0, 0, 0.05);
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        position: relative;
      }

      .day-cell:hover {
        transform: scale(1.15);
        z-index: 10;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        border-color: rgba(0, 0, 0, 0.1);
      }

      .day-cell.selected {
        border: 2px solid var(--primary-text-color);
        box-shadow: 0 0 6px rgba(0, 0, 0, 0.3);
      }

      .day-cell::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border-radius: 1px;
        box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
        pointer-events: none;
      }

      .empty-cell {
        width: ${cellWidth}px;
        height: ${cellWidth}px;
        margin-bottom: ${cellMargin}px;
        box-sizing: border-box;
      }
    `;
  }

  constructor() {
    super();
    this.weeks = [];
    this.dailyTotals = {};
    this.maxValue = 0;
    this.gameColorMap = {};
    this.selectedDate = null;
    // Binary mode properties
    this.binaryMode = false;
    this.binaryTotals = {};
    this.binaryColor = DEFAULT_CONFIG.binary_color;
  }

  /**
   * Handle cell click event
   * @param {Object} data - Cell data
   * @private
   */
  _handleCellClick(data) {
    this.dispatchEvent(
      new CustomEvent('cell-click', {
        detail: data,
        bubbles: true,
        composed: true,
      }),
    );
  }

  /**
   * Handle cell hover event
   * @param {Object} data - Cell data
   * @private
   */
  _handleCellHover(data) {
    this.dispatchEvent(
      new CustomEvent('cell-hover', {
        detail: data,
        bubbles: true,
        composed: true,
      }),
    );
  }

  /**
   * Handle cell hover end event
   * @private
   */
  _handleCellHoverEnd() {
    this.dispatchEvent(
      new CustomEvent('cell-hover', {
        detail: null,
        bubbles: true,
        composed: true,
      }),
    );
  }

  /**
   * Calculate cell color based on intensity
   * @param {string} dominantGame - Dominant game for the day
   * @param {number} dominantSec - Seconds of dominant game
   * @param {number} intensity - Intensity value (0-1)
   * @param {string} dayStr - Day string (YYYY-MM-DD)
   * @returns {string} Cell color
   * @private
   */
  _calculateCellColor(dominantGame, dominantSec, intensity, dayStr) {
    if (dominantGame && dominantSec > 0) {
      const baseColor = this.gameColorMap[dominantGame];
      return adjustColor(baseColor, intensity);
    } else {
      return getNoDataColorWithOpacity(
        this.selectedDate === dayStr ? 0.5 : 0.3,
      );
    }
  }

  /**
   * Calculate intensity based on dominant game seconds
   * @param {number} dominantSec - Seconds of dominant game
   * @returns {number} Intensity value (0-1)
   * @private
   */
  _calculateIntensity(dominantSec) {
    if (this.maxValue <= 0 || dominantSec <= 0) {
      return 0;
    }

    // Define time thresholds in seconds for better visual differentiation
    const THRESHOLDS = {
      MINIMAL: 15 * 60, // 15 minutes
      LOW: 45 * 60, // 45 minutes
      MEDIUM: 2 * 60 * 60, // 2 hours
      HIGH: 4 * 60 * 60, // 4 hours
      VERY_HIGH: 8 * 60 * 60, // 8 hours
    };

    // Use a stepped approach for more distinct visual differences
    let intensity;

    if (dominantSec < THRESHOLDS.MINIMAL) {
      // Very short sessions (< 15 min)
      intensity = 0.2;
    } else if (dominantSec < THRESHOLDS.LOW) {
      // Short sessions (15-45 min)
      intensity = 0.35;
    } else if (dominantSec < THRESHOLDS.MEDIUM) {
      // Medium sessions (45 min - 2 hours)
      intensity = 0.55;
    } else if (dominantSec < THRESHOLDS.HIGH) {
      // Longer sessions (2-4 hours)
      intensity = 0.75;
    } else if (dominantSec < THRESHOLDS.VERY_HIGH) {
      // High usage sessions (4-8 hours)
      intensity = 0.9;
    } else {
      // Very high usage sessions (8+ hours)
      intensity = 1.0;
    }

    // Add a small variation within each band based on the exact duration
    const bandSize = 0.05; // Size of variation within each band

    // Calculate position within the current band
    let positionInBand = 0;
    if (dominantSec < THRESHOLDS.MINIMAL) {
      positionInBand = dominantSec / THRESHOLDS.MINIMAL;
    } else if (dominantSec < THRESHOLDS.LOW) {
      positionInBand =
        (dominantSec - THRESHOLDS.MINIMAL) /
        (THRESHOLDS.LOW - THRESHOLDS.MINIMAL);
    } else if (dominantSec < THRESHOLDS.MEDIUM) {
      positionInBand =
        (dominantSec - THRESHOLDS.LOW) / (THRESHOLDS.MEDIUM - THRESHOLDS.LOW);
    } else if (dominantSec < THRESHOLDS.HIGH) {
      positionInBand =
        (dominantSec - THRESHOLDS.MEDIUM) /
        (THRESHOLDS.HIGH - THRESHOLDS.MEDIUM);
    } else if (dominantSec < THRESHOLDS.VERY_HIGH) {
      positionInBand =
        (dominantSec - THRESHOLDS.HIGH) /
        (THRESHOLDS.VERY_HIGH - THRESHOLDS.HIGH);
    } else {
      positionInBand = Math.min(
        1,
        (dominantSec - THRESHOLDS.VERY_HIGH) / THRESHOLDS.VERY_HIGH,
      );
    }

    // Apply the variation within the band
    intensity += positionInBand * bandSize - bandSize / 2;

    // Ensure intensity stays within bounds
    return Math.max(0.15, Math.min(1, intensity));
  }

  /**
   * Render a day cell
   * @param {Date} date - Date object
   * @param {number} weekIndex - Week index
   * @param {number} dayIndex - Day index
   * @returns {TemplateResult} Lit-html template result
   * @private
   */
  _renderDayCell(date, weekIndex, dayIndex) {
    const dayStr = date.toISOString().split('T')[0];
    const statesObj = this.dailyTotals[dayStr] || {};
    const sumSeconds = Object.values(statesObj).reduce(
      (acc, val) => acc + val,
      0,
    );

    let cellColor;
    let intensity;
    let tooltipText;

    if (this.binaryMode) {
      // Binary mode rendering
      const isActive = this.binaryTotals[dayStr] === true;
      intensity = isActive ? 1.0 : 0;
      cellColor = isActive
        ? adjustColor(this.binaryColor, 1.0)
        : getNoDataColorWithOpacity(this.selectedDate === dayStr ? 0.5 : 0.3);
      tooltipText = `${date.toLocaleDateString()} - ${isActive ? 'Active' : 'No activity'}`;
    } else {
      // Standard duration-based rendering
      const { dominantGame, dominantSec } = findDominantGame(statesObj);
      intensity = this._calculateIntensity(dominantSec);
      cellColor = this._calculateCellColor(
        dominantGame,
        dominantSec,
        intensity,
        dayStr,
      );
      tooltipText = `${date.toLocaleDateString()} - ${sumSeconds > 0 ? formatDuration(sumSeconds) : 'No activity'}`;
    }

    // Add a data attribute for the intensity value - useful for debugging and testing
    const intensityPercent = Math.round(intensity * 100);

    // Create cell with appropriate class
    const classNames = ['day-cell'];
    if (this.selectedDate === dayStr) {
      classNames.push('selected');
    }

    // Add position-specific classes to handle edge cases
    if (dayIndex === 0) classNames.push('first-in-row');
    if (dayIndex === 6) classNames.push('last-in-row');
    if (weekIndex === 0) classNames.push('first-in-column');
    if (weekIndex === this.weeks.length - 1) classNames.push('last-in-column');

    // Create cell data for events
    const cellData = {
      date: dayStr,
      statesObj,
      gameColorMap: this.gameColorMap,
      binaryMode: this.binaryMode,
      isActive: this.binaryMode ? this.binaryTotals[dayStr] === true : null,
    };

    return html`
      <div
        class=${classNames.join(' ')}
        style="background-color: ${cellColor};"
        title="${tooltipText}"
        data-intensity="${intensityPercent}"
        @click=${() => this._handleCellClick(cellData)}
        @mouseenter=${() => this._handleCellHover(cellData)}
        @mouseleave=${this._handleCellHoverEnd}
      ></div>
    `;
  }

  /**
   * Render an empty cell
   * @returns {TemplateResult} Lit-html template result
   * @private
   */
  _renderEmptyCell() {
    return html`<div class="empty-cell"></div>`;
  }

  render() {
    const { weekColWidth } = CELL_DIMENSIONS;

    return html`
      <div
        class="heatmap-grid"
        style="min-width: ${this.weeks.length * weekColWidth}px;"
      >
        ${this.weeks.map(
          (week, weekIndex) => html`
            <div class="week-column week-column-spacing">
              ${Array(7)
                .fill(0)
                .map((_, dayIndex) => {
                  if (dayIndex < week.length && week[dayIndex] !== null) {
                    return this._renderDayCell(
                      week[dayIndex],
                      weekIndex,
                      dayIndex,
                    );
                  } else {
                    return this._renderEmptyCell();
                  }
                })}
            </div>
          `,
        )}
      </div>
    `;
  }
}

customElements.define('heatmap-grid', HeatmapGrid);
