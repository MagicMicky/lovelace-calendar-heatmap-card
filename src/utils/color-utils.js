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
 * Calculates the relative luminance of a color (for WCAG contrast calculations)
 * @param {number} r - Red component (0-255)
 * @param {number} g - Green component (0-255)
 * @param {number} b - Blue component (0-255)
 * @returns {number} Luminance value between 0 and 1
 */
function calculateLuminance(r, g, b) {
  // Convert RGB to sRGB
  const sR = r / 255;
  const sG = g / 255;
  const sB = b / 255;
  
  // Convert sRGB to linear RGB
  const R = sR <= 0.03928 ? sR / 12.92 : Math.pow((sR + 0.055) / 1.055, 2.4);
  const G = sG <= 0.03928 ? sG / 12.92 : Math.pow((sG + 0.055) / 1.055, 2.4);
  const B = sB <= 0.03928 ? sB / 12.92 : Math.pow((sB + 0.055) / 1.055, 2.4);
  
  // Calculate luminance
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

/**
 * Calculates the contrast ratio between two colors
 * @param {number} luminance1 - Luminance of first color
 * @param {number} luminance2 - Luminance of second color
 * @returns {number} Contrast ratio between 1 and 21
 */
function calculateContrastRatio(luminance1, luminance2) {
  const lighter = Math.max(luminance1, luminance2);
  const darker = Math.min(luminance1, luminance2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Parses a color string (hex, rgb, or rgba) into RGB components
 * @param {string} color - Color string to parse
 * @returns {Object|null} Object with r, g, b components or null if parsing failed
 */
function parseColor(color) {
  // Handle CSS variables
  if (color.startsWith('var(')) {
    // For CSS variables, we can't parse them directly
    // Return a default color that will be visible in most themes
    return { r: 128, g: 128, b: 128 };
  }
  
  // Handle hex colors
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    // Handle shorthand hex (#RGB)
    if (hex.length === 3) {
      const r = parseInt(hex[0] + hex[0], 16);
      const g = parseInt(hex[1] + hex[1], 16);
      const b = parseInt(hex[2] + hex[2], 16);
      return { r, g, b };
    }
    // Handle full hex (#RRGGBB)
    if (hex.length === 6) {
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      return { r, g, b };
    }
  }
  
  // Handle rgb/rgba colors
  const rgbMatch = color.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)/);
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1], 10);
    const g = parseInt(rgbMatch[2], 10);
    const b = parseInt(rgbMatch[3], 10);
    return { r, g, b };
  }
  
  return null;
}

/**
 * Adjusts a color's intensity based on a factor with contrast awareness
 * Blends between the no-data color (0) and the color (1)
 * Ensures sufficient contrast against background
 * 
 * @param {string} hex - Hex color code (with or without #)
 * @param {number} factor - Intensity factor between 0 and 1
 * @returns {string} Adjusted color as RGB string
 */
