# [3.6.0](https://github.com/MagicMicky/lovelace-calendar-heatmap-card/compare/v3.5.0...v3.6.0) (2026-09-05)


### Bug Fixes

* align month headers with the visible week range ([67fbcd4](https://github.com/MagicMicky/lovelace-calendar-heatmap-card/commit/67fbcd4b04614b0c46a93f15636426f992d2c09c)), closes [#16](https://github.com/MagicMicky/lovelace-calendar-heatmap-card/issues/16)
* align month labels with the month each column mostly belongs to ([170ebd0](https://github.com/MagicMicky/lovelace-calendar-heatmap-card/commit/170ebd00ac83111c2666a7dcb4dda90a716b9616))
* attribute history to the local day it actually falls in ([ef1915c](https://github.com/MagicMicky/lovelace-calendar-heatmap-card/commit/ef1915cf6056060b849507d1e76ad2eaaac9e0db)), closes [#14](https://github.com/MagicMicky/lovelace-calendar-heatmap-card/issues/14) [#13](https://github.com/MagicMicky/lovelace-calendar-heatmap-card/issues/13) [#14](https://github.com/MagicMicky/lovelace-calendar-heatmap-card/issues/14)
* parse detail view dates as local time ([d32abaf](https://github.com/MagicMicky/lovelace-calendar-heatmap-card/commit/d32abaf1fd8e202dcd6f902ff9c3389c941ee8bb)), closes [#15](https://github.com/MagicMicky/lovelace-calendar-heatmap-card/issues/15)
* reduce inactive binary cell opacity to 0.2 ([c7035b4](https://github.com/MagicMicky/lovelace-calendar-heatmap-card/commit/c7035b434a6565042bca725c2d1e94ae457344ea)), closes [#20](https://github.com/MagicMicky/lovelace-calendar-heatmap-card/issues/20)
* remove extra card header padding ([63a14ed](https://github.com/MagicMicky/lovelace-calendar-heatmap-card/commit/63a14ed00471b0e9e1760f6bcbb7d8a14be342a4)), closes [#18](https://github.com/MagicMicky/lovelace-calendar-heatmap-card/issues/18)


### Features

* add show_title option to hide the card title ([cfeedcb](https://github.com/MagicMicky/lovelace-calendar-heatmap-card/commit/cfeedcb0e44109744d047e68312fcc7ad0171b09)), closes [#19](https://github.com/MagicMicky/lovelace-calendar-heatmap-card/issues/19)
* integrate contributor PRs [#13](https://github.com/MagicMicky/lovelace-calendar-heatmap-card/issues/13)-[#20](https://github.com/MagicMicky/lovelace-calendar-heatmap-card/issues/20) with fixes and release pipeline repairs ([e24fc98](https://github.com/MagicMicky/lovelace-calendar-heatmap-card/commit/e24fc98e7e722a2b2288d50db5c71a094c2f3220)), closes [#22](https://github.com/MagicMicky/lovelace-calendar-heatmap-card/issues/22)
* tighten the card layout when the title is hidden ([cdb0484](https://github.com/MagicMicky/lovelace-calendar-heatmap-card/commit/cdb0484d6cee9721c1808e5cb34a5085754fe957)), closes [#19](https://github.com/MagicMicky/lovelace-calendar-heatmap-card/issues/19)

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
