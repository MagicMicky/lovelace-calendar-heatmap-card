# Calendar Heatmap Card

A custom Lovelace card for Home Assistant that visualizes game activity data as a calendar heatmap.

## Features
- Displays historical game activity on a calendar grid.
- Customizable colors and theming.
- Dynamically fetches sensor history via Home Assistant API.
- Modular code structure for easy maintenance and extension.

## Installation via HACS
1. Add this repository as a custom repository in HACS.
2. Search for "Calendar Heatmap Card" and install it.
3. Restart Home Assistant.

## Project Structure
The project follows a modular architecture:

```
src/
├── index.js                  # Main entry point
├── calendar-heatmap-card.js  # Main component class
├── constants.js              # Constants like version
├── utils/                    # Utility functions
│   ├── date-utils.js         # Date manipulation functions
│   ├── format-utils.js       # Formatting functions
│   └── dom-utils.js          # DOM manipulation helpers
├── services/                 # External services
│   └── history-service.js    # History data fetching
├── data/                     # Data processing
│   └── data-processor.js     # Data transformation logic
└── ui/                       # UI components
    ├── components/           # Reusable UI components
    │   ├── month-header.js   # Month header component
    │   ├── day-labels.js     # Day labels component
    │   └── heatmap-grid.js   # Heatmap grid component
    └── styles.js             # Styles and theme handling
```

## Development
To build the project:
```bash
npm install
npm run build
```

For development with auto-rebuild:
```bash
npm run build:watch
```

## Sample YAML Configuration
