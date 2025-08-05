'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { PollCreationForm } from '@/components/PollCreationForm';
import ResponsiveLayout from '@/components/ResponsiveLayout';
import { useToast } from '@/components/ToastProvider';
import type { CreatePollRequest } from '@/types/poll';

export default function CreatePollPage() {
  const router = useRouter();
  const toast = useToast();

  const handleSubmit = async (data: CreatePollRequest) => {
    try {
      const response = await fetch('/api/polls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create poll');
      }

      const result = await response.json();

      toast.showSuccess(
        'Poll created successfully! Share the link with participants.'
      );

      // Redirect to the created poll
      router.push(`/poll/${result.id}`);
    } catch (error) {
      console.error('Error creating poll:', error);
      toast.showError('Failed to create poll. Please try again.');
    }
  };

  return (
    <ResponsiveLayout>
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
            Create a New Poll
          </h1>
          <p className="text-foreground-600 max-w-2xl mx-auto">
            Set up a scheduling poll with multiple time slots and timezone
            support
          </p>
        </div>

        <PollCreationForm onSubmit={handleSubmit} />
      </div>
    </ResponsiveLayout>
  );
}
