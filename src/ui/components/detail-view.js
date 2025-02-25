import { createElement } from '../../utils/dom-utils.js';
import { formatDuration } from '../../utils/format-utils.js';
import { COMMON_STYLES } from '../styles.js';

/**
 * Create a breakdown item for a game
 * @param {string} game - Game name
 * @param {number} secs - Seconds played
 * @param {string} color - Color for the game
 * @returns {HTMLElement} The breakdown item element
 */
function createBreakdownItem(game, secs, color) {
  const item = createElement('div', COMMON_STYLES.breakdownItem);
  
  const colorSwatch = createElement('div', {
    ...COMMON_STYLES.colorSwatch,
    background: color,
  });
  
  const gameName = createElement('div', COMMON_STYLES.gameName, {
    textContent: game,
  });
  
  const duration = createElement('div', {}, {
    textContent: formatDuration(secs),
  });
  
  item.appendChild(colorSwatch);
  item.appendChild(gameName);
  item.appendChild(duration);
  
  return item;
}

/**
 * Update the detail view with overall summary
 * @param {HTMLElement} detailViewElement - The detail view element
 * @param {Object} defaultData - Default data with overall totals
 */
export function updateDetailViewWithSummary(detailViewElement, defaultData) {
  // Clear previous content
  detailViewElement.innerHTML = '';
  
  // Create header
  const header = createElement('h2', { marginTop: '0' }, {
    textContent: 'Overall Summary',
  });
  
  // Create total
  const totalSeconds = Object.values(defaultData.overallTotals).reduce((a, b) => a + b, 0);
  const totalElement = createElement('div', {}, {
    textContent: `Total: ${formatDuration(totalSeconds)}`,
  });
  
  // Create most played
  const mostPlayedElement = createElement('div', {}, {
    textContent: `Most Played: ${defaultData.bestGame} (${formatDuration(defaultData.bestSec)})`,
  });
  
  // Create breakdown section
  const breakdownHeader = createElement('h3', { marginBottom: '4px' }, {
    textContent: 'Breakdown',
  });
  
  // Add elements to detail view
  detailViewElement.appendChild(header);
  detailViewElement.appendChild(totalElement);
  detailViewElement.appendChild(mostPlayedElement);
  detailViewElement.appendChild(breakdownHeader);
  
  // Add breakdown items
  const games = Object.entries(defaultData.overallTotals).sort((a, b) => b[1] - a[1]);
  games.forEach(([game, secs]) => {
    const item = createBreakdownItem(game, secs, defaultData.gameColorMap[game]);
    detailViewElement.appendChild(item);
  });
}

/**
 * Update the detail view with day details
 * @param {HTMLElement} detailViewElement - The detail view element
 * @param {Object} data - Day data
 */
export function updateDetailViewWithDayDetails(detailViewElement, data) {
  // Clear previous content
  detailViewElement.innerHTML = '';
  
  // Create header with formatted date
  const date = new Date(data.date);
  const header = createElement('h2', { marginTop: '0' }, {
    textContent: date.toLocaleDateString(undefined, { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    }),
  });
  
  // Create total
  const totalSeconds = Object.values(data.statesObj).reduce((a, b) => a + b, 0);
  const totalElement = createElement('div', {}, {
    textContent: `Total: ${formatDuration(totalSeconds)}`,
  });
  
  // Find dominant game
  let dominantGame = "";
  let dominantSec = 0;
  for (const [game, secs] of Object.entries(data.statesObj)) {
    if (secs > dominantSec) {
      dominantSec = secs;
      dominantGame = game;
    }
  }
  
  // Create dominant game element
  const dominantElement = createElement('div', {}, {
    textContent: `Dominant: ${dominantGame} (${formatDuration(dominantSec)})`,
  });
  
  // Create breakdown section
  const breakdownHeader = createElement('h3', { marginBottom: '4px' }, {
    textContent: 'Breakdown',
  });
  
  // Add elements to detail view
  detailViewElement.appendChild(header);
  detailViewElement.appendChild(totalElement);
  detailViewElement.appendChild(dominantElement);
  detailViewElement.appendChild(breakdownHeader);
  
  // Add breakdown items
  const games = Object.entries(data.statesObj).sort((a, b) => b[1] - a[1]);
  games.forEach(([game, secs]) => {
    const item = createBreakdownItem(game, secs, data.gameColorMap[game]);
    detailViewElement.appendChild(item);
  });
} 