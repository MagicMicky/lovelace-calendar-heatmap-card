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

## Release Process

This project uses [semantic-release](https://github.com/semantic-release/semantic-release) to automate the release process. The release is triggered automatically when commits are pushed to the `main` branch.

### Commit Message Format

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification for commit messages. This allows us to automatically determine the next version number and generate changelogs.

The commit message should be structured as follows:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

The `type` must be one of the following:

- `feat`: A new feature (triggers a MINOR version bump)
- `fix`: A bug fix (triggers a PATCH version bump)
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools and libraries

If the commit introduces a breaking change, the footer should contain `BREAKING CHANGE:` followed by a description of the change. This will trigger a MAJOR version bump.

Examples:

```
feat(calendar): add week number display
```

```
fix(heatmap): correct color calculation for empty days
```

```
feat(api): support new Home Assistant sensor format

BREAKING CHANGE: The sensor data format has changed and requires Home Assistant 2023.8.0 or newer
```

### Release Workflow

The release workflow is as follows:

1. Commits are pushed to the `main` branch
2. GitHub Actions runs the CI workflow to validate the code
3. If the CI passes, the release workflow is triggered
4. semantic-release determines the next version number based on the commit messages
5. The version is updated in all relevant files
6. The changelog is generated
7. The code is built and packaged
8. A new GitHub release is created with the appropriate tag
9. The release assets are uploaded to the GitHub release

You don't need to manually create releases or update version numbers. Just follow the commit message format and the rest will be handled automatically. 