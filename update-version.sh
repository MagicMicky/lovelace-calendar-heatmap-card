#!/bin/bash

# Calendar Heatmap Card Version Update Script
# This script updates the version number in all relevant files

# Exit on error
set -e

# Check if a version argument was provided
if [ $# -ne 1 ]; then
  echo "Usage: $0 <new_version>"
  echo "Example: $0 3.2.1"
  exit 1
fi

NEW_VERSION=$1

# Validate version format (simple check for x.y.z format)
if ! [[ $NEW_VERSION =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "Error: Version must be in the format x.y.z (e.g., 3.2.1)"
  exit 1
fi

echo "Updating version to $NEW_VERSION in all files..."

# Update version in src/constants.js
sed -i "s/CARD_VERSION = '[0-9]\+\.[0-9]\+\.[0-9]\+'/CARD_VERSION = '$NEW_VERSION'/g" src/constants.js
echo "✓ Updated src/constants.js"

# Update version in package.json
sed -i "s/\"version\": \"[0-9]\+\.[0-9]\+\.[0-9]\+\"/\"version\": \"$NEW_VERSION\"/g" package.json
echo "✓ Updated package.json"

# Update version in manifest.json
sed -i "s/\"version\": \"[0-9]\+\.[0-9]\+\.[0-9]\+\"/\"version\": \"$NEW_VERSION\"/g" manifest.json
echo "✓ Updated manifest.json"

echo "Version updated successfully to $NEW_VERSION"
echo ""
echo "Next steps:"
echo "1. Update CHANGELOG.md with the new version details"
echo "2. Commit the changes"
echo "3. Run prepare-release.sh to build and package the release" 