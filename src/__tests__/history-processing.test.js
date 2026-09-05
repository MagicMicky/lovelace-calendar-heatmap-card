import { processDailyTotals, processBinaryTotals } from '../data/data-processor.js';
import { toLocalDateKey } from '../utils/date-utils.js';

/** A compressed-format history entry at a local wall-clock time. */
const at = (state, y, m, d, hh = 0, mm = 0) => ({
  s: state,
  lu: new Date(y, m, d, hh, mm).getTime() / 1000,
});

const key = (y, m, d) => toLocalDateKey(new Date(y, m, d));
const HOUR = 3600;

describe('processDailyTotals day keys', () => {
  it('files a span under its local date, not its UTC date', () => {
    // 14:00 local. East of Greenwich this is still the same UTC day, but a
    // local midnight converted through toISOString() would land on the day
    // before - the bug this guards.
    const totals = processDailyTotals(
      [[at('Playing', 2026, 6, 8, 14), at('Idle', 2026, 6, 8, 16)]],
      [],
    );
    expect(totals[key(2026, 6, 8)].Playing).toBe(2 * HOUR);
    // Nothing leaks onto the neighbouring day, which is what a UTC-based key
    // would do east of Greenwich.
    expect(totals[key(2026, 6, 7)]).toBeUndefined();
  });

  it('splits a span that crosses local midnight across both days', () => {
    // 22:00 -> 02:00 the next day: 2h on the first day, 2h on the second.
    const totals = processDailyTotals(
      [[at('Playing', 2026, 6, 8, 22), at('Idle', 2026, 6, 9, 2)]],
      [],
    );
    expect(totals[key(2026, 6, 8)].Playing).toBe(2 * HOUR);
    expect(totals[key(2026, 6, 9)].Playing).toBe(2 * HOUR);
  });

  it('fills every day of a multi-day span instead of discarding it', () => {
    // Previously any span over 86400s was dropped entirely, leaving the days
    // it covered blank.
    const totals = processDailyTotals(
      [[at('On', 2026, 6, 6, 10), at('Off', 2026, 6, 9, 14)]],
      [],
    );
    // The trailing "Off" is the last entry, so it runs on to now; assert on
    // the "On" span itself rather than the full set of days present.
    expect(totals[key(2026, 6, 5)]).toBeUndefined();
    expect(totals[key(2026, 6, 6)].On).toBe(14 * HOUR); // 10:00 -> midnight
    expect(totals[key(2026, 6, 7)].On).toBe(24 * HOUR); // whole day
    expect(totals[key(2026, 6, 8)].On).toBe(24 * HOUR); // whole day
    expect(totals[key(2026, 6, 9)].On).toBe(14 * HOUR); // midnight -> 14:00
    expect(totals[key(2026, 6, 10)].On).toBeUndefined(); // span has ended
  });

  it('conserves total time across the days it splits into', () => {
    const start = new Date(2026, 6, 6, 10);
    const end = new Date(2026, 6, 9, 14);
    const totals = processDailyTotals(
      [[{ s: 'On', lu: start.getTime() / 1000 }, { s: 'Off', lu: end.getTime() / 1000 }]],
      [],
    );
    const summed = Object.values(totals).reduce(
      (acc, day) => acc + (day.On || 0),
      0,
    );
    expect(summed).toBe((end - start) / 1000);
  });
});

describe('the final history entry', () => {
  it('runs the last known state up to now', () => {
    const now = new Date();
    const twoHoursAgo = new Date(now.getTime() - 2 * HOUR * 1000);
    const totals = processDailyTotals(
      [[{ s: 'Playing', lu: twoHoursAgo.getTime() / 1000 }]],
      [],
    );
    // Today must be represented; previously the last entry was never processed.
    expect(totals[toLocalDateKey(now)]).toBeDefined();
    expect(totals[toLocalDateKey(now)].Playing).toBeGreaterThan(0);
  });

  it('marks today active when the state has held for over a day', () => {
    // The old 86400s cap meant a state unchanged for >24h produced nothing.
    const now = new Date();
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * HOUR * 1000);
    const totals = processDailyTotals(
      [[{ s: 'On', lu: threeDaysAgo.getTime() / 1000 }]],
      [],
    );
    const binary = processBinaryTotals(totals, 'On');
    expect(binary[toLocalDateKey(now)]).toBe(true);
  });
});

describe('zero-length slivers', () => {
  it('does not create a day for a span ending exactly at midnight', () => {
    const totals = processDailyTotals(
      [[
        at('On', 2026, 6, 6, 20),
        at('Off', 2026, 6, 7, 0), // exactly local midnight
        at('Off', 2026, 6, 7, 6),
      ]],
      [],
    );
    // 7 July must not carry a zero-second "On" entry...
    expect(totals[key(2026, 6, 7)].On).toBeUndefined();
    // ...because binary mode would otherwise count it as an active day.
    expect(processBinaryTotals(totals, 'On')[key(2026, 6, 7)]).toBe(false);
    expect(processBinaryTotals(totals, 'On')[key(2026, 6, 6)]).toBe(true);
  });
});

describe('existing guarantees still hold', () => {
  it('skips ignored states', () => {
    const totals = processDailyTotals(
      [[at('unknown', 2026, 6, 8, 10), at('Playing', 2026, 6, 8, 12), at('Idle', 2026, 6, 8, 13)]],
      ['unknown'],
    );
    expect(totals[key(2026, 6, 8)].unknown).toBeUndefined();
    expect(totals[key(2026, 6, 8)].Playing).toBe(HOUR);
  });

  it('skips entries that go backwards in time', () => {
    const totals = processDailyTotals(
      [[at('A', 2026, 6, 8, 12), at('B', 2026, 6, 8, 10), at('C', 2026, 6, 8, 14)]],
      [],
    );
    expect(totals[key(2026, 6, 8)].A).toBeUndefined();
  });

  it('returns an empty object for unusable input', () => {
    expect(processDailyTotals(null, [])).toEqual({});
    expect(processDailyTotals([], [])).toEqual({});
  });
});
