import { parseISO, format } from 'date-fns';
import {
  fromZonedTime,
  toZonedTime,
  formatInTimeZone,
  getTimezoneOffset,
} from 'date-fns-tz';
import { Locale } from 'node_modules/next/dist/compiled/@vercel/og/satori';

export interface TimezoneOption {
  value: string;
  label: string;
  offset: string;
  region: string;
}

/**
 * Detect the user's current timezone using browser APIs
 * Falls back to UTC if detection fails
 */
export function detectUserTimezone(): string {
  try {
    // Primary method: Intl.DateTimeFormat
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (timezone && isValidTimezone(timezone)) {
      return timezone;
    }
  } catch (error) {
    console.warn('Failed to detect timezone using Intl.DateTimeFormat:', error);
  }

  try {
    // Fallback method: Date.getTimezoneOffset
    const offset = new Date().getTimezoneOffset();
    const timezone = getTimezoneFromOffset(offset);
    if (timezone) {
      return timezone;
    }
  } catch (error) {
    console.warn('Failed to detect timezone using offset:', error);
  }

  // Final fallback
  return 'UTC';
}

/**
 * Legacy function for backward compatibility
 */
export function getUserTimezone(): string {
  return detectUserTimezone();
}

/**
 * Validate if a timezone string is valid
 */
export function isValidTimezone(timezone: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return true;
  } catch {
    return false;
  }
}

/**
 * Get timezone from UTC offset (in minutes)
 */
function getTimezoneFromOffset(offsetMinutes: number): string | null {
  const offsetHours = -offsetMinutes / 60;
  const offsetMap: Record<string, string> = {
    '-12': 'Pacific/Kwajalein',
    '-11': 'Pacific/Midway',
    '-10': 'Pacific/Honolulu',
    '-9': 'America/Anchorage',
    '-8': 'America/Los_Angeles',
    '-7': 'America/Denver',
    '-6': 'America/Chicago',
    '-5': 'America/New_York',
    '-4': 'America/Halifax',
    '-3': 'America/Sao_Paulo',
    '-2': 'Atlantic/South_Georgia',
    '-1': 'Atlantic/Azores',
    '0': 'Europe/London',
    '1': 'Europe/Paris',
    '2': 'Europe/Berlin',
    '3': 'Europe/Moscow',
    '4': 'Asia/Dubai',
    '5': 'Asia/Karachi',
    '6': 'Asia/Dhaka',
    '7': 'Asia/Bangkok',
    '8': 'Asia/Shanghai',
    '9': 'Asia/Tokyo',
    '10': 'Australia/Sydney',
    '11': 'Pacific/Norfolk',
    '12': 'Pacific/Fiji',
  };

  const key = offsetHours.toString();
  return offsetMap[key] || null;
}

/**
 * Convert a date from one timezone to another
 */
export function convertTimezone(
  date: Date | string,
  fromTimezone: string,
  toTimezone: string
): Date {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const utcDate = fromZonedTime(dateObj, fromTimezone);
  return toZonedTime(utcDate, toTimezone);
}

/**
 * Convert time slots from organizer timezone to participant timezone
 */
export function convertTimeSlots(
  timeSlots: Array<{ date: string; startTime: string; endTime: string }>,
  fromTimezone: string,
  toTimezone: string
): Array<{
  date: string;
  startTime: string;
  endTime: string;
  originalDate?: string;
}> {
  if (fromTimezone === toTimezone) {
    return timeSlots.map((slot) => ({ ...slot, originalDate: slot.date }));
  }

  return timeSlots.map((slot) => {
    try {
      const startDateTime = parseISO(`${slot.date}T${slot.startTime}:00`);
      const endDateTime = parseISO(`${slot.date}T${slot.endTime}:00`);

      const convertedStart = convertTimezone(
        startDateTime,
        fromTimezone,
        toTimezone
      );
      const convertedEnd = convertTimezone(
        endDateTime,
        fromTimezone,
        toTimezone
      );

      return {
        date: format(convertedStart, 'yyyy-MM-dd'),
        startTime: format(convertedStart, 'HH:mm'),
        endTime: format(convertedEnd, 'HH:mm'),
        originalDate: slot.date,
      };
    } catch (error) {
      console.error(
        `Error converting time slot ${slot.date} ${slot.startTime}:`,
        error
      );
      // Return original slot if conversion fails
      return {
        ...slot,
        originalDate: slot.date,
      };
    }
  });
}

