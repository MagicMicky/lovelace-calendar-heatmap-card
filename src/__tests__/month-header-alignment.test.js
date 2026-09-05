import { groupWeeksByMonth } from '../utils/date-utils.js';

/** Columns of 7 consecutive days, the way buildWeeksArray produces them. */
function buildWeeks(startMonday, weekCount) {
  const weeks = [];
  const cursor = new Date(startMonday);
  for (let w = 0; w < weekCount; w++) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      week.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
  }
  return weeks;
}

/** Column index at which each month's label is rendered. */
function labelColumns(weeks) {
  const cols = {};
  let col = 0;
  for (const group of groupWeeksByMonth(weeks)) {
    if (!(group.month in cols)) cols[group.month] = col;
    col += group.count;
  }
  return cols;
}

/** First column in which a month holds the majority of the days. */
function majorityColumns(weeks) {
  const cols = {};
  weeks.forEach((week, i) => {
    const days = week.filter(Boolean);
    const counts = new Map();
    days.forEach((d) => counts.set(d.getMonth(), (counts.get(d.getMonth()) || 0) + 1));
    let winner = null;
    let best = -1;
    days.forEach((d) => {
      const c = counts.get(d.getMonth());
      if (c > best) {
        best = c;
        winner = d.getMonth();
      }
    });
    if (winner !== null && !(winner in cols)) cols[winner] = i;
  });
  return cols;
}

describe('groupWeeksByMonth alignment', () => {
  // 2026-04-20 is a Monday. Covers May, July and August (none start on a
  // Monday) plus June (which does), and four straddling columns.
  const weeks = buildWeeks(new Date(2026, 3, 20), 20);

  it('labels each month at the first column that month predominantly occupies', () => {
    expect(labelColumns(weeks)).toEqual(majorityColumns(weeks));
  });

  it('does not hand a column to a month that owns only its tail', () => {
    // Mon 27 Jul - Sun 2 Aug is five July days and two August days, so the
    // column stays with July and August opens at the following column.
    const cols = labelColumns(weeks);
    expect(cols[6]).toBe(10); // July  -> col 10 (Mon 29 Jun, five July days)
    expect(cols[7]).toBe(15); // Aug   -> col 15 (Mon 3 Aug), not col 14
  });

  it('keeps a month that starts exactly on the week start day', () => {
    // 1 June 2026 is a Monday.
    expect(labelColumns(weeks)[5]).toBe(6);
  });

  it('ignores null placeholders in a partial trailing week', () => {
    const partial = buildWeeks(new Date(2026, 7, 31), 1);
    partial[0] = [...partial[0].slice(0, 3), null, null, null, null];
    // Aug 31 + Sep 1 + Sep 2 -> September holds the majority.
    expect(groupWeeksByMonth(partial)[0].month).toBe(8);
  });

  it('returns an empty list for an unusable weeks array', () => {
    expect(groupWeeksByMonth([])).toEqual([]);
    expect(groupWeeksByMonth([[null, null]])).toEqual([]);
  });
});
