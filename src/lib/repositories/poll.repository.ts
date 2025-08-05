import { prisma, withTransaction } from '@/lib/prisma';
import {
  PollWithRelations,
  CreatePollRequest,
  CreateTimeSlotData,
  TimeSlot,
} from '@/types/poll';
import { ErrorCode, createApiError } from '@/types/errors';
import { format } from 'date-fns';

export class PollRepository {
  /**
   * Create a new poll with time slots
   */
  static async createPoll(data: CreatePollRequest): Promise<PollWithRelations> {
    try {
      return await withTransaction(async (tx) => {
        // Create the poll
        const poll = await tx.poll.create({
          data: {
            title: data.title,
            description: data.description,
            organizerTimezone: data.organizerTimezone,
          },
        });

        // Create time slots
        const timeSlotData: CreateTimeSlotData[] = data.timeSlots.map(
          (slot) => ({
            pollId: poll.id,
            date: new Date(slot.date),
            startTime: slot.startTime,
            endTime: slot.endTime,
          })
        );

        await tx.timeSlot.createMany({
          data: timeSlotData,
        });

        // Return the poll with relations
        return await tx.poll.findUniqueOrThrow({
          where: { id: poll.id },
          include: {
            timeSlots: true,
            participants: {
              include: {
                availability: true,
              },
            },
          },
        });
      });
    } catch (error) {
      console.error('Error creating poll:', error);
      throw createApiError(
        500,
        ErrorCode.DATABASE_ERROR,
        'Failed to create poll'
      );
    }
  }

  /**
   * Get a poll by ID with all relations
   */
  static async getPollById(id: string): Promise<PollWithRelations | null> {
    try {
      const poll = await prisma.poll.findUnique({
        where: { id },
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

      return poll;
    } catch (error) {
      console.error('Error fetching poll:', error);
      throw createApiError(
        500,
        ErrorCode.DATABASE_ERROR,
        'Failed to fetch poll'
      );
    }
  }

  /**
   * Get a poll by ID or throw error if not found
   */
  static async getPollByIdOrThrow(id: string): Promise<PollWithRelations> {
    const poll = await this.getPollById(id);
    if (!poll) {
      throw createApiError(404, ErrorCode.POLL_NOT_FOUND);
    }
    return poll;
  }

  /**
   * Update poll details
   */
  static async updatePoll(
    id: string,
    data: Partial<Pick<CreatePollRequest, 'title' | 'description'>>
  ): Promise<PollWithRelations> {
    try {
      const updatedPoll = await prisma.poll.update({
        where: { id },
        data: {
          title: data.title,
          description: data.description,
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

      return updatedPoll;
    } catch (error) {
      console.error('Error updating poll:', error);
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        error.code === 'P2025'
      ) {
        throw createApiError(404, ErrorCode.POLL_NOT_FOUND);
      }
      throw createApiError(
        500,
        ErrorCode.DATABASE_ERROR,
        'Failed to update poll'
      );
    }
  }

  /**
   * Delete a poll and all related data
   */
  static async deletePoll(id: string): Promise<void> {
    try {
      await prisma.poll.delete({
        where: { id },
      });
    } catch (error) {
      console.error('Error deleting poll:', error);
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        error.code === 'P2025'
      ) {
        throw createApiError(404, ErrorCode.POLL_NOT_FOUND);
      }
      throw createApiError(
        500,
        ErrorCode.DATABASE_ERROR,
        'Failed to delete poll'
      );
    }
  }

  /**
   * Get polls created within a date range (for cleanup/analytics)
   */
  static async getPollsByDateRange(
    startDate: Date,
    endDate: Date
  ): Promise<PollWithRelations[]> {
    try {
      return await prisma.poll.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
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
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      console.error('Error fetching polls by date range:', error);
      throw createApiError(
        500,
        ErrorCode.DATABASE_ERROR,
        'Failed to fetch polls'
      );
    }
  }

  /**
   * Get poll statistics
   */
  static async getPollStats(id: string) {
    try {
      const poll = await this.getPollByIdOrThrow(id);

      const totalTimeSlots = poll.timeSlots.length;
      const totalParticipants = poll.participants.length;
      const totalResponses = poll.participants.reduce(
        (sum, participant) => sum + participant.availability.length,
        0
      );

      const availabilityByTimeSlot = poll.timeSlots.map((timeSlot) => {
        const availableCount = poll.participants.filter((participant) =>
          participant.availability.some(
            (avail) => avail.timeSlotId === timeSlot.id && avail.isAvailable
          )
        ).length;

        return {
          timeSlotId: timeSlot.id,
          date: format(timeSlot.date, 'yyyy-MM-dd'),
          startTime: timeSlot.startTime,
          endTime: timeSlot.endTime,
          availableCount,
          availabilityPercentage:
            totalParticipants > 0
              ? (availableCount / totalParticipants) * 100
              : 0,
        };
      });

      return {
        totalTimeSlots,
        totalParticipants,
        totalResponses,
        availabilityByTimeSlot,
        responseRate:
          totalTimeSlots > 0
            ? (totalResponses / (totalTimeSlots * totalParticipants)) * 100
            : 0,
      };
    } catch (error) {
      console.error('Error getting poll stats:', error);
      throw createApiError(
        500,
        ErrorCode.DATABASE_ERROR,
        'Failed to get poll statistics'
      );
    }
  }
}