/**
 * Generate business hours time slots (9am-5pm) for given dates in a specific timezone
 */
export function generateBusinessHoursTimeSlots(
  dates: string[],
  timezone: string
): Array<{ date: string; startTime: string; endTime: string }> {
  const businessHours = [
    '09:00',
    '09:30',
    '10:00',
    '10:30',
    '11:00',
    '11:30',
    '12:00',
    '12:30',
    '13:00',
    '13:30',
    '14:00',
    '14:30',
    '15:00',
    '15:30',
    '16:00',
    '16:30',
    '17:00',
  ];

  const timeSlots: Array<{ date: string; startTime: string; endTime: string }> =
    [];

  dates.forEach((date) => {
    businessHours.forEach((startTime) => {
      // Calculate end time (30 minutes later)
      const startDateTime = parseISO(`${date}T${startTime}:00`);
      const endDateTime = new Date(startDateTime.getTime() + 30 * 60000);
      const endTime = format(endDateTime, 'HH:mm');

      timeSlots.push({
        date,
        startTime,
        endTime,
      });
    });
  });

  return timeSlots;
}

/**
 * Convert business hours from one timezone to another, filtering to keep only 9am-5pm slots in target timezone
 */
export function convertBusinessHoursTimeSlots(
  timeSlots: Array<{ date: string; startTime: string; endTime: string }>,
  fromTimezone: string,
  toTimezone: string
): Array<{
  date: string;
  startTime: string;
  endTime: string;
  originalDate?: string;
}> {
  const converted = convertTimeSlots(timeSlots, fromTimezone, toTimezone);

  // Filter to only include slots that fall within business hours (9am-5pm) in the target timezone
  const filtered = converted.filter((slot) => {
    const startHour = parseInt(slot.startTime.split(':')[0]);
    const startMinute = parseInt(slot.startTime.split(':')[1]);
    const startTimeInMinutes = startHour * 60 + startMinute;

    // Business hours: 9:00 AM (540 minutes) to 5:00 PM (1020 minutes)
    return startTimeInMinutes >= 540 && startTimeInMinutes <= 1020;
  });

  // If no slots remain after filtering, generate new business hours for the converted dates
  if (filtered.length === 0 && converted.length > 0) {
    // Get unique dates from converted slots
    const uniqueDates = Array.from(
      new Set(converted.map((slot) => slot.date))
    ).sort();

    // Generate business hours for these dates
    return generateBusinessHoursTimeSlots(uniqueDates, toTimezone);
  }

  return filtered;
}

/**
 * Format a date in a specific timezone with locale support
 */
export function formatInTimezone(
  date: Date | string,
  timezone: string,
  formatString: string = 'yyyy-MM-dd HH:mm:ss zzz'
): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return formatInTimeZone(dateObj, timezone, formatString);
}

/**
 * Format time for display in different locales
 */
export function formatTimeForLocale(
  date: Date | string,
  timezone: string,
  locale: string = 'en-US',
  options: Intl.DateTimeFormatOptions = {}
): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const convertedDate = toZonedTime(dateObj, timezone);

  const defaultOptions: Intl.DateTimeFormatOptions = {
    timeZone: timezone,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    ...options,
  };

  return new Intl.DateTimeFormat(locale, defaultOptions).format(convertedDate);
}

/**
 * Format date for display in different locales
 */
export function formatDateForLocale(
  date: Date | string,
  timezone: string,
  locale: string = 'en-US',
  options: Intl.DateTimeFormatOptions = {}
): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const convertedDate = toZonedTime(dateObj, timezone);

  const defaultOptions: Intl.DateTimeFormatOptions = {
    timeZone: timezone,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    ...options,
  };

  return new Intl.DateTimeFormat(locale, defaultOptions).format(convertedDate);
}

/**
 * Get timezone offset string (e.g., "+05:30", "-08:00")
 */
