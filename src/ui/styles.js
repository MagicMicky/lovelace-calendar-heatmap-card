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
 * Style system for the Steam Playtime Card
 * 
 * This file contains two complementary styling approaches:
 * 1. CARD_STYLES - CSS string for the overall card styling (injected via <style>)
 * 2. COMPONENT_STYLES - JavaScript objects for individual component styling (applied directly)
 */

/**
 * Get all CSS styles for the card and components
 * @param {string} theme - Theme ('dark' or 'light')
 * @returns {string} CSS styles as a string
 */
export function getStyles(theme) {
  const primaryTextColor = theme === "light" ? "#333" : "#c9d1d9";
  const secondaryTextColor = theme === "light" ? "#888" : "#8b949e";
  const defaultNoDataColor = theme === "light" ? "#E0E0E0" : "#757575";
  
  return `
    :host {
      --heatmap-primary-text: ${primaryTextColor};
      --heatmap-secondary-text: ${secondaryTextColor};
      --heatmap-no-data-color: ${defaultNoDataColor};
      --heatmap-cell-width: ${CELL_DIMENSIONS.cellWidth}px;
      --heatmap-cell-margin: ${CELL_DIMENSIONS.cellMargin}px;
      --heatmap-week-col-width: ${CELL_DIMENSIONS.weekColWidth}px;
    }
    
    /* Card Container */
    ha-card {
      box-shadow: var(--ha-card-box-shadow, 0 2px 5px rgba(0,0,0,0.26));
      border-radius: var(--ha-card-border-radius, 4px);
      color: var(--primary-text-color, ${primaryTextColor});
      overflow: hidden;
      position: relative;
      padding: 0;
    }
    
    .card-content {
      font-family: var(--paper-font-common-base, sans-serif);
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
      background-color: var(--ha-card-background);
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
      background-color: var(--secondary-background-color, #f7f7f7);
      border-left: 1px solid var(--divider-color, #CCC);
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
      font-size: 1.4em;
      font-weight: 500;
      color: var(--primary-text-color, ${primaryTextColor});
      position: sticky;
      left: 0;
      background-color: var(--ha-card-background);
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
      background-color: var(--ha-card-background);
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
      background-color: var(--ha-card-background);
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
      padding: 0;
    }
    
    .heatmap-grid {
      display: flex;
      flex-wrap: nowrap;
      min-width: min-content;
      overflow: visible;
      padding: 3px;
      box-sizing: border-box;
    }
    
    .week-column {
      display: flex;
      flex-direction: column;
      margin-right: ${CELL_DIMENSIONS.cellMargin}px;
      width: ${CELL_DIMENSIONS.cellWidth}px;
      flex-shrink: 0;
      box-sizing: border-box;
    }
    
    .day-cell {
      width: var(--heatmap-cell-width);
      height: var(--heatmap-cell-width);
      margin-bottom: var(--heatmap-cell-margin);
      border-radius: 2px;
      cursor: pointer;
      transition: all 0.2s ease;
      flex-shrink: 0;
      position: relative;
      box-sizing: border-box;
    }
    
    .empty-cell {
      width: ${CELL_DIMENSIONS.cellWidth}px;
      height: ${CELL_DIMENSIONS.cellWidth}px;
      margin-bottom: ${CELL_DIMENSIONS.cellMargin}px;
      flex-shrink: 0;
      box-sizing: border-box;
    }
    
    /* Detail View Components */
    .content-container {
      display: flex;
      flex-direction: column;
      flex: 1;
      padding-right: 4px;
      overflow: hidden;
    }
    
    .total-element {
      margin-bottom: 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .dominant-element {
      margin-bottom: 12px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .breakdown-container {
      flex: 1;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    
    /* Breakdown Items */
    .breakdown-item {
      display: flex;
      align-items: center;
      margin-bottom: 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .color-swatch {
      width: 12px;
      height: 12px;
      margin-right: 8px;
      flex-shrink: 0;
      border-radius: 2px;
    }
    
    .game-name {
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      min-width: 0;
    }
    
    /* Responsive Styles */
    @media (max-width: 500px) {
      .card-content {
        flex-direction: column;
      }
      
      .heatmap-container {
        padding-right: 16px;
      }
      
      .detail-view {
        max-width: none;
        border-left: none;
        border-top: 1px solid var(--divider-color, #CCC);
      }
    }

    /* Improved hover and selection styles */
    .day-cell:hover {
      box-shadow: 0 0 0 2px rgba(var(--rgb-primary-color, 33, 150, 243), 0.5);
      z-index: 3;
      transform: scale(1.05);
    }

    .day-cell.selected {
      box-shadow: 0 0 0 3px var(--primary-color, #2196F3);
      z-index: 4;
      transform: scale(1.1);
    }
    
    /* Fix for edge cells to prevent halo clipping */
    .heatmap-grid-wrapper {
      padding: 3px;
      overflow: visible !important;
      position: relative;
      box-sizing: border-box;
    }
    
    /* Specific styles for edge cells - using transform instead of margin to prevent alignment issues */
    .day-cell.first-in-row,
    .day-cell.last-in-row,
    .day-cell.first-in-column,
    .day-cell.last-in-column {
      position: relative;
      z-index: 2;
    }
    
    /* New classes to replace inline styles */
    .flex-container {
      display: flex;
    }
    
    .flex-align-stretch {
      align-items: stretch;
    }
    
    .flex-align-start {
      align-items: flex-start;
    }
    
    .flex-column {
      flex-direction: column;
    }
    
    .grid-container-spacing {
      margin-top: 2px;
    }
    
    .month-header-spacing {
      margin-bottom: 2px;
    }
    
    .day-label-spacing {
      margin-right: 4px;
    }
    
    .week-column-spacing {
      margin-right: ${CELL_DIMENSIONS.cellMargin}px;
    }
    
    .position-relative {
      position: relative;
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