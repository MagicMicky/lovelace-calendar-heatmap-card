import { createElement } from '../../utils/dom-utils.js';
import { CELL_DIMENSIONS, COMMON_STYLES } from '../styles.js';

/**
 * Create the month header component
 * @param {Array} monthGroups - Groups of months with counts
 * @param {CSSStyleDeclaration} style - Computed style of the element
 * @returns {HTMLElement} The month header element
 */
export function createMonthHeader(monthGroups, style) {
  const { weekColWidth } = CELL_DIMENSIONS;
  const primaryTextColor = style.getPropertyValue("--primary-text-color").trim() || "#555";
  
  const monthHeader = createElement('div', {
    ...COMMON_STYLES.monthHeader,
    color: primaryTextColor,
  });
  
  monthGroups.forEach((group) => {
    const label = createElement('div', {
      width: `${group.count * weekColWidth}px`,
      textAlign: 'center',
    }, {
      textContent: group.monthName,
    });
    
    monthHeader.appendChild(label);
  });
  
  return monthHeader;
} 