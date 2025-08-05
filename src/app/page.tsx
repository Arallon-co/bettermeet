'use client';

import React from 'react';
import ResponsiveLayout from '@/components/ResponsiveLayout';
import { Button } from '@nextui-org/react';
import Link from 'next/link';
import {
  CalendarIcon,
  ClockIcon,
  GlobeAltIcon,
  UserGroupIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

export default function Home() {
  const features = [
    {
      icon: GlobeAltIcon,
      title: 'Timezone Smart',
      description:
        'Automatic timezone detection and conversion for seamless global scheduling.',
    },
    {
      icon: UserGroupIcon,
      title: 'Team Friendly',
      description:
        'Easy sharing and collaboration features for teams of any size.',
    },
    {
      icon: ClockIcon,
      title: 'Quick Setup',
      description:
        'Create polls in seconds and get responses from your team instantly.',
    },
    {
      icon: CalendarIcon,
      title: 'Flexible Scheduling',
      description:
        'Support for date ranges, time slots, and multiple meeting options.',
    },
  ];

  const benefits = [
    'No account required to create polls',
    'Real-time timezone conversion',
    'Mobile-optimized interface',
    'Instant sharing via links',
    'Clean, intuitive design',
    'Works across all devices',
  ];

  return (
    <ResponsiveLayout>
      <div className="min-h-screen flex flex-col">
        {/* Hero Section */}
        <section className="flex-1 flex items-center justify-center py-20">
          <div className="text-center space-y-8 max-w-4xl mx-auto px-4">
            {/* Main Headline */}
            <div className="space-y-6">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent leading-tight">
                Schedule Meetings
                <br />
                <span className="text-foreground">Without the Hassle</span>
              </h1>

              <p className="text-xl sm:text-2xl text-foreground-600 max-w-3xl mx-auto leading-relaxed">
                Create polls, share with your team, and find the perfect meeting
                time across timezones. No more back-and-forth emails.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                as={Link}
                color="primary"
                size="lg"
                href="/create"
                className="min-h-[56px] px-12 text-lg font-semibold text-white shadow-lg hover:shadow-xl transition-shadow"
              >
                Create Free Poll
              </Button>
              <Button
                as={Link}
                color="default"
                variant="bordered"
                size="lg"
                href="#features"
                className="min-h-[56px] px-12 text-lg font-semibold"
              >
                Learn More
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="pt-8">
              <p className="text-sm text-foreground-500 mb-4">
                Trusted by teams worldwide
              </p>
              <div className="flex flex-wrap justify-center gap-8 text-foreground-400">
                <span className="flex items-center gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-success-500" />
                  No registration required
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-success-500" />
                  Free forever
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-success-500" />
                  Privacy focused
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section
          id="features"
          className="py-20 bg-gradient-to-b from-background to-primary-50/20"
        >
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                Why Choose BetterMeet?
              </h2>
              <p className="text-lg text-foreground-600 max-w-2xl mx-auto">
                Built for modern teams who need to schedule meetings quickly and
                efficiently
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="text-center space-y-4">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
                    <feature.icon className="w-8 h-8 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-foreground-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                Everything You Need
              </h2>
              <p className="text-lg text-foreground-600">
                All the features you need to schedule meetings like a pro
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircleIcon className="w-6 h-6 text-success-500 flex-shrink-0" />
                  <span className="text-foreground-700">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-20 bg-gradient-to-r from-primary-50 to-secondary-50">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Ready to Simplify Your Scheduling?
            </h2>
            <p className="text-lg text-foreground-600 mb-8 max-w-2xl mx-auto">
              Join thousands of teams who&apos;ve already made the switch to
              BetterMeet. Create your first poll in under 30 seconds.
            </p>
            <Button
              as={Link}
              color="primary"
              size="lg"
              href="/create"
              className="min-h-[56px] px-12 text-lg font-semibold text-white shadow-lg hover:shadow-xl transition-shadow"
            >
              Get Started Now - It&apos;s Free
            </Button>
          </div>
        </section>
      </div>
    </ResponsiveLayout>
  );
}
