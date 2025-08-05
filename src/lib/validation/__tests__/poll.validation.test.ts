import {
  createPollSchema,
  submitResponseSchema,
  updatePollSchema,
  updateParticipantSchema,
  idSchema,
} from '../poll.validation';

describe('Poll Validation', () => {
  describe('createPollSchema', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7); // 7 days from now
    const futureDateString = futureDate.toISOString().split('T')[0]; // YYYY-MM-DD format

    const validPollData = {
      title: 'Test Poll',
      description: 'Test Description',
      organizerTimezone: 'America/New_York',
      dates: [futureDateString],
      timeSlots: [
        {
          date: futureDateString,
          startTime: '09:00',
          endTime: '10:00',
        },
      ],
    };

    it('should validate valid poll data', () => {
      const result = createPollSchema.safeParse(validPollData);
      expect(result.success).toBe(true);
    });

    it('should reject empty title', () => {
      const result = createPollSchema.safeParse({
        ...validPollData,
        title: '',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Title is required');
      }
    });

    it('should reject title longer than 255 characters', () => {
      const result = createPollSchema.safeParse({
        ...validPollData,
        title: 'a'.repeat(256),
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'Title must be less than 255 characters'
        );
      }
    });

    it('should reject invalid timezone', () => {
      const result = createPollSchema.safeParse({
        ...validPollData,
        organizerTimezone: 'Invalid/Timezone',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Invalid timezone');
      }
    });

    it('should reject empty dates array', () => {
      const result = createPollSchema.safeParse({
        ...validPollData,
        dates: [],
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'At least one date is required'
        );
      }
    });

    it('should reject invalid date format', () => {
      const result = createPollSchema.safeParse({
        ...validPollData,
        dates: ['invalid-date'],
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        // The error could be either "Invalid date format" or "Date must be in the future"
        // depending on which validation runs first
        const hasDateError = result.error.issues.some(
          (issue) =>
            issue.message === 'Invalid date format' ||
            issue.message === 'Date must be in the future'
        );
        expect(hasDateError).toBe(true);
      }
    });

    it('should reject invalid time format', () => {
      const result = createPollSchema.safeParse({
        ...validPollData,
        timeSlots: [
          {
            date: futureDateString,
            startTime: '25:00', // Invalid hour
            endTime: '10:00',
          },
        ],
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const timeError = result.error.issues.find(
          (issue) => issue.message === 'Time must be in HH:MM format'
        );
        expect(timeError).toBeDefined();
      }
    });

    it('should reject end time before start time', () => {
      const result = createPollSchema.safeParse({
        ...validPollData,
        timeSlots: [
          {
            date: futureDateString,
            startTime: '10:00',
            endTime: '09:00', // Before start time
          },
        ],
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const timeError = result.error.issues.find(
          (issue) => issue.message === 'End time must be after start time'
        );
        expect(timeError).toBeDefined();
      }
    });

    it('should accept null description', () => {
      const result = createPollSchema.safeParse({
        ...validPollData,
        description: null,
      });
      expect(result.success).toBe(true);
    });

    it('should accept undefined description', () => {
      const { description, ...dataWithoutDescription } = validPollData;
      const result = createPollSchema.safeParse(dataWithoutDescription);
      expect(result.success).toBe(true);
    });
  });

  describe('submitResponseSchema', () => {
    const validResponseData = {
      participantName: 'John Doe',
      participantEmail: 'john@example.com',
      participantTimezone: 'America/New_York',
      availability: [
        {
          timeSlotId: 'clh1234567890',
          isAvailable: true,
        },
      ],
    };

    it('should validate valid response data', () => {
      const result = submitResponseSchema.safeParse(validResponseData);
      expect(result.success).toBe(true);
    });

    it('should reject empty participant name', () => {
      const result = submitResponseSchema.safeParse({
        ...validResponseData,
        participantName: '',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Name is required');
      }
    });

    it('should reject invalid email format', () => {
      const result = submitResponseSchema.safeParse({
        ...validResponseData,
        participantEmail: 'invalid-email',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Invalid email format');
      }
    });

    it('should accept null email', () => {
      const result = submitResponseSchema.safeParse({
        ...validResponseData,
        participantEmail: null,
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid timezone', () => {
      const result = submitResponseSchema.safeParse({
        ...validResponseData,
        participantTimezone: 'Invalid/Timezone',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Invalid timezone');
      }
    });

    it('should reject empty availability array', () => {
      const result = submitResponseSchema.safeParse({
        ...validResponseData,
        availability: [],
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'At least one availability response is required'
        );
      }
    });

    it('should reject invalid time slot ID format', () => {
      const result = submitResponseSchema.safeParse({
        ...validResponseData,
        availability: [
          {
            timeSlotId: 'invalid-id',
            isAvailable: true,
          },
        ],
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Invalid time slot ID');
      }
    });
  });

  describe('updatePollSchema', () => {
    it('should validate valid update data', () => {
      const result = updatePollSchema.safeParse({
        title: 'Updated Title',
        description: 'Updated Description',
      });
      expect(result.success).toBe(true);
    });

    it('should accept partial updates', () => {
      const result = updatePollSchema.safeParse({
        title: 'Updated Title',
      });
      expect(result.success).toBe(true);
    });

    it('should accept null description', () => {
      const result = updatePollSchema.safeParse({
        description: null,
      });
      expect(result.success).toBe(true);
    });

    it('should reject empty title', () => {
      const result = updatePollSchema.safeParse({
        title: '',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Title is required');
      }
    });
  });

  describe('updateParticipantSchema', () => {
    it('should validate valid participant update', () => {
      const result = updateParticipantSchema.safeParse({
        name: 'Updated Name',
        email: 'updated@example.com',
        timezone: 'Europe/London',
      });
      expect(result.success).toBe(true);
    });

    it('should accept partial updates', () => {
      const result = updateParticipantSchema.safeParse({
        name: 'Updated Name',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const result = updateParticipantSchema.safeParse({
        email: 'invalid-email',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Invalid email format');
      }
    });
  });

  describe('idSchema', () => {
    it('should validate valid CUID', () => {
      const result = idSchema.safeParse('clh1234567890abcdef');
      expect(result.success).toBe(true);
    });

    it('should reject invalid ID format', () => {
      const result = idSchema.safeParse('invalid-id');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Invalid ID format');
      }
    });

    it('should reject empty string', () => {
      const result = idSchema.safeParse('');
      expect(result.success).toBe(false);
    });
  });
});
