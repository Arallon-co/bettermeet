'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader, Button } from '@nextui-org/react';
import { GlobeAltIcon } from '@heroicons/react/24/outline';
import { TimezoneSelector } from '@/components/TimezoneSelector';
import { useRouter } from 'next/navigation';

interface TimezonePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function TimezonePage({ params }: TimezonePageProps) {
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

  return <TimezonePageContent id={id} />;
}

function TimezonePageContent({ id }: { id: string }) {
  const [timezone, setTimezone] = useState('');
  const [isValid, setIsValid] = useState(false);
  const router = useRouter();

  const handleTimezoneChange = (selectedTimezone: string) => {
    setTimezone(selectedTimezone);
    setIsValid(!!selectedTimezone);
  };

  const handleContinue = () => {
    if (timezone) {
      // Store timezone in sessionStorage for the poll page
      sessionStorage.setItem(`poll-${id}-timezone`, timezone);
      router.push(`/poll/${id}`);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="pb-0">
          <div className="w-full text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <GlobeAltIcon className="w-8 h-8 text-primary-600" />
              <h1 className="text-2xl font-bold text-foreground">
                Select Your Timezone
              </h1>
            </div>
            <p className="text-foreground-600">
              Please select your timezone before viewing the poll. This helps us
              display times correctly for you.
            </p>
          </div>
        </CardHeader>
        <CardBody className="space-y-6">
          <TimezoneSelector
            value={timezone}
            onChange={handleTimezoneChange}
            label="Your Timezone"
            showCurrentTime={true}
            isRequired={true}
          />

          <div className="flex gap-3">
            <Button
              variant="bordered"
              onPress={() => router.back()}
              className="flex-1"
            >
              Go Back
            </Button>
            <Button
              color="primary"
              onPress={handleContinue}
              disabled={!isValid}
              className="flex-1 text-white"
            >
              Continue to Poll
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
