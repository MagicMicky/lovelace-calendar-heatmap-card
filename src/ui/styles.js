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
 * Get CSS styles for the card
 * @param {string} theme - Theme ('dark' or 'light')
 * @returns {string} CSS styles as a string
 */
export function getCardStyles(theme) {
  const primaryTextColor = theme === "light" ? "#333" : "#c9d1d9";
  
  return `
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
    }
    .heatmap-container {
      flex: 3;
      min-width: 0;
      padding: 16px;
      padding-right: 24px;
      background-color: var(--ha-card-background);
      min-height: 300px;
      overflow-x: auto;
      overflow-y: hidden;
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
      height: 300px;
      max-height: 300px;
      overflow-y: auto;
    }
    .card-header {
      padding: 16px 16px 8px;
      font-size: 1.4em;
      font-weight: 500;
      color: var(--primary-text-color, ${primaryTextColor});
      position: sticky;
      left: 0;
      background-color: var(--ha-card-background);
      z-index: 1;
    }
    .detail-view h2 {
      margin-top: 0;
      font-size: 1em;
      opacity: 0.9;
    }
    .detail-view h3 {
      margin: 8px 0 4px;
      font-size: 0.9em;
      opacity: 0.8;
    }
    .month-header {
      display: flex;
      margin-left: 40px;
      margin-bottom: 4px;
      font-size: 0.8em;
      font-weight: 500;
      color: var(--primary-text-color, ${primaryTextColor});
      position: sticky;
      left: 40px;
      background-color: var(--ha-card-background);
      z-index: 1;
    }
    .day-labels {
      display: flex;
      flex-direction: column;
      margin-right: 4px;
      font-size: 0.75em;
      color: var(--secondary-text-color, #888);
      position: sticky;
      left: 0;
      z-index: 2;
      background-color: var(--ha-card-background);
    }
    .day-labels div {
      height: 12px;
      margin-bottom: 2px;
    }
    .heatmap-grid {
      display: flex;
      flex-wrap: nowrap;
      min-width: min-content;
    }
    .grid-container {
      display: flex;
      min-width: min-content;
    }
    @media (max-width: 500px) {
      .card-content {
        flex-direction: column;
      }
      .heatmap-container {
        border-right: none;
        border-bottom: 1px solid var(--divider-color, #CCC);
        padding-right: 16px;
        margin-bottom: 16px;
        min-height: auto;
      }
      .detail-view {
        max-width: none;
        border-left: none;
        background-color: var(--ha-card-background);
        opacity: 1;
        height: 250px;
        max-height: 250px;
      }
    }
  `;
}

/**
 * Common styles for UI components
 */
export const COMMON_STYLES = {
  container: {
    display: 'flex',
    flexWrap: 'wrap',
    padding: '0',
  },
  
  heatmapContainer: {
    flex: '3',
    minWidth: '0',
    padding: '16px',
    paddingRight: '24px',
    backgroundColor: 'var(--ha-card-background)',
    minHeight: '300px',
    overflowX: 'auto',
    overflowY: 'hidden',
  },
  
  detailView: {
    flex: '1',
    minWidth: '200px',
    maxWidth: '280px',
    padding: '16px',
    backgroundColor: 'var(--secondary-background-color, #f7f7f7)',
    borderLeft: '1px solid var(--divider-color, #CCC)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    opacity: '0.9',
    height: '300px',
    maxHeight: '300px',
    overflowY: 'auto',
  },
  
  cardHeader: {
    padding: '16px 16px 8px',
    fontSize: '1.4em',
    fontWeight: '500',
    position: 'sticky',
    left: '0',
    backgroundColor: 'var(--ha-card-background)',
    zIndex: '1',
  },
  
  monthHeader: {
    display: 'flex',
    marginLeft: '40px',
    marginBottom: '4px',
    fontSize: '0.8em',
    fontWeight: '500',
    position: 'sticky',
    left: '40px',
    backgroundColor: 'var(--ha-card-background)',
    zIndex: '1',
  },
  
  dayLabels: {
    display: 'flex',
    flexDirection: 'column',
    marginRight: '4px',
    fontSize: '0.75em',
    position: 'sticky',
    left: '0',
    zIndex: '2',
    backgroundColor: 'var(--ha-card-background)',
  },
  
  gridContainer: {
    display: 'flex',
    minWidth: 'min-content',
  },
  
  heatmapGrid: {
    display: 'flex',
    flexWrap: 'nowrap',
    minWidth: 'min-content',
  },
  
  weekColumn: {
    display: 'flex',
    flexDirection: 'column',
  },
  
  versionText: {
    marginTop: '8px',
    fontSize: '0.8em',
    opacity: '0.6',
  },
  
  breakdownItem: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '4px',
  },
  
  colorSwatch: {
    width: '12px',
    height: '12px',
    marginRight: '8px',
  },
  
  gameName: {
    flex: '1',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  }
}; 