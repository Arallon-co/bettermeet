import { prisma, withTransaction } from '@/lib/prisma';
import {
  ParticipantModel,
  AvailabilityModel,
  SubmitResponseRequest,
  CreateParticipantData,
  CreateAvailabilityData,
} from '@/types/poll';
import { ErrorCode, createApiError } from '@/types/errors';

export class ParticipantRepository {
  /**
   * Create a new participant with their availability responses
   */
  static async createParticipantWithAvailability(
    pollId: string,
    data: SubmitResponseRequest
  ): Promise<ParticipantModel & { availability: AvailabilityModel[] }> {
    try {
      return await withTransaction(async (tx) => {
        // Check if participant with email already exists for this poll
        if (data.participantEmail) {
          const existingParticipant = await tx.participant.findFirst({
            where: {
              pollId,
              email: data.participantEmail,
            },
          });

          if (existingParticipant) {
            throw createApiError(409, ErrorCode.DUPLICATE_PARTICIPANT);
          }
        }

        // Create the participant
        const participant = await tx.participant.create({
          data: {
            pollId,
            name: data.participantName,
            email: data.participantEmail,
            timezone: data.participantTimezone,
          },
        });

        // Create availability records
        const availabilityData: CreateAvailabilityData[] =
          data.availability.map((avail) => ({
            participantId: participant.id,
            timeSlotId: avail.timeSlotId,
            isAvailable: avail.isAvailable,
          }));

        await tx.availability.createMany({
          data: availabilityData,
        });

        // Return participant with availability
        return await tx.participant.findUniqueOrThrow({
          where: { id: participant.id },
          include: {
            availability: true,
          },
        });
      });
    } catch (error) {
      console.error('Error creating participant:', error);
      if (error instanceof Error && 'statusCode' in error) {
        throw error; // Re-throw API errors
      }
      throw createApiError(
        500,
        ErrorCode.DATABASE_ERROR,
        'Failed to create participant'
      );
    }
  }

  /**
   * Get participant by ID with availability
   */
  static async getParticipantById(
    id: string
  ): Promise<
    (ParticipantModel & { availability: AvailabilityModel[] }) | null
  > {
    try {
      return await prisma.participant.findUnique({
        where: { id },
        include: {
          availability: true,
        },
      });
    } catch (error) {
      console.error('Error fetching participant:', error);
      throw createApiError(
        500,
        ErrorCode.DATABASE_ERROR,
        'Failed to fetch participant'
      );
    }
  }

  /**
   * Get participant by ID or throw error if not found
   */
  static async getParticipantByIdOrThrow(
    id: string
  ): Promise<ParticipantModel & { availability: AvailabilityModel[] }> {
    const participant = await this.getParticipantById(id);
    if (!participant) {
      throw createApiError(404, ErrorCode.PARTICIPANT_NOT_FOUND);
    }
    return participant;
  }

  /**
   * Update participant availability
   */
  static async updateParticipantAvailability(
    participantId: string,
    availability: { timeSlotId: string; isAvailable: boolean }[]
  ): Promise<ParticipantModel & { availability: AvailabilityModel[] }> {
    try {
      return await withTransaction(async (tx) => {
        // Delete existing availability records
        await tx.availability.deleteMany({
          where: { participantId },
        });

        // Create new availability records
        const availabilityData: CreateAvailabilityData[] = availability.map(
          (avail) => ({
            participantId,
            timeSlotId: avail.timeSlotId,
            isAvailable: avail.isAvailable,
          })
        );

        await tx.availability.createMany({
          data: availabilityData,
        });

        // Return updated participant
        return await tx.participant.findUniqueOrThrow({
          where: { id: participantId },
          include: {
            availability: true,
          },
        });
      });
    } catch (error) {
      console.error('Error updating participant availability:', error);
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        error.code === 'P2025'
      ) {
        throw createApiError(404, ErrorCode.PARTICIPANT_NOT_FOUND);
      }
      throw createApiError(
        500,
        ErrorCode.DATABASE_ERROR,
        'Failed to update availability'
      );
    }
  }

  /**
   * Update participant details (name, email, timezone)
   */
  static async updateParticipant(
    id: string,
    data: Partial<Pick<CreateParticipantData, 'name' | 'email' | 'timezone'>>
  ): Promise<ParticipantModel & { availability: AvailabilityModel[] }> {
    try {
      const updatedParticipant = await prisma.participant.update({
        where: { id },
        data: {
          name: data.name,
          email: data.email,
          timezone: data.timezone,
        },
        include: {
          availability: true,
        },
      });

      return updatedParticipant;
    } catch (error) {
      console.error('Error updating participant:', error);
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        error.code === 'P2025'
      ) {
        throw createApiError(404, ErrorCode.PARTICIPANT_NOT_FOUND);
      }
      throw createApiError(
        500,
        ErrorCode.DATABASE_ERROR,
        'Failed to update participant'
      );
    }
  }

  /**
   * Delete participant and all their availability records
   */
  static async deleteParticipant(id: string): Promise<void> {
    try {
      await prisma.participant.delete({
        where: { id },
      });
    } catch (error) {
      console.error('Error deleting participant:', error);
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        error.code === 'P2025'
      ) {
        throw createApiError(404, ErrorCode.PARTICIPANT_NOT_FOUND);
      }
      throw createApiError(
        500,
        ErrorCode.DATABASE_ERROR,
        'Failed to delete participant'
      );
    }
  }

  /**
   * Get all participants for a poll
   */
  static async getParticipantsByPollId(
    pollId: string
  ): Promise<(ParticipantModel & { availability: AvailabilityModel[] })[]> {
    try {
      return await prisma.participant.findMany({
        where: { pollId },
        include: {
          availability: true,
        },
        orderBy: { createdAt: 'asc' },
      });
    } catch (error) {
      console.error('Error fetching participants:', error);
      throw createApiError(
        500,
        ErrorCode.DATABASE_ERROR,
        'Failed to fetch participants'
      );
    }
  }

  /**
   * Check if participant exists by email for a poll
   */
  static async participantExistsByEmail(
    pollId: string,
    email: string
  ): Promise<boolean> {
    try {
      const participant = await prisma.participant.findFirst({
        where: {
          pollId,
          email,
        },
      });
      return !!participant;
    } catch (error) {
      console.error('Error checking participant existence:', error);
      throw createApiError(
        500,
        ErrorCode.DATABASE_ERROR,
        'Failed to check participant'
      );
    }
  }

  /**
   * Get participant statistics for a poll
   */
  static async getParticipantStats(pollId: string) {
    try {
      const participants = await this.getParticipantsByPollId(pollId);

      const totalParticipants = participants.length;
      const participantsWithEmail = participants.filter((p) => p.email).length;
      const totalResponses = participants.reduce(
        (sum, participant) => sum + participant.availability.length,
        0
      );

      const timezoneDistribution = participants.reduce(
        (acc, participant) => {
          acc[participant.timezone] = (acc[participant.timezone] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

      return {
        totalParticipants,
        participantsWithEmail,
        totalResponses,
        timezoneDistribution,
        averageResponsesPerParticipant:
          totalParticipants > 0 ? totalResponses / totalParticipants : 0,
      };
    } catch (error) {
      console.error('Error getting participant stats:', error);
      throw createApiError(
        500,
        ErrorCode.DATABASE_ERROR,
        'Failed to get participant statistics'
      );
    }
  }
}
