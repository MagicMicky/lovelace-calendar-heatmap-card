/**
 * Get the start date for the heatmap (days_to_show days ago, adjusted to previous Sunday or Monday)
 * @param {number} daysToShow - Number of days to show in the heatmap
 * @param {string} startDayOfWeek - Day to start the week on ('monday' or 'sunday')
 * @returns {Date} The start date for the heatmap
 */
export function getHeatmapStartDate(daysToShow, startDayOfWeek = 'monday') {
  const now = new Date();
  let startDate = new Date(
    now.getTime() - daysToShow * 24 * 60 * 60 * 1000
  );
  
  // Adjust startDate to the previous start day of week
  const dayOfWeek = startDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  if (startDayOfWeek === 'monday') {
    // Adjust to previous Monday (if day is 0/Sunday, go back 6 days, if day is 1/Monday, go back 0 days)
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    startDate.setDate(startDate.getDate() - daysToSubtract);
  } else {
    // Adjust to previous Sunday
    startDate.setDate(startDate.getDate() - dayOfWeek);
  }
  
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

/**
 * Get localized day names based on the locale
 * @param {string} startDayOfWeek - Day to start the week on ('monday' or 'sunday')
 * @param {string} locale - Locale string (defaults to browser locale)
 * @returns {Array} Array of day names starting with the specified start day
 */
export function getLocalizedDayNames(startDayOfWeek = 'monday', locale = undefined) {
  const days = [];
  const date = new Date(2000, 0, 2); // Start with a Sunday (Jan 2, 2000)
  
  // If we start with Monday, we need to start with Jan 3, 2000
  if (startDayOfWeek === 'monday') {
    date.setDate(3);
  }
  
  // Get 7 days starting from our start day
  for (let i = 0; i < 7; i++) {
    days.push(date.toLocaleString(locale, { weekday: 'short' }));
    date.setDate(date.getDate() + 1);
  }
  
  return days;
} 