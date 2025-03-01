# Changelog

All notable changes to the Calendar Heatmap Card will be documented in this file.

## [3.2.0] - 2023-03-01

### Added
- Advanced theme-aware color handling that automatically adapts to light/dark modes
- Intelligent color intensity scaling for better visual differentiation between activity durations
- Stepped intensity approach with specific thresholds for common gaming session durations
- Theme detection for parent elements to support cards inside dashboards with different themes
- Data attribute for intensity values to aid in debugging
- Comprehensive error handling throughout the codebase

### Changed
- Improved visual differentiation between different activity durations
- Enhanced contrast for better readability in both light and dark themes
- Refined color adjustment algorithm to ensure optimal visibility
- Updated README with new theming information and troubleshooting section
- Removed manual theme configuration option in favor of automatic detection

### Fixed
- Fixed "Invalid time value" errors when processing history data
- Improved handling of invalid dates throughout the application
- Enhanced error resilience when fetching historical data
- Better handling of "no data" colors with appropriate opacity

## [3.1.1] - 2023-02-15

### Fixed
- Fixed an issue with date handling in the history service
- Improved error handling for WebSocket API calls

## [3.1.0] - 2023-02-01

### Added
- Support for localized day and month names
- Configurable week start day (Monday or Sunday)
- Responsive design improvements for mobile devices

### Changed
- Improved performance for large datasets
- Enhanced visual appearance with subtle shadows and hover effects

## [3.0.0] - 2023-01-15

### Added
- Complete rewrite using a modular architecture
- Detailed breakdown of activity on hover and click
- Auto-refresh at configurable intervals
- Support for Home Assistant themes

### Changed
- Improved performance and reliability
- Enhanced visual design
- Better error handling

## [2.0.0] - 2022-12-01

### Added
- Support for Home Assistant 2022.12.0
- Improved color handling
- Better integration with Home Assistant

## [1.0.0] - 2022-10-15

### Added
- Initial release
- Basic calendar heatmap functionality
- Support for tracking game activity 