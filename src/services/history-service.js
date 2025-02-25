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
    console.warn('Calendar Heatmap: Invalid Home Assistant instance');
    return [];
  }
  
  if (!entityId || typeof entityId !== 'string') {
    console.warn('Calendar Heatmap: Invalid entity ID');
    return [];
  }
  
  if (!daysToShow || daysToShow <= 0) {
    console.warn('Calendar Heatmap: Invalid days to show, using default of 30 days');
    daysToShow = 30;
  }
  
  console.log('Calendar Heatmap: Fetching history for', entityId, 'for', daysToShow, 'days');
  
  // Calculate date range
  const now = new Date();
  const start = new Date(now.getTime() - daysToShow * 24 * 60 * 60 * 1000);
  
  // Try WebSocket API first if available
  if (hass.callWS) {
    try {
      console.log('Calendar Heatmap: Using WebSocket API');
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
      
      console.log('Calendar Heatmap: WebSocket response', history);
      
      // Check if we got a valid response
      if (history && history[entityId] && Array.isArray(history[entityId])) {
        console.log('Calendar Heatmap: Valid WebSocket response with', history[entityId].length, 'entries');
        
        // Check if we need to convert the compressed format
        const firstEntry = history[entityId][0];
        if (firstEntry && (firstEntry.s !== undefined || firstEntry.lu !== undefined)) {
          console.log('Calendar Heatmap: Detected compressed history format, using as is');
        }
        
        // Format the response to match the expected format in the data processor
        return [history[entityId]];
      } else {
        console.warn('Calendar Heatmap: Unexpected WebSocket response format, falling back to REST API');
      }
    } catch (error) {
      console.error('Calendar Heatmap: Error fetching history data via WebSocket', error);
    }
  }
  
  // Fallback to REST API
  if (hass.callApi) {
    try {
      console.log('Calendar Heatmap: Using REST API');
      const startISOString = start.toISOString();
      const endISOString = now.toISOString();
      
      // Build the API URL with proper encoding
      const encodedEntityId = encodeURIComponent(entityId);
      const encodedEndTime = encodeURIComponent(endISOString);
      const url = `history/period/${startISOString}?filter_entity_id=${encodedEntityId}&end_time=${encodedEndTime}`;
      
      // Make the API call
      const history = await hass.callApi('GET', url);
      
      console.log('Calendar Heatmap: REST API response', history);
      
      // Validate response
      if (Array.isArray(history) && history.length > 0) {
        // Check if the first item is an array of state objects
        if (Array.isArray(history[0])) {
          console.log('Calendar Heatmap: Valid REST API response with', history[0].length, 'entries');
          return history;
        } else {
          console.warn('Calendar Heatmap: Unexpected REST API response format');
        }
      } else {
        console.warn('Calendar Heatmap: Empty or invalid history response');
      }
    } catch (error) {
      console.error('Calendar Heatmap: Error fetching history data via REST API', error);
    }
  } else {
    console.warn('Calendar Heatmap: No API methods available on hass object');
  }
  
  console.warn('Calendar Heatmap: Failed to fetch history data');
  // Return empty array if all methods fail
  return [];
} 