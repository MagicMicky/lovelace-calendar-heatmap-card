/**
 * History Service
 * 
 * This module provides functions to interact with the Home Assistant history API.
 */

/**
 * Fetches historical state data for an entity from Home Assistant
 * 
 * @param {Object} hass - Home Assistant instance
 * @param {string} entityId - Entity ID to fetch history for
 * @param {number} daysToShow - Number of days of history to fetch
 * @returns {Promise<Array>} Promise resolving to history data array
 */
export async function fetchHistory(hass, entityId, daysToShow) {
  // Validate inputs
  if (!hass) {
    return [];
  }
  
  if (!entityId || typeof entityId !== 'string') {
    return [];
  }
  
  if (!daysToShow || daysToShow <= 0) {
    daysToShow = 30;
  }
  
  // Calculate date range
  const now = new Date();
  const start = new Date(now.getTime() - daysToShow * 24 * 60 * 60 * 1000);
  
  // Try WebSocket API first if available
  if (hass.callWS) {
    try {
      // Use the WebSocket API for better performance
      const history = await hass.callWS({
        type: 'history/history_during_period',
        entity_ids: [entityId],
        start_time: start.toISOString(),
        end_time: now.toISOString(),
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
      const startISOString = start.toISOString();
      const endISOString = now.toISOString();
      
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