/**
 * Constants for cell dimensions
 */
export const CELL_DIMENSIONS = {
  cellWidth: 14,
  cellMargin: 3,
  get weekColWidth() {
    return this.cellWidth + this.cellMargin;
  }
};

/**
 * Style system for the Calendar Heatmap Card
 * 
 * This file contains two complementary styling approaches:
 * 1. CARD_STYLES - CSS string for the overall card styling (injected via <style>)
 * 2. COMPONENT_STYLES - JavaScript objects for individual component styling (applied directly)
 * 
 * The styling system uses Home Assistant CSS variables to automatically adapt to the current theme.
 */

/**
 * Get all CSS styles for the card and components
 * Uses Home Assistant CSS variables to automatically adapt to the current theme
 * 
 * @returns {string} CSS styles as a string
 */
export function getStyles() {
  return `
    :host {
      /* Text colors */
      --heatmap-primary-text: var(--primary-text-color);
      --heatmap-secondary-text: var(--secondary-text-color);
      
      /* Background colors */
      --heatmap-card-background: var(--ha-card-background, var(--card-background-color));
      --heatmap-secondary-background: var(--secondary-background-color);
      
      /* Heatmap specific colors */
      --heatmap-no-data-color: var(--calendar-heatmap-no-data-color, var(--disabled-text-color));
      --heatmap-level-1: var(--calendar-heatmap-level-1, var(--success-color));
      --heatmap-level-2: var(--calendar-heatmap-level-2, var(--primary-color));
      --heatmap-level-3: var(--calendar-heatmap-level-3, var(--accent-color));
      --heatmap-level-4: var(--calendar-heatmap-level-4, var(--state-active-color));
      
      /* UI elements */
      --heatmap-divider-color: var(--divider-color);
      --heatmap-box-shadow: var(--ha-card-box-shadow, 0 2px 5px rgba(0,0,0,0.26));
      --heatmap-border-radius: var(--ha-card-border-radius, 4px);
      
      /* Layout dimensions */
      --heatmap-cell-width: ${CELL_DIMENSIONS.cellWidth}px;
      --heatmap-cell-margin: ${CELL_DIMENSIONS.cellMargin}px;
      --heatmap-week-col-width: ${CELL_DIMENSIONS.weekColWidth}px;
    }
    
    /* Card Container */
    ha-card {
      box-shadow: var(--heatmap-box-shadow);
      border-radius: var(--heatmap-border-radius);
      color: var(--heatmap-primary-text);
      background: var(--heatmap-card-background);
      overflow: hidden;
      position: relative;
      padding: 0;
    }
    
    .card-content {
      font-family: var(--primary-font-family, var(--paper-font-common-base));
      display: flex;
      flex-wrap: wrap;
      padding: 0;
      height: auto;
      min-height: 220px;
    }
    
    /* Layout Containers */
    .heatmap-container {
      flex: 3;
      min-width: 0;
      padding: 16px 16px 24px 16px;
      background-color: var(--heatmap-card-background);
      min-height: 220px;
      overflow: hidden;
      position: relative;
      display: flex;
      flex-direction: column;
      height: 100%;
    }
    
    .detail-view {
      flex: 1;
      min-width: 200px;
      max-width: 280px;
      padding: 16px 16px 16px 12px;
      background-color: var(--heatmap-secondary-background);
      border-left: 1px solid var(--heatmap-divider-color);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      opacity: 0.9;
      min-height: 220px;
      height: 100%;
    }
    
    /* Headers */
    .card-header {
      padding: 8px 0 16px;
      font-size: var(--ha-card-header-font-size, 1.4em);
      font-weight: var(--ha-card-header-font-weight, 500);
      color: var(--ha-card-header-color, var(--heatmap-primary-text));
      position: sticky;
      left: 0;
      background-color: var(--heatmap-card-background);
      z-index: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-bottom: 4px;
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
    
    .detail-view h2 {
      margin-top: 0;
      margin-bottom: 8px;
      font-size: 1em;
      opacity: 0.9;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .detail-view h3 {
      margin: 8px 0 4px;
      margin-bottom: 8px;
      margin-top: 0;
      font-size: 0.9em;
      opacity: 0.8;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    /* Month Header */
    .month-header {
      display: flex;
      margin-left: 36px;
      margin-bottom: 4px;
      font-size: 0.8em;
      font-weight: 500;
      color: var(--heatmap-primary-text);
      position: sticky;
      left: 36px;
      background-color: var(--heatmap-card-background);
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
    
    /* Day Labels */
    .day-labels {
      display: flex;
      flex-direction: column;
      margin-right: 4px;
      font-size: 0.75em;
      color: var(--heatmap-secondary-text);
      position: sticky;
      left: 0;
      z-index: 2;
      background-color: var(--heatmap-card-background);
      width: 32px;
      text-align: right;
      padding-top: 6px;
      box-sizing: border-box;
      margin-top: 0;
      margin-bottom: 0;
    }
    
    .day-label {
      height: ${CELL_DIMENSIONS.cellWidth}px;
      margin-bottom: ${CELL_DIMENSIONS.cellMargin}px;
      padding-right: 4px;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      box-sizing: border-box;
    }
    
    /* Grid Components */
    .grid-container {
      display: flex;
      min-width: min-content;
      overflow: visible;
      margin-top: 0;
      flex: 1;
      align-items: flex-start;
      position: relative;
      box-sizing: border-box;
      margin-left: 0;
      margin-right: 0;
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
    
    .heatmap-grid-wrapper {
      overflow-x: auto;
      overflow-y: hidden;
      margin-bottom: 0;
      padding-bottom: 0;
      box-sizing: border-box;
    }
    
    .week-column {
      display: flex;
      flex-direction: column;
      width: ${CELL_DIMENSIONS.weekColWidth}px;
      box-sizing: border-box;
    }
    
    .week-column-spacing {
      margin-right: 0;
    }
    
    .day-cell {
      width: ${CELL_DIMENSIONS.cellWidth}px;
      height: ${CELL_DIMENSIONS.cellWidth}px;
      margin-bottom: ${CELL_DIMENSIONS.cellMargin}px;
      border-radius: 2px;
      box-sizing: border-box;
      cursor: pointer;
      transition: transform 0.1s ease-in-out;
    }
    
    .day-cell:hover {
      transform: scale(1.15);
      z-index: 10;
    }
    
    .day-cell.selected {
      border: 2px solid var(--heatmap-primary-text);
      box-shadow: 0 0 4px rgba(0, 0, 0, 0.2);
    }
    
    .empty-cell {
      width: ${CELL_DIMENSIONS.cellWidth}px;
      height: ${CELL_DIMENSIONS.cellWidth}px;
      margin-bottom: ${CELL_DIMENSIONS.cellMargin}px;
      box-sizing: border-box;
    }
    
    /* Detail View Components */
    .detail-content {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
    }
    
    .detail-date {
      font-size: 1.1em;
      font-weight: 500;
      margin-bottom: 12px;
      color: var(--heatmap-primary-text);
    }
    
    .detail-total {
      font-size: 0.9em;
      margin-bottom: 16px;
      color: var(--heatmap-secondary-text);
    }
    
    .detail-games {
      margin-top: 8px;
    }
    
    .game-item {
      display: flex;
      align-items: center;
      margin-bottom: 8px;
      padding-bottom: 8px;
      border-bottom: 1px solid var(--heatmap-divider-color);
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
      color: var(--heatmap-primary-text);
    }
    
    .game-time {
      font-size: 0.8em;
      color: var(--heatmap-secondary-text);
      margin-left: 8px;
      flex-shrink: 0;
    }
    
    .summary-item {
      display: flex;
      align-items: center;
      margin-bottom: 8px;
      padding-bottom: 8px;
      border-bottom: 1px solid var(--heatmap-divider-color);
    }
    
    .summary-item:last-child {
      border-bottom: none;
    }
    
    .summary-color {
      width: 12px;
      height: 12px;
      border-radius: 3px;
      margin-right: 8px;
      flex-shrink: 0;
    }
    
    .summary-name {
      flex: 1;
      font-size: 0.9em;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      color: var(--heatmap-primary-text);
    }
    
    .summary-time {
      font-size: 0.8em;
      color: var(--heatmap-secondary-text);
      margin-left: 8px;
      flex-shrink: 0;
    }
    
    .summary-percentage {
      font-size: 0.75em;
      color: var(--heatmap-secondary-text);
      margin-left: 4px;
      flex-shrink: 0;
    }
    
    .no-data-message {
      color: var(--heatmap-secondary-text);
      font-style: italic;
      text-align: center;
      margin-top: 16px;
    }
    
    /* Responsive adjustments */
    @media (max-width: 600px) {
      .card-content {
        flex-direction: column;
      }
      
      .detail-view {
        max-width: none;
        border-left: none;
        border-top: 1px solid var(--heatmap-divider-color);
      }
    }
    
    /* Scrollbar styling */
    .heatmap-grid-wrapper::-webkit-scrollbar {
      height: 6px;
    }
    
    .heatmap-grid-wrapper::-webkit-scrollbar-track {
      background: var(--heatmap-card-background);
    }
    
    .heatmap-grid-wrapper::-webkit-scrollbar-thumb {
      background-color: var(--heatmap-secondary-text);
      border-radius: 3px;
    }
    
    .detail-content::-webkit-scrollbar {
      width: 6px;
    }
    
    .detail-content::-webkit-scrollbar-track {
      background: var(--heatmap-secondary-background);
    }
    
    .detail-content::-webkit-scrollbar-thumb {
      background-color: var(--heatmap-secondary-text);
      border-radius: 3px;
    }
  `;
}

// For backward compatibility
export function getCardStyles(theme) {
  console.warn('getCardStyles is deprecated, use getStyles instead');
  return getStyles(theme);
}

// For backward compatibility - empty objects that will be removed in future
export const COMPONENT_STYLES = {};
export const COMMON_STYLES = COMPONENT_STYLES;