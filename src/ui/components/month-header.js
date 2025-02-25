import { createElement } from '../../utils/dom-utils.js';
import { CELL_DIMENSIONS } from '../styles.js';

/**
 * Create the month header component
 * @param {Array} monthGroups - Groups of months with counts
 * @param {CSSStyleDeclaration} style - Computed style of the element
 * @returns {HTMLElement} The month header element
 */
export function createMonthHeader(monthGroups, style) {
  const { weekColWidth } = CELL_DIMENSIONS;
  const primaryTextColor = style.getPropertyValue("--primary-text-color").trim() || "#555";
  
  const monthHeader = createElement('div', {}, {
    className: 'month-header',
    style: `color: ${primaryTextColor};`
  });
  
  // Calculate total width to ensure proper alignment
  let totalWidth = 0;
  
  monthGroups.forEach((group) => {
    const width = group.count * weekColWidth;
    totalWidth += width;
    
    const label = createElement('div', {}, {
      className: 'month-label',
      style: `width: ${width}px;`,
      textContent: group.monthName,
    });
    
    monthHeader.appendChild(label);
  });
  
  // Set a minimum width to ensure proper alignment
  monthHeader.style.minWidth = `${totalWidth}px`;
  
  return monthHeader;
} 