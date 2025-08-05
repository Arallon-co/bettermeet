import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  ValidatedInput,
  FormCard,
  FormActions,
  SubmitButton,
  validators,
} from '../FormComponents';

// Mock NextUI components
jest.mock('@nextui-org/react', () => ({
  Input: ({
    label,
    value,
    onValueChange,
    onBlur,
    isInvalid,
    errorMessage,
    description,
    ...props
  }: any) => {
    const {
      isRequired,
      isDisabled,
      startContent,
      endContent,
      minRows,
      maxRows,
      ...validProps
    } = props;
    return (
      <div>
        <label htmlFor="test-input">{label}</label>
        <input
          id="test-input"
          value={value}
          onChange={(e) => onValueChange?.(e.target.value)}
          onBlur={onBlur}
          data-invalid={isInvalid}
          {...validProps}
        />
        {errorMessage && <div data-testid="error-message">{errorMessage}</div>}
        {description && <div data-testid="description">{description}</div>}
      </div>
    );
  },
  Textarea: ({
    label,
    value,
    onValueChange,
    onBlur,
    isInvalid,
    errorMessage,
    description,
    ...props
  }: any) => {
    const { isRequired, isDisabled, minRows, maxRows, ...validProps } = props;
    return (
      <div>
        <label htmlFor="test-textarea">{label}</label>
        <textarea
          id="test-textarea"
          value={value}
          onChange={(e) => onValueChange?.(e.target.value)}
          onBlur={onBlur}
          data-invalid={isInvalid}
          {...validProps}
        />
        {errorMessage && <div data-testid="error-message">{errorMessage}</div>}
        {description && <div data-testid="description">{description}</div>}
      </div>
    );
  },
  Card: ({ children, className }: any) => (
    <div data-testid="card" className={className}>
      {children}
    </div>
  ),
  CardHeader: ({ children, className }: any) => (
    <div data-testid="card-header" className={className}>
      {children}
    </div>
  ),
  CardBody: ({ children, className }: any) => (
    <div data-testid="card-body" className={className}>
      {children}
    </div>
  ),
  Button: ({
    children,
    onPress,
    isLoading,
    isDisabled,
    color,
    variant,
    size,
    type,
  }: any) => (
    <button
      onClick={onPress}
      disabled={isDisabled || isLoading}
      data-loading={isLoading}
      data-color={color}
      data-variant={variant}
      data-size={size}
      type={type}
    >
      {children}
    </button>
  ),
}));

describe('ValidatedInput', () => {
  it('renders input with label', () => {
    const onChange = jest.fn();
    render(<ValidatedInput label="Test Label" value="" onChange={onChange} />);

    expect(screen.getByLabelText('Test Label')).toBeInTheDocument();
  });

  it('calls onChange when value changes', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(<ValidatedInput label="Test Label" value="" onChange={onChange} />);

    const input = screen.getByLabelText('Test Label');
    await user.type(input, 'a');

    // userEvent.type calls onChange for each character typed
    expect(onChange).toHaveBeenCalledWith('a');
  });

  it('shows validation error on blur', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    const validate = jest.fn().mockReturnValue('Validation error');

    render(
      <ValidatedInput
        label="Test Label"
        value=""
        onChange={onChange}
        validate={validate}
      />
    );

    const input = screen.getByLabelText('Test Label');
    await user.click(input);
    await user.tab(); // Trigger blur

    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent(
        'Validation error'
      );
    });
  });

  it('shows external error', () => {
    const onChange = jest.fn();

    render(
      <ValidatedInput
        label="Test Label"
        value=""
        onChange={onChange}
        errorMessage="External error"
      />
    );

    expect(screen.getByTestId('error-message')).toHaveTextContent(
      'External error'
    );
  });

  it('shows helper text when no error', () => {
    const onChange = jest.fn();

    render(
      <ValidatedInput
        label="Test Label"
        value=""
        onChange={onChange}
        description="Helper text"
      />
    );

    expect(screen.getByTestId('description')).toHaveTextContent('Helper text');
  });
});

describe('FormCard', () => {
  it('renders children', () => {
    render(
      <FormCard title="Test Card">
        <div>Form content</div>
      </FormCard>
    );

    expect(screen.getByText('Form content')).toBeInTheDocument();
  });

  it('renders title and description', () => {
    render(
      <FormCard title="Form Title" description="Form description">
        <div>Form content</div>
      </FormCard>
    );

    expect(screen.getByText('Form Title')).toBeInTheDocument();
    expect(screen.getByText('Form description')).toBeInTheDocument();
  });
});

describe('FormActions', () => {
  it('renders children with correct styling', () => {
    render(
      <FormActions>
        <button>Action 1</button>
        <button>Action 2</button>
      </FormActions>
    );

    expect(screen.getByText('Action 1')).toBeInTheDocument();
    expect(screen.getByText('Action 2')).toBeInTheDocument();
  });
});

describe('SubmitButton', () => {
  it('renders button with correct props', () => {
    const onPress = jest.fn();
    render(<SubmitButton onPress={onPress}>Submit</SubmitButton>);

    const button = screen.getByText('Submit');
    expect(button).toHaveAttribute('type', 'submit');
    expect(button).toHaveAttribute('data-color', 'primary');
    expect(button).toHaveAttribute('data-size', 'lg');
  });

  it('shows loading state', () => {
    render(
      <SubmitButton onPress={() => {}} isLoading>
        Submit
      </SubmitButton>
    );

    const button = screen.getByText('Submit');
    expect(button).toHaveAttribute('data-loading', 'true');
    expect(button).toBeDisabled();
  });

  it('is disabled when disabled prop is true', () => {
    render(
      <SubmitButton onPress={() => {}} disabled>
        Submit
      </SubmitButton>
    );

    expect(screen.getByText('Submit')).toBeDisabled();
  });
});

describe('validators', () => {
  describe('required', () => {
    it('returns error for empty string', () => {
      expect(validators.required('')).toBe('This field is required');
      expect(validators.required('   ')).toBe('This field is required');
    });

    it('returns null for non-empty string', () => {
      expect(validators.required('test')).toBeNull();
    });
  });

  describe('email', () => {
    it('returns error for invalid email', () => {
      expect(validators.email('invalid')).toBe(
        'Please enter a valid email address'
      );
      expect(validators.email('test@')).toBe(
        'Please enter a valid email address'
      );
    });

    it('returns null for valid email', () => {
      expect(validators.email('test@example.com')).toBeNull();
    });
  });

  describe('minLength', () => {
    it('returns error for short string', () => {
      const validator = validators.minLength(5);
      expect(validator('test')).toBe('Must be at least 5 characters');
    });

    it('returns null for long enough string', () => {
      const validator = validators.minLength(5);
      expect(validator('testing')).toBeNull();
    });
  });

  describe('maxLength', () => {
    it('returns error for long string', () => {
      const validator = validators.maxLength(5);
      expect(validator('testing')).toBe('Must be no more than 5 characters');
    });

    it('returns null for short enough string', () => {
      const validator = validators.maxLength(5);
      expect(validator('test')).toBeNull();
    });
  });

  describe('combine', () => {
    it('returns first error encountered', () => {
      const validator = validators.combine(
        validators.required,
        validators.minLength(5)
      );

      expect(validator('')).toBe('This field is required');
      expect(validator('ab')).toBe('Must be at least 5 characters');
      expect(validator('testing')).toBeNull();
    });
  });
});
