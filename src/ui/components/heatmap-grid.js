import { createElement } from '../../utils/dom-utils.js';
import { CELL_DIMENSIONS, COMMON_STYLES } from '../styles.js';
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
  const { cellWidth, cellMargin } = CELL_DIMENSIONS;
  
  const heatmapGrid = createElement('div', COMMON_STYLES.heatmapGrid);
  
  weeks.forEach((week) => {
    const col = createElement('div', {
      ...COMMON_STYLES.weekColumn,
      marginRight: `${cellMargin}px`,
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
        
        cell = createElement('div', {
          width: `${cellWidth}px`,
          height: `${cellWidth}px`,
          marginBottom: `${cellMargin}px`,
          backgroundColor: cellColor,
          borderRadius: '2px',
          cursor: 'pointer',
          transition: 'box-shadow 0.2s ease',
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
        cell = createElement('div', {
          width: `${cellWidth}px`,
          height: `${cellWidth}px`,
          marginBottom: `${cellMargin}px`,
        });
      }
      
      col.appendChild(cell);
    }
    
    heatmapGrid.appendChild(col);
  });
  
  return heatmapGrid;
} 