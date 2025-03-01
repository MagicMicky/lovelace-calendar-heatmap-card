import { createElement } from '../../utils/dom-utils.js';
import { CELL_DIMENSIONS } from '../styles.js';
import { formatDuration } from '../../utils/format-utils.js';
import { findDominantGame } from '../../data/data-processor.js';
import { adjustColor, getNoDataColorWithOpacity } from '../../utils/color-utils.js';
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
        
        // Calculate intensity with a more balanced approach
        let intensity = 0;
        if (maxValue > 0 && dominantSec > 0) {
          // Define time thresholds in seconds for better visual differentiation
          // These thresholds represent common gaming session durations
          const THRESHOLDS = {
            MINIMAL: 15 * 60,     // 15 minutes
            LOW: 45 * 60,         // 45 minutes
            MEDIUM: 2 * 60 * 60,  // 2 hours
            HIGH: 4 * 60 * 60,    // 4 hours
            VERY_HIGH: 8 * 60 * 60 // 8 hours
          };
          
          // Use a stepped approach for more distinct visual differences
          // This creates clearer "bands" of intensity based on time thresholds
          if (dominantSec < THRESHOLDS.MINIMAL) {
            // Very short sessions (< 15 min)
            intensity = 0.2;
          } else if (dominantSec < THRESHOLDS.LOW) {
            // Short sessions (15-45 min)
            intensity = 0.35;
          } else if (dominantSec < THRESHOLDS.MEDIUM) {
            // Medium sessions (45 min - 2 hours)
            intensity = 0.55;
          } else if (dominantSec < THRESHOLDS.HIGH) {
            // Longer sessions (2-4 hours)
            intensity = 0.75;
          } else if (dominantSec < THRESHOLDS.VERY_HIGH) {
            // High usage sessions (4-8 hours)
            intensity = 0.9;
          } else {
            // Very high usage sessions (8+ hours)
            intensity = 1.0;
          }
          
          // Add a small variation within each band based on the exact duration
          // This prevents all cells in the same band from looking identical
          const bandSize = 0.05; // Size of variation within each band
          
          // Calculate position within the current band
          let positionInBand = 0;
          if (dominantSec < THRESHOLDS.MINIMAL) {
            positionInBand = dominantSec / THRESHOLDS.MINIMAL;
          } else if (dominantSec < THRESHOLDS.LOW) {
            positionInBand = (dominantSec - THRESHOLDS.MINIMAL) / (THRESHOLDS.LOW - THRESHOLDS.MINIMAL);
          } else if (dominantSec < THRESHOLDS.MEDIUM) {
            positionInBand = (dominantSec - THRESHOLDS.LOW) / (THRESHOLDS.MEDIUM - THRESHOLDS.LOW);
          } else if (dominantSec < THRESHOLDS.HIGH) {
            positionInBand = (dominantSec - THRESHOLDS.MEDIUM) / (THRESHOLDS.HIGH - THRESHOLDS.MEDIUM);
          } else if (dominantSec < THRESHOLDS.VERY_HIGH) {
            positionInBand = (dominantSec - THRESHOLDS.HIGH) / (THRESHOLDS.VERY_HIGH - THRESHOLDS.HIGH);
          } else {
            positionInBand = Math.min(1, (dominantSec - THRESHOLDS.VERY_HIGH) / THRESHOLDS.VERY_HIGH);
          }
          
          // Apply the variation within the band
          intensity += (positionInBand * bandSize) - (bandSize / 2);
          
          // Ensure intensity stays within bounds
          intensity = Math.max(0.15, Math.min(1, intensity));
        }
        
        // Determine cell color with improved contrast and theme awareness
        let cellColor;
        if (dominantGame && dominantSec > 0) {
          const baseColor = gameColorMap[dominantGame];
          // adjustColor now handles theme-specific adjustments automatically
          cellColor = adjustColor(baseColor, intensity);
        } else {
          // For cells with no data, use a semi-transparent version of the no-data color
          // The opacity varies based on whether it's selected or not
          cellColor = getNoDataColorWithOpacity(selectedDate === dayStr ? 0.5 : 0.3);
        }
        
        // Add a data attribute for the intensity value - useful for debugging and testing
        const intensityPercent = Math.round(intensity * 100);
        
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
        
        // Create cell with tooltip and intensity data attribute
        cell = createElement('div', {}, {
          className: classNames.join(' '),
          style: `background-color: ${cellColor};`,
          title: `${date.toLocaleDateString()} - ${sumSeconds > 0 ? formatDuration(sumSeconds) : 'No activity'}`,
          'data-intensity': intensityPercent
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