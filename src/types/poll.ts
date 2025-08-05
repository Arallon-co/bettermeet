// Core data types for the BetterMeet application

export interface TimeSlot {
  id: string;
  date: string; // ISO date string (YYYY-MM-DD)
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
}

export interface AvailabilitySlot {
  timeSlotId: string;
  isAvailable: boolean;
}

export interface Participant {
  id: string;
  name: string;
  email?: string;
  timezone: string;
  availability: AvailabilitySlot[];
  createdAt: Date;
}

export interface Poll {
  id: string;
  title: string;
  description?: string;
  organizerTimezone: string;
  timeSlots: TimeSlot[];
  participants: Participant[];
  createdAt: Date;
  updatedAt: Date;
}

// API Request/Response types

export interface CreatePollRequest {
  title: string;
  description?: string;
  dates: string[]; // ISO date strings
  timeSlots: Omit<TimeSlot, 'id'>[];
  organizerTimezone: string;
}

export interface CreatePollResponse {
  id: string;
  title: string;
  description?: string;
  organizerTimezone: string;
  shareUrl: string;
  createdAt: string;
}

export interface PollResponse {
  id: string;
  title: string;
  description?: string;
  organizerTimezone: string;
  timeSlots: TimeSlot[];
  participants: Participant[];
  createdAt: string;
  updatedAt: string;
}

export interface SubmitResponseRequest {
  participantName: string;
  participantEmail?: string;
  participantTimezone: string;
  availability: AvailabilitySlot[];
}

export interface SubmitResponseResponse {
  success: boolean;
  participantId: string;
  message: string;
}

export interface PollResultsResponse {
  poll: Poll;
  availabilityMatrix: AvailabilityMatrix;
  optimalTimeSlots: OptimalTimeSlot[];
  participantCount: number;
}

export interface AvailabilityMatrix {
  [timeSlotId: string]: {
    timeSlot: TimeSlot;
    availableParticipants: string[]; // participant IDs
    availabilityCount: number;
    availabilityPercentage: number;
  };
}

export interface OptimalTimeSlot {
  timeSlot: TimeSlot;
  availableParticipants: Participant[];
  availabilityCount: number;
  availabilityPercentage: number;
}

// Database model types (matching Prisma schema)

export interface PollModel {
  id: string;
  title: string;
  description: string | null;
  organizerTimezone: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TimeSlotModel {
  id: string;
  pollId: string;
  date: Date;
  startTime: string;
  endTime: string;
  createdAt: Date;
}

export interface ParticipantModel {
  id: string;
  pollId: string;
  name: string;
  email: string | null;
  timezone: string;
  createdAt: Date;
}

export interface AvailabilityModel {
  id: string;
  participantId: string;
  timeSlotId: string;
  isAvailable: boolean;
  createdAt: Date;
}

// Utility types

export type PollWithRelations = PollModel & {
  timeSlots: TimeSlotModel[];
  participants: (ParticipantModel & {
    availability: AvailabilityModel[];
  })[];
};

export type CreateTimeSlotData = Omit<TimeSlotModel, 'id' | 'createdAt'>;
export type CreateParticipantData = Omit<ParticipantModel, 'id' | 'createdAt'>;
export type CreateAvailabilityData = Omit<
  AvailabilityModel,
  'id' | 'createdAt'
>;
