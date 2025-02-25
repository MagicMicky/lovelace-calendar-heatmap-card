# Calendar Heatmap Card

[![HACS Badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/custom-components/hacs)
[![GitHub Release](https://img.shields.io/github/release/MagicMicky/lovelace-calendar-heatmap-card.svg)](https://github.com/MagicMicky/lovelace-calendar-heatmap-card/releases)
[![License](https://img.shields.io/github/license/MagicMicky/lovelace-calendar-heatmap-card.svg)](LICENSE)

A custom Lovelace card for Home Assistant that visualizes entity activity data as a calendar heatmap, similar to GitHub's contribution graph. Perfect for tracking game activity, device usage, or any time-based data.

![Calendar Heatmap Card](https://raw.githubusercontent.com/MagicMicky/lovelace-calendar-heatmap-card/main/docs/images/card-preview.png)

## Features

- 📅 Displays historical activity data on a calendar grid
- 🎮 Perfect for tracking game activity, device usage, or any time-based data
- 🎨 Customizable colors and theming (light/dark mode support)
- 🔄 Auto-refreshes data at configurable intervals
- 📊 Detailed breakdown of activity on hover and click
- 🌐 Localized day and month names
- 📱 Responsive design for both desktop and mobile
- 🗓️ Configurable week start day (Monday or Sunday)

## Installation

### HACS (Recommended)

1. Make sure [HACS](https://hacs.xyz/) is installed in your Home Assistant instance
2. Add this repository as a custom repository in HACS:
   - Go to HACS → Integrations → ⋮ → Custom repositories
   - Add `https://github.com/MagicMicky/lovelace-calendar-heatmap-card` as a "Lovelace" repository
3. Search for "Calendar Heatmap Card" in the Frontend section and install it
4. Restart Home Assistant

### Manual Installation

1. Download the `calendar-heatmap-card.js` file from the [latest release](https://github.com/MagicMicky/lovelace-calendar-heatmap-card/releases)
2. Upload it to your Home Assistant instance using the following path:
   ```
   /config/www/community/lovelace-calendar-heatmap-card/calendar-heatmap-card.js
   ```
3. Add the resource reference to your Lovelace configuration:
   ```yaml
   resources:
     - url: /local/community/lovelace-calendar-heatmap-card/calendar-heatmap-card.js
       type: module
   ```
4. Restart Home Assistant

## Usage

Add the card to your Lovelace dashboard:

```yaml
type: custom:calendar-heatmap-card
entity: sensor.game_activity
title: My Gaming Activity
days_to_show: 365
theme: dark
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `entity` | string | (Required) | Entity ID to display history for |
| `title` | string | "Game Activity" | Card title |
| `days_to_show` | number | 365 | Number of days of history to display |
| `ignored_states` | array | ["unknown", "idle", "offline", ""] | States to ignore in calculations |
| `refresh_interval` | number | 300 | Refresh interval in seconds |
| `theme` | string | "dark" | Theme to use ("dark" or "light") |
| `start_day_of_week` | string | "monday" | Day to start the week on ("monday" or "sunday") |

### Example Configurations

#### Basic Configuration
```yaml
type: custom:calendar-heatmap-card
entity: sensor.steam_activity
title: Steam Gaming Activity
```

#### Advanced Configuration
```yaml
type: custom:calendar-heatmap-card
entity: sensor.steam_activity
title: Steam Gaming Activity
days_to_show: 180
ignored_states:
  - unknown
  - idle
  - offline
  - ""
refresh_interval: 600
theme: light
start_day_of_week: sunday
```

## Entity Requirements

This card works best with entities that:

1. Have different states representing different activities (like game names)
2. Change state frequently enough to generate meaningful data
3. Maintain history in Home Assistant

Examples include:
- Game activity sensors (Steam, PlayStation, etc.)
- Device usage sensors
- Presence/occupancy sensors
- Any sensor that changes state throughout the day

## Development

### Project Structure
The project follows a modular architecture:

```
src/
├── index.js                  # Main entry point
├── calendar-heatmap-card.js  # Main component class
├── constants.js              # Constants like version
├── utils/                    # Utility functions
│   ├── date-utils.js         # Date manipulation functions
│   ├── format-utils.js       # Formatting functions
│   ├── color-utils.js        # Color manipulation helpers
│   └── dom-utils.js          # DOM manipulation helpers
├── services/                 # External services
│   └── history-service.js    # History data fetching
├── data/                     # Data processing
│   └── data-processor.js     # Data transformation logic
└── ui/                       # UI components
    ├── components/           # Reusable UI components
    │   ├── month-header.js   # Month header component
    │   ├── day-labels.js     # Day labels component
    │   ├── detail-view.js    # Detail view component
    │   └── heatmap-grid.js   # Heatmap grid component
    └── styles.js             # Styles and theme handling
```

### Building the Project

#### Using Docker (Recommended)
```bash
# Ensure you're in the docker group
newgrp docker

# Build the project
docker build -t calendar-heatmap-card .
docker run --rm -v $(pwd)/dist:/app/dist calendar-heatmap-card
```

#### Using npm
```bash
# Install dependencies
npm install

# Build the project
npm run build

# For development with auto-rebuild
npm run build:watch
```

### Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by GitHub's contribution calendar
- Built for the Home Assistant community
