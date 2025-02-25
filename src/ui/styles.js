/**
 * Constants for cell dimensions
 */
export const CELL_DIMENSIONS = {
  cellWidth: 12,
  cellMargin: 2,
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
    }
    
    /* Layout Containers */
    .heatmap-container {
      flex: 3;
      min-width: 0;
      padding: 16px;
      padding-right: 24px;
      background-color: var(--ha-card-background);
      min-height: 200px;
      overflow: hidden;
      position: relative;
    }
    
    .detail-view {
      flex: 1;
      min-width: 200px;
      max-width: 280px;
      padding: 16px;
      background-color: var(--secondary-background-color, #f7f7f7);
      border-left: 1px solid var(--divider-color, #CCC);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      opacity: 0.9;
      height: 200px;
      max-height: 200px;
    }
    
    /* Headers */
    .card-header {
      padding: 16px 16px 8px;
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
      margin-left: 40px;
      margin-bottom: 4px;
      font-size: 0.8em;
      font-weight: 500;
      color: var(--heatmap-primary-text);
      position: sticky;
      left: 40px;
      background-color: var(--ha-card-background);
      z-index: 1;
      white-space: nowrap;
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
    }
    
    .day-label {
      height: ${CELL_DIMENSIONS.cellWidth}px;
      margin-bottom: ${CELL_DIMENSIONS.cellMargin}px;
    }
    
    /* Grid Components */
    .grid-container {
      display: flex;
      min-width: min-content;
      overflow: hidden;
    }
    
    .heatmap-grid {
      display: flex;
      flex-wrap: nowrap;
      min-width: min-content;
      overflow: hidden;
    }
    
    .week-column {
      display: flex;
      flex-direction: column;
      margin-right: ${CELL_DIMENSIONS.cellMargin}px;
      width: ${CELL_DIMENSIONS.cellWidth}px;
      flex-shrink: 0;
    }
    
    .day-cell {
      width: var(--heatmap-cell-width);
      height: var(--heatmap-cell-width);
      margin-bottom: var(--heatmap-cell-margin);
      border-radius: 2px;
      cursor: pointer;
      transition: box-shadow 0.2s ease;
      flex-shrink: 0;
    }
    
    .empty-cell {
      width: ${CELL_DIMENSIONS.cellWidth}px;
      height: ${CELL_DIMENSIONS.cellWidth}px;
      margin-bottom: ${CELL_DIMENSIONS.cellMargin}px;
      flex-shrink: 0;
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

    /* Add these styles to the existing CSS */

    .day-cell:hover {
      box-shadow: 0 0 0 2px rgba(var(--rgb-primary-color, 33, 150, 243), 0.5);
      z-index: 3;
    }

    .day-cell.selected {
      box-shadow: 0 0 0 3px var(--primary-color, #2196F3);
      z-index: 4;
      transform: scale(1.1);
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