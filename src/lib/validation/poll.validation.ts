import { z } from 'zod';
import { isValid, parseISO, isFuture } from 'date-fns';

// Timezone validation - basic check for valid timezone format
const timezoneSchema = z.string().refine(
  (tz) => {
    try {
      Intl.DateTimeFormat(undefined, { timeZone: tz });
      return true;
    } catch {
      return false;
    }
  },
  { message: 'Invalid timezone' }
);

// Time format validation (HH:MM)
const timeSchema = z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
  message: 'Time must be in HH:MM format',
});

// Date validation
const dateSchema = z.string().refine(
  (date) => {
    const parsed = parseISO(date);
    return isValid(parsed);
  },
  { message: 'Invalid date format' }
);

// Future date validation
const futureDateSchema = z.string().refine(
  (date) => {
    const parsed = parseISO(date);
    return isValid(parsed) && isFuture(parsed);
  },
  { message: 'Date must be in the future' }
);

// Time slot validation
const timeSlotSchema = z
  .object({
    date: dateSchema,
    startTime: timeSchema,
    endTime: timeSchema,
  })
  .refine(
    (data) => {
      const [startHour, startMin] = data.startTime.split(':').map(Number);
      const [endHour, endMin] = data.endTime.split(':').map(Number);
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;
      return endMinutes > startMinutes;
    },
    {
      message: 'End time must be after start time',
      path: ['endTime'],
    }
  );

// Poll creation validation
export const createPollSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(255, 'Title must be less than 255 characters')
    .trim(),
  description: z
    .string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional()
    .nullable(),
  organizerTimezone: timezoneSchema,
  dates: z
    .array(futureDateSchema)
    .min(1, 'At least one date is required')
    .max(30, 'Maximum 30 dates allowed'),
  timeSlots: z
    .array(timeSlotSchema)
    .min(1, 'At least one time slot is required')
    .max(100, 'Maximum 100 time slots allowed'),
});

// Poll update validation
export const updatePollSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(255, 'Title must be less than 255 characters')
    .trim()
    .optional(),
  description: z
    .string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional()
    .nullable(),
});

// Participant response validation
export const submitResponseSchema = z.object({
  participantName: z
    .string()
    .min(1, 'Name is required')
    .max(255, 'Name must be less than 255 characters')
    .trim(),
  participantEmail: z
    .string()
    .email('Invalid email format')
    .max(255, 'Email must be less than 255 characters')
    .optional()
    .nullable(),
  participantTimezone: timezoneSchema,
  availability: z
    .array(
      z.object({
        timeSlotId: z.string().cuid('Invalid time slot ID'),
        isAvailable: z.boolean(),
      })
    )
    .min(1, 'At least one availability response is required'),
});

// Participant update validation
export const updateParticipantSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(255, 'Name must be less than 255 characters')
    .trim()
    .optional(),
  email: z
    .string()
    .email('Invalid email format')
    .max(255, 'Email must be less than 255 characters')
    .optional()
    .nullable(),
  timezone: timezoneSchema.optional(),
});

// Availability update validation
export const updateAvailabilitySchema = z.object({
  availability: z
    .array(
      z.object({
        timeSlotId: z.string().cuid('Invalid time slot ID'),
        isAvailable: z.boolean(),
      })
    )
    .min(1, 'At least one availability response is required'),
});

// ID validation
export const idSchema = z.string().cuid('Invalid ID format');

// Query parameter validation
export const pollQuerySchema = z.object({
  includeParticipants: z.boolean().optional(),
  includeAvailability: z.boolean().optional(),
});

// Date range validation for analytics
export const dateRangeSchema = z
  .object({
    startDate: z.string().refine((date) => isValid(parseISO(date)), {
      message: 'Invalid start date',
    }),
    endDate: z.string().refine((date) => isValid(parseISO(date)), {
      message: 'Invalid end date',
    }),
  })
  .refine(
    (data) => {
      const start = parseISO(data.startDate);
      const end = parseISO(data.endDate);
      return end >= start;
    },
    {
      message: 'End date must be after or equal to start date',
      path: ['endDate'],
    }
  );

// Export types for use in API routes
export type CreatePollInput = z.infer<typeof createPollSchema>;
export type UpdatePollInput = z.infer<typeof updatePollSchema>;
export type SubmitResponseInput = z.infer<typeof submitResponseSchema>;
export type UpdateParticipantInput = z.infer<typeof updateParticipantSchema>;
export type UpdateAvailabilityInput = z.infer<typeof updateAvailabilitySchema>;
export type PollQueryInput = z.infer<typeof pollQuerySchema>;
export type DateRangeInput = z.infer<typeof dateRangeSchema>;
