# [3.5.0](https://github.com/MagicMicky/lovelace-calendar-heatmap-card/compare/v3.4.1...v3.5.0) (2026-02-01)


### Features

* add binary/habit-tracker mode ([f5d1039](https://github.com/MagicMicky/lovelace-calendar-heatmap-card/commit/f5d1039eef0f72793aa8adab6f5d8a94b16edada)), closes [#9](https://github.com/MagicMicky/lovelace-calendar-heatmap-card/issues/9) [#4CAF50](https://github.com/MagicMicky/lovelace-calendar-heatmap-card/issues/4CAF50)

## [3.4.1](https://github.com/MagicMicky/lovelace-calendar-heatmap-card/compare/v3.4.0...v3.4.1) (2025-03-01)


### Bug Fixes

* ci for hacs + readme ([ab22aee](https://github.com/MagicMicky/lovelace-calendar-heatmap-card/commit/ab22aee83f342ff2837ebac9b8ce20f7e71dd370))
* hacs.json ([39eb418](https://github.com/MagicMicky/lovelace-calendar-heatmap-card/commit/39eb418b0c2653ab8e861f80b039a8800e1e8f89))
* update hacs.json to use category instead of type ([19aeecd](https://github.com/MagicMicky/lovelace-calendar-heatmap-card/commit/19aeecde3efe14c6dc4681622dddeb2a4d1415a9))

# [3.4.0](https://github.com/MagicMicky/lovelace-calendar-heatmap-card/compare/v3.3.0...v3.4.0) (2025-03-01)


### Bug Fixes

* believe AI overlords ([6b74db3](https://github.com/MagicMicky/lovelace-calendar-heatmap-card/commit/6b74db3af7f21b04900037dcc4b95135bea316b7))
* fix prettier vs eslint ([924d6a0](https://github.com/MagicMicky/lovelace-calendar-heatmap-card/commit/924d6a0837048fbdf931ee4b770453cea96c4e13))
* lint ([899a587](https://github.com/MagicMicky/lovelace-calendar-heatmap-card/commit/899a5872a9317d4fa776117a2033fbb2c21ebd10))


### Features

* automatic build ([5777296](https://github.com/MagicMicky/lovelace-calendar-heatmap-card/commit/5777296c50fec4e2f0db30d323dbc56e1f8558a6))
* fix linting issues and setup pre-commit hooks ([7326378](https://github.com/MagicMicky/lovelace-calendar-heatmap-card/commit/73263787cd06ad859ccc99ee55f2414fb5b83b98))

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
