'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Button, Chip, Card, CardBody } from '@nextui-org/react';
import {
  format,
  addDays,
  startOfMonth,
  endOfMonth,
  isSameDay,
  parseISO,
  isAfter,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isToday,
  isSameMonth,
} from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

interface DateRangePickerProps {
  selectedDates: string[];
  onChange: (dates: string[]) => void;
  organizerTimezone: string;
  error?: string;
  className?: string;
  maxDates?: number;
  minDate?: Date;
}

interface CalendarProps {
  selectedDates: string[];
  onDateSelect: (date: Date) => void;
  minDate: Date;
  maxDates: number;
}

function Calendar({
  selectedDates,
  onDateSelect,
  minDate,
  maxDates,
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const isDateSelected = (date: Date) => {
    return selectedDates.includes(format(date, 'yyyy-MM-dd'));
  };

  const isDateDisabled = (date: Date) => {
    return !isAfter(date, minDate) && !isSameDay(date, minDate);
  };

  const handleDateClick = (date: Date) => {
    if (isDateDisabled(date)) return;
    onDateSelect(date);
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="w-full">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-8">
        <Button
          variant="light"
          size="sm"
          onPress={prevMonth}
          className="min-h-[40px] w-[40px] p-0 text-foreground-600 hover:bg-foreground-100"
        >
          <ChevronLeftIcon className="w-5 h-5" />
        </Button>

        <h3 className="text-xl font-semibold text-foreground">
          {format(currentMonth, 'MMMM yyyy')}
        </h3>

        <Button
          variant="light"
          size="sm"
          onPress={nextMonth}
          className="min-h-[40px] w-[40px] p-0 text-foreground-600 hover:bg-foreground-100"
        >
          <ChevronRightIcon className="w-5 h-5" />
        </Button>
      </div>

      {/* Week Days Header */}
      <div className="grid grid-cols-7 gap-2 mb-4">
        {weekDays.map((day) => (
          <div
            key={day}
            className="h-10 flex items-center justify-center text-sm font-medium text-foreground-500"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => {
          const isSelected = isDateSelected(day);
          const isDisabled = isDateDisabled(day);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isTodayDate = isToday(day);

          return (
            <button
              key={day.toISOString()}
              onClick={() => handleDateClick(day)}
              disabled={isDisabled}
              className={`
                h-12 w-full rounded-xl text-sm font-medium transition-all duration-200
                flex items-center justify-center relative
                ${
                  isDisabled
                    ? 'text-foreground-300 cursor-not-allowed'
                    : 'hover:bg-foreground-100 hover:scale-105 cursor-pointer active:scale-95'
                }
                ${
                  isSelected
                    ? 'bg-primary-500 text-white shadow-lg hover:bg-primary-600 ring-2 ring-primary-200'
                    : isCurrentMonth
                      ? 'text-foreground'
                      : 'text-foreground-400'
                }
                ${!isCurrentMonth ? 'opacity-40' : ''}
                ${isTodayDate && !isSelected ? 'ring-2 ring-primary-300 bg-primary-50' : ''}
              `}
            >
              {format(day, 'd')}
              {isTodayDate && !isSelected && (
                <div className="absolute -bottom-1 w-1 h-1 bg-primary-500 rounded-full"></div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function DateRangePicker({
  selectedDates,
  onChange,
  organizerTimezone,
  error,
  className = '',
  maxDates = 30,
  minDate = new Date(),
}: DateRangePickerProps) {
  // Enhanced quick selections
  const quickSelections = useMemo(() => {
    const today = new Date();

    return [
      {
        label: 'Today',
        dates: [format(today, 'yyyy-MM-dd')],
        icon: '📅',
      },
      {
        label: 'Next 3 days',
        dates: [today, addDays(today, 1), addDays(today, 2)].map((date) =>
          format(date, 'yyyy-MM-dd')
        ),
        icon: '📆',
      },
      {
        label: 'This week',
        dates: Array.from({ length: 7 }, (_, i) =>
          format(addDays(today, i), 'yyyy-MM-dd')
        ),
        icon: '📅',
      },
      {
        label: 'Next week',
        dates: Array.from({ length: 7 }, (_, i) =>
          format(addDays(today, i + 7), 'yyyy-MM-dd')
        ),
        icon: '📆',
      },
    ];
  }, []);

  const handleDateSelect = useCallback(
    (date: Date) => {
      const dateString = format(date, 'yyyy-MM-dd');
      const isSelected = selectedDates.includes(dateString);

      if (isSelected) {
        onChange(selectedDates.filter((d) => d !== dateString));
      } else {
        if (selectedDates.length >= maxDates) return;
        onChange([...selectedDates, dateString]);
      }
    },
    [selectedDates, onChange, maxDates]
  );

  const handleQuickSelect = useCallback(
    (dates: string[]) => {
      const validDates = dates.filter((dateStr) => {
        const dateObj = parseISO(dateStr);
        return isAfter(dateObj, minDate) || isSameDay(dateObj, minDate);
      });

      const newDates = [...selectedDates];
      validDates.forEach((dateStr) => {
        if (!newDates.includes(dateStr) && newDates.length < maxDates) {
          newDates.push(dateStr);
        }
      });

      onChange(newDates);
    },
    [selectedDates, onChange, maxDates, minDate]
  );

  const clearAllDates = useCallback(() => {
    onChange([]);
  }, [onChange]);

  const removeDate = useCallback(
    (dateStr: string) => {
      onChange(selectedDates.filter((d) => d !== dateStr));
    },
    [selectedDates, onChange]
  );

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

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Quick Selection Buttons */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <CalendarIcon className="w-6 h-6 text-primary-600" />
          <h4 className="text-lg font-semibold text-foreground">
            Quick Select
          </h4>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickSelections.map((selection, index) => (
            <Button
              key={index}
              variant="bordered"
              color="primary"
              onPress={() => handleQuickSelect(selection.dates)}
              className="min-h-[48px] text-sm font-medium"
              startContent={<span className="text-lg">{selection.icon}</span>}
            >
              {selection.label}
            </Button>
          ))}
        </div>

        {selectedDates.length > 0 && (
          <div className="flex justify-end">
            <Button
              variant="light"
              color="danger"
              onPress={clearAllDates}
              className="min-h-[40px]"
              startContent={<XMarkIcon className="w-4 h-4" />}
            >
              Clear All
            </Button>
          </div>
        )}
      </div>

      {/* Calendar */}
      <Card className="w-full border border-divider shadow-sm">
        <CardBody className="p-8">
          <Calendar
            selectedDates={selectedDates}
            onDateSelect={handleDateSelect}
            minDate={minDate}
            maxDates={maxDates}
          />
        </CardBody>
      </Card>

      {/* Selected Dates Summary */}
      {selectedDates.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-foreground">
              Selected Dates ({selectedDates.length}/{maxDates})
            </h4>
            <span className="text-sm text-foreground-500">Click to remove</span>
          </div>

          <div className="flex flex-wrap gap-3">
            {selectedDates.map((dateStr) => (
              <Chip
                key={dateStr}
                variant="flat"
                color="primary"
                onClose={() => removeDate(dateStr)}
                className="cursor-pointer text-sm font-medium px-4 py-2"
                startContent={<CalendarIcon className="w-4 h-4" />}
              >
                {formatDateForDisplay(dateStr)}
              </Chip>
            ))}
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-danger-50 border border-danger-200 rounded-lg">
          <p className="text-danger text-sm font-medium">{error}</p>
        </div>
      )}
    </div>
  );
}
