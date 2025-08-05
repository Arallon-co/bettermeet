import { NextRequest, NextResponse } from 'next/server';
import { PollRepository } from '@/lib/repositories/poll.repository';
import { createApiError, ErrorCode } from '@/types/errors';
import { convertBusinessHoursTimeSlots } from '@/lib/timezone';
import { format } from 'date-fns';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const poll = await PollRepository.getPollById(id);

    if (!poll) {
      return NextResponse.json(
        createApiError(404, ErrorCode.POLL_NOT_FOUND, 'Poll not found'),
        { status: 404 }
      );
    }

    // Get participant timezone from query params (if provided)
    const { searchParams } = new URL(request.url);
    const participantTimezone = searchParams.get('timezone');

    // Convert time slots to participant's timezone if provided
    let convertedTimeSlots = poll.timeSlots.map((slot) => ({
      id: slot.id,
      date: format(slot.date, 'yyyy-MM-dd'),
      startTime: slot.startTime,
      endTime: slot.endTime,
    }));

    if (participantTimezone && participantTimezone !== poll.organizerTimezone) {
      try {
        console.log(
          'Converting time slots from',
          poll.organizerTimezone,
          'to',
          participantTimezone
        );
        console.log('Original time slots:', convertedTimeSlots.length);

        // Convert time slots to participant's timezone, keeping only business hours
        const businessHoursSlots = convertBusinessHoursTimeSlots(
          convertedTimeSlots,
          poll.organizerTimezone,
          participantTimezone
        );

        console.log('Converted time slots:', businessHoursSlots.length);

        // Create a mapping of original slots to converted slots
        const originalSlotMap = new Map();
        convertedTimeSlots.forEach((slot) => {
          const key = `${slot.date}-${slot.startTime}`;
          originalSlotMap.set(key, slot.id);
        });

        convertedTimeSlots = businessHoursSlots.map((slot, index) => {
          // Try to find matching original slot ID, otherwise generate a unique ID
          const key = `${slot.originalDate || slot.date}-${slot.startTime}`;
          const originalId = originalSlotMap.get(key);

          return {
            id: originalId || `${poll.id}-${slot.date}-${slot.startTime}`,
            date: slot.date,
            startTime: slot.startTime,
            endTime: slot.endTime,
          };
        });

        console.log('Final converted time slots:', convertedTimeSlots.length);
      } catch (error) {
        console.error('Error converting time slots for timezone:', error);
        // Fall back to original time slots if conversion fails
      }
    }

    // Return poll with converted time slots
    const response = {
      ...poll,
      timeSlots: convertedTimeSlots,
      createdAt: poll.createdAt.toISOString(),
      updatedAt: poll.updatedAt.toISOString(),
      participants: poll.participants.map((participant) => ({
        ...participant,
        createdAt: participant.createdAt.toISOString(),
      })),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching poll:', error);
    return NextResponse.json(
      createApiError(500, ErrorCode.DATABASE_ERROR, 'Failed to fetch poll'),
      { status: 500 }
    );
  }
}
