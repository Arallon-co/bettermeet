import { NextRequest, NextResponse } from 'next/server';
import { ParticipantRepository } from '@/lib/repositories/participant.repository';
import { PollRepository } from '@/lib/repositories/poll.repository';
import { createApiError, ErrorCode } from '@/types/errors';
import { SubmitResponseRequest } from '@/types/poll';
import { submitResponseSchema } from '@/lib/validation/poll.validation';
import { ZodError } from 'zod';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: pollId } = await params;
    const body = await request.json();

    // Validate that poll exists
    const poll = await PollRepository.getPollById(pollId);
    if (!poll) {
      return NextResponse.json(
        createApiError(404, ErrorCode.POLL_NOT_FOUND, 'Poll not found'),
        { status: 404 }
      );
    }

    // Convert selectedSlots format to availability format
    const availability =
      body.selectedSlots?.map((slotKey: string) => {
        // Find the corresponding time slot ID
        const [date, startTime] = slotKey.split('-');
        const timeSlot = poll.timeSlots.find(
          (slot) =>
            slot.date.toISOString().split('T')[0] === date &&
            slot.startTime === startTime
        );

        return {
          timeSlotId: timeSlot?.id || slotKey, // Use slot ID if found, otherwise use the key
          isAvailable: true,
        };
      }) || [];

    // Prepare data for validation
    const submitData = {
      participantName: body.name,
      participantEmail: body.email || null,
      participantTimezone: body.timezone,
      availability,
    };

    // Validate request data
    const validatedData = submitResponseSchema.parse(submitData);

    // Create participant with availability
    const participant =
      await ParticipantRepository.createParticipantWithAvailability(
        pollId,
        validatedData as SubmitResponseRequest
      );

    return NextResponse.json({
      success: true,
      participantId: participant.id,
      message: 'Vote submitted successfully',
    });
  } catch (error) {
    console.error('Error submitting vote:', error);

    // Handle validation errors
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: {
            code: ErrorCode.VALIDATION_ERROR,
            message: 'Invalid request data',
            details: error.issues.reduce(
              (acc, err) => {
                const path = err.path.join('.');
                acc[path] = err.message;
                return acc;
              },
              {} as Record<string, string>
            ),
          },
        },
        { status: 400 }
      );
    }

    // Handle API errors
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const apiError = error as ReturnType<typeof createApiError>;
      return NextResponse.json(
        {
          error: {
            code: apiError.code,
            message: apiError.message,
          },
        },
        { status: apiError.statusCode }
      );
    }

    // Handle unexpected errors
    return NextResponse.json(
      createApiError(
        500,
        ErrorCode.INTERNAL_SERVER_ERROR,
        'Failed to submit vote'
      ),
      { status: 500 }
    );
  }
}
