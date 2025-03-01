/**
 * Validates a date object
 * @param {Date} date - Date to validate
 * @returns {boolean} True if date is valid, false otherwise
 */
export function isValidDate(date) {
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Creates a safe date object with validation
 * @param {Date|string|number} input - Input to convert to date
 * @param {Date} fallback - Fallback date if input is invalid (defaults to current date)
 * @returns {Date} Valid date object
 */
export function createSafeDate(input, fallback = new Date()) {
  try {
    if (input instanceof Date) {
      return isValidDate(input) ? input : fallback;
    }

    if (typeof input === "string" || typeof input === "number") {
      const date = new Date(input);
      return isValidDate(date) ? date : fallback;
    }

    return fallback;
  } catch (error) {
    console.warn(
      "Calendar Heatmap: Error creating date, using fallback",
      error,
    );
    return fallback;
  }
}

/**
 * Calculate the maximum number of weeks that can fit in the available space
 * @param {number} availableWidth - Available width in pixels
 * @param {number} weekColWidth - Width of a week column in pixels
 * @returns {number} Maximum number of weeks that can fit
 */
export function calculateMaxWeeks(availableWidth, weekColWidth) {
  if (
    !availableWidth ||
    availableWidth <= 0 ||
    !weekColWidth ||
    weekColWidth <= 0
  ) {
    // Default to 52 weeks (1 year) if we can't calculate
    return 52;
  }

  // Calculate max weeks that can fit in the available space
  // Subtract some padding to ensure we don't overflow
  const maxWeeks = Math.floor((availableWidth - 30) / weekColWidth);

  // Ensure we show at least 4 weeks and at most 52 weeks (1 year)
  return Math.max(4, Math.min(52, maxWeeks));
}

/**
 * Get the start date for the heatmap based on the maximum number of weeks that can fit
 * @param {number} maxWeeks - Maximum number of weeks to show
 * @param {string} startDayOfWeek - Day to start the week on ('monday' or 'sunday')
 * @returns {Date} The start date for the heatmap
 */
export function getHeatmapStartDate(maxWeeks = 52, startDayOfWeek = "monday") {
  // Create a safe now date
  const now = new Date();

  // Calculate days to show based on maxWeeks
  const daysToShow = maxWeeks * 7;

  // Calculate start date
  let startDate = new Date(now);
  startDate.setDate(now.getDate() - daysToShow);

  // Validate the calculated date
  if (!isValidDate(startDate)) {
    console.warn(
      "Calendar Heatmap: Invalid start date calculated, using 30 days ago",
    );
    startDate = new Date(now);
    startDate.setDate(now.getDate() - 30);
  }

  // Adjust startDate to the previous start day of week
  const dayOfWeek = startDate.getDay(); // 0 = Sunday, 1 = Monday, etc.

  if (startDayOfWeek === "monday") {
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
  // Validate input
  if (!isValidDate(startDate)) {
    console.warn("Calendar Heatmap: Invalid start date, using 30 days ago");
    startDate = getHeatmapStartDate(30);
  }

  const now = new Date();
  const weeks = [];
  const currentDate = new Date(startDate);

  // Safety check to prevent infinite loops
  const maxWeeks = 53; // Maximum of one year plus one week
  let weekCount = 0;

  while (currentDate <= now && weekCount < maxWeeks) {
    const week = [];

    for (let d = 0; d < 7; d++) {
      if (currentDate <= now) {
        week.push(new Date(currentDate));
      } else {
        // Add empty placeholder for future dates to maintain grid alignment
        week.push(null);
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Only add the week if it has at least one valid day
    if (week.some((day) => day !== null)) {
      weeks.push(week);
      weekCount++;
    }

    // If we've gone past today, break the loop
    if (currentDate > now) {
      break;
    }
  }

  return weeks;
}

/**
 * Group weeks by month for the month header
 * @param {Array} weeks - Array of weeks
 * @returns {Array} Array of month groups with month, monthName, and count properties
 */
export function groupWeeksByMonth(weeks) {
  // Validate input
  if (!Array.isArray(weeks) || weeks.length === 0) {
    console.warn("Calendar Heatmap: Invalid weeks array");
    return [];
  }

  let groups = [];
  let currentGroup = null;

  weeks.forEach((week) => {
    // Skip empty weeks
    if (!Array.isArray(week) || week.length === 0) {
      return;
    }

    // Use the first day of the week
    const firstDay = week[0];

    // Validate the date
    if (!isValidDate(firstDay)) {
      return;
    }

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
export function getLocalizedDayNames(
  startDayOfWeek = "monday",
  locale = undefined,
) {
  const days = [];
  const date = new Date(2000, 0, 2); // Start with a Sunday (Jan 2, 2000)

  // If we start with Monday, we need to start with Jan 3, 2000
  if (startDayOfWeek === "monday") {
    date.setDate(3);
  }

  // Get 7 days starting from our start day
  for (let i = 0; i < 7; i++) {
    days.push(date.toLocaleString(locale, { weekday: "short" }));
    date.setDate(date.getDate() + 1);
  }

  return days;
}
