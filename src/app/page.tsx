'use client';

import React from 'react';
import ResponsiveLayout from '@/components/ResponsiveLayout';
import LoadingSpinner from '@/components/LoadingSpinner';
import { ErrorDisplay } from '@/components/ErrorBoundary';
import { useToast } from '@/components/ToastProvider';
import { TimezoneSelector } from '@/components/TimezoneSelector';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Chip,
} from '@nextui-org/react';
import {
  CalendarIcon,
  ClockIcon,
  GlobeAltIcon,
  DevicePhoneMobileIcon,
  BoltIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

export default function Home() {
  const [selectedTimezone, setSelectedTimezone] = React.useState('');
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [showError, setShowError] = React.useState(false);
  const toast = useToast();

  const handleSubmit = async () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast.showSuccess('Welcome to BetterMeet!');
    }, 2000);
  };

  const showToastExamples = () => {
    toast.showInfo('This is an info message');
    setTimeout(() => toast.showWarning('This is a warning'), 500);
    setTimeout(() => toast.showError('This is an error message'), 1000);
  };

  const features = [
    {
      icon: GlobeAltIcon,
      title: 'Timezone Smart',
      description:
        'Automatic timezone detection and conversion for seamless global scheduling.',
      color: 'primary',
    },
    {
      icon: DevicePhoneMobileIcon,
      title: 'Mobile First',
      description:
        'Optimized for touch interactions with responsive design across all devices.',
      color: 'success',
    },
    {
      icon: BoltIcon,
      title: 'Fast & Reliable',
      description:
        'Built with Next.js and modern React patterns for optimal performance.',
      color: 'warning',
    },
    {
      icon: UserGroupIcon,
      title: 'Team Friendly',
      description:
        'Easy sharing and collaboration features for teams of any size.',
      color: 'secondary',
    },
  ];

  return (
    <ResponsiveLayout>
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-6">
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              BetterMeet
            </h1>
            <p className="text-lg sm:text-xl text-foreground-600 max-w-2xl mx-auto">
              Smart scheduling across timezones with a mobile-optimized
              interface
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              color="primary"
              size="lg"
              href="/create"
              className="min-h-[44px] px-8 text-white"
            >
              Create Poll
            </Button>
            <Button
              color="default"
              variant="bordered"
              size="lg"
              href="/about"
              className="min-h-[44px] px-8"
            >
              Learn More
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Demo Form */}
          <Card className="w-full">
            <CardHeader className="pb-4">
              <h2 className="text-xl font-semibold">Get Started</h2>
              <p className="text-sm text-foreground-600">
                Try out our responsive form components
              </p>
            </CardHeader>
            <CardBody className="space-y-4">
              <Input
                label="Your Name"
                placeholder="Enter your full name"
                value={name}
                onValueChange={setName}
                isRequired
                className="w-full"
              />

              <Input
                label="Email Address"
                placeholder="your@email.com"
                type="email"
                value={email}
                onValueChange={setEmail}
                isRequired
                className="w-full"
              />

              <TimezoneSelector
                value={selectedTimezone}
                onChange={setSelectedTimezone}
                label="Your Timezone"
                showCurrentTime
                isRequired
              />

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  variant="bordered"
                  onPress={() => {
                    setName('');
                    setEmail('');
                    setSelectedTimezone('');
                  }}
                  className="flex-1 min-h-[44px]"
                >
                  Clear
                </Button>
                <Button
                  color="primary"
                  onPress={handleSubmit}
                  isLoading={isLoading}
                  isDisabled={!name || !email || !selectedTimezone}
                  className="flex-1 min-h-[44px] text-white"
                >
                  {isLoading ? 'Creating Account...' : 'Get Started'}
                </Button>
              </div>
            </CardBody>
          </Card>

          {/* Component Showcase */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Component Showcase</h2>
              </CardHeader>
              <CardBody className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-3">Loading States</h3>
                  <LoadingSpinner size="sm" text="Small spinner" />
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Toast Notifications</h3>
                  <Button
                    onPress={showToastExamples}
                    variant="bordered"
                    className="min-h-[44px]"
                  >
                    Show Toast Examples
                  </Button>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Error Handling</h3>
                  <Button
                    onPress={() => setShowError(!showError)}
                    variant="bordered"
                    color="danger"
                    className="min-h-[44px]"
                  >
                    Toggle Error Display
                  </Button>
                  {showError && (
                    <div className="mt-3">
                      <ErrorDisplay
                        error={new Error('This is a sample error message')}
                        onRetry={() => setShowError(false)}
                      />
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="w-full">
              <CardBody className="text-center space-y-3">
                <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center mx-auto">
                  <feature.icon className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="text-sm text-foreground-600">
                  {feature.description}
                </p>
              </CardBody>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <Card className="bg-gradient-to-r from-primary-50 to-secondary-50 border-primary-200">
          <CardBody className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-foreground">
              Ready to get started?
            </h2>
            <p className="text-foreground-600 max-w-md mx-auto">
              Create your first poll and experience the power of smart
              scheduling
            </p>
            <Button
              color="primary"
              size="lg"
              href="/create"
              className="min-h-[44px] px-8 text-white"
            >
              Create Your First Poll
            </Button>
          </CardBody>
        </Card>
      </div>
    </ResponsiveLayout>
  );
}
