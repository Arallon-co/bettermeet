/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { POST } from '../route';
import { PollRepository } from '@/lib/repositories/poll.repository';
import { ErrorCode } from '@/types/errors';
import { CreatePollRequest, PollWithRelations } from '@/types/poll';

// Mock the repository
jest.mock('@/lib/repositories/poll.repository');
const mockPollRepository = PollRepository as jest.Mocked<typeof PollRepository>;

// Mock environment variables
const originalEnv = process.env;
beforeEach(() => {
  process.env = {
    ...originalEnv,
    NEXT_PUBLIC_BASE_URL: 'https://bettermeet.example.com',
  };
});

afterEach(() => {
  process.env = originalEnv;
  jest.clearAllMocks();
});

// Helper function to create a mock request
function createMockRequest(body: any, url = 'https://example.com/api/polls') {
  return new NextRequest(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

// Mock poll data
const mockPollData: CreatePollRequest = {
  title: 'Team Meeting',
  description: 'Weekly team sync',
  organizerTimezone: 'America/New_York',
  dates: ['2025-12-01', '2025-12-02'],
  timeSlots: [
    {
      date: '2025-12-01',
      startTime: '09:00',
      endTime: '10:00',
    },
    {
      date: '2025-12-01',
      startTime: '14:00',
      endTime: '15:00',
    },
    {
      date: '2025-12-02',
      startTime: '09:00',
      endTime: '10:00',
    },
  ],
};

const mockCreatedPoll: PollWithRelations = {
  id: 'poll_123',
  title: 'Team Meeting',
  description: 'Weekly team sync',
  organizerTimezone: 'America/New_York',
  createdAt: new Date('2025-01-01T10:00:00Z'),
  updatedAt: new Date('2025-01-01T10:00:00Z'),
  timeSlots: [
    {
      id: 'slot_1',
      pollId: 'poll_123',
      date: new Date('2025-12-01'),
      startTime: '09:00',
      endTime: '10:00',
      createdAt: new Date('2025-01-01T10:00:00Z'),
    },
    {
      id: 'slot_2',
      pollId: 'poll_123',
      date: new Date('2025-12-01'),
      startTime: '14:00',
      endTime: '15:00',
      createdAt: new Date('2025-01-01T10:00:00Z'),
    },
    {
      id: 'slot_3',
      pollId: 'poll_123',
      date: new Date('2025-12-02'),
      startTime: '09:00',
      endTime: '10:00',
      createdAt: new Date('2025-01-01T10:00:00Z'),
    },
  ],
  participants: [],
};

describe('POST /api/polls', () => {
  describe('Successful poll creation', () => {
    it('should create a poll and return success response', async () => {
      mockPollRepository.createPoll.mockResolvedValue(mockCreatedPoll);

      const request = createMockRequest(mockPollData);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(201);
      expect(responseData).toEqual({
        id: 'poll_123',
        title: 'Team Meeting',
        description: 'Weekly team sync',
        organizerTimezone: 'America/New_York',
        shareUrl: 'https://bettermeet.example.com/poll/poll_123',
        createdAt: '2025-01-01T10:00:00.000Z',
      });

      expect(mockPollRepository.createPoll).toHaveBeenCalledWith(mockPollData);
    });

    it('should create a poll without description', async () => {
      const pollDataWithoutDescription = {
        ...mockPollData,
        description: undefined,
      };
      const mockPollWithoutDescription = {
        ...mockCreatedPoll,
        description: null,
      };

      mockPollRepository.createPoll.mockResolvedValue(
        mockPollWithoutDescription
      );

      const request = createMockRequest(pollDataWithoutDescription);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(201);
      expect(responseData.description).toBeUndefined();
    });

    it('should generate share URL using request host when NEXT_PUBLIC_BASE_URL is not set', async () => {
      delete process.env.NEXT_PUBLIC_BASE_URL;
      mockPollRepository.createPoll.mockResolvedValue(mockCreatedPoll);

      const request = createMockRequest(
        mockPollData,
        'https://localhost:3000/api/polls'
      );
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(201);
      expect(responseData.shareUrl).toBe(
        'https://localhost:3000/poll/poll_123'
      );
    });
  });

  describe('Validation errors', () => {
    it('should return 400 for missing title', async () => {
      const invalidData = {
        ...mockPollData,
        title: '',
      };

      const request = createMockRequest(invalidData);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.error.code).toBe(ErrorCode.VALIDATION_ERROR);
      expect(responseData.error.details.title).toBe('Title is required');
    });

    it('should return 400 for invalid timezone', async () => {
      const invalidData = {
        ...mockPollData,
        organizerTimezone: 'Invalid/Timezone',
      };

      const request = createMockRequest(invalidData);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.error.code).toBe(ErrorCode.VALIDATION_ERROR);
      expect(responseData.error.details.organizerTimezone).toBe(
        'Invalid timezone'
      );
    });

    it('should return 400 for invalid time format', async () => {
      const invalidData = {
        ...mockPollData,
        timeSlots: [
          {
            date: '2025-12-01',
            startTime: '25:00', // Invalid hour
            endTime: '10:00',
          },
        ],
      };

      const request = createMockRequest(invalidData);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.error.code).toBe(ErrorCode.VALIDATION_ERROR);
    });

    it('should return 400 for end time before start time', async () => {
      const invalidData = {
        ...mockPollData,
        timeSlots: [
          {
            date: '2025-12-01',
            startTime: '15:00',
            endTime: '14:00', // End before start
          },
        ],
      };

      const request = createMockRequest(invalidData);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.error.code).toBe(ErrorCode.VALIDATION_ERROR);
      expect(responseData.error.details['timeSlots.0.endTime']).toBe(
        'End time must be after start time'
      );
    });

    it('should return 400 for past dates', async () => {
      const invalidData = {
        ...mockPollData,
        dates: ['2020-01-01'], // Past date
        timeSlots: [
          {
            date: '2020-01-01',
            startTime: '09:00',
            endTime: '10:00',
          },
        ],
      };

      const request = createMockRequest(invalidData);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.error.code).toBe(ErrorCode.VALIDATION_ERROR);
    });

    it('should return 400 for empty time slots', async () => {
      const invalidData = {
        ...mockPollData,
        timeSlots: [],
      };

      const request = createMockRequest(invalidData);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.error.code).toBe(ErrorCode.VALIDATION_ERROR);
      expect(responseData.error.details.timeSlots).toBe(
        'At least one time slot is required'
      );
    });

    it('should return 400 for too many time slots', async () => {
      const invalidData = {
        ...mockPollData,
        timeSlots: Array.from({ length: 101 }, (_, i) => ({
          date: '2025-12-01',
          startTime: '09:00',
          endTime: '10:00',
        })),
      };

      const request = createMockRequest(invalidData);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.error.code).toBe(ErrorCode.VALIDATION_ERROR);
      expect(responseData.error.details.timeSlots).toBe(
        'Maximum 100 time slots allowed'
      );
    });

    it('should return 400 for invalid JSON', async () => {
      const request = new NextRequest('https://example.com/api/polls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: 'invalid json',
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData.error.code).toBe(ErrorCode.INTERNAL_SERVER_ERROR);
    });
  });

  describe('Database errors', () => {
    it('should handle database errors', async () => {
      const dbError = {
        statusCode: 500,
        code: ErrorCode.DATABASE_ERROR,
        message: 'Database connection failed',
      };
      mockPollRepository.createPoll.mockRejectedValue(dbError);

      const request = createMockRequest(mockPollData);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData.error.code).toBe(ErrorCode.DATABASE_ERROR);
      expect(responseData.error.message).toBe('Database connection failed');
    });

    it('should handle unexpected errors', async () => {
      mockPollRepository.createPoll.mockRejectedValue(
        new Error('Unexpected error')
      );

      const request = createMockRequest(mockPollData);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData.error.code).toBe(ErrorCode.INTERNAL_SERVER_ERROR);
      expect(responseData.error.message).toBe('An unexpected error occurred');
    });
  });

  describe('Edge cases', () => {
    it('should handle maximum allowed title length', async () => {
      const longTitle = 'a'.repeat(255);
      const validData = {
        ...mockPollData,
        title: longTitle,
      };
      const mockPollWithLongTitle = {
        ...mockCreatedPoll,
        title: longTitle,
      };

      mockPollRepository.createPoll.mockResolvedValue(mockPollWithLongTitle);

      const request = createMockRequest(validData);
      const response = await POST(request);

      expect(response.status).toBe(201);
    });

    it('should reject title longer than 255 characters', async () => {
      const tooLongTitle = 'a'.repeat(256);
      const invalidData = {
        ...mockPollData,
        title: tooLongTitle,
      };

      const request = createMockRequest(invalidData);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.error.code).toBe(ErrorCode.VALIDATION_ERROR);
      expect(responseData.error.details.title).toBe(
        'Title must be less than 255 characters'
      );
    });

    it('should handle maximum allowed description length', async () => {
      const longDescription = 'a'.repeat(1000);
      const validData = {
        ...mockPollData,
        description: longDescription,
      };
      const mockPollWithLongDescription = {
        ...mockCreatedPoll,
        description: longDescription,
      };

      mockPollRepository.createPoll.mockResolvedValue(
        mockPollWithLongDescription
      );

      const request = createMockRequest(validData);
      const response = await POST(request);

      expect(response.status).toBe(201);
    });

    it('should reject description longer than 1000 characters', async () => {
      const tooLongDescription = 'a'.repeat(1001);
      const invalidData = {
        ...mockPollData,
        description: tooLongDescription,
      };

      const request = createMockRequest(invalidData);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.error.code).toBe(ErrorCode.VALIDATION_ERROR);
      expect(responseData.error.details.description).toBe(
        'Description must be less than 1000 characters'
      );
    });

    it('should handle maximum allowed dates', async () => {
      const maxDates = Array.from({ length: 30 }, (_, i) => {
        const date = new Date('2025-12-01');
        date.setDate(date.getDate() + i);
        return date.toISOString().split('T')[0];
      });

      const validData = {
        ...mockPollData,
        dates: maxDates,
        timeSlots: maxDates.map((date) => ({
          date,
          startTime: '09:00',
          endTime: '10:00',
        })),
      };

      mockPollRepository.createPoll.mockResolvedValue(mockCreatedPoll);

      const request = createMockRequest(validData);
      const response = await POST(request);

      expect(response.status).toBe(201);
    });

    it('should reject more than 30 dates', async () => {
      const tooManyDates = Array.from({ length: 31 }, (_, i) => {
        const date = new Date('2025-12-01');
        date.setDate(date.getDate() + i);
        return date.toISOString().split('T')[0];
      });

      const invalidData = {
        ...mockPollData,
        dates: tooManyDates,
      };

      const request = createMockRequest(invalidData);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.error.code).toBe(ErrorCode.VALIDATION_ERROR);
      expect(responseData.error.details.dates).toBe('Maximum 30 dates allowed');
    });
  });
});
