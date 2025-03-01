import { createElement } from '../../utils/dom-utils.js';
import { CELL_DIMENSIONS } from '../styles.js';
import { formatDuration } from '../../utils/format-utils.js';
import { findDominantGame } from '../../data/data-processor.js';
import { adjustColor } from '../../utils/color-utils.js';
import { CSS_VARIABLES } from '../../constants.js';

/**
 * Create the heatmap grid component
 * Uses Home Assistant CSS variables for theming
 * 
 * @param {Array} weeks - Array of weeks
 * @param {Object} dailyTotals - Daily totals by state
 * @param {number} maxValue - Maximum daily total seconds
 * @param {Object} gameColorMap - Map of game names to colors
 * @param {Function} onCellHover - Callback for cell hover
 * @param {Function} onCellClick - Callback for cell click
 * @param {string|null} selectedDate - Currently selected date (YYYY-MM-DD)
 * @returns {HTMLElement} The heatmap grid element
 */
export function createHeatmapGrid(
  weeks, 
  dailyTotals, 
  maxValue, 
  gameColorMap, 
  onCellHover,
  onCellClick,
  selectedDate
) {
  const { cellWidth, cellMargin, weekColWidth } = CELL_DIMENSIONS;
  
  const heatmapGrid = createElement('div', {}, {
    className: 'heatmap-grid',
    style: `min-width: ${weeks.length * weekColWidth}px;`
  });
  
  weeks.forEach((week, weekIndex) => {
    const col = createElement('div', {}, {
      className: 'week-column week-column-spacing'
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
        const baseColor = dominantGame ? gameColorMap[dominantGame] : CSS_VARIABLES.noDataColor;
        const intensity = maxValue > 0 ? dominantSec / maxValue : 0;
        const cellColor = adjustColor(baseColor, intensity);
        
        // Create cell with appropriate class
        const classNames = ['day-cell', 'position-relative'];
        if (selectedDate === dayStr) {
          classNames.push('selected');
        }
        
        // Add position-specific classes to handle edge cases
        if (i === 0) classNames.push('first-in-row');
        if (i === 6) classNames.push('last-in-row');
        if (weekIndex === 0) classNames.push('first-in-column');
        if (weekIndex === weeks.length - 1) classNames.push('last-in-column');
        
        // Create cell with tooltip
        cell = createElement('div', {}, {
          className: classNames.join(' '),
          style: `background-color: ${cellColor};`,
          title: `${date.toLocaleDateString()} - ${sumSeconds > 0 ? formatDuration(sumSeconds) : 'No activity'}`
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
        
        // Add click listener
        if (onCellClick) {
          cell.addEventListener('click', () => {
            onCellClick(cell._data);
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