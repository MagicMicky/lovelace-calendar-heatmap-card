/**
 * Fetch history data for an entity from Home Assistant
 * @param {Object} hass - Home Assistant instance
 * @param {string} entityId - Entity ID to fetch history for
 * @param {number} daysToShow - Number of days of history to fetch
 * @returns {Promise<Array>} Promise resolving to history data
 */
export async function fetchHistory(hass, entityId, daysToShow) {
  if (!hass) return [];
  
  const now = new Date();
  const start = new Date(
    now.getTime() - daysToShow * 24 * 60 * 60 * 1000
  );
  const startISOString = start.toISOString();
  const endISOString = now.toISOString();
  
  try {
    const history = await hass.callApi(
      "GET",
      `history/period/${startISOString}?filter_entity_id=${entityId}&end_time=${endISOString}`
    );
    return history;
  } catch (err) {
    console.error("Calendar Heatmap: Error fetching history data", err);
    return [];
  }
} 