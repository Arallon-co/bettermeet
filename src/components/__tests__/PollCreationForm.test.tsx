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

    expect(screen.getByText('Create New Poll')).toBeInTheDocument();
    expect(screen.getByText('Step 1 of 4')).toBeInTheDocument();
    expect(screen.getByText('Basic Info')).toBeInTheDocument();
    expect(screen.getByLabelText('Poll Title')).toBeInTheDocument();
  });

  it('validates required fields on step 1', async () => {
    const user = userEvent.setup();
    renderWithProviders(<PollCreationForm onSubmit={mockOnSubmit} />);

    const nextButton = screen.getByRole('button', { name: 'Next' });
    await user.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText('Poll title is required')).toBeInTheDocument();
    });
  });

  it('allows navigation to next step when form is valid', async () => {
    const user = userEvent.setup();
    renderWithProviders(<PollCreationForm onSubmit={mockOnSubmit} />);

    // Fill in required fields
    const titleInput = screen.getByLabelText('Poll Title');
    await user.type(titleInput, 'Test Poll');

    const nextButton = screen.getByRole('button', { name: 'Next' });
    await user.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText('Step 2 of 4')).toBeInTheDocument();
      expect(screen.getByText('Select Available Dates')).toBeInTheDocument();
    });
  });

  it('shows progress indicator', () => {
    renderWithProviders(<PollCreationForm onSubmit={mockOnSubmit} />);

    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveAttribute('aria-valuenow', '25'); // 1/4 * 100
  });

  it('allows going back to previous step', async () => {
    const user = userEvent.setup();
    renderWithProviders(<PollCreationForm onSubmit={mockOnSubmit} />);

    // Fill in required fields and go to step 2
    const titleInput = screen.getByLabelText('Poll Title');
    await user.type(titleInput, 'Test Poll');

    const nextButton = screen.getByRole('button', { name: 'Next' });
    await user.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText('Step 2 of 4')).toBeInTheDocument();
    });

    // Go back to step 1
    const previousButton = screen.getByRole('button', { name: 'Previous' });
    await user.click(previousButton);

    await waitFor(() => {
      expect(screen.getByText('Step 1 of 4')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test Poll')).toBeInTheDocument();
    });
  });

  it('displays loading state when submitting', () => {
    renderWithProviders(<PollCreationForm onSubmit={mockOnSubmit} isLoading />);

    const nextButton = screen.getByRole('button', { name: 'Next' });
    expect(nextButton).toBeDisabled();
  });
});