export function adjustColor(hex, factor) {
  // Validate inputs
  if (!hex || typeof hex !== 'string') {
    return getNoDataColorWithOpacity(0.5);
  }
  
  // If the color is a CSS variable, we need special handling
  if (hex.startsWith('var(')) {
    // For very low factors, return the no-data color with appropriate opacity
    if (factor < 0.05) {
      return getNoDataColorWithOpacity(0.3);
    } else if (factor < 0.3) {
      return getNoDataColorWithOpacity(0.5 + factor);
    }
    
    // For higher factors, return the original CSS variable
    return hex;
  }
  
  // Clamp factor between 0 and 1
  const clampedFactor = Math.max(0, Math.min(1, factor));
  
  // For very low factors, return the no-data color with appropriate opacity
  if (clampedFactor < 0.05) {
    return getNoDataColorWithOpacity(0.3);
  }
  
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
    return getNoDataColorWithOpacity(0.5);
  }
  
  // Calculate original luminance
  const originalLuminance = calculateLuminance(r, g, b);
  
  // Apply intensity factor with contrast preservation
  // For low factors, we'll blend with a light or dark color depending on the original color
  const blendWithDark = originalLuminance > 0.5;
  
  let adjustedR, adjustedG, adjustedB;
  
  // Define intensity ranges for better visual differentiation
  // Use more dramatic adjustments for clearer visual steps
  if (clampedFactor < 0.25) {
    // Very low intensity (0-0.25) - subtle, desaturated color
    const [h, s, l] = rgbToHsl(r, g, b);
    const adjustedS = s * 0.5; // Significantly reduce saturation
    const adjustedL = blendWithDark 
      ? Math.min(0.8, l * 1.6)  // Much lighter for dark colors
      : Math.max(0.4, l * 0.9); // Slightly darker for light colors
    [adjustedR, adjustedG, adjustedB] = hslToRgb(h, adjustedS, adjustedL);
    
    // Add transparency for very low values
    return `rgba(${Math.round(adjustedR)}, ${Math.round(adjustedG)}, ${Math.round(adjustedB)}, ${0.7 + (clampedFactor * 0.8)})`;
  } else if (clampedFactor < 0.45) {
    // Low intensity (0.25-0.45) - more visible but still subdued
    const [h, s, l] = rgbToHsl(r, g, b);
    const adjustedS = s * 0.7; // Moderately reduce saturation
    const adjustedL = blendWithDark 
      ? Math.min(0.7, l * 1.4)  // Lighter for dark colors
      : Math.max(0.35, l * 0.85); // Darker for light colors
    [adjustedR, adjustedG, adjustedB] = hslToRgb(h, adjustedS, adjustedL);
  } else if (clampedFactor < 0.65) {
    // Medium intensity (0.45-0.65) - vibrant but not too bold
    const [h, s, l] = rgbToHsl(r, g, b);
    const adjustedS = Math.min(1, s * 1.1); // Slightly increase saturation
    const adjustedL = blendWithDark 
      ? Math.min(0.6, l * 1.2)  // Lighter for dark colors
      : Math.max(0.3, l * 0.8); // Darker for light colors
    [adjustedR, adjustedG, adjustedB] = hslToRgb(h, adjustedS, adjustedL);
  } else if (clampedFactor < 0.85) {
    // High intensity (0.65-0.85) - bold and saturated
    const [h, s, l] = rgbToHsl(r, g, b);
    const adjustedS = Math.min(1, s * 1.3); // Significantly increase saturation
    const adjustedL = blendWithDark 
      ? Math.min(0.5, l * 1.1)  // Slightly lighter for dark colors
      : Math.max(0.25, l * 0.7); // Much darker for light colors
    [adjustedR, adjustedG, adjustedB] = hslToRgb(h, adjustedS, adjustedL);
  } else {
    // Very high intensity (0.85-1.0) - maximum impact
    const [h, s, l] = rgbToHsl(r, g, b);
    const adjustedS = 1.0; // Maximum saturation
    const adjustedL = blendWithDark 
      ? Math.min(0.45, l * 1.0)  // Keep dark colors dark
      : Math.max(0.2, l * 0.6); // Very dark for light colors
    [adjustedR, adjustedG, adjustedB] = hslToRgb(h, adjustedS, adjustedL);
  }
  
  // Ensure the adjusted color has sufficient contrast against the background
  const bgColor = parseColor(CSS_VARIABLES.cardBackground) || { r: 30, g: 30, b: 30 };
  const bgLuminance = calculateLuminance(bgColor.r, bgColor.g, bgColor.b);
  const adjustedLuminance = calculateLuminance(adjustedR, adjustedG, adjustedB);
  const contrastRatio = calculateContrastRatio(adjustedLuminance, bgLuminance);
  
  // WCAG AA requires a contrast ratio of at least 4.5:1 for normal text
  // For our visualization, we'll aim for at least 3:1
  const MIN_CONTRAST = 3;
  
  if (contrastRatio < MIN_CONTRAST) {
    // Adjust brightness to improve contrast
    const targetLuminance = bgLuminance < 0.5 
      ? Math.min(1, bgLuminance + 0.3)  // For dark backgrounds, make colors lighter
      : Math.max(0, bgLuminance - 0.3); // For light backgrounds, make colors darker
    
    const [h, s, l] = rgbToHsl(adjustedR, adjustedG, adjustedB);
    [adjustedR, adjustedG, adjustedB] = hslToRgb(h, s, targetLuminance);
  }
  
  return `rgb(${Math.round(adjustedR)}, ${Math.round(adjustedG)}, ${Math.round(adjustedB)})`;
}

/**
 * Converts RGB color to HSL
 * @param {number} r - Red component (0-255)
 * @param {number} g - Green component (0-255)
 * @param {number} b - Blue component (0-255)
 * @returns {Array} Array with [h, s, l] components
 */
function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  
  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    
    h /= 6;
  }
  
  return [h, s, l];
}

/**
 * Converts HSL color to RGB
 * @param {number} h - Hue component (0-1)
 * @param {number} s - Saturation component (0-1)
 * @param {number} l - Lightness component (0-1)
 * @returns {Array} Array with [r, g, b] components
 */
function hslToRgb(h, s, l) {
  let r, g, b;
  
  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  
  return [r * 255, g * 255, b * 255];
}

/**
 * Gets the no-data color from CSS variables with specified opacity
 * 
 * @param {number} opacity - Opacity value between 0 and 1
 * @returns {string} The no-data color with opacity
 */
export function getNoDataColorWithOpacity(opacity = 0.5) {
  // Clamp opacity between 0 and 1
  const clampedOpacity = Math.max(0, Math.min(1, opacity));
  
  // If we're using CSS variables, we need to handle this differently
  if (CSS_VARIABLES.noDataColor.startsWith('var(')) {
    // For CSS variables, we'll return a rgba version with the specified opacity
    return `rgba(var(--disabled-text-color-rgb, 117, 117, 117), ${clampedOpacity})`;
  }
  
  // Parse the color if it's a hex value
  const noDataColor = CSS_VARIABLES.noDataColor.startsWith('#') 
    ? CSS_VARIABLES.noDataColor 
    : '#757575'; // Default fallback
  
  try {
    const hex = noDataColor.slice(1);
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    
    return `rgba(${r}, ${g}, ${b}, ${clampedOpacity})`;
  } catch (error) {
    // Fallback to a default color with opacity
    return `rgba(117, 117, 117, ${clampedOpacity})`;
  }
}

/**
 * Gets the no-data color from CSS variables
 * 
 * @returns {string} The no-data color from CSS variables
 */
export function getNoDataColor() {
  return CSS_VARIABLES.noDataColor;
} 