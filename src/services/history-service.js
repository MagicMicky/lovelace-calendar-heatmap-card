/**
 * History Service
 * 
 * This module provides functions to interact with the Home Assistant history API.
 */

/**
 * Safely converts a date to ISO string with validation
 * @param {Date} date - Date to convert
 * @returns {string} ISO string or fallback to current time if invalid
 */
function safeISOString(date) {
  try {
    // Check if date is valid
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      console.warn('Calendar Heatmap: Invalid date detected, using current time as fallback');
      return new Date().toISOString();
    }
    return date.toISOString();
  } catch (error) {
    console.warn('Calendar Heatmap: Error converting date to ISO string, using current time as fallback');
    return new Date().toISOString();
  }
}

/**
 * Fetches historical state data for an entity from Home Assistant
 * 
 * @param {Object} hass - Home Assistant instance
 * @param {string} entityId - Entity ID to fetch history for
 * @param {Date|number} startDate - Start date or days to show
 * @param {Date} endDate - End date (optional, defaults to now)
 * @returns {Promise<Array>} Promise resolving to history data array
 */
export async function fetchHistory(hass, entityId, startDate, endDate = new Date()) {
  // Validate inputs
  if (!hass) {
    console.warn('Calendar Heatmap: No hass instance provided');
    return [];
  }
  
  if (!entityId || typeof entityId !== 'string') {
    console.warn('Calendar Heatmap: Invalid entity ID');
    return [];
  }
  
  // Handle different types of startDate
  let start;
  if (startDate instanceof Date) {
    start = startDate;
  } else if (typeof startDate === 'number' && startDate > 0) {
    // If startDate is a number, treat it as days to show
    start = new Date();
    start.setDate(start.getDate() - startDate);
  } else {
    console.warn('Calendar Heatmap: Invalid start date, using 30 days as default');
    start = new Date();
    start.setDate(start.getDate() - 30);
  }
  
  // Ensure end date is valid
  if (!(endDate instanceof Date) || isNaN(endDate.getTime())) {
    console.warn('Calendar Heatmap: Invalid end date, using current time');
    endDate = new Date();
  }
  
  // Convert dates to ISO strings safely
  const startISOString = safeISOString(start);
  const endISOString = safeISOString(endDate);
  
  // Try WebSocket API first if available
  if (hass.callWS) {
    try {
      // Use the WebSocket API for better performance
      const history = await hass.callWS({
        type: 'history/history_during_period',
        entity_ids: [entityId],
        start_time: startISOString,
        end_time: endISOString,
        minimal_response: false,
        no_attributes: true,
        significant_changes_only: false,
      });
      
      // Check if we got a valid response
      if (history && history[entityId] && Array.isArray(history[entityId])) {
        // Format the response to match the expected format in the data processor
        return [history[entityId]];
      }
    } catch (error) {
      console.error('Calendar Heatmap: Error fetching history data via WebSocket', error);
    }
  }
  
  // Fallback to REST API
  if (hass.callApi) {
    try {
      // Build the API URL with proper encoding
      const encodedEntityId = encodeURIComponent(entityId);
      const encodedEndTime = encodeURIComponent(endISOString);
      const url = `history/period/${startISOString}?filter_entity_id=${encodedEntityId}&end_time=${encodedEndTime}`;
      
      // Make the API call
      const history = await hass.callApi('GET', url);
      
      // Validate response
      if (Array.isArray(history) && history.length > 0) {
        // Check if the first item is an array of state objects
        if (Array.isArray(history[0])) {
          return history;
        }
      }
    } catch (error) {
      console.error('Calendar Heatmap: Error fetching history data via REST API', error);
    }
  }
  
  // Return empty array if all methods fail
  return [];
} 