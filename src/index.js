import { CARD_VERSION } from './constants.js';
import CalendarHeatmapCard from './calendar-heatmap-card.js';

// Log version info
console.info(
  `%c CALENDAR-HEATMAP-CARD %c ${CARD_VERSION} `,
  'color: white; background: #3498db; font-weight: 700;',
  'color: #3498db; background: white; font-weight: 700;',
);

// Register the custom element
customElements.define("calendar-heatmap-card", CalendarHeatmapCard);

// Add card to CUSTOM_CARD_HELPERS for better integration with Home Assistant
window.customCards = window.customCards || [];
window.customCards.push({
  type: "calendar-heatmap-card",
  name: "Calendar Heatmap Card",
  description: "A calendar heatmap card for visualizing entity activity data",
  preview: true,
  documentationURL: "https://github.com/MagicMicky/lovelace-calendar-heatmap-card",
}); 