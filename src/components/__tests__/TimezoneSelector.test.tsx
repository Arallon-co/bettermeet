import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TimezoneSelector } from '../TimezoneSelector';

// Mock the timezone utilities
jest.mock('@/lib/timezone', () => ({
  detectUserTimezone: jest.fn(() => 'America/New_York'),
  searchTimezones: jest.fn((query: string) => [
    {
      value: 'America/New_York',
      label: 'New York (-05:00)',
      offset: '-05:00',
      region: 'America',
    },
    {
      value: 'Europe/London',
      label: 'London (+00:00)',
      offset: '+00:00',
      region: 'Europe',
    },
  ]),
  getCommonTimezones: jest.fn(() => [
    {
      value: 'UTC',
      label: 'Coordinated Universal Time (+00:00)',
      offset: '+00:00',
      region: 'UTC',
    },
    {
      value: 'America/New_York',
      label: 'New York (-05:00)',
      offset: '-05:00',
      region: 'America',
    },
  ]),
  formatTimeForLocale: jest.fn(() => '12:00 PM'),
}));

// Mock HeroUI components
jest.mock('@heroui/react', () => ({
  Select: ({
    children,
    onSelectionChange,
    placeholder,
    selectedKeys,
    startContent,
    isDisabled,
  }: any) => (
    <div data-testid="select">
      <div data-testid="select-placeholder">{placeholder}</div>
      {startContent && (
        <div data-testid="select-start-content">{startContent}</div>
      )}
      <select
        data-testid="select-input"
        onChange={(e) => onSelectionChange?.(new Set([e.target.value]))}
        value={selectedKeys?.[0] || ''}
        disabled={isDisabled}
      >
        <option value="">Select...</option>
        {children}
      </select>
    </div>
  ),
  SelectItem: ({ children, value, textValue }: any) => (
    <option value={value} data-testid={`select-item-${value}`}>
      {textValue || (typeof children === 'string' ? children : 'Option')}
    </option>
  ),
  Input: ({ placeholder, value, onValueChange, startContent }: any) => (
    <div data-testid="input">
      {startContent && (
        <div data-testid="input-start-content">{startContent}</div>
      )}
      <input
        data-testid="input-field"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onValueChange?.(e.target.value)}
      />
    </div>
  ),
  Button: ({ children, onPress, ...props }: any) => (
    <button data-testid="button" onClick={onPress} {...props}>
      {children}
    </button>
  ),
  Chip: ({ children }: any) => <span data-testid="chip">{children}</span>,
  Tooltip: ({ children, content }: any) => (
    <div data-testid="tooltip" title={content}>
      {children}
    </div>
  ),
}));

describe('TimezoneSelector', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render with default props', () => {
    render(<TimezoneSelector onChange={mockOnChange} />);

    expect(screen.getByText('Timezone')).toBeInTheDocument();
    expect(screen.getByTestId('select-placeholder')).toHaveTextContent(
      'Select timezone...'
    );
    expect(screen.getByTestId('input-field')).toHaveAttribute(
      'placeholder',
      'Search timezones...'
    );
  });

  it('should render with custom label and placeholder', () => {
    render(
      <TimezoneSelector
        onChange={mockOnChange}
        label="Choose Timezone"
        placeholder="Pick a timezone..."
      />
    );

    expect(screen.getByText('Choose Timezone')).toBeInTheDocument();
    expect(screen.getByTestId('select-placeholder')).toHaveTextContent(
      'Pick a timezone...'
    );
  });

  it('should show required indicator when required', () => {
    render(<TimezoneSelector onChange={mockOnChange} isRequired />);

    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('should call onChange when timezone is selected', async () => {
    const user = userEvent.setup();
    render(<TimezoneSelector onChange={mockOnChange} />);

    const select = screen.getByTestId('select-input');
    await user.selectOptions(select, 'America/New_York');

    expect(mockOnChange).toHaveBeenCalledWith('America/New_York');
  });

  it('should show current time when timezone is selected and showCurrentTime is true', () => {
    render(
      <TimezoneSelector
        onChange={mockOnChange}
        value="America/New_York"
        showCurrentTime={true}
      />
    );

    expect(screen.getByTestId('chip')).toHaveTextContent('12:00 PM');
  });

  it('should not show current time when showCurrentTime is false', () => {
    render(
      <TimezoneSelector
        onChange={mockOnChange}
        value="America/New_York"
        showCurrentTime={false}
      />
    );

    expect(screen.queryByTestId('chip')).not.toBeInTheDocument();
  });

  it('should show auto-detect button when detected timezone differs from selected', () => {
    render(<TimezoneSelector onChange={mockOnChange} value="Europe/London" />);

    expect(screen.getByTestId('button')).toHaveTextContent(
      'Use detected (New York)'
    );
  });

  it('should call onChange with detected timezone when auto-detect is clicked', async () => {
    const user = userEvent.setup();
    render(<TimezoneSelector onChange={mockOnChange} value="Europe/London" />);

    const autoDetectButton = screen.getByTestId('button');
    await user.click(autoDetectButton);

    expect(mockOnChange).toHaveBeenCalledWith('America/New_York');
  });

  it('should filter timezones when search query is entered', async () => {
    const user = userEvent.setup();
    render(<TimezoneSelector onChange={mockOnChange} />);

    const searchInput = screen.getByTestId('input-field');
    await user.type(searchInput, 'London');

    // The searchTimezones mock should be called with 'London'
    expect(require('@/lib/timezone').searchTimezones).toHaveBeenCalledWith(
      'London',
      20
    );
  });

  it('should display selected timezone information', () => {
    render(
      <TimezoneSelector onChange={mockOnChange} value="America/New_York" />
    );

    expect(screen.getByText(/Selected: New York/)).toBeInTheDocument();
    expect(screen.getByText(/Current time: 12:00 PM/)).toBeInTheDocument();
  });

  it('should be disabled when isDisabled is true', () => {
    render(<TimezoneSelector onChange={mockOnChange} isDisabled />);

    const select = screen.getByTestId('select-input');
    expect(select).toBeDisabled();
  });

  it('should auto-select detected timezone on mount when no value is provided', () => {
    render(<TimezoneSelector onChange={mockOnChange} />);

    // Should call onChange with detected timezone
    expect(mockOnChange).toHaveBeenCalledWith('America/New_York');
  });

  it('should not auto-select when value is already provided', () => {
    render(<TimezoneSelector onChange={mockOnChange} value="Europe/London" />);

    // Should not call onChange since value is already provided
    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it('should handle search input changes', async () => {
    const user = userEvent.setup();
    render(<TimezoneSelector onChange={mockOnChange} />);

    const searchInput = screen.getByTestId('input-field');

    await user.type(searchInput, 'New York');

    expect(searchInput).toHaveValue('New York');
  });

  it('should clear search when auto-detect is used', async () => {
    const user = userEvent.setup();
    render(<TimezoneSelector onChange={mockOnChange} value="Europe/London" />);

    const searchInput = screen.getByTestId('input-field');
    await user.type(searchInput, 'test query');

    const autoDetectButton = screen.getByTestId('button');
    await user.click(autoDetectButton);

    expect(searchInput).toHaveValue('');
  });
});
