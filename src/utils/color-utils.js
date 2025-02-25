import { MATERIAL_COLORS } from '../constants.js';

/**
 * Get a consistent color for a game name
 * @param {string} gameName - Name of the game
 * @returns {string} Color for the game
 */
export function getGameColor(gameName) {
  let hash = 0;
  for (let i = 0; i < gameName.length; i++) {
    hash = gameName.charCodeAt(i) + ((hash << 5) - hash);
  }
  hash = Math.abs(hash);
  const index = hash % MATERIAL_COLORS.length;
  return MATERIAL_COLORS[index];
}

/**
 * Adjust a color's intensity based on a factor
 * @param {string} hex - Hex color code
 * @param {number} factor - Intensity factor (0-1)
 * @param {string} theme - Theme ('dark' or 'light')
 * @returns {string} Adjusted color as RGB
 */
export function adjustColor(hex, factor, theme = "dark") {
  if (hex.startsWith("#")) {
    hex = hex.slice(1);
  }
  
  let r = parseInt(hex.slice(0, 2), 16);
  let g = parseInt(hex.slice(2, 4), 16);
  let b = parseInt(hex.slice(4, 6), 16);
  
  if (theme === "dark") {
    r = Math.round(0 * (1 - factor) + r * factor);
    g = Math.round(0 * (1 - factor) + g * factor);
    b = Math.round(0 * (1 - factor) + b * factor);
  } else {
    r = Math.round(255 * (1 - factor) + r * factor);
    g = Math.round(255 * (1 - factor) + g * factor);
    b = Math.round(255 * (1 - factor) + b * factor);
  }
  
  return `rgb(${r}, ${g}, ${b})`;
} 