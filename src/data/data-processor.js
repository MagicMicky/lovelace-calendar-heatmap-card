import { getGameColor } from '../utils/color-utils.js';
import { isValidDate } from '../utils/date-utils.js';

/**
 * Process history data into daily totals
 * @param {Array} historyData - History data from Home Assistant
 * @param {Array} ignoredStates - States to ignore
 * @returns {Object} Object with daily totals by state
 */
export function processDailyTotals(historyData, ignoredStates) {
  let dailyTotals = {};
  let skippedEntries = 0;
  let processedEntries = 0;
  
  // Validate input
  if (!Array.isArray(historyData) || historyData.length === 0 || !Array.isArray(historyData[0])) {
    console.warn('Calendar Heatmap: Invalid history data format');
    return dailyTotals;
  }
  
  // Ensure ignoredStates is an array
  if (!Array.isArray(ignoredStates)) {
    ignoredStates = [];
  }
  
  try {
    const entityHistory = historyData[0];
    
    for (let i = 0; i < entityHistory.length - 1; i++) {
      const current = entityHistory[i];
      const next = entityHistory[i + 1];
      
      // Skip if either entry is missing
      if (!current || !next) {
        skippedEntries++;
        continue;
      }
      
      // Handle both standard and compressed formats
      // Compressed format uses 's' for state, 'lu' for last_updated/last_changed
      const currentState = current?.state || current?.s;
      
      // Get timestamps, handling both formats
      let currentTimestamp, nextTimestamp;
      
      try {
        if (current.last_changed) {
          currentTimestamp = new Date(current.last_changed);
        } else if (current.lu) {
          currentTimestamp = new Date(current.lu * 1000);
        } else {
          // Skip if no timestamp
          skippedEntries++;
          continue;
        }
        
        if (next.last_changed) {
          nextTimestamp = new Date(next.last_changed);
        } else if (next.lu) {
          nextTimestamp = new Date(next.lu * 1000);
        } else {
          // Skip if no timestamp
          skippedEntries++;
          continue;
        }
      } catch (error) {
        console.warn('Calendar Heatmap: Error parsing timestamps', error);
        skippedEntries++;
        continue;
      }
      
      // Validate dates
      if (!isValidDate(currentTimestamp) || !isValidDate(nextTimestamp)) {
        skippedEntries++;
        continue;
      }
      
      // Skip entries with missing required properties
      if (!currentState) {
        skippedEntries++;
        continue;
      }
      
      const stateLower = currentState.toLowerCase();
      
      // Log the first few entries to understand the data format
      if (i < 5) {
        console.log('Calendar Heatmap: Entry', i, 'state:', currentState, 'timestamp:', currentTimestamp);
      }
      
      // Skip ignored states
      if (ignoredStates.includes(stateLower)) {
        skippedEntries++;
        continue;
      }
      
      // Calculate time difference
      const diffSeconds = (nextTimestamp - currentTimestamp) / 1000;
      
      // Skip negative or extremely large time differences (more than a day)
      if (diffSeconds <= 0 || diffSeconds > 86400) {
        skippedEntries++;
        continue;
      }
      
      // Get the date string (YYYY-MM-DD)
      const dayStr = currentTimestamp.toISOString().split("T")[0];
      
      // Initialize the day if needed
      if (!dailyTotals[dayStr]) {
        dailyTotals[dayStr] = {};
      }
      
      // Add the seconds to the state's total
      dailyTotals[dayStr][currentState] =
        (dailyTotals[dayStr][currentState] || 0) + diffSeconds;
      
      processedEntries++;
    }
    
    // Log processing summary
    console.log(`Calendar Heatmap: Processed ${processedEntries} entries, skipped ${skippedEntries} entries`);
    
  } catch (error) {
    console.error('Calendar Heatmap: Error processing history data', error);
  }
  
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
 * Build a mapping of games/states to colors
 * @param {Array} states - Array of unique state names
 * @returns {Object} Map of state names to colors
 */
export function buildGameColorMap(states) {
  // Create a Set to ensure uniqueness
  const uniqueStates = new Set(states);
  
  // Create color mapping
  const gameColorMap = {};
  Array.from(uniqueStates).forEach(state => {
    gameColorMap[state] = getGameColor(state);
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