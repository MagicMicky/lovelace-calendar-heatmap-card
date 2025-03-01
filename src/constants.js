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
export const CARD_VERSION = '3.2.0';

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
  ignored_states: ['unknown', 'idle', 'offline', ''],
  refresh_interval: 10 * 60, // 10 minutes in seconds
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
 * CSS variables for theming
 * These are the Home Assistant CSS variables used for theming with fallbacks
 * @type {Object}
 */
export const CSS_VARIABLES = {
  // Text colors
  primaryText: 'var(--primary-text-color, #c9d1d9)',
  secondaryText: 'var(--secondary-text-color, #8b949e)',
  
  // Background colors
  cardBackground: 'var(--ha-card-background, var(--card-background-color, #1c1c1c))',
  secondaryBackground: 'var(--secondary-background-color, #2d333b)',
  
  // Heatmap specific colors
  noDataColor: 'var(--calendar-heatmap-no-data-color, var(--disabled-text-color, #757575))',
  level1Color: 'var(--calendar-heatmap-level-1, var(--success-color, #c6e48b))',
  level2Color: 'var(--calendar-heatmap-level-2, var(--primary-color, #7bc96f))',
  level3Color: 'var(--calendar-heatmap-level-3, var(--accent-color, #239a3b))',
  level4Color: 'var(--calendar-heatmap-level-4, var(--state-active-color, #196127))',
  
  // UI elements
  dividerColor: 'var(--divider-color, #444c56)',
  cardBoxShadow: 'var(--ha-card-box-shadow, 0 2px 5px rgba(0,0,0,0.26))',
  cardBorderRadius: 'var(--ha-card-border-radius, 4px)'
}; 