'use client';

import React, { useState } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Textarea,
  Progress,
  Chip,
} from '@nextui-org/react';
import { SimpleDateSelector } from './SimpleDateSelector';
import { TimeSlotBuilder } from './TimeSlotBuilder';
import { TimezoneSelector } from './TimezoneSelector';
import { useToast } from './ToastProvider';
import type { CreatePollRequest, TimeSlot } from '@/types/poll';
import {
  CalendarIcon,
  ClockIcon,
  GlobeAltIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

interface PollCreationFormProps {
  onSubmit: (data: CreatePollRequest) => void;
  isLoading?: boolean;
}

const STEPS = [
  { id: 1, title: 'Basic Info', icon: UserGroupIcon },
  { id: 2, title: 'Date Range', icon: CalendarIcon },
  { id: 3, title: 'Review', icon: ClockIcon },
];

export function PollCreationForm({
  onSubmit,
  isLoading = false,
}: PollCreationFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dates: [] as string[],
    timeSlots: [] as Omit<TimeSlot, 'id'>[],
    organizerTimezone: '',
  });
  const toast = useToast();

  const updateFormData = (updates: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    if (!formData.title.trim()) {
      toast.showError('Please enter a poll title');
      return;
    }

    if (formData.dates.length === 0) {
      toast.showError('Please select at least one date');
      return;
    }

    if (formData.timeSlots.length === 0) {
      toast.showError('Please add at least one time slot');
      return;
    }

    if (!formData.organizerTimezone) {
      toast.showError('Please select your timezone');
      return;
    }

    const submitData: CreatePollRequest = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      dates: formData.dates,
      timeSlots: formData.timeSlots,
      organizerTimezone: formData.organizerTimezone,
    };

    onSubmit(submitData);
  };

  const progress = (currentStep / STEPS.length) * 100;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress Indicator */}
      <Card className="w-full">
        <CardBody className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Create Poll</h2>
              <span className="text-sm text-foreground-600">
                Step {currentStep} of {STEPS.length}
              </span>
            </div>

            <Progress
              value={progress}
              color="primary"
              className="w-full"
              size="sm"
            />

            <div className="flex justify-between">
              {STEPS.map((step) => (
                <div
                  key={step.id}
                  className={`flex flex-col items-center space-y-2 ${
                    step.id <= currentStep
                      ? 'text-primary-600'
                      : 'text-foreground-400'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      step.id <= currentStep
                        ? 'bg-primary-100'
                        : 'bg-foreground-100'
                    }`}
                  >
                    <step.icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-medium">{step.title}</span>
                </div>
              ))}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Form Steps */}
      <Card className="w-full">
        <CardBody className="p-6">
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-4">
                  Basic Information
                </h3>
                <p className="text-sm text-foreground-600 mb-6">
                  Start by providing the basic details for your scheduling poll.
                </p>
              </div>

              <Input
                label="Poll Title"
                placeholder="Enter poll title"
                value={formData.title}
                onValueChange={(value) => updateFormData({ title: value })}
                isRequired
                className="w-full"
                startContent={
                  <UserGroupIcon className="w-4 h-4 text-foreground-400" />
                }
              />

              <Textarea
                label="Description (Optional)"
                placeholder="Add a description for your poll"
                value={formData.description}
                onValueChange={(value) =>
                  updateFormData({ description: value })
                }
                className="w-full"
                minRows={3}
                maxRows={6}
              />

              <TimezoneSelector
                value={formData.organizerTimezone}
                onChange={(timezone) =>
                  updateFormData({ organizerTimezone: timezone })
                }
                label="Your Timezone"
                showCurrentTime
                isRequired
              />
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-4">
                  Date Range & Business Hours
                </h3>
                <p className="text-sm text-foreground-600 mb-6">
                  Choose a date range. Time slots will be automatically set to
                  business hours (9 AM - 5 PM).
                </p>
              </div>

              <SimpleDateSelector
                selectedDates={formData.dates}
                onChange={(dates: string[]) => updateFormData({ dates })}
                organizerTimezone={formData.organizerTimezone}
              />

              {formData.dates.length > 0 && (
                <TimeSlotBuilder
                  selectedDates={formData.dates}
                  timeSlots={formData.timeSlots}
                  onChange={(timeSlots: Omit<TimeSlot, 'id'>[]) =>
                    updateFormData({ timeSlots })
                  }
                  organizerTimezone={formData.organizerTimezone}
                />
              )}
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-4">Review & Create</h3>
                <p className="text-sm text-foreground-600 mb-6">
                  Review your poll details before creating.
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-foreground-50 rounded-lg">
                  <h4 className="font-semibold text-foreground mb-2">
                    {formData.title}
                  </h4>
                  {formData.description && (
                    <p className="text-sm text-foreground-600 mb-3">
                      {formData.description}
                    </p>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-foreground-400" />
                      <span className="text-sm">
                        {formData.dates.length} date
                        {formData.dates.length !== 1 ? 's' : ''} selected
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <ClockIcon className="w-4 h-4 text-foreground-400" />
                      <span className="text-sm">
                        {formData.timeSlots.length} time slot
                        {formData.timeSlots.length !== 1 ? 's' : ''} configured
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <GlobeAltIcon className="w-4 h-4 text-foreground-400" />
                      <span className="text-sm">
                        Timezone: {formData.organizerTimezone}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {formData.dates.map((date, index) => (
                    <Chip key={index} variant="flat" color="primary" size="sm">
                      {new Date(date).toLocaleDateString()}
                    </Chip>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center pt-6">
            <Button
              variant="bordered"
              onPress={prevStep}
              isDisabled={currentStep === 1}
              className="min-h-[44px]"
            >
              Previous
            </Button>

            <div className="flex items-center gap-4">
              <span className="text-sm text-foreground-500">
                Step {currentStep} of {STEPS.length}
              </span>

              <Button
                color="primary"
                onPress={currentStep < STEPS.length ? nextStep : handleSubmit}
                isLoading={isLoading && currentStep === STEPS.length}
                className="min-h-[44px] px-6 text-white"
              >
                {currentStep < STEPS.length ? 'Next →' : 'Create Poll'}
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
