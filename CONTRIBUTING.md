# Contributing to Calendar Heatmap Card

Thank you for your interest in contributing to the Calendar Heatmap Card! This document provides guidelines and instructions for contributing.

## Code Architecture

The Calendar Heatmap Card uses a fully LitElement-based architecture:

1. **Main Component**: `CalendarHeatmapCard` - Manages the overall card lifecycle and data fetching
2. **UI Components**:
   - `HeatmapGrid` - Renders the heatmap grid cells
   - `DayLabels` - Renders the day labels
   - `MonthHeader` - Renders the month header
   - `DetailView` - Renders the detail view

All components use LitElement for consistent reactivity and templating.

## Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/MagicMicky/lovelace-calendar-heatmap-card.git
   cd lovelace-calendar-heatmap-card
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   npm run build:watch
   ```

4. Link the development version to your Home Assistant instance for testing.

## Dependency Management

- **lit**: Used for all components (LitElement)

When adding new dependencies, please consider:
- Is it necessary?
- Could it be implemented without the dependency?
- What's the impact on bundle size?

## Code Style

We use ESLint and Prettier to maintain code quality and consistency:

```bash
# Run linting
npm run lint

# Fix linting issues
npm run lint:fix
```

## Pull Request Process

1. Fork the repository and create a feature branch
2. Make your changes
3. Ensure your code passes linting
4. Update documentation if necessary
5. Submit a pull request

## Component Guidelines

### LitElement Components

- Use LitElement's reactive properties system
- Use lit-html for templating in the render method
- Follow the established component pattern
- Document properties and methods
- Use CSS custom properties for theming

### Event Handling

- Use custom events for component communication
- Document event details
- Ensure events bubble and compose correctly

### Services

- Document the API interactions
- Handle errors gracefully
- Provide meaningful console messages for debugging

## Testing

We use Jest for testing:

```bash
npm test
```

Please add tests for new features when possible.

## Documentation

Update the README.md file if you add new features or configuration options.

## License

By contributing, you agree that your contributions will be licensed under the project's MIT License. 