import { createElement } from '../../utils/dom-utils.js';
import { CELL_DIMENSIONS, COMMON_STYLES } from '../styles.js';

/**
 * Create the day labels component
 * @param {CSSStyleDeclaration} style - Computed style of the element
 * @returns {HTMLElement} The day labels element
 */
export function createDayLabels(style) {
  const { cellWidth, cellMargin } = CELL_DIMENSIONS;
  const secondaryTextColor = style.getPropertyValue("--secondary-text-color").trim() || "#888";
  
  const dayLabels = createElement('div', {
    ...COMMON_STYLES.dayLabels,
    color: secondaryTextColor,
  });
  
  // Day names array
  const dayNamesArr = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  
  for (let i = 0; i < 7; i++) {
    const label = createElement('div', {
      height: `${cellWidth}px`,
      marginBottom: `${cellMargin}px`,
    });
    
    // Only label Monday (i=1), Wednesday (i=3) and Friday (i=5)
    if (i === 1 || i === 3 || i === 5) {
      label.textContent = dayNamesArr[i];
    } else {
      label.textContent = "";
    }
    
    dayLabels.appendChild(label);
  }
  
  return dayLabels;
} 