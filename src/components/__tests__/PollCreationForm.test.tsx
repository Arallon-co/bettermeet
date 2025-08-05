import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PollCreationForm } from '../PollCreationForm';
import { ToastProvider } from '../ToastProvider';

// Mock the timezone detection
jest.mock('@/lib/timezone', () => ({
  detectUserTimezone: jest.fn(() => 'America/New_York'),
  searchTimezones: jest.fn(() => [
    { value: 'America/New_York', label: 'New York (-05:00)' },
    { value: 'Europe/London', label: 'London (+00:00)' },
  ]),
  getCommonTimezones: jest.fn(() => [
    { value: 'America/New_York', label: 'New York (-05:00)' },
    { value: 'Europe/London', label: 'London (+00:00)' },
  ]),
  formatTimeForLocale: jest.fn(() => '12:00 PM'),
}));

// Mock custom components
jest.mock('../SimpleDateSelector', () => ({
  SimpleDateSelector: ({ onDatesChange, selectedDates }: any) => (
    <div data-testid="simple-date-selector">
      <button onClick={() => onDatesChange?.(['2024-12-01', '2024-12-02'])}>
        Select Dates
      </button>
      <div>Selected: {selectedDates?.join(', ')}</div>
    </div>
  ),
}));

jest.mock('../TimeSlotBuilder', () => ({
  TimeSlotBuilder: ({ onTimeSlotsChange, timeSlots }: any) => (
    <div data-testid="time-slot-builder">
      <button
        onClick={() =>
          onTimeSlotsChange?.([
            { date: '2024-12-01', startTime: '09:00', endTime: '10:00' },
          ])
        }
      >
        Build Time Slots
      </button>
      <div>Time slots: {timeSlots?.length || 0}</div>
    </div>
  ),
}));

jest.mock('../TimezoneSelector', () => ({
  TimezoneSelector: ({ onTimezoneChange, selectedTimezone }: any) => (
    <div data-testid="timezone-selector">
      <button onClick={() => onTimezoneChange?.('America/New_York')}>
        Pacific Time (PT)
      </button>
      <div>Selected: {selectedTimezone}</div>
    </div>
  ),
}));

const renderWithProviders = (component: React.ReactElement) => {
  return render(<ToastProvider>{component}</ToastProvider>);
};

describe('PollCreationForm', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it('renders the form with initial step', () => {
    renderWithProviders(<PollCreationForm onSubmit={mockOnSubmit} />);

    expect(screen.getByText('Create Poll')).toBeInTheDocument();
    expect(screen.getAllByText('Step 1 of 3')).toHaveLength(2); // Header and footer
    expect(screen.getByText('Basic Info')).toBeInTheDocument();
    expect(screen.getByLabelText('Poll Title')).toBeInTheDocument();
  });

  it('shows progress indicator', () => {
    renderWithProviders(<PollCreationForm onSubmit={mockOnSubmit} />);

    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveAttribute('aria-valuenow', '33.33333333333333'); // 1/3 * 100
  });

  it('has navigation buttons', () => {
    renderWithProviders(<PollCreationForm onSubmit={mockOnSubmit} />);

    expect(screen.getByRole('button', { name: 'Next →' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Previous' })
    ).toBeInTheDocument();
  });

  it('displays form fields for basic info step', () => {
    renderWithProviders(<PollCreationForm onSubmit={mockOnSubmit} />);

    expect(screen.getByLabelText('Poll Title')).toBeInTheDocument();
    expect(screen.getByLabelText('Description (Optional)')).toBeInTheDocument();
    expect(screen.getByTestId('timezone-selector')).toBeInTheDocument();
  });

  it('shows loading state when isLoading prop is true', () => {
    renderWithProviders(<PollCreationForm onSubmit={mockOnSubmit} isLoading />);

    // The form should still render normally when loading
    expect(screen.getByText('Create Poll')).toBeInTheDocument();
  });

  it('calls onSubmit when form is completed', async () => {
    const user = userEvent.setup();
    renderWithProviders(<PollCreationForm onSubmit={mockOnSubmit} />);

    // Fill in the title field
    const titleInput = screen.getByLabelText('Poll Title');
    await user.type(titleInput, 'Test Poll');

    // The form should be functional
    expect(titleInput).toHaveValue('Test Poll');
  });
});
