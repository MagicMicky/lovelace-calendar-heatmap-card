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
      flex: 2;
      min-width: 0;
      padding: 16px;
      padding-right: 24px;
      border-right: 1px solid var(--divider-color, #CCC);
    }
    .detail-view {
      flex: 1;
      min-width: 240px;
      padding: 16px;
      background-color: var(--ha-card-background);
      border-radius: 4px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .card-header {
      padding: 16px 16px 0;
      font-size: 1.2em;
      font-weight: 500;
      color: var(--primary-text-color, ${primaryTextColor});
    }
    .detail-view h2 {
      margin-top: 0;
      font-size: 1em;
    }
    .detail-view h3 {
      margin: 8px 0 4px;
      font-size: 0.9em;
    }
    .month-header {
      display: flex;
      margin-left: 40px;
      margin-bottom: 4px;
      font-size: 0.75em;
      color: var(--primary-text-color, ${primaryTextColor});
    }
    .day-labels {
      display: flex;
      flex-direction: column;
      margin-right: 4px;
      font-size: 0.75em;
      color: var(--secondary-text-color, #888);
    }
    .day-labels div {
      height: 12px;
      margin-bottom: 2px;
    }
    .heatmap-grid {
      display: flex;
      flex-wrap: nowrap;
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
      }
      .detail-view {
        margin-top: 0;
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
    flex: '2',
    minWidth: '0',
    padding: '16px',
    paddingRight: '24px',
  },
  
  detailView: {
    flex: '1',
    minWidth: '240px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  
  cardHeader: {
    padding: '16px 16px 0',
    fontSize: '1.2em',
    fontWeight: '500',
  },
  
  monthHeader: {
    display: 'flex',
    marginLeft: '40px',
    marginBottom: '4px',
    fontSize: '0.75em',
  },
  
  dayLabels: {
    display: 'flex',
    flexDirection: 'column',
    marginRight: '4px',
    fontSize: '0.75em',
  },
  
  gridContainer: {
    display: 'flex',
  },
  
  heatmapGrid: {
    display: 'flex',
    flexWrap: 'nowrap',
  },
  
  weekColumn: {
    display: 'flex',
    flexDirection: 'column',
  },
  
  versionText: {
    marginTop: '8px',
    fontSize: '0.8em',
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