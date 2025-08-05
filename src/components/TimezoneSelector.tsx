'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Select,
  SelectItem,
  Input,
  Button,
  Chip,
  Tooltip,
} from '@nextui-org/react';
import {
  ClockIcon,
  GlobeAltIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import {
  detectUserTimezone,
  searchTimezones,
  getCommonTimezones,
  formatTimeForLocale,
} from '@/lib/timezone';

interface TimezoneSelectorProps {
  value?: string;
  onChange: (timezone: string) => void;
  label?: string;
  placeholder?: string;
  showCurrentTime?: boolean;
  isRequired?: boolean;
  isDisabled?: boolean;
  className?: string;
}

export function TimezoneSelector({
  value,
  onChange,
  label = 'Timezone',
  placeholder = 'Select timezone...',
  showCurrentTime = false,
  isRequired = false,
  isDisabled = false,
  className = '',
}: TimezoneSelectorProps) {
  const [detectedTimezone, setDetectedTimezone] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [timezones, setTimezones] = useState(getCommonTimezones());

  // Detect user's timezone on component mount
  useEffect(() => {
    const detected = detectUserTimezone();
    setDetectedTimezone(detected);

    // Auto-select detected timezone if no value is provided
    if (!value && detected) {
      onChange(detected);
    }
  }, [value, onChange]);

  // Update timezones based on search query
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = searchTimezones(searchQuery, 20);
      setTimezones(filtered);
    } else {
      setTimezones(getCommonTimezones());
    }
  }, [searchQuery]);

  const handleSelectionChange = (keys: any) => {
    const selectedKey = Array.from(keys)[0] as string;
    if (selectedKey) {
      onChange(selectedKey);
    }
  };

  const handleAutoDetect = () => {
    if (detectedTimezone) {
      onChange(detectedTimezone);
      setSearchQuery('');
    }
  };

  const selectedTimezone = timezones.find((tz) => tz.value === value);
  const currentTime = value ? formatTimeForLocale(new Date(), value) : '';

  const showAutoDetectButton = detectedTimezone && detectedTimezone !== value;
  const detectedTimezoneInfo = timezones.find(
    (tz) => tz.value === detectedTimezone
  );

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center gap-2">
        <GlobeAltIcon className="w-5 h-5 text-primary-600" />
        <label className="text-sm font-medium text-foreground">
          {label}
          {isRequired && <span className="text-danger-500 ml-1">*</span>}
        </label>
      </div>

      <div className="space-y-2">
        <Input
          placeholder="Search timezones..."
          value={searchQuery}
          onValueChange={setSearchQuery}
          startContent={
            <MagnifyingGlassIcon className="w-4 h-4 text-foreground-400" />
          }
          size="sm"
          isDisabled={isDisabled}
        />

        <Select
          placeholder={placeholder}
          selectedKeys={value ? new Set([value]) : new Set()}
          onSelectionChange={handleSelectionChange}
          startContent={<ClockIcon className="w-4 h-4 text-foreground-400" />}
          isDisabled={isDisabled}
        >
          {timezones.map((timezone) => (
            <SelectItem
              key={timezone.value}
              value={timezone.value}
              textValue={timezone.label}
            >
              <div className="flex flex-col">
                <span className="font-medium">{timezone.label}</span>
                <span className="text-xs text-foreground-500">
                  {timezone.value}
                </span>
              </div>
            </SelectItem>
          ))}
        </Select>
      </div>

      {showCurrentTime && value && currentTime && (
        <Chip
          color="primary"
          variant="flat"
          size="sm"
          startContent={<ClockIcon className="w-3 h-3" />}
        >
          {currentTime}
        </Chip>
      )}

      {selectedTimezone && (
        <div className="text-sm text-foreground-600">
          <div>Selected: {selectedTimezone.label.split(' (')[0]}</div>
          {showCurrentTime && currentTime && (
            <div>Current time: {currentTime}</div>
          )}
        </div>
      )}

      {showAutoDetectButton && detectedTimezoneInfo && (
        <Button
          size="sm"
          variant="bordered"
          color="primary"
          onPress={handleAutoDetect}
          startContent={<GlobeAltIcon className="w-3 h-3" />}
        >
          Use detected ({detectedTimezoneInfo.label.split(' (')[0]})
        </Button>
      )}
    </div>
  );
}
