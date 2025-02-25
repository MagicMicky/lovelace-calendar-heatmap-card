/**
 * Get theme colors for the heatmap
 * @param {CSSStyleDeclaration} style - Computed style of the element
 * @returns {Array} Array of color values for different heatmap levels
 */
export function getThemeColors(style) {
  return [
    style.getPropertyValue("--calendar-heatmap-no-data-color").trim() || "#ebedf0",
    style.getPropertyValue("--calendar-heatmap-level-1").trim() || "#c6e48b",
    style.getPropertyValue("--calendar-heatmap-level-2").trim() || "#7bc96f",
    style.getPropertyValue("--calendar-heatmap-level-3").trim() || "#239a3b",
    style.getPropertyValue("--calendar-heatmap-level-4").trim() || "#196127",
  ];
}

/**
 * Create a DOM element with specified properties
 * @param {string} tag - HTML tag name
 * @param {Object} styles - CSS styles to apply
 * @param {Object} props - Properties to set on the element
 * @returns {HTMLElement} The created element
 */
export function createElement(tag, styles = {}, props = {}) {
  const element = document.createElement(tag);
  
  // Apply styles
  Object.entries(styles).forEach(([property, value]) => {
    element.style[property] = value;
  });
  
  // Apply properties
  Object.entries(props).forEach(([property, value]) => {
    element[property] = value;
  });
  
  return element;
} 