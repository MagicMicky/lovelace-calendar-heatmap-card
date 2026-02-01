# Calendar Heatmap Card

[![HACS Badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/custom-components/hacs)
[![HACS Validation](https://github.com/MagicMicky/lovelace-calendar-heatmap-card/workflows/HACS%20Validation/badge.svg)](https://github.com/MagicMicky/lovelace-calendar-heatmap-card/actions/workflows/hacs.yml)
[![GitHub Release](https://img.shields.io/github/release/MagicMicky/lovelace-calendar-heatmap-card.svg)](https://github.com/MagicMicky/lovelace-calendar-heatmap-card/releases)
[![License](https://img.shields.io/github/license/MagicMicky/lovelace-calendar-heatmap-card.svg)](LICENSE)

> ⚠️ **AI-Assisted Development Warning**: This project has been largely developed with the assistance of AI tools (Claude and Cursor). I only have a basic understanding of what this code does and have been using this project as a way to experiment with AI-assisted development while creating a component I wanted for my dashboard. The code may contain inconsistencies, and best practices might only be partially followed due to the contextual limitations of AI. Use at your own risk and feel free to contribute improvements!

A custom Lovelace card for Home Assistant that visualizes entity activity data as a calendar heatmap, similar to GitHub's contribution graph. Perfect for tracking game activity, device usage, or any time-based data.

![Calendar Heatmap Card](https://raw.githubusercontent.com/MagicMicky/lovelace-calendar-heatmap-card/main/docs/images/calendar-heatmap.png)

## Features

- 📅 Displays historical activity data on a calendar grid
- 🎮 Perfect for tracking game activity, device usage, or any time-based data
- ✅ **Binary/Habit tracking mode** for simple on/off tracking (e.g., gym attendance)
- 🎨 Advanced theme-aware colors that automatically adapt to light/dark modes
- 🌈 Intelligent color intensity scaling for better visual differentiation
- 🔄 Auto-refreshes data at configurable intervals
- 📊 Detailed breakdown of activity on hover and click
- 🌐 Localized day and month names
- 📱 Responsive design for both desktop and mobile
- 🗓️ Configurable week start day (Monday or Sunday)
- 📏 Automatic sizing of heatmap based on available space
- 🎲 Configurable limit on number of games displayed

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
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `entity` | string | (Required) | Entity ID to display history for |
| `title` | string | "Game Activity" | Card title |
| `ignored_states` | array | ["unknown", "idle", "offline", ""] | States to ignore in calculations |
| `refresh_interval` | number | 300 | Refresh interval in seconds |
| `start_day_of_week` | string | "monday" | Day to start the week on ("monday" or "sunday") |
| `include_unknown` | boolean | false | Whether to include "unknown" state in calculations |
| `binary_mode` | boolean | false | Enable binary/habit tracking mode (shows active/inactive instead of duration) |
| `binary_on_state` | string | null | Specific state to track as "on" in binary mode (null = any non-ignored state) |
| `binary_color` | string | "#4CAF50" | Color for active days in binary mode |

### Example Configurations

#### Basic Configuration
```yaml
type: custom:calendar-heatmap-card
entity: sensor.steam_activity
title: Steam Gaming Activity
```

#### Binary/Habit Tracking Mode
Perfect for tracking habits like gym attendance, medication, or any yes/no daily activity:

```yaml
type: custom:calendar-heatmap-card
entity: input_boolean.gym_tracker
title: Gym Activity
binary_mode: true
binary_on_state: "on"
binary_color: "#4CAF50"
```

In binary mode:
- Days are shown as either active (colored) or inactive (gray)
- The detail panel shows "X / Y days (Z% active)" instead of duration
- Clicking a day shows "Active" or "No activity" with a list of states that occurred

## Theming

The Calendar Heatmap Card features advanced theme-aware color handling that automatically adapts to your Home Assistant theme. The card will detect whether you're using a light or dark theme and adjust colors accordingly for optimal visibility.

### Theme Detection

In version 3.3.0, the theme detection has been improved to:

1. Automatically detect theme changes in real-time
2. Properly detect themes from parent elements (useful for cards inside dashboards with different themes)
3. Adapt colors for better contrast in both light and dark themes

### Visual Differentiation

The card uses an improved intensity scaling algorithm that provides better visual differentiation between different activity durations:

- Very short sessions (< 15 min)
- Short sessions (15-45 min)
- Medium sessions (45 min - 2 hours)
- Longer sessions (2-4 hours)
- High usage sessions (4-8 hours)
- Very high usage sessions (8+ hours)

This makes it easier to distinguish between days with different levels of activity at a glance.

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

## Integration Examples

### Discord Game Activity

The Calendar Heatmap Card works perfectly with the [Discord Game integration](https://github.com/LordBoos/discord_game) for Home Assistant, which provides a sensor that tracks the games you play.

When you set up the Discord Game integration, it creates a sensor for each user that shows the current game being played. The sensor follows the format `sensor.discord_user_*_game` where `*` is your Discord user ID. This sensor's state changes to the name of the game when you're playing something, and to "idle", "offline", or other status indicators when you're not.

#### Example Configuration

```yaml
type: custom:calendar-heatmap-card
entity: sensor.discord_user_game
title: My Discord Gaming Activity
days_to_show: 365
ignored_states:
  - unknown
  - idle
  - offline
  - ""
  - dnd
  - online
refresh_interval: 300
start_day_of_week: monday
```

Replace `sensor.discord_user_game` with your actual Discord game sensor as it appears in Home Assistant.

#### How It Works

The Calendar Heatmap Card will:
- Track the time spent in each game state
- Display different colors for different games
- Show a breakdown of your gaming activity when you hover over or click on a day
- Filter out states like "idle" and "offline" by default (configurable)

This gives you a beautiful visualization of your gaming habits over time, showing which days you played the most and which games dominated your play time.

![Discord Gaming Activity Example](https://raw.githubusercontent.com/MagicMicky/lovelace-calendar-heatmap-card/main/docs/images/calendar-heatmap.png)
*Example of Discord gaming activity visualization*

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
│   ├── history-service.js    # History data fetching
│   └── entity-subscription.js # Entity state subscription
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

### Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
   This will also generate a `package-lock.json` file which is important for CI/CD.
3. Build the project:
   ```bash
   npm run build
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

## Automated Releases

This project uses semantic-release for automated versioning and releases. For this to work properly:

1. Create a GitHub Personal Access Token with `repo` scope
2. Add this token as a repository secret named `GH_TOKEN` in your GitHub repository settings
3. Ensure the `scripts` directory exists and the update script is executable:
   ```bash
   mkdir -p scripts
   chmod +x scripts/update-version.js
   ```
4. Set up Git hooks properly (especially if you're using nvm):
   ```bash
   npm run setup-hooks
   ```
5. Write commit messages following the [Conventional Commits](https://www.conventionalcommits.org/) format:
   - `feat: ...` for new features (minor version bump)
   - `fix: ...` for bug fixes (patch version bump)
   - Include `BREAKING CHANGE:` in the commit message for major version bumps

See the [CONTRIBUTING.md](CONTRIBUTING.md) file for more details on the release process.
