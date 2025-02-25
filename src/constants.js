/**
 * Calendar Heatmap Card Constants
 */

export const CARD_VERSION = "3.1.0";

// Material-inspired color palette
export const MATERIAL_COLORS = [
  "#F44336", // red
  "#E91E63", // pink
  "#9C27B0", // purple
  "#673AB7", // deep purple
  "#3F51B5", // indigo
  "#2196F3", // blue
  "#03A9F4", // light blue
  "#00BCD4", // cyan
  "#009688", // teal
  "#4CAF50"  // green
];

export const DEFAULT_CONFIG = {
  title: "Game Activity",
  days_to_show: 365,
  ignored_states: ["unknown", "idle", "offline", ""],
  refresh_interval: 5 * 60, // seconds
  theme: "dark",
}; 