#!/bin/bash

# Calendar Heatmap Card Release Preparation Script
# This script builds the project and prepares files for release

# Exit on error
set -e

# Get version from constants.js
CONSTANTS_VERSION=$(grep -o "CARD_VERSION = '[^']*'" src/constants.js | cut -d "'" -f 2)
PACKAGE_VERSION=$(grep -o '"version": "[^"]*"' package.json | head -1 | cut -d '"' -f 4)
MANIFEST_VERSION=$(grep -o '"version": "[^"]*"' manifest.json | head -1 | cut -d '"' -f 4)

echo "Checking version consistency..."
echo "- constants.js: $CONSTANTS_VERSION"
echo "- package.json: $PACKAGE_VERSION"
echo "- manifest.json: $MANIFEST_VERSION"

# Check if versions match
if [ "$CONSTANTS_VERSION" != "$PACKAGE_VERSION" ] || [ "$CONSTANTS_VERSION" != "$MANIFEST_VERSION" ]; then
  echo "ERROR: Version mismatch detected!"
  echo "Please ensure all version numbers are consistent before running this script."
  exit 1
fi

# Use the version from constants.js
VERSION=$CONSTANTS_VERSION
echo "Preparing release for version $VERSION"

# Create release directory if it doesn't exist
RELEASE_DIR="releases/v$VERSION"
mkdir -p "$RELEASE_DIR"

# Build the project using build.sh script
echo "Building project..."
./build.sh

# Copy files to release directory
echo "Copying files to release directory..."
cp dist/calendar-heatmap-card.js "$RELEASE_DIR/"
cp README.md "$RELEASE_DIR/"
cp CHANGELOG.md "$RELEASE_DIR/"
cp LICENSE "$RELEASE_DIR/"

# Create a zip file for HACS
echo "Creating zip file for HACS..."
cd "$RELEASE_DIR"
zip "calendar-heatmap-card-$VERSION.zip" *
cd -

echo "Release preparation complete!"
echo "Files are available in: $RELEASE_DIR"
echo "Next steps:"
echo "1. Commit and push changes to GitHub"
echo "2. Create a new release on GitHub with tag v$VERSION"
echo "3. Upload the zip file to the GitHub release"
echo "4. Update HACS custom repository"
echo ""
echo "Note: The RELEASE_TEMPLATE.md file is for reference only and doesn't need to be committed."
echo "You can use its contents when creating the GitHub release manually." 