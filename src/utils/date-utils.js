/**
 * Get the start date for the heatmap (days_to_show days ago, adjusted to previous Sunday)
 * @param {number} daysToShow - Number of days to show in the heatmap
 * @returns {Date} The start date for the heatmap
 */
export function getHeatmapStartDate(daysToShow) {
  const now = new Date();
  let startDate = new Date(
    now.getTime() - daysToShow * 24 * 60 * 60 * 1000
  );
  
  // Adjust startDate to the previous Sunday
  const dayOfWeek = startDate.getDay();
  startDate.setDate(startDate.getDate() - dayOfWeek);
  
  return startDate;
}

/**
 * Build weeks array from start date to today
 * @param {Date} startDate - The start date for the heatmap
 * @returns {Array} Array of weeks, each containing an array of days
 */
export function buildWeeksArray(startDate) {
  const now = new Date();
  const weeks = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= now) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      if (currentDate <= now) {
        week.push(new Date(currentDate));
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    weeks.push(week);
  }
  
  return weeks;
}

/**
 * Group weeks by month for the month header
 * @param {Array} weeks - Array of weeks
 * @returns {Array} Array of month groups with month, monthName, and count properties
 */
export function groupWeeksByMonth(weeks) {
  let groups = [];
  let currentGroup = null;
  
  weeks.forEach((week) => {
    // Use the first day of the week
    const firstDay = week[0];
    const month = firstDay.getMonth();
    const monthName = firstDay.toLocaleString("default", { month: "short" });
    
    if (!currentGroup) {
      currentGroup = { month, monthName, count: 1 };
    } else if (currentGroup.month === month) {
      currentGroup.count++;
    } else {
      groups.push(currentGroup);
      currentGroup = { month, monthName, count: 1 };
    }
  });
  
  if (currentGroup) {
    groups.push(currentGroup);
  }
  
  return groups;
} 