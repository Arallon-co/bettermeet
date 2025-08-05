import {
  detectUserTimezone,
  getUserTimezone,
  isValidTimezone,
  convertTimezone,
  convertTimeSlots,
  formatInTimezone,
  formatTimeForLocale,
  formatDateForLocale,
  getTimezoneOffsetString,
  getAllTimezones,
  getCommonTimezones,
  searchTimezones,
} from '../timezone';

describe('Timezone utilities', () => {
  describe('detectUserTimezone', () => {
    it('should return a valid timezone string', () => {
      const timezone = detectUserTimezone();
      expect(typeof timezone).toBe('string');
      expect(timezone.length).toBeGreaterThan(0);
      // Should be a valid timezone format
      expect(timezone).toMatch(/^[A-Za-z_]+\/[A-Za-z_]+$|^UTC$/);
    });
  });

  describe('getUserTimezone', () => {
    it('should return the same as detectUserTimezone', () => {
      const detected = detectUserTimezone();
      const user = getUserTimezone();
      expect(user).toBe(detected);
    });
  });

  describe('isValidTimezone', () => {
    it('should return true for valid timezones', () => {
      expect(isValidTimezone('UTC')).toBe(true);
      expect(isValidTimezone('America/New_York')).toBe(true);
      expect(isValidTimezone('Europe/London')).toBe(true);
    });

    it('should return false for invalid timezones', () => {
      expect(isValidTimezone('Invalid/Timezone')).toBe(false);
      expect(isValidTimezone('Not_A_Timezone')).toBe(false);
      expect(isValidTimezone('')).toBe(false);
    });
  });

  describe('convertTimezone', () => {
    it('should convert date between timezones', () => {
      const date = new Date('2024-01-01T12:00:00Z');
      const converted = convertTimezone(date, 'UTC', 'America/New_York');
      expect(converted).toBeInstanceOf(Date);
      // Should be different from original (unless same timezone)
      expect(converted.getTime()).not.toBe(date.getTime());
    });

    it('should handle string dates', () => {
      const dateString = '2024-01-01T12:00:00';
      const converted = convertTimezone(dateString, 'UTC', 'America/New_York');
      expect(converted).toBeInstanceOf(Date);
    });

    it('should return same time when converting to same timezone', () => {
      const date = new Date('2024-01-01T12:00:00Z');
      const converted = convertTimezone(date, 'UTC', 'UTC');
      expect(converted.getTime()).toBe(date.getTime());
    });
  });

  describe('convertTimeSlots', () => {
    it('should convert time slots between timezones', () => {
      const timeSlots = [
        { date: '2024-01-01', startTime: '09:00', endTime: '10:00' },
        { date: '2024-01-01', startTime: '14:00', endTime: '15:00' },
      ];

      const converted = convertTimeSlots(timeSlots, 'UTC', 'America/New_York');

      expect(converted).toHaveLength(2);
      expect(converted[0]).toHaveProperty('date');
      expect(converted[0]).toHaveProperty('startTime');
      expect(converted[0]).toHaveProperty('endTime');
      expect(converted[0]).toHaveProperty('originalDate', '2024-01-01');
    });

    it('should preserve structure when converting to same timezone', () => {
      const timeSlots = [
        { date: '2024-01-01', startTime: '09:00', endTime: '10:00' },
      ];

      const converted = convertTimeSlots(timeSlots, 'UTC', 'UTC');

      expect(converted[0].date).toBe('2024-01-01');
      expect(converted[0].startTime).toBe('09:00');
      expect(converted[0].endTime).toBe('10:00');
    });
  });

  describe('formatInTimezone', () => {
    it('should format date in specified timezone', () => {
      const date = new Date('2024-01-01T12:00:00Z');
      const formatted = formatInTimezone(date, 'UTC');
      expect(typeof formatted).toBe('string');
      expect(formatted).toContain('2024');
    });

    it('should handle string dates', () => {
      const dateString = '2024-01-01T12:00:00';
      const formatted = formatInTimezone(dateString, 'UTC', 'yyyy-MM-dd');
      expect(typeof formatted).toBe('string');
      expect(formatted).toContain('2024');
    });
  });

  describe('formatTimeForLocale', () => {
    it('should format time for different locales', () => {
      const date = new Date('2024-01-01T12:00:00Z');
      const formatted = formatTimeForLocale(date, 'UTC', 'en-US');
      expect(typeof formatted).toBe('string');
      // Should contain time-like format
      expect(formatted).toMatch(/\d/);
    });

    it('should handle custom options', () => {
      const date = new Date('2024-01-01T12:00:00Z');
      const formatted = formatTimeForLocale(date, 'UTC', 'en-US', {
        hour12: false,
      });
      expect(typeof formatted).toBe('string');
    });
  });

  describe('formatDateForLocale', () => {
    it('should format date for different locales', () => {
      const date = new Date('2024-01-01T12:00:00Z');
      const formatted = formatDateForLocale(date, 'UTC', 'en-US');
      expect(typeof formatted).toBe('string');
      // Should contain some date information
      expect(formatted.length).toBeGreaterThan(0);
    });
  });

  describe('getTimezoneOffsetString', () => {
    it('should return offset string for timezone', () => {
      const offset = getTimezoneOffsetString('UTC');
      expect(offset).toMatch(/^[+-]\d{2}:\d{2}$/);
    });

    it('should handle different timezones', () => {
      const offset = getTimezoneOffsetString('America/New_York');
      expect(offset).toMatch(/^[+-]\d{2}:\d{2}$/);
    });

    it('should fallback to +00:00 for invalid timezones', () => {
      const offset = getTimezoneOffsetString('Invalid/Timezone');
      expect(offset).toBe('+00:00');
    });
  });

  describe('getAllTimezones', () => {
    it('should return all available timezones', () => {
      const timezones = getAllTimezones();
      expect(Array.isArray(timezones)).toBe(true);
      expect(timezones.length).toBeGreaterThan(0);

      const timezone = timezones[0];
      expect(timezone).toHaveProperty('value');
      expect(timezone).toHaveProperty('label');
      expect(timezone).toHaveProperty('offset');
      expect(timezone).toHaveProperty('region');
    });

    it('should include UTC in all timezones', () => {
      const timezones = getAllTimezones();
      const utc = timezones.find((tz) => tz.value === 'UTC');
      expect(utc).toBeDefined();
    });
  });

  describe('getCommonTimezones', () => {
    it('should return common timezone objects', () => {
      const timezones = getCommonTimezones();
      expect(Array.isArray(timezones)).toBe(true);
      expect(timezones.length).toBeGreaterThan(0);

      const timezone = timezones[0];
      expect(timezone).toHaveProperty('value');
      expect(timezone).toHaveProperty('label');
      expect(timezone).toHaveProperty('offset');
      expect(timezone).toHaveProperty('region');
    });

    it('should include UTC in common timezones', () => {
      const timezones = getCommonTimezones();
      const utc = timezones.find((tz) => tz.value === 'UTC');
      expect(utc).toBeDefined();
    });

    it('should be a subset of all timezones', () => {
      const common = getCommonTimezones();
      const all = getAllTimezones();
      expect(common.length).toBeLessThanOrEqual(all.length);
    });
  });

  describe('searchTimezones', () => {
    it('should return common timezones for empty query', () => {
      const results = searchTimezones('');
      const common = getCommonTimezones();
      expect(results.length).toBeLessThanOrEqual(common.length);
    });

    it('should filter timezones by query', () => {
      const results = searchTimezones('America');
      expect(results.length).toBeGreaterThan(0);

      // All results should contain 'America' in some form
      results.forEach((tz) => {
        const searchText = `${tz.value} ${tz.label} ${tz.region}`.toLowerCase();
        expect(searchText).toContain('america');
      });
    });

    it('should limit results', () => {
      const results = searchTimezones('America', 3);
      expect(results.length).toBeLessThanOrEqual(3);
    });

    it('should be case insensitive', () => {
      const lowerResults = searchTimezones('america');
      const upperResults = searchTimezones('AMERICA');
      expect(lowerResults.length).toBe(upperResults.length);
    });
  });
});
