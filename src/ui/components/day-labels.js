import { createElement } from '../../utils/dom-utils.js';
import { getLocalizedDayNames } from '../../utils/date-utils.js';

/**
 * Create the day labels component
 * @param {CSSStyleDeclaration} style - Computed style of the element
 * @param {string} startDayOfWeek - Day to start the week on ('monday' or 'sunday')
 * @returns {HTMLElement} The day labels element
 */
export function createDayLabels(style, startDayOfWeek = 'monday') {
  const secondaryTextColor = style.getPropertyValue("--secondary-text-color").trim() || "#888";
  
  const dayLabels = createElement('div', {}, {
    className: 'day-labels',
    style: `color: ${secondaryTextColor};`
  });
  
  // Get localized day names
  const dayNamesArr = getLocalizedDayNames(startDayOfWeek);
  
  // Only show Monday (index 0), Wednesday (index 2) and Friday (index 4) when starting with Monday
  // Or Sunday (index 0), Tuesday (index 2) and Thursday (index 4) when starting with Sunday
  const displayIndices = [0, 2, 4];
  
  for (let i = 0; i < 7; i++) {
    const label = createElement('div', {}, {
      className: 'day-label'
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