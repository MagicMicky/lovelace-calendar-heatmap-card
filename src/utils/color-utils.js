/**
 * Color Utility Functions
 * 
 * This module provides utility functions for color manipulation and generation.
 */

import { MATERIAL_COLORS, CSS_VARIABLES } from '../constants.js';

/**
 * Generates a consistent color for a given string (e.g., game name)
 * Uses a simple hashing algorithm to ensure the same string always gets the same color
 * 
 * @param {string} name - The string to generate a color for (e.g., game name)
 * @returns {string} A hex color code from the MATERIAL_COLORS palette
 */
export function getGameColor(name) {
  if (!name || typeof name !== 'string') {
    return MATERIAL_COLORS[0]; // Default to first color for invalid inputs
  }
  
  let hash = 0;
  // Generate a hash value based on the string
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Ensure positive hash value
  hash = Math.abs(hash);
  
  // Map hash to a color in our palette
  const index = hash % MATERIAL_COLORS.length;
  return MATERIAL_COLORS[index];
}

/**
 * Adjusts a color's intensity based on a factor
 * Blends between the no-data color (0) and the color (1)
 * Automatically adapts to light/dark themes via CSS variables
 * 
 * @param {string} hex - Hex color code (with or without #)
 * @param {number} factor - Intensity factor between 0 and 1
 * @returns {string} Adjusted color as RGB string
 */
export function adjustColor(hex, factor) {
  // Validate inputs
  if (!hex || typeof hex !== 'string') {
    return CSS_VARIABLES.noDataColor;
  }
  
  // If the color is a CSS variable, return it directly
  if (hex.startsWith('var(')) {
    return hex;
  }
  
  // Clamp factor between 0 and 1
  const clampedFactor = Math.max(0, Math.min(1, factor));
  
  // Remove # if present
  const cleanHex = hex.startsWith('#') ? hex.slice(1) : hex;
  
  // Parse RGB components
  let r, g, b;
  try {
    r = parseInt(cleanHex.slice(0, 2), 16);
    g = parseInt(cleanHex.slice(2, 4), 16);
    b = parseInt(cleanHex.slice(4, 6), 16);
    
    // Check if parsing was successful
    if (isNaN(r) || isNaN(g) || isNaN(b)) {
      throw new Error('Invalid hex color');
    }
  } catch (error) {
    console.warn(`Invalid hex color: ${hex}. Using fallback.`);
    return CSS_VARIABLES.noDataColor;
  }
  
  // For very low factors, return the no-data color
  if (clampedFactor < 0.05) {
    return CSS_VARIABLES.noDataColor;
  }
  
  // Apply intensity factor directly to RGB values
  r = Math.round(r * clampedFactor);
  g = Math.round(g * clampedFactor);
  b = Math.round(b * clampedFactor);
  
  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Gets the no-data color from CSS variables
 * 
 * @returns {string} The no-data color from CSS variables
 */
export function getNoDataColor() {
  return CSS_VARIABLES.noDataColor;
} 