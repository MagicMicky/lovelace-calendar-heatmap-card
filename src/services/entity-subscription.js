/**
 * Entity Subscription Service
 * 
 * This module provides functions to subscribe to entity state changes
 * using Home Assistant's WebSocket API.
 */

/**
 * Subscribe to entity state changes
 * 
 * @param {Object} hass - Home Assistant instance
 * @param {string} entityId - Entity ID to subscribe to
 * @param {Function} callback - Callback function to call when entity state changes
 * @returns {Promise<Function>} Promise resolving to an unsubscribe function
 */
export async function subscribeToEntity(hass, entityId, callback) {
  // Validate inputs
  if (!hass || !hass.connection) {
    return () => {}; // Return empty unsubscribe function
  }
  
  if (!entityId || typeof entityId !== 'string') {
    return () => {}; // Return empty unsubscribe function
  }
  
  if (!callback || typeof callback !== 'function') {
    return () => {}; // Return empty unsubscribe function
  }
  
  try {
    // Subscribe to state changes for the specific entity
    const unsubscribe = await hass.connection.subscribeEvents(
      (event) => {
        // Check if this event is for our entity
        if (event.data && event.data.entity_id === entityId) {
          callback(event.data);
        }
      },
      'state_changed'
    );
    
    // Return the unsubscribe function
    return unsubscribe;
  } catch (error) {
    console.error('Calendar Heatmap: Error subscribing to entity', error);
    return () => {}; // Return empty unsubscribe function
  }
} 