import { createElement } from '../../utils/dom-utils.js';
import { formatDuration } from '../../utils/format-utils.js';

/**
 * Create a game item for the detail view
 * Uses CSS variables for theming
 * 
 * @param {string} game - Game name
 * @param {number} secs - Seconds played
 * @param {string} color - Color for the game
 * @param {number} totalSecs - Total seconds (for percentage calculation)
 * @returns {HTMLElement} The game item element
 */
function createGameItem(game, secs, color, totalSecs) {
  const item = createElement('div', {}, {
    className: 'game-item'
  });
  
  const colorSwatch = createElement('div', {}, {
    className: 'game-color',
    style: `background: ${color};`
  });
  
  const gameName = createElement('div', {}, {
    className: 'game-name',
    textContent: game,
  });
  
  const gameTime = createElement('div', {}, {
    className: 'game-time',
    textContent: formatDuration(secs),
  });
  
  // Add percentage if totalSecs is provided
  if (totalSecs > 0) {
    const percentage = Math.round((secs / totalSecs) * 100);
    const percentageElement = createElement('div', {}, {
      className: 'summary-percentage',
      textContent: `(${percentage}%)`,
    });
    
    item.appendChild(colorSwatch);
    item.appendChild(gameName);
    item.appendChild(gameTime);
    item.appendChild(percentageElement);
  } else {
    item.appendChild(colorSwatch);
    item.appendChild(gameName);
    item.appendChild(gameTime);
  }
  
  return item;
}

/**
 * Update the detail view with overall summary
 * Uses CSS variables for theming
 * 
 * @param {HTMLElement} detailViewElement - The detail view element
 * @param {Object} summaryData - Summary data with overall totals
 */
export function updateDetailViewWithSummary(detailViewElement, summaryData) {
  // Clear previous content
  detailViewElement.innerHTML = '';
  
  // Create content container
  const contentContainer = createElement('div', {}, {
    className: 'detail-content'
  });
  
  // Create header
  const header = createElement('div', {}, {
    className: 'detail-header',
    textContent: 'Overall Summary',
  });
  
  // Create total
  const totalSeconds = Object.values(summaryData.overallTotals).reduce((a, b) => a + b, 0);
  const totalElement = createElement('div', {}, {
    className: 'detail-total',
    textContent: `Total: ${formatDuration(totalSeconds)}`,
  });
  
  // Create games section
  const gamesContainer = createElement('div', {}, {
    className: 'detail-games'
  });
  
  // Add elements to content container
  contentContainer.appendChild(header);
  contentContainer.appendChild(totalElement);
  
  // Add game items
  const games = Object.entries(summaryData.overallTotals).sort((a, b) => b[1] - a[1]);
  
  if (games.length > 0) {
    for (const [game, secs] of games) {
      const item = createGameItem(game, secs, summaryData.gameColorMap[game], totalSeconds);
      gamesContainer.appendChild(item);
    }
    contentContainer.appendChild(gamesContainer);
  } else {
    // No data message
    const noDataMessage = createElement('div', {}, {
      className: 'no-data-message',
      textContent: 'No activity data available',
    });
    contentContainer.appendChild(noDataMessage);
  }
  
  // Add content container to detail view
  detailViewElement.appendChild(contentContainer);
}

/**
 * Update the detail view with day details
 * Uses CSS variables for theming
 * 
 * @param {HTMLElement} detailViewElement - The detail view element
 * @param {Object} dayData - Day data with date, statesObj, and gameColorMap
 */
export function updateDetailViewWithDayDetails(detailViewElement, dayData) {
  // Clear previous content
  detailViewElement.innerHTML = '';
  
  // Create content container
  const contentContainer = createElement('div', {}, {
    className: 'detail-content'
  });
  
  // Create header with formatted date
  const date = new Date(dayData.date);
  const header = createElement('div', {}, {
    className: 'detail-date',
    textContent: date.toLocaleDateString(undefined, { 
      weekday: 'long', 
      month: 'short', 
      day: 'numeric' 
    }),
  });
  
  // Create total
  const totalSeconds = Object.values(dayData.statesObj).reduce((a, b) => a + b, 0);
  const totalElement = createElement('div', {}, {
    className: 'detail-total',
    textContent: `Total: ${formatDuration(totalSeconds)}`,
  });
  
  // Create games section
  const gamesContainer = createElement('div', {}, {
    className: 'detail-games'
  });
  
  // Add elements to content container
  contentContainer.appendChild(header);
  contentContainer.appendChild(totalElement);
  
  // Add game items
  const games = Object.entries(dayData.statesObj).sort((a, b) => b[1] - a[1]);
  
  if (games.length > 0) {
    for (const [game, secs] of games) {
      const item = createGameItem(game, secs, dayData.gameColorMap[game], totalSeconds);
      gamesContainer.appendChild(item);
    }
    contentContainer.appendChild(gamesContainer);
  } else {
    // No data message
    const noDataMessage = createElement('div', {}, {
      className: 'no-data-message',
      textContent: 'No activity data for this day',
    });
    contentContainer.appendChild(noDataMessage);
  }
  
  // Add content container to detail view
  detailViewElement.appendChild(contentContainer);
} 