export function getTimezoneOffsetString(
  timezone: string,
  date: Date = new Date()
): string {
  try {
    // getTimezoneOffset returns milliseconds, convert to minutes
    const offsetMilliseconds = getTimezoneOffset(timezone, date);
    const offsetMinutes = offsetMilliseconds / (1000 * 60);

    // Handle invalid offset values
    if (!Number.isFinite(offsetMinutes)) {
      return '+00:00';
    }

    const hours = Math.floor(Math.abs(offsetMinutes) / 60);
    const minutes = Math.abs(offsetMinutes) % 60;
    const sign = offsetMinutes <= 0 ? '+' : '-';

    // Ensure hours and minutes are valid numbers
    if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
      return '+00:00';
    }

    return `${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  } catch (error) {
    console.warn('Failed to get timezone offset:', error);
    return '+00:00';
  }
}

/**
 * Get comprehensive list of all available timezones with search support
 */
export function getAllTimezones(): TimezoneOption[] {
  const now = new Date();

  try {
    // Get all available timezones from Intl (if supported)
    let timezones: string[] = [];

    if (
      'supportedValuesOf' in Intl &&
      typeof (Intl as any).supportedValuesOf === 'function'
    ) {
      timezones = (Intl as any).supportedValuesOf('timeZone');
    } else {
      // Fallback to common timezones if supportedValuesOf is not available
      timezones = [
        'UTC',
        'America/New_York',
        'America/Chicago',
        'America/Denver',
        'America/Los_Angeles',
        'Europe/London',
        'Europe/Paris',
        'Europe/Berlin',
        'Asia/Tokyo',
        'Asia/Shanghai',
        'Australia/Sydney',
      ];
    }

    // Add UTC if it's not in the list
    if (!timezones.includes('UTC')) {
      timezones = ['UTC', ...timezones];
    }

    return timezones
      .map((timezone) => {
        const offset = getTimezoneOffsetString(timezone, now);
        const parts = timezone.split('/');
        const region = parts[0];
        const city = parts[parts.length - 1]?.replace(/_/g, ' ') || timezone;

        // Create a readable label
        let label = city;
        if (parts.length > 2) {
          label = `${parts[1].replace(/_/g, ' ')} - ${city}`;
        }

        return {
          value: timezone,
          label: `${label} (${offset})`,
          offset,
          region,
        };
      })
      .sort((a, b) => {
        // Sort by offset first, then by label
        if (a.offset !== b.offset) {
          return a.offset.localeCompare(b.offset);
        }
        return a.label.localeCompare(b.label);
      });
  } catch (error) {
    console.warn(
      'Failed to get all timezones, falling back to common timezones:',
      error
    );
    // Fallback to a basic list if Intl.supportedValuesOf is not available
    const fallbackTimezones = [
      'UTC',
      'America/New_York',
      'America/Chicago',
      'America/Denver',
      'America/Los_Angeles',
      'Europe/London',
      'Europe/Paris',
      'Asia/Tokyo',
      'Asia/Shanghai',
      'Australia/Sydney',
    ];

    return fallbackTimezones.map((timezone) => {
      const offset = getTimezoneOffsetString(timezone, now);
      const parts = timezone.split('/');
      const region = parts[0];
      const city = parts[parts.length - 1]?.replace(/_/g, ' ') || timezone;

      return {
        value: timezone,
        label: `${city} (${offset})`,
        offset,
        region,
      };
    });
  }
}

/**
 * Get a list of common timezones with enhanced information
 */
export function getCommonTimezones(): TimezoneOption[] {
  const commonTimezoneIds = [
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'America/Toronto',
    'America/Vancouver',
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Europe/Rome',
    'Europe/Madrid',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Asia/Kolkata',
    'Asia/Dubai',
    'Australia/Sydney',
    'Australia/Melbourne',
    'Pacific/Auckland',
    'UTC',
  ];

  const allTimezones = getAllTimezones();
  return commonTimezoneIds
    .map((id) => allTimezones.find((tz) => tz.value === id))
    .filter((tz): tz is TimezoneOption => tz !== undefined);
}

/**
 * Search timezones by name, city, or region
 */
export function searchTimezones(
  query: string,
  limit: number = 10
): TimezoneOption[] {
  if (!query.trim()) {
    return getCommonTimezones().slice(0, limit);
  }

  const searchTerm = query.toLowerCase();
  const allTimezones = getAllTimezones();

  const matches = allTimezones.filter(
    (timezone) =>
      timezone.label.toLowerCase().includes(searchTerm) ||
      timezone.value.toLowerCase().includes(searchTerm) ||
      timezone.region.toLowerCase().includes(searchTerm)
  );

  return matches.slice(0, limit);
}
