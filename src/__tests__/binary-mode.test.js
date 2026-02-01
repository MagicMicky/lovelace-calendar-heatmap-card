import {
  processBinaryTotals,
  calculateBinaryStats,
} from '../data/data-processor.js';

describe('Binary Mode Functions', () => {
  describe('processBinaryTotals', () => {
    it('should return empty object for empty daily totals', () => {
      const result = processBinaryTotals({});
      expect(result).toEqual({});
    });

    it('should mark days with activity as true (without onState filter)', () => {
      const dailyTotals = {
        '2024-01-15': { on: 3600 },
        '2024-01-16': { off: 1800 },
        '2024-01-17': {},
      };

      const result = processBinaryTotals(dailyTotals);

      expect(result['2024-01-15']).toBe(true);
      expect(result['2024-01-16']).toBe(true);
      expect(result['2024-01-17']).toBe(false);
    });

    it('should filter by specific onState when provided', () => {
      const dailyTotals = {
        '2024-01-15': { on: 3600, off: 1800 },
        '2024-01-16': { off: 1800 },
        '2024-01-17': { ON: 900 }, // Test case-insensitivity
      };

      const result = processBinaryTotals(dailyTotals, 'on');

      expect(result['2024-01-15']).toBe(true);
      expect(result['2024-01-16']).toBe(false);
      expect(result['2024-01-17']).toBe(true); // Case-insensitive match
    });

    it('should be case-insensitive when matching onState', () => {
      const dailyTotals = {
        '2024-01-15': { Active: 3600 },
        '2024-01-16': { ACTIVE: 1800 },
        '2024-01-17': { active: 900 },
      };

      const result = processBinaryTotals(dailyTotals, 'ACTIVE');

      expect(result['2024-01-15']).toBe(true);
      expect(result['2024-01-16']).toBe(true);
      expect(result['2024-01-17']).toBe(true);
    });

    it('should handle days with no matching onState', () => {
      const dailyTotals = {
        '2024-01-15': { idle: 3600 },
        '2024-01-16': { sleeping: 1800 },
      };

      const result = processBinaryTotals(dailyTotals, 'on');

      expect(result['2024-01-15']).toBe(false);
      expect(result['2024-01-16']).toBe(false);
    });
  });

  describe('calculateBinaryStats', () => {
    it('should calculate correct stats for mixed activity', () => {
      const binaryTotals = {
        '2024-01-15': true,
        '2024-01-16': false,
        '2024-01-17': true,
        '2024-01-18': true,
        '2024-01-19': false,
      };

      const result = calculateBinaryStats(binaryTotals, 30);

      expect(result.activeDays).toBe(3);
      expect(result.totalDays).toBe(30);
      expect(result.percentage).toBe(10);
    });

    it('should handle all active days', () => {
      const binaryTotals = {
        '2024-01-15': true,
        '2024-01-16': true,
        '2024-01-17': true,
      };

      const result = calculateBinaryStats(binaryTotals, 3);

      expect(result.activeDays).toBe(3);
      expect(result.totalDays).toBe(3);
      expect(result.percentage).toBe(100);
    });

    it('should handle all inactive days', () => {
      const binaryTotals = {
        '2024-01-15': false,
        '2024-01-16': false,
      };

      const result = calculateBinaryStats(binaryTotals, 30);

      expect(result.activeDays).toBe(0);
      expect(result.totalDays).toBe(30);
      expect(result.percentage).toBe(0);
    });

    it('should handle empty binary totals', () => {
      const result = calculateBinaryStats({}, 30);

      expect(result.activeDays).toBe(0);
      expect(result.totalDays).toBe(30);
      expect(result.percentage).toBe(0);
    });

    it('should handle zero total days', () => {
      const result = calculateBinaryStats({}, 0);

      expect(result.activeDays).toBe(0);
      expect(result.totalDays).toBe(0);
      expect(result.percentage).toBe(0);
    });

    it('should round percentage to nearest integer', () => {
      const binaryTotals = {
        '2024-01-15': true,
      };

      const result = calculateBinaryStats(binaryTotals, 3);

      // 1/3 = 33.33...% should round to 33%
      expect(result.percentage).toBe(33);
    });
  });
});
