import { createElement } from '../../utils/dom-utils.js';
import { CELL_DIMENSIONS, COMMON_STYLES } from '../styles.js';
import { getLocalizedDayNames } from '../../utils/date-utils.js';

/**
 * Create the day labels component
 * @param {CSSStyleDeclaration} style - Computed style of the element
 * @param {string} startDayOfWeek - Day to start the week on ('monday' or 'sunday')
 * @returns {HTMLElement} The day labels element
 */
export function createDayLabels(style, startDayOfWeek = 'monday') {
  const { cellWidth, cellMargin } = CELL_DIMENSIONS;
  const secondaryTextColor = style.getPropertyValue("--secondary-text-color").trim() || "#888";
  
  const dayLabels = createElement('div', {
    ...COMMON_STYLES.dayLabels,
    color: secondaryTextColor,
  });
  
  // Get localized day names
  const dayNamesArr = getLocalizedDayNames(startDayOfWeek);
  
  // Only show Monday (index 0), Wednesday (index 2) and Friday (index 4) when starting with Monday
  // Or Sunday (index 0), Tuesday (index 2) and Thursday (index 4) when starting with Sunday
  const displayIndices = [0, 2, 4];
  
  for (let i = 0; i < 7; i++) {
    const label = createElement('div', {
      height: `${cellWidth}px`,
      marginBottom: `${cellMargin}px`,
    });
    
    // Only label specific days
    if (displayIndices.includes(i)) {
      label.textContent = dayNamesArr[i];
    } else {
      label.textContent = "";
    }
    
    dayLabels.appendChild(label);
  }
  
  return dayLabels;
} 