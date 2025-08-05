import { PollRepository } from '../poll.repository';
import { prisma } from '@/lib/prisma';
import { CreatePollRequest } from '@/types/poll';
import { ErrorCode } from '@/types/errors';

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    poll: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
    },
    timeSlot: {
      createMany: jest.fn(),
    },
    $transaction: jest.fn(),
  },
  withTransaction: jest.fn(),
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const mockWithTransaction = require('@/lib/prisma')
  .withTransaction as jest.MockedFunction<any>;

describe('PollRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createPoll', () => {
    const mockPollData: CreatePollRequest = {
      title: 'Test Poll',
      description: 'Test Description',
      organizerTimezone: 'America/New_York',
      dates: ['2024-12-01'],
      timeSlots: [
        {
          date: '2024-12-01',
          startTime: '09:00',
          endTime: '10:00',
        },
      ],
    };

    const mockCreatedPoll = {
      id: 'poll-1',
      title: 'Test Poll',
      description: 'Test Description',
      organizerTimezone: 'America/New_York',
      createdAt: new Date(),
      updatedAt: new Date(),
      timeSlots: [
        {
          id: 'slot-1',
          pollId: 'poll-1',
          date: new Date('2024-12-01'),
          startTime: '09:00',
          endTime: '10:00',
          createdAt: new Date(),
        },
      ],
      participants: [],
    };

    it('should create a poll with time slots successfully', async () => {
      mockWithTransaction.mockImplementation(async (callback) => {
        return callback({
          poll: {
            create: jest.fn().mockResolvedValue({
              id: 'poll-1',
              title: 'Test Poll',
              description: 'Test Description',
              organizerTimezone: 'America/New_York',
            }),
            findUniqueOrThrow: jest.fn().mockResolvedValue(mockCreatedPoll),
          },
          timeSlot: {
            createMany: jest.fn().mockResolvedValue({ count: 1 }),
          },
        });
      });

      const result = await PollRepository.createPoll(mockPollData);

      expect(result).toEqual(mockCreatedPoll);
      expect(mockWithTransaction).toHaveBeenCalledTimes(1);
    });

    it('should throw database error when creation fails', async () => {
      mockWithTransaction.mockRejectedValue(new Error('Database error'));

      await expect(
        PollRepository.createPoll(mockPollData)
      ).rejects.toMatchObject({
        statusCode: 500,
        code: ErrorCode.DATABASE_ERROR,
      });
    });
  });

  describe('getPollById', () => {
    const mockPoll = {
      id: 'poll-1',
      title: 'Test Poll',
      description: 'Test Description',
      organizerTimezone: 'America/New_York',
      createdAt: new Date(),
      updatedAt: new Date(),
      timeSlots: [],
      participants: [],
    };

    it('should return poll when found', async () => {
      mockPrisma.poll.findUnique.mockResolvedValue(mockPoll);

      const result = await PollRepository.getPollById('poll-1');

      expect(result).toEqual(mockPoll);
      expect(mockPrisma.poll.findUnique).toHaveBeenCalledWith({
        where: { id: 'poll-1' },
        include: {
          timeSlots: {
            orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
          },
          participants: {
            include: {
              availability: true,
            },
            orderBy: { createdAt: 'asc' },
          },
        },
      });
    });

    it('should return null when poll not found', async () => {
      mockPrisma.poll.findUnique.mockResolvedValue(null);

      const result = await PollRepository.getPollById('nonexistent');

      expect(result).toBeNull();
    });

    it('should throw database error when query fails', async () => {
      mockPrisma.poll.findUnique.mockRejectedValue(new Error('Database error'));

      await expect(PollRepository.getPollById('poll-1')).rejects.toMatchObject({
        statusCode: 500,
        code: ErrorCode.DATABASE_ERROR,
      });
    });
  });

  describe('getPollByIdOrThrow', () => {
    it('should return poll when found', async () => {
      const mockPoll = {
        id: 'poll-1',
        title: 'Test Poll',
        description: 'Test Description',
        organizerTimezone: 'America/New_York',
        createdAt: new Date(),
        updatedAt: new Date(),
        timeSlots: [],
        participants: [],
      };

      jest.spyOn(PollRepository, 'getPollById').mockResolvedValue(mockPoll);

      const result = await PollRepository.getPollByIdOrThrow('poll-1');

      expect(result).toEqual(mockPoll);
    });

    it('should throw not found error when poll does not exist', async () => {
      jest.spyOn(PollRepository, 'getPollById').mockResolvedValue(null);

      await expect(
        PollRepository.getPollByIdOrThrow('nonexistent')
      ).rejects.toMatchObject({
        statusCode: 404,
        code: ErrorCode.POLL_NOT_FOUND,
      });
    });
  });

  describe('updatePoll', () => {
    const mockUpdatedPoll = {
      id: 'poll-1',
      title: 'Updated Poll',
      description: 'Updated Description',
      organizerTimezone: 'America/New_York',
      createdAt: new Date(),
      updatedAt: new Date(),
      timeSlots: [],
      participants: [],
    };

    it('should update poll successfully', async () => {
      mockPrisma.poll.update.mockResolvedValue(mockUpdatedPoll);

      const result = await PollRepository.updatePoll('poll-1', {
        title: 'Updated Poll',
        description: 'Updated Description',
      });

      expect(result).toEqual(mockUpdatedPoll);
      expect(mockPrisma.poll.update).toHaveBeenCalledWith({
        where: { id: 'poll-1' },
        data: {
          title: 'Updated Poll',
          description: 'Updated Description',
        },
        include: {
          timeSlots: {
            orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
          },
          participants: {
            include: {
              availability: true,
            },
            orderBy: { createdAt: 'asc' },
          },
        },
      });
    });

    it('should throw not found error when poll does not exist', async () => {
      mockPrisma.poll.update.mockRejectedValue({ code: 'P2025' });

      await expect(
        PollRepository.updatePoll('nonexistent', { title: 'Updated' })
      ).rejects.toMatchObject({
        statusCode: 404,
        code: ErrorCode.POLL_NOT_FOUND,
      });
    });
  });

  describe('deletePoll', () => {
    it('should delete poll successfully', async () => {
      mockPrisma.poll.delete.mockResolvedValue({} as any);

      await PollRepository.deletePoll('poll-1');

      expect(mockPrisma.poll.delete).toHaveBeenCalledWith({
        where: { id: 'poll-1' },
      });
    });

    it('should throw not found error when poll does not exist', async () => {
      mockPrisma.poll.delete.mockRejectedValue({ code: 'P2025' });

      await expect(
        PollRepository.deletePoll('nonexistent')
      ).rejects.toMatchObject({
        statusCode: 404,
        code: ErrorCode.POLL_NOT_FOUND,
      });
    });
  });
});
