'use client';

import React, { useMemo } from 'react';
import { Button, Card, CardBody, Chip } from '@nextui-org/react';
import { format, addDays } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { CalendarIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface SimpleDateSelectorProps {
  selectedDates: string[];
  onChange: (dates: string[]) => void;
  organizerTimezone: string;
  error?: string;
  className?: string;
}

export function SimpleDateSelector({
  selectedDates,
  onChange,
  organizerTimezone,
  error,
  className = '',
}: SimpleDateSelectorProps) {
  // Generate date options based on current date
  const dateOptions = useMemo(() => {
    const today = new Date();

    return [
      {
        label: 'Tomorrow',
        description: 'Next 1 day',
        dates: [format(addDays(today, 1), 'yyyy-MM-dd')],
        icon: '📅',
      },
      {
        label: 'Next 3 Days',
        description: 'Starting tomorrow',
        dates: [
          format(addDays(today, 1), 'yyyy-MM-dd'),
          format(addDays(today, 2), 'yyyy-MM-dd'),
          format(addDays(today, 3), 'yyyy-MM-dd'),
        ],
        icon: '📆',
      },
      {
        label: 'Next 7 Days',
        description: 'Starting tomorrow',
        dates: Array.from({ length: 7 }, (_, i) =>
          format(addDays(today, i + 1), 'yyyy-MM-dd')
        ),
        icon: '🗓️',
      },
    ];
  }, []);

  const handleOptionSelect = (dates: string[]) => {
    onChange(dates);
  };

  const clearSelection = () => {
    onChange([]);
  };

  const formatDateForDisplay = (dateStr: string) => {
    try {
      return formatInTimeZone(new Date(dateStr), organizerTimezone, 'MMM dd');
    } catch {
      return format(new Date(dateStr), 'MMM dd');
    }
  };

  const getSelectedOption = () => {
    if (selectedDates.length === 0) return null;

    return dateOptions.find(
      (option) =>
        option.dates.length === selectedDates.length &&
        option.dates.every((date) => selectedDates.includes(date))
    );
  };

  const selectedOption = getSelectedOption();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Date Range Options */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <CalendarIcon className="w-6 h-6 text-primary-600" />
          <h4 className="text-lg font-semibold text-foreground">
            Select Date Range
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {dateOptions.map((option, index) => {
            const isSelected = selectedOption?.label === option.label;

            return (
              <Card
                key={index}
                className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
                  isSelected
                    ? 'ring-2 ring-primary-500 bg-primary-50 border-primary-200'
                    : 'hover:bg-foreground-50'
                }`}
                isPressable
                onPress={() => handleOptionSelect(option.dates)}
              >
                <CardBody className="p-6 text-center">
                  <div className="text-3xl mb-3">{option.icon}</div>
                  <h3
                    className={`text-lg font-semibold mb-2 ${
                      isSelected ? 'text-primary-700' : 'text-foreground'
                    }`}
                  >
                    {option.label}
                  </h3>
                  <p
                    className={`text-sm ${
                      isSelected ? 'text-primary-600' : 'text-foreground-600'
                    }`}
                  >
                    {option.description}
                  </p>
                  <div className="mt-3 text-xs text-foreground-500">
                    {option.dates.length} day
                    {option.dates.length !== 1 ? 's' : ''}
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>

        {selectedDates.length > 0 && (
          <div className="flex justify-end">
            <Button
              variant="light"
              color="danger"
              onPress={clearSelection}
              className="min-h-[40px]"
              startContent={<XMarkIcon className="w-4 h-4" />}
            >
              Clear Selection
            </Button>
          </div>
        )}
      </div>

      {/* Selected Dates Summary */}
      {selectedDates.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-foreground">
              Selected Dates ({selectedDates.length})
            </h4>
          </div>

          <div className="flex flex-wrap gap-2">
            {selectedDates.map((dateStr) => (
              <Chip
                key={dateStr}
                variant="flat"
                color="primary"
                className="text-sm font-medium px-3 py-1"
                startContent={<CalendarIcon className="w-4 h-4" />}
              >
                {formatDateForDisplay(dateStr)}
              </Chip>
            ))}
          </div>

          <div className="p-4 bg-primary-50 border border-primary-200 rounded-lg">
            <p className="text-sm text-primary-700">
              <strong>Time slots:</strong> 9:00 AM - 5:00 PM in your timezone (
              {organizerTimezone})
            </p>
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
