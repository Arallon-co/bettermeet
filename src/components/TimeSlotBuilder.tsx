'use client';

import React, { useState, useCallback, useMemo, useRef } from 'react';
import { Card, CardBody, Button } from '@nextui-org/react';
import { format, parseISO } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { generateBusinessHoursTimeSlots } from '@/lib/timezone';
import { XMarkIcon } from '@heroicons/react/24/outline';
import type { TimeSlot } from '@/types/poll';

interface TimeSlotBuilderProps {
  selectedDates: string[];
  timeSlots: Omit<TimeSlot, 'id'>[];
  onChange: (timeSlots: Omit<TimeSlot, 'id'>[]) => void;
  organizerTimezone: string;
  error?: string;
  className?: string;
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

export function TimeSlotBuilder({
  selectedDates,
  timeSlots,
  onChange,
  organizerTimezone,
  error,
  className = '',
}: TimeSlotBuilderProps) {
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

  // Auto-generate all business hours time slots when dates change
  React.useEffect(() => {
    if (selectedDates.length > 0 && timeSlots.length === 0) {
      const allBusinessHours = generateBusinessHoursTimeSlots(
        selectedDates,
        organizerTimezone
      );
      onChange(allBusinessHours);
    }
  }, [selectedDates, timeSlots.length, organizerTimezone, onChange]);

  const formatDateForDisplay = useCallback(
    (dateStr: string) => {
      try {
        return formatInTimeZone(parseISO(dateStr), organizerTimezone, 'MMM dd');
      } catch {
        return format(parseISO(dateStr), 'MMM dd');
      }
    },
    [organizerTimezone]
  );

  const formatTimeForDisplay = useCallback(
    (timeStr: string) => {
      try {
        const time = new Date(`2000-01-01T${timeStr}`);
        return formatInTimeZone(time, organizerTimezone, 'h:mm a');
      } catch {
        return format(new Date(`2000-01-01T${timeStr}`), 'h:mm a');
      }
    },
    [organizerTimezone]
  );

  const isTimeSlotSelected = useCallback(
    (date: string, timeSlot: string) => {
      return timeSlots.some(
        (slot) => slot.date === date && slot.startTime === timeSlot
      );
    },
    [timeSlots]
  );

  const getTimeSlotIndex = useCallback((timeSlot: string) => {
    return TIME_SLOTS.indexOf(timeSlot);
  }, []);

  const getDateIndex = useCallback(
    (date: string) => {
      return selectedDates.indexOf(date);
    },
    [selectedDates]
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
      const isSelected = isTimeSlotSelected(date, timeSlot);
      const action = isSelected ? 'deselect' : 'select';

      setIsDragging(true);
      setDragStart({ date, timeSlot });
      setDragEnd({ date, timeSlot });
      setDragAction(action);

      // Toggle the clicked slot immediately
      if (isSelected) {
        const filtered = timeSlots.filter(
          (slot) => !(slot.date === date && slot.startTime === timeSlot)
        );
        onChange(filtered);
      } else {
        const endTime = format(
          new Date(`2000-01-01T${timeSlot}`).getTime() + 30 * 60000,
          'HH:mm'
        );
        onChange([...timeSlots, { date, startTime: timeSlot, endTime }]);
      }
    },
    [isTimeSlotSelected, timeSlots, onChange]
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
    if (isDragging && dragStart && dragEnd && dragAction) {
      // Apply the drag selection
      const startDateIndex = getDateIndex(dragStart.date);
      const endDateIndex = getDateIndex(dragEnd.date);
      const startTimeIndex = getTimeSlotIndex(dragStart.timeSlot);
      const endTimeIndex = getTimeSlotIndex(dragEnd.timeSlot);

      const minDateIndex = Math.min(startDateIndex, endDateIndex);
      const maxDateIndex = Math.max(startDateIndex, endDateIndex);
      const minTimeIndex = Math.min(startTimeIndex, endTimeIndex);
      const maxTimeIndex = Math.max(startTimeIndex, endTimeIndex);

      if (dragAction === 'deselect') {
        // Remove slots in the range
        const filtered = timeSlots.filter((slot) => {
          const slotDateIndex = getDateIndex(slot.date);
          const slotTimeIndex = getTimeSlotIndex(slot.startTime);
          return !(
            slotDateIndex >= minDateIndex &&
            slotDateIndex <= maxDateIndex &&
            slotTimeIndex >= minTimeIndex &&
            slotTimeIndex <= maxTimeIndex
          );
        });
        onChange(filtered);
      } else {
        // Add slots in the range
        const newSlots = [...timeSlots];
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
            const date = selectedDates[dateIndex];
            const timeSlot = TIME_SLOTS[timeIndex];
            if (date && timeSlot) {
              const endTime = format(
                new Date(`2000-01-01T${timeSlot}`).getTime() + 30 * 60000,
                'HH:mm'
              );
              const slotExists = newSlots.some(
                (slot) => slot.date === date && slot.startTime === timeSlot
              );
              if (!slotExists) {
                newSlots.push({ date, startTime: timeSlot, endTime });
              }
            }
          }
        }
        onChange(newSlots);
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
    timeSlots,
    onChange,
    selectedDates,
  ]);

  const clearAllSlots = useCallback(() => {
    onChange([]);
  }, [onChange]);

  // Don't render if no dates are selected
  if (selectedDates.length === 0) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="text-center p-8 bg-foreground-50 rounded-lg">
          <p className="text-foreground-500">
            Please select dates first to configure time slots
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Availability Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold text-foreground">
            Business Hours Time Slots ({selectedDates.length} days)
          </h4>
          <Button
            variant="light"
            color="danger"
            onPress={clearAllSlots}
            className="min-h-[40px]"
            startContent={<XMarkIcon className="w-4 h-4" />}
          >
            Clear All
          </Button>
        </div>

        <div
          ref={gridRef}
          className="overflow-x-auto"
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div className="min-w-max">
            {/* Header Row */}
            <div
              className="grid gap-1 mb-2"
              style={{
                gridTemplateColumns: `120px repeat(${selectedDates.length}, 1fr)`,
              }}
            >
              <div className="h-8"></div> {/* Empty corner */}
              {selectedDates.map((date) => (
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
                gridTemplateColumns: `120px repeat(${selectedDates.length}, 1fr)`,
              }}
            >
              {TIME_SLOTS.map((timeSlot) => (
                <React.Fragment key={timeSlot}>
                  {/* Time Label */}
                  <div className="h-8 flex items-center justify-end pr-3 text-sm text-foreground-600 font-medium">
                    {formatTimeForDisplay(timeSlot)}
                  </div>

                  {/* Time Slot Cells */}
                  {selectedDates.map((date) => {
                    const isSelected = isTimeSlotSelected(date, timeSlot);
                    const isInDrag = isInDragRange(date, timeSlot);
                    return (
                      <button
                        key={`${date}-${timeSlot}`}
                        onMouseDown={() => handleMouseDown(date, timeSlot)}
                        onMouseEnter={() => handleMouseEnter(date, timeSlot)}
                        className={`
                                                    h-8 border border-divider rounded transition-all duration-150
                                                    ${
                                                      isSelected || isInDrag
                                                        ? 'bg-primary-500 border-primary-600'
                                                        : 'bg-foreground-50 hover:bg-foreground-100'
                                                    }
                                                    ${isDragging ? 'cursor-crosshair' : 'cursor-pointer'}
                                                `}
                      />
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        <p className="text-sm text-foreground-500 text-center">
          Click and drag to select/deselect time slots during business hours (9
          AM - 5 PM)
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-danger-50 border border-danger-200 rounded-lg">
          <p className="text-danger text-sm font-medium">{error}</p>
        </div>
      )}
    </div>
  );
}
