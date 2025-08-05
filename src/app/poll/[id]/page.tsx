'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Chip,
} from '@nextui-org/react';
import { format, parseISO } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import {
  CalendarIcon,
  ClockIcon,
  UserIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline';
import type { Poll, TimeSlot, Participant } from '@/types/poll';

interface PollPageProps {
  params: Promise<{
    id: string;
  }>;
}

// Generate time slots for business hours (9am-5pm) in 30-minute intervals
const TIME_SLOTS = [
  '09:00',
  '09:30',
  '10:00',
  '10:30',
  '11:00',
  '11:30',
  '12:00',
  '12:30',
  '13:00',
  '13:30',
  '14:00',
  '14:30',
  '15:00',
  '15:30',
  '16:00',
  '16:30',
  '17:00',
];

function PollPageContent({ id }: { id: string }) {
  const [poll, setPoll] = useState<Poll | null>(null);
  const [participantName, setParticipantName] = useState('');
  const [participantTimezone, setParticipantTimezone] = useState('');
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState<'select' | 'availability'>('select');
  const [timezoneSelected, setTimezoneSelected] = useState(false);
  const [timezoneChecked, setTimezoneChecked] = useState(false);

  // Drag selection state
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{
    date: string;
    timeSlot: string;
  } | null>(null);
  const [dragEnd, setDragEnd] = useState<{
    date: string;
    timeSlot: string;
  } | null>(null);
  const [dragAction, setDragAction] = useState<'select' | 'deselect' | null>(
    null
  );
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if timezone is set in sessionStorage
    const storedTimezone = sessionStorage.getItem(`poll-${id}-timezone`);
    if (!storedTimezone) {
      // Redirect to timezone selection page
      window.location.href = `/poll/${id}/timezone`;
      return;
    }

    setParticipantTimezone(storedTimezone);
    setTimezoneSelected(true);
    setTimezoneChecked(true);
  }, [id]);

  // Fetch poll data when timezone is available
  useEffect(() => {
    if (participantTimezone && timezoneSelected) {
      fetchPoll();
    }
  }, [participantTimezone, timezoneSelected]);

  const fetchPoll = async () => {
    try {
      setLoading(true);
      // Include participant timezone in the request if available
      const url = participantTimezone
        ? `/api/polls/${id}?timezone=${encodeURIComponent(participantTimezone)}`
        : `/api/polls/${id}`;

      console.log('Fetching poll with URL:', url);
      console.log('Participant timezone:', participantTimezone);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Poll not found');
      }

      const data = await response.json();
      console.log('Poll data received:', data);
      console.log('Time slots count:', data.timeSlots?.length || 0);

      setPoll(data);
    } catch (err) {
      console.error('Error fetching poll:', err);
      setError(err instanceof Error ? err.message : 'Failed to load poll');
    } finally {
      setLoading(false);
    }
  };

  const formatDateForDisplay = useCallback(
    (dateStr: string) => {
      try {
        return formatInTimeZone(
          parseISO(dateStr),
          participantTimezone || poll?.organizerTimezone || 'UTC',
          'MMM dd'
        );
      } catch {
        return format(parseISO(dateStr), 'MMM dd');
      }
    },
    [participantTimezone, poll?.organizerTimezone]
  );

  const formatTimeForDisplay = useCallback(
    (timeStr: string) => {
      try {
        const time = new Date(`2000-01-01T${timeStr}`);
        return formatInTimeZone(
          time,
          participantTimezone || poll?.organizerTimezone || 'UTC',
          'h:mm a'
        );
      } catch {
        return format(new Date(`2000-01-01T${timeStr}`), 'h:mm a');
      }
    },
    [participantTimezone, poll?.organizerTimezone]
  );

  const isTimeSlotSelected = useCallback(
    (date: string, timeSlot: string) => {
      const slotKey = `${date}-${timeSlot}`;
      return selectedSlots.includes(slotKey);
    },
    [selectedSlots]
  );

  const getTimeSlotIndex = useCallback((timeSlot: string) => {
    return TIME_SLOTS.indexOf(timeSlot);
  }, []);

  const getDateIndex = useCallback(
    (date: string) => {
      if (!poll) return -1;
      const dates = Array.from(
        new Set(poll.timeSlots.map((slot) => slot.date))
      ).sort();
      return dates.indexOf(date);
    },
    [poll]
  );

  const isInDragRange = useCallback(
    (date: string, timeSlot: string) => {
      if (!dragStart || !dragEnd) return false;

      const startDateIndex = getDateIndex(dragStart.date);
      const endDateIndex = getDateIndex(dragEnd.date);
      const startTimeIndex = getTimeSlotIndex(dragStart.timeSlot);
      const endTimeIndex = getTimeSlotIndex(dragEnd.timeSlot);

      const currentDateIndex = getDateIndex(date);
      const currentTimeIndex = getTimeSlotIndex(timeSlot);

      const minDateIndex = Math.min(startDateIndex, endDateIndex);
      const maxDateIndex = Math.max(startDateIndex, endDateIndex);
      const minTimeIndex = Math.min(startTimeIndex, endTimeIndex);
      const maxTimeIndex = Math.max(startTimeIndex, endTimeIndex);

      return (
        currentDateIndex >= minDateIndex &&
        currentDateIndex <= maxDateIndex &&
        currentTimeIndex >= minTimeIndex &&
        currentTimeIndex <= maxTimeIndex
      );
    },
    [dragStart, dragEnd, getDateIndex, getTimeSlotIndex]
  );

  const handleMouseDown = useCallback(
    (date: string, timeSlot: string) => {
      if (!timezoneSelected) return;

      const isSelected = isTimeSlotSelected(date, timeSlot);
      const action = isSelected ? 'deselect' : 'select';

      setIsDragging(true);
      setDragStart({ date, timeSlot });
      setDragEnd({ date, timeSlot });
      setDragAction(action);

      // Create a unique identifier for this date/time combination
      const slotKey = `${date}-${timeSlot}`;

      if (isSelected) {
        // Remove from selected slots
        setSelectedSlots((prev) => prev.filter((id) => id !== slotKey));
      } else {
        // Add to selected slots
        setSelectedSlots((prev) => [...prev, slotKey]);
      }
    },
    [isTimeSlotSelected, timezoneSelected]
  );

  const handleMouseEnter = useCallback(
    (date: string, timeSlot: string) => {
      if (isDragging && dragStart && dragAction) {
        setDragEnd({ date, timeSlot });
      }
    },
    [isDragging, dragStart, dragAction]
  );

  const handleMouseUp = useCallback(() => {
    if (isDragging && dragStart && dragEnd && dragAction && poll) {
      // Apply the drag selection
      const startDateIndex = getDateIndex(dragStart.date);
      const endDateIndex = getDateIndex(dragEnd.date);
      const startTimeIndex = getTimeSlotIndex(dragStart.timeSlot);
      const endTimeIndex = getTimeSlotIndex(dragEnd.timeSlot);

      const minDateIndex = Math.min(startDateIndex, endDateIndex);
      const maxDateIndex = Math.max(startDateIndex, endDateIndex);
      const minTimeIndex = Math.min(startTimeIndex, endTimeIndex);
      const maxTimeIndex = Math.max(startTimeIndex, endTimeIndex);

      const dates = Array.from(
        new Set(poll.timeSlots.map((slot) => slot.date))
      ).sort();

      if (dragAction === 'deselect') {
        // Remove slots in the range
        setSelectedSlots((prev) =>
          prev.filter((id) => {
            const [date, timeSlot] = id.split('-');
            if (date && timeSlot) {
              const slotDateIndex = getDateIndex(date);
              const slotTimeIndex = getTimeSlotIndex(timeSlot);
              return !(
                slotDateIndex >= minDateIndex &&
                slotDateIndex <= maxDateIndex &&
                slotTimeIndex >= minTimeIndex &&
                slotTimeIndex <= maxTimeIndex
              );
            }
            return true; // Keep other IDs
          })
        );
      } else {
        // Add slots in the range
        const newSlots: string[] = [];

        for (
          let dateIndex = minDateIndex;
          dateIndex <= maxDateIndex;
          dateIndex++
        ) {
          for (
            let timeIndex = minTimeIndex;
            timeIndex <= maxTimeIndex;
            timeIndex++
          ) {
            const date = pollDates[dateIndex];
            const timeSlot = TIME_SLOTS[timeIndex];
            if (date && timeSlot) {
              newSlots.push(`${date}-${timeSlot}`);
            }
          }
        }

        setSelectedSlots((prev) => {
          const combined = [...prev, ...newSlots];
          return Array.from(new Set(combined)); // Remove duplicates
        });
      }
    }

    setIsDragging(false);
    setDragStart(null);
    setDragEnd(null);
    setDragAction(null);
  }, [
    isDragging,
    dragStart,
    dragEnd,
    dragAction,
    getDateIndex,
    getTimeSlotIndex,
    poll,
  ]);

  const getAvailabilityPercentage = useCallback(
    (date: string, timeSlot: string) => {
      if (!poll) return 0;

      const slotKey = `${date}-${timeSlot}`;
      let totalParticipants = 0;
      let availableParticipants = 0;

      // Count creator (their time slots represent their availability)
      totalParticipants += 1;
      const creatorIsAvailable = poll.timeSlots.some(
        (slot) => slot.date === date && slot.startTime === timeSlot
      );
      if (creatorIsAvailable) {
        availableParticipants += 1;
      }

      // Count other participants
      if (poll.participants && poll.participants.length > 0) {
        totalParticipants += poll.participants.length;

        availableParticipants += poll.participants.filter((participant) =>
          participant.availability?.some(
            (avail) =>
              avail.timeSlotId === slotKey ||
              (avail.timeSlotId &&
                poll.timeSlots.find(
                  (slot) =>
                    slot.id === avail.timeSlotId &&
                    slot.date === date &&
                    slot.startTime === timeSlot
                ))
          )
        ).length;
      }

      // Include current user's selection only if they've made selections
      if (selectedSlots.length > 0) {
        totalParticipants += 1;
        if (selectedSlots.includes(slotKey)) {
          availableParticipants += 1;
        }
      }

      return totalParticipants > 0
        ? (availableParticipants / totalParticipants) * 100
        : 0;
    },
    [poll, selectedSlots]
  );

  const getAvailableCount = useCallback(
    (date: string, timeSlot: string) => {
      if (!poll) return 0;
      const slotKey = `${date}-${timeSlot}`;
      let count = 0;

      // Count creator
      const creatorIsAvailable = poll.timeSlots.some(
        (slot) => slot.date === date && slot.startTime === timeSlot
      );
      if (creatorIsAvailable) count += 1;

      // Count other participants
      if (poll.participants && poll.participants.length > 0) {
        count += poll.participants.filter((participant) =>
          participant.availability?.some(
            (avail) =>
              avail.timeSlotId === slotKey ||
              (avail.timeSlotId &&
                poll.timeSlots.find(
                  (slot) =>
                    slot.id === avail.timeSlotId &&
                    slot.date === date &&
                    slot.startTime === timeSlot
                ))
          )
        ).length;
      }

      // Count current user if they've made selections
      if (selectedSlots.length > 0 && selectedSlots.includes(slotKey)) {
        count += 1;
      }

      return count;
    },
    [poll, selectedSlots]
  );

  const getTotalCount = useCallback(
    (date: string, timeSlot: string) => {
      if (!poll) return 0;
      let count = 1; // Creator (always included)
      if (poll.participants && poll.participants.length > 0) {
        count += poll.participants.length; // Other participants
      }
      // Only count current user if they've made selections
      if (selectedSlots.length > 0) {
        count += 1;
      }
      return count;
    },
    [poll, selectedSlots]
  );

  const handleSubmitVote = async () => {
    if (!participantName.trim()) {
      setError('Please provide your name');
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch(`/api/polls/${id}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: participantName,
          timezone: participantTimezone,
          selectedSlots,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit vote');
      }

      // Reset form and show success message
      setParticipantName('');
      setSelectedSlots([]);
      setError(null);
      alert('Vote submitted successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit vote');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !timezoneChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground-600">Loading poll...</p>
        </div>
      </div>
    );
  }

  if (error || !poll) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Poll Not Found
          </h1>
          <p className="text-foreground-600 mb-6">
            {error || 'The poll you are looking for does not exist.'}
          </p>
          <Button color="primary" href="/">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  // Get all available dates from the poll (creator's selected date range)
  const pollDates = Array.from(
    new Set(poll.timeSlots.map((slot) => slot.date))
  ).sort();

  // If no time slots are available after timezone conversion, show a message
  if (poll.timeSlots.length === 0) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-6xl mx-auto space-y-8">
          <Card className="w-full">
            <CardHeader className="pb-0">
              <div className="w-full">
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  {poll.title}
                </h1>
                {poll.description && (
                  <p className="text-foreground-600 text-lg">
                    {poll.description}
                  </p>
                )}
              </div>
            </CardHeader>
          </Card>

          <Card className="w-full">
            <CardBody className="p-8 text-center">
              <div className="space-y-4">
                <div className="text-6xl">🕐</div>
                <h2 className="text-2xl font-semibold text-foreground">
                  No Available Time Slots
                </h2>
                <p className="text-foreground-600 max-w-md mx-auto">
                  The time slots for this poll don&apos;t align with business
                  hours (9 AM - 5 PM) in your timezone ({participantTimezone}).
                </p>
                <div className="pt-4">
                  <Button
                    color="primary"
                    onPress={() =>
                      (window.location.href = `/poll/${id}/timezone`)
                    }
                    className="text-white"
                  >
                    Change Timezone
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Poll Header */}
        <Card className="w-full">
          <CardHeader className="pb-0">
            <div className="w-full">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {poll.title}
              </h1>
              {poll.description && (
                <p className="text-foreground-600 text-lg">
                  {poll.description}
                </p>
              )}
              <div className="flex items-center gap-4 mt-4">
                <Chip
                  color="primary"
                  variant="flat"
                  startContent={<CalendarIcon className="w-4 h-4" />}
                >
                  {poll.timeSlots.length} time slots
                </Chip>
                <Chip
                  color="secondary"
                  variant="flat"
                  startContent={<UserIcon className="w-4 h-4" />}
                >
                  {poll.participants?.length || 0} participants
                </Chip>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Time Slots Grid */}
        <Card className="w-full">
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <h2 className="text-xl font-semibold text-foreground">
                {viewMode === 'select'
                  ? 'Select Your Availability'
                  : 'Group Availability'}
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-sm text-foreground-600">View:</span>
                <Button
                  size="sm"
                  variant={viewMode === 'select' ? 'solid' : 'bordered'}
                  color="primary"
                  onPress={() => setViewMode('select')}
                  className={viewMode === 'select' ? 'text-white' : ''}
                >
                  My Selection
                </Button>
                <Button
                  size="sm"
                  variant={viewMode === 'availability' ? 'solid' : 'bordered'}
                  color="primary"
                  onPress={() => setViewMode('availability')}
                  className={viewMode === 'availability' ? 'text-white' : ''}
                >
                  Group View
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              <div
                ref={gridRef}
                className="overflow-x-auto overflow-y-auto max-h-96"
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                <div className="min-w-max">
                  {/* Header Row */}
                  <div
                    className="grid gap-1 mb-2"
                    style={{
                      gridTemplateColumns: `120px repeat(${pollDates.length}, 1fr)`,
                    }}
                  >
                    <div className="h-8"></div> {/* Empty corner */}
                    {pollDates.map((date) => (
                      <div
                        key={date}
                        className="h-8 flex items-center justify-center text-sm font-medium text-foreground bg-foreground-50 rounded-lg"
                      >
                        {formatDateForDisplay(date)}
                      </div>
                    ))}
                  </div>

                  {/* Time Slots Grid */}
                  <div
                    className="grid gap-1"
                    style={{
                      gridTemplateColumns: `120px repeat(${pollDates.length}, 1fr)`,
                    }}
                  >
                    {TIME_SLOTS.map((timeSlot) => (
                      <React.Fragment key={timeSlot}>
                        {/* Time Label */}
                        <div className="h-8 flex items-center justify-end pr-3 text-sm text-foreground-600 font-medium">
                          {formatTimeForDisplay(timeSlot)}
                        </div>

                        {/* Time Slot Cells */}
                        {pollDates.map((date) => {
                          const isSelected = isTimeSlotSelected(date, timeSlot);
                          const isInDrag = isInDragRange(date, timeSlot);
                          const availabilityPercentage =
                            getAvailabilityPercentage(date, timeSlot);

                          // Calculate heat map color based on availability percentage
                          const getHeatMapColor = (percentage: number) => {
                            if (percentage === 0) return 'transparent';
                            // Use percentage directly for opacity (0.1 to 1.0)
                            const opacity = Math.max(0.1, percentage / 100);
                            return `rgba(59, 130, 246, ${opacity})`; // Blue with percentage-based opacity
                          };

                          return (
                            <button
                              key={`${date}-${timeSlot}`}
                              onMouseDown={() =>
                                handleMouseDown(date, timeSlot)
                              }
                              onMouseEnter={() =>
                                handleMouseEnter(date, timeSlot)
                              }
                              disabled={!timezoneSelected}
                              className={`
                                 h-8 border border-divider rounded transition-all duration-150 relative
                                 ${
                                   !timezoneSelected
                                     ? 'bg-foreground-100 cursor-not-allowed opacity-50'
                                     : viewMode === 'availability'
                                       ? 'cursor-pointer'
                                       : isSelected || isInDrag
                                         ? 'bg-primary-500 border-primary-600'
                                         : 'bg-foreground-50 hover:bg-foreground-100 cursor-pointer'
                                 }
                                 ${isDragging && timezoneSelected ? 'cursor-crosshair' : ''}
                               `}
                              style={{
                                backgroundColor:
                                  viewMode === 'availability' &&
                                  timezoneSelected
                                    ? getHeatMapColor(availabilityPercentage)
                                    : undefined,
                              }}
                              title={
                                viewMode === 'availability' && timezoneSelected
                                  ? `${getAvailableCount(date, timeSlot)}/${getTotalCount(date, timeSlot)} participants available`
                                  : undefined
                              }
                            >
                              {viewMode === 'availability' &&
                                timezoneSelected &&
                                availabilityPercentage > 0 && (
                                  <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white drop-shadow-sm">
                                    {getAvailableCount(date, timeSlot)}/
                                    {getTotalCount(date, timeSlot)}
                                  </span>
                                )}
                            </button>
                          );
                        })}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>

              <p className="text-sm text-foreground-500 text-center">
                {!timezoneSelected
                  ? 'Please select your timezone first to view and select time slots'
                  : viewMode === 'select'
                    ? 'Select any time slots on the available dates. Click and drag to select multiple.'
                    : 'Darker blue indicates more participants are available. Hover for details.'}
              </p>
            </div>
          </CardBody>
        </Card>

        {/* Participant Form */}
        <Card className="w-full">
          <CardHeader>
            <h2 className="text-xl font-semibold text-foreground">
              Submit Your Vote
            </h2>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              <Input
                label="Your Name"
                placeholder="Enter your name"
                value={participantName}
                onChange={(e) => setParticipantName(e.target.value)}
                isRequired
                className="w-full"
              />

              <div className="p-4 bg-primary-50 border border-primary-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <GlobeAltIcon className="w-5 h-5 text-primary-600" />
                  <span className="text-sm font-medium text-primary-700">
                    Your timezone: {participantTimezone}
                  </span>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-danger-50 border border-danger-200 rounded-lg">
                  <p className="text-danger text-sm font-medium">{error}</p>
                </div>
              )}

              <div className="flex items-center justify-between">
                <p className="text-sm text-foreground-600">
                  Selected: {selectedSlots.length} time slot
                  {selectedSlots.length !== 1 ? 's' : ''}
                </p>
                <Button
                  color="primary"
                  onPress={handleSubmitVote}
                  isLoading={submitting}
                  disabled={selectedSlots.length === 0}
                  className="text-white"
                >
                  Submit Vote
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

export default function PollPage({ params }: PollPageProps) {
  const [id, setId] = React.useState<string>('');

  React.useEffect(() => {
    params.then((p) => setId(p.id));
  }, [params]);

  if (!id) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground-600">Loading...</p>
        </div>
      </div>
    );
  }

  return <PollPageContent id={id} />;
}
