# Changelog

All notable changes to the Calendar Heatmap Card will be documented in this file.

## [3.3.0] - 2025-03-01

### Added
- Automatic sizing of heatmap for better responsiveness
- Limit on number of games displayed for improved performance

### Changed
- Migrated fully to Lit framework for improved performance and maintainability
- Improved history fetching to follow Home Assistant best practices
- Limited card height for better UI integration
- Enhanced UI with better padding and scroll behavior

## [3.2.0] - 2023-02-29

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

## [1.0.0] - 2025-02-29

### Added
- Initial release
- Basic calendar heatmap functionality
- Support for tracking game activity 