#!/usr/bin/env node

/**
 * Calendar Heatmap Card Version Update Script
 * This script updates the version number in all relevant files
 */

const fs = require('fs');
const path = require('path');

// Get the new version from command line arguments
const newVersion = process.argv[2];

if (!newVersion) {
  console.error('Error: No version specified');
  console.error('Usage: node update-version.js <new_version>');
  process.exit(1);
}

// Validate version format (x.y.z)
if (!/^\d+\.\d+\.\d+$/.test(newVersion)) {
  console.error('Error: Version must be in the format x.y.z (e.g., 3.2.1)');
  process.exit(1);
}

console.log(`Updating version to ${newVersion} in all files...`);

// Update version in src/constants.js
const constantsPath = path.resolve(__dirname, '../src/constants.js');
let constantsContent = fs.readFileSync(constantsPath, 'utf8');
constantsContent = constantsContent.replace(
  /CARD_VERSION = ['"][\d\.]+['"]/,
  `CARD_VERSION = '${newVersion}'`
);
fs.writeFileSync(constantsPath, constantsContent);
console.log('✓ Updated src/constants.js');

// Update version in package.json
const packagePath = path.resolve(__dirname, '../package.json');
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
packageJson.version = newVersion;
fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n');
console.log('✓ Updated package.json');

// Update version in manifest.json
const manifestPath = path.resolve(__dirname, '../manifest.json');
const manifestJson = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
manifestJson.version = newVersion;
fs.writeFileSync(manifestPath, JSON.stringify(manifestJson, null, 2) + '\n');
console.log('✓ Updated manifest.json');

console.log(`Version updated successfully to ${newVersion}`); 