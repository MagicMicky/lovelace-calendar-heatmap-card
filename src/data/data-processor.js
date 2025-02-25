import { getGameColor } from '../utils/color-utils.js';

/**
 * Process history data into daily totals
 * @param {Array} historyData - History data from Home Assistant
 * @param {Array} ignoredStates - States to ignore
 * @returns {Object} Object with daily totals by state
 */
export function processDailyTotals(historyData, ignoredStates) {
  console.log('Calendar Heatmap: Processing history data', historyData);
  console.log('Calendar Heatmap: Ignored states', ignoredStates);
  
  // Log the first few entries of raw history data to understand the structure
  if (historyData && historyData[0] && historyData[0].length > 0) {
    console.log('Calendar Heatmap: First 5 raw history entries:');
    for (let i = 0; i < Math.min(5, historyData[0].length); i++) {
      console.log(`Entry ${i}:`, JSON.stringify(historyData[0][i]));
    }
  }
  
  let dailyTotals = {};
  let skippedEntries = 0;
  let processedEntries = 0;
  
  if (historyData && historyData[0]) {
    const entityHistory = historyData[0];
    console.log('Calendar Heatmap: Entity history length', entityHistory.length);
    
    for (let i = 0; i < entityHistory.length - 1; i++) {
      const current = entityHistory[i];
      const next = entityHistory[i + 1];
      
      // Handle both standard and compressed formats
      // Compressed format uses 's' for state, 'lu' for last_updated/last_changed
      const currentState = current?.state || current?.s;
      const currentLastChanged = current?.last_changed || (current?.lu ? new Date(current.lu * 1000).toISOString() : null);
      const nextLastChanged = next?.last_changed || (next?.lu ? new Date(next.lu * 1000).toISOString() : null);
      
      // Skip entries with undefined state
      if (!currentState || !nextLastChanged) {
        console.log(`Calendar Heatmap: Skipping entry ${i} - missing required properties`);
        console.log('Current state:', currentState);
        console.log('Next last_changed:', nextLastChanged);
        skippedEntries++;
        continue;
      }
      
      const stateLower = currentState.toLowerCase();
      
      // Log the first few entries to understand the data format
      if (i < 5) {
        console.log('Calendar Heatmap: Entry', i, 'state:', currentState, 'last_changed:', currentLastChanged);
      }
      
      // Log why an entry is being skipped due to ignored states
      if (ignoredStates.includes(stateLower)) {
        console.log(`Calendar Heatmap: Skipping entry ${i} - state "${currentState}" is in ignored_states list`);
        skippedEntries++;
        continue;
      }
      
      // Ensure last_changed exists
      if (!currentLastChanged) {
        console.log(`Calendar Heatmap: Skipping entry ${i} - missing last_changed`);
        skippedEntries++;
        continue;
      }
      
      const startTime = new Date(currentLastChanged);
      const endTime = new Date(nextLastChanged);
      
      // Skip invalid dates
      if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
        console.log(`Calendar Heatmap: Skipping entry ${i} - invalid date format`);
        skippedEntries++;
        continue;
      }
      
      const diffSeconds = (endTime - startTime) / 1000;
      
      // Skip negative or extremely large time differences (more than a day)
      if (diffSeconds <= 0 || diffSeconds > 86400) {
        console.log(`Calendar Heatmap: Skipping entry ${i} - invalid time difference: ${diffSeconds} seconds`);
        skippedEntries++;
        continue;
      }
      
      const dayStr = startTime.toISOString().split("T")[0];
      
      if (!dailyTotals[dayStr]) {
        dailyTotals[dayStr] = {};
      }
      
      dailyTotals[dayStr][currentState] =
        (dailyTotals[dayStr][currentState] || 0) + diffSeconds;
      
      processedEntries++;
    }
  }
  
  console.log('Calendar Heatmap: Processed entries', processedEntries);
  console.log('Calendar Heatmap: Skipped entries', skippedEntries);
  console.log('Calendar Heatmap: Daily totals', dailyTotals);
  
  return dailyTotals;
}

/**
 * Calculate the maximum daily total seconds
 * @param {Object} dailyTotals - Daily totals by state
 * @returns {number} Maximum daily total seconds
 */
export function calculateMaxValue(dailyTotals) {
  let maxValue = 0;
  
  for (const dayStr in dailyTotals) {
    const statesObj = dailyTotals[dayStr];
    const sumSeconds = Object.values(statesObj).reduce((acc, val) => acc + val, 0);
    if (sumSeconds > maxValue) maxValue = sumSeconds;
  }
  
  return maxValue;
}

/**
 * Build a mapping of games to colors
 * @param {Object} dailyTotals - Daily totals by state
 * @returns {Object} Map of game names to colors
 */
export function buildGameColorMap(dailyTotals) {
  // Extract unique game names
  let gameSet = new Set();
  for (const day in dailyTotals) {
    for (const game in dailyTotals[day]) {
      gameSet.add(game);
    }
  }
  
  // Create color mapping
  let gameColorMap = {};
  Array.from(gameSet).forEach(game => {
    gameColorMap[game] = getGameColor(game);
  });
  
  return gameColorMap;
}

/**
 * Calculate overall totals across all days
 * @param {Object} dailyTotals - Daily totals by state
 * @returns {Object} Overall totals by game
 */
export function calculateOverallTotals(dailyTotals) {
  let overallTotals = {};
  
  for (const day in dailyTotals) {
    for (const game in dailyTotals[day]) {
      overallTotals[game] = (overallTotals[game] || 0) + dailyTotals[day][game];
    }
  }
  
  return overallTotals;
}

/**
 * Find the most played game
 * @param {Object} overallTotals - Overall totals by game
 * @returns {Object} Object with bestGame and bestSec properties
 */
export function findMostPlayedGame(overallTotals) {
  let bestGame = "";
  let bestSec = 0;
  
  for (const game in overallTotals) {
    if (overallTotals[game] > bestSec) {
      bestSec = overallTotals[game];
      bestGame = game;
    }
  }
  
  return { bestGame, bestSec };
}

/**
 * Find the dominant game for a day
 * @param {Object} statesObj - States object for a day
 * @returns {Object} Object with dominantGame and dominantSec properties
 */
export function findDominantGame(statesObj) {
  let dominantGame = "";
  let dominantSec = 0;
  
  for (const [game, secs] of Object.entries(statesObj)) {
    if (secs > dominantSec) {
      dominantSec = secs;
      dominantGame = game;
    }
  }
  
  return { dominantGame, dominantSec };
}

/**
 * Get color index based on activity level
 * @param {number} seconds - Seconds of activity
 * @param {number} maxValue - Maximum value for scaling
 * @returns {number} Color index (0-4)
 */
export function getColorIndex(seconds, maxValue) {
  if (maxValue <= 0 || seconds <= 0) return 0;
  
  const fraction = seconds / maxValue;
  if (fraction > 0.75) return 4;
  if (fraction > 0.5) return 3;
  if (fraction > 0.25) return 2;
  return 1;
} 