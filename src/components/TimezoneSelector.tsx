'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Input,
  Button,
  Chip,
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@nextui-org/react';
import {
  ClockIcon,
  GlobeAltIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import { formatInTimeZone } from 'date-fns-tz';

interface TimezoneSelectorProps {
  value: string;
  onChange: (timezone: string) => void;
  label?: string;
  showCurrentTime?: boolean;
  isRequired?: boolean;
  className?: string;
}

export function TimezoneSelector({
  value,
  onChange,
  label = 'Timezone',
  showCurrentTime = false,
  isRequired = false,
  className = '',
}: TimezoneSelectorProps) {
  const [currentTimezone, setCurrentTimezone] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  // Common timezones with their display names
  const timezones = useMemo(
    () => [
      { value: 'America/New_York', label: 'Eastern Time (ET)' },
      { value: 'America/Chicago', label: 'Central Time (CT)' },
      { value: 'America/Denver', label: 'Mountain Time (MT)' },
      { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
      { value: 'America/Anchorage', label: 'Alaska Time (AKT)' },
      { value: 'Pacific/Honolulu', label: 'Hawaii Time (HST)' },
      { value: 'Europe/London', label: 'Greenwich Mean Time (GMT)' },
      { value: 'Europe/Paris', label: 'Central European Time (CET)' },
      { value: 'Europe/Berlin', label: 'Central European Time (CET)' },
      { value: 'Europe/Moscow', label: 'Moscow Time (MSK)' },
      { value: 'Asia/Tokyo', label: 'Japan Standard Time (JST)' },
      { value: 'Asia/Shanghai', label: 'China Standard Time (CST)' },
      { value: 'Asia/Kolkata', label: 'India Standard Time (IST)' },
      { value: 'Asia/Dubai', label: 'Gulf Standard Time (GST)' },
      { value: 'Australia/Sydney', label: 'Australian Eastern Time (AET)' },
      { value: 'Australia/Perth', label: 'Australian Western Time (AWT)' },
      { value: 'Pacific/Auckland', label: 'New Zealand Standard Time (NZST)' },
    ],
    []
  );

  // Filter timezones based on search query
  const filteredTimezones = useMemo(() => {
    if (!searchQuery) return timezones;

    return timezones.filter(
      (tz) =>
        tz.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tz.value.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [timezones, searchQuery]);

  // Detect user's timezone on component mount
  useEffect(() => {
    try {
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      setCurrentTimezone(userTimezone);

      // Auto-select user's timezone if no timezone is selected
      if (!value && userTimezone) {
        onChange(userTimezone);
      }
    } catch (error) {
      console.warn('Could not detect user timezone:', error);
    }
  }, [value, onChange]);

  // Get current time in selected timezone
  const currentTimeInTimezone = useMemo(() => {
    if (!value) return '';

    try {
      const now = new Date();
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: value,
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZoneName: 'short',
      });
      return formatter.format(now);
    } catch (error) {
      console.warn('Error formatting time:', error);
      return '';
    }
  }, [value]);

  // Get timezone display name
  const getTimezoneDisplayName = (timezoneValue: string) => {
    const timezone = timezones.find((tz) => tz.value === timezoneValue);
    return timezone ? timezone.label : timezoneValue;
  };

  const handleTimezoneSelect = (timezoneValue: string) => {
    onChange(timezoneValue);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      // Focus search input when opening
      setTimeout(() => {
        searchRef.current?.focus();
      }, 100);
    } else {
      setSearchQuery('');
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center gap-2">
        <GlobeAltIcon className="w-5 h-5 text-primary-600" />
        <label className="text-sm font-medium text-foreground">
          {label}
          {isRequired && <span className="text-danger-500 ml-1">*</span>}
        </label>
      </div>

      <Popover
        isOpen={isOpen}
        onOpenChange={handleOpenChange}
        placement="bottom-start"
        showArrow={false}
      >
        <PopoverTrigger>
          <Button
            variant="bordered"
            className="w-full justify-between"
            endContent={<ChevronDownIcon className="w-4 h-4" />}
            startContent={<ClockIcon className="w-4 h-4 text-foreground-400" />}
          >
            {value ? getTimezoneDisplayName(value) : 'Select timezone'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0">
          <div className="p-4">
            <Input
              ref={searchRef}
              placeholder="Search timezones..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mb-3"
              size="sm"
              startContent={
                <ClockIcon className="w-4 h-4 text-foreground-400" />
              }
            />

            <div className="max-h-60 overflow-y-auto space-y-1">
              {filteredTimezones.map((timezone) => (
                <button
                  key={timezone.value}
                  onClick={() => handleTimezoneSelect(timezone.value)}
                  className={`w-full text-left p-3 rounded-lg transition-colors hover:bg-foreground-100 ${
                    value === timezone.value
                      ? 'bg-primary-50 border border-primary-200'
                      : ''
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">
                      {timezone.label}
                    </span>
                    <span className="text-xs text-foreground-500">
                      {timezone.value}
                    </span>
                  </div>
                </button>
              ))}

              {filteredTimezones.length === 0 && (
                <div className="text-center py-4 text-foreground-500 text-sm">
                  No timezones found
                </div>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {showCurrentTime && value && currentTimeInTimezone && (
        <div className="flex items-center gap-2">
          <Chip
            color="primary"
            variant="flat"
            size="sm"
            startContent={<ClockIcon className="w-3 h-3" />}
          >
            Current time: {currentTimeInTimezone}
          </Chip>
        </div>
      )}

      {currentTimezone && currentTimezone !== value && (
        <div className="flex items-center gap-2">
          <Chip
            color="secondary"
            variant="flat"
            size="sm"
            startContent={<GlobeAltIcon className="w-3 h-3" />}
          >
            Your timezone: {getTimezoneDisplayName(currentTimezone)}
          </Chip>
          <Button
            size="sm"
            variant="bordered"
            color="primary"
            onPress={() => onChange(currentTimezone)}
            className="text-xs"
          >
            Use Mine
          </Button>
        </div>
      )}
    </div>
  );
}
