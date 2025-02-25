/**
 * Calendar Heatmap Card Constants
 * 
 * This file contains all the constants used throughout the application.
 * Centralizing constants makes it easier to maintain and update the application.
 */

/**
 * Current version of the card
 * @type {string}
 */
export const CARD_VERSION = '3.1.0';

/**
 * Material Design inspired color palette for heatmap
 * These colors are used to represent different states/games in the heatmap
 * @type {string[]}
 */
export const MATERIAL_COLORS = [
  '#F44336', // red
  '#E91E63', // pink
  '#9C27B0', // purple
  '#673AB7', // deep purple
  '#3F51B5', // indigo
  '#2196F3', // blue
  '#03A9F4', // light blue
  '#00BCD4', // cyan
  '#009688', // teal
  '#4CAF50'  // green
];

/**
 * Default configuration for the card
 * These values will be used if not specified in the card configuration
 * @type {Object}
 */
export const DEFAULT_CONFIG = {
  title: 'Game Activity',
  days_to_show: 365,
  ignored_states: ['unknown', 'idle', 'offline', ''],
  refresh_interval: 5 * 60, // seconds
  theme: 'dark',
  start_day_of_week: 'monday', // can be "monday" or "sunday"
};

/**
 * Layout constants for the heatmap grid
 * @type {Object}
 */
export const LAYOUT = {
  cellWidth: 12,
  cellMargin: 2,
  get weekColWidth() {
    return this.cellWidth + this.cellMargin;
  }
};

/**
 * Theme color constants
 * @type {Object}
 */
export const THEME_COLORS = {
  dark: {
    primaryText: '#c9d1d9',
    secondaryText: '#8b949e',
    noDataColor: '#757575',
  },
  light: {
    primaryText: '#333',
    secondaryText: '#888',
    noDataColor: '#E0E0E0',
  }
}; 