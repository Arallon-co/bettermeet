import { NextRequest, NextResponse } from 'next/server';
import { PollRepository } from '@/lib/repositories/poll.repository';
import { createPollSchema } from '@/lib/validation/poll.validation';
import { ErrorCode, createApiError } from '@/types/errors';
import { CreatePollResponse } from '@/types/poll';
import { ZodError } from 'zod';

/**
 * POST /api/polls - Create a new poll
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validatedData = createPollSchema.parse(body);

    // Create poll using repository
    const poll = await PollRepository.createPoll({
      ...validatedData,
      description: validatedData.description || undefined,
    });

    // Generate shareable URL
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      `${request.nextUrl.protocol}//${request.nextUrl.host}`;
    const shareUrl = `${baseUrl}/poll/${poll.id}`;

    // Prepare response
    const response: CreatePollResponse = {
      id: poll.id,
      title: poll.title,
      description: poll.description || undefined,
      organizerTimezone: poll.organizerTimezone,
      shareUrl,
      createdAt: poll.createdAt.toISOString(),
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/polls:', error);

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
      {
        error: {
          code: ErrorCode.INTERNAL_SERVER_ERROR,
          message: 'An unexpected error occurred',
        },
      },
      { status: 500 }
    );
  }
}
