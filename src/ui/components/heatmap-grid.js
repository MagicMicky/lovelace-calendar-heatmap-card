import { createElement } from '../../utils/dom-utils.js';
import { CELL_DIMENSIONS } from '../styles.js';
import { formatDuration } from '../../utils/format-utils.js';
import { findDominantGame } from '../../data/data-processor.js';
import { adjustColor } from '../../utils/color-utils.js';

/**
 * Create the heatmap grid component
 * @param {Array} weeks - Array of weeks
 * @param {Object} dailyTotals - Daily totals by state
 * @param {number} maxValue - Maximum daily total seconds
 * @param {Object} gameColorMap - Map of game names to colors
 * @param {string} theme - Theme ('dark' or 'light')
 * @param {Function} onCellHover - Callback for cell hover
 * @returns {HTMLElement} The heatmap grid element
 */
export function createHeatmapGrid(weeks, dailyTotals, maxValue, gameColorMap, theme, onCellHover) {
  const { weekColWidth } = CELL_DIMENSIONS;
  
  const heatmapGrid = createElement('div', {}, {
    className: 'heatmap-grid',
    style: `min-width: ${weeks.length * weekColWidth}px;`
  });
  
  weeks.forEach((week) => {
    const col = createElement('div', {}, {
      className: 'week-column'
    });
    
    // Create one cell per day
    for (let i = 0; i < 7; i++) {
      let cell;
      
      if (i < week.length) {
        const date = week[i];
        const dayStr = date.toISOString().split("T")[0];
        const statesObj = dailyTotals[dayStr] || {};
        const sumSeconds = Object.values(statesObj).reduce((acc, val) => acc + val, 0);
        
        // Find dominant game for this day
        const { dominantGame, dominantSec } = findDominantGame(statesObj);
        
        // Determine cell color
        const defaultNoDataColor = theme === "dark" ? "#757575" : "#E0E0E0";
        const baseColor = dominantGame ? gameColorMap[dominantGame] : defaultNoDataColor;
        const intensity = maxValue > 0 ? dominantSec / maxValue : 0;
        const cellColor = adjustColor(baseColor, intensity, theme);
        
        cell = createElement('div', {}, {
          className: 'day-cell',
          style: `background-color: ${cellColor};`
        });
        
        // Store data for hover/click
        cell._data = {
          date: dayStr,
          statesObj,
          gameColorMap
        };
        
        // Add event listeners
        if (onCellHover) {
          cell.addEventListener('mouseenter', () => {
            onCellHover(cell._data);
          });
          
          cell.addEventListener('mouseleave', () => {
            onCellHover(null);
          });
        }
      } else {
        cell = createElement('div', {}, {
          className: 'empty-cell'
        });
      }
      
      col.appendChild(cell);
    }
    
    heatmapGrid.appendChild(col);
  });
  
  return heatmapGrid;
} 