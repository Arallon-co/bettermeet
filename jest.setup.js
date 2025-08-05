import '@testing-library/jest-dom'

// Mock framer-motion to avoid dynamic import issues
jest.mock('framer-motion', () => ({
  motion: {
    div: 'div',
    span: 'span',
    button: 'button',
  },
  AnimatePresence: ({ children }) => children,
  useAnimation: () => ({
    start: jest.fn(),
    stop: jest.fn(),
    set: jest.fn(),
  }),
}))

// Mock NextUI components
jest.mock('@nextui-org/react', () => ({
  Card: ({ children, className }) => <div data-testid="card" className={className}>{children}</div>,
  CardBody: ({ children, className }) => <div data-testid="card-body" className={className}>{children}</div>,
  CardHeader: ({ children, className }) => <div data-testid="card-header" className={className}>{children}</div>,
  Button: ({ children, onPress, isLoading, disabled, isDisabled, className, type, color, size, startContent, endContent, ...props }) => {
    // Filter out NextUI-specific props that shouldn't be passed to DOM
    const { variant, radius, fullWidth, ...domProps } = props;
    return (
      <button 
        onClick={onPress} 
        disabled={disabled || isDisabled || isLoading}
        className={className}
        data-loading={isLoading ? 'true' : 'false'}
        data-color={color}
        data-size={size}
        type={type}
        {...domProps}
      >
        {startContent}
        {children}
        {endContent}
      </button>
    );
  },
  Input: ({ label, value, onValueChange, onChange, placeholder, isRequired, className, errorMessage, description, startContent, endContent, ...props }) => {
    // Filter out NextUI-specific props that shouldn't be passed to DOM
    const { variant, color, size, radius, labelPlacement, ...domProps } = props;
    const handleChange = (e) => {
      if (onValueChange) {
        onValueChange(e.target.value);
      }
      if (onChange) {
        onChange(e);
      }
    };
    return (
      <div className={className}>
        <label>{label}</label>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {startContent}
          <input 
            aria-label={label}
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            required={isRequired}
            {...domProps}
          />
          {endContent}
        </div>
        {errorMessage && <div data-testid="error-message">{errorMessage}</div>}
        {description && <div data-testid="description">{description}</div>}
      </div>
    );
  },
  Textarea: ({ label, value, onValueChange, onChange, placeholder, className, minRows, maxRows, ...props }) => {
    // Filter out NextUI-specific props that shouldn't be passed to DOM
    const { variant, color, size, radius, labelPlacement, ...domProps } = props;
    const handleChange = (e) => {
      if (onValueChange) {
        onValueChange(e.target.value);
      }
      if (onChange) {
        onChange(e);
      }
    };
    return (
      <div className={className}>
        <label>{label}</label>
        <textarea 
          aria-label={label}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          rows={minRows}
          {...domProps}
        />
      </div>
    );
  },
  Progress: ({ value, className, ...props }) => (
    <div 
      role="progressbar" 
      aria-valuenow={value}
      aria-valuemin="0"
      aria-valuemax="100"
      aria-valuetext={`${Math.round(value)}%`}
      className={className}
      {...props}
    />
  ),
  Chip: ({ children, className, startContent, endContent, onClose, ...props }) => {
    // Filter out NextUI-specific props that shouldn't be passed to DOM
    const { variant, color, size, radius, ...domProps } = props;
    return (
      <span className={className} {...domProps}>
        {startContent}
        {children}
        {endContent}
        {onClose && <button onClick={onClose}>×</button>}
      </span>
    );
  },
  Select: ({ children, label, placeholder, className, startContent, selectedKeys, onSelectionChange, ...props }) => {
    // Filter out NextUI-specific props that shouldn't be passed to DOM
    const { variant, color, size, radius, labelPlacement, ...domProps } = props;
    const handleChange = (e) => {
      if (onSelectionChange) {
        onSelectionChange(new Set([e.target.value]));
      }
    };
    return (
      <div className={className}>
        <label>{label}</label>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {startContent}
          <select 
            aria-label={label} 
            onChange={handleChange}
            value={selectedKeys ? Array.from(selectedKeys)[0] : ''}
            {...domProps}
          >
            <option value="">{placeholder}</option>
            {children}
          </select>
        </div>
      </div>
    );
  },
  SelectItem: ({ children, value, ...props }) => (
    <option value={value} {...props}>{children}</option>
  ),
  NextUIProvider: ({ children }) => <div>{children}</div>,
  Popover: ({ children, isOpen, onOpenChange }) => (
    <div data-testid="popover" data-open={isOpen}>
      {children}
    </div>
  ),
  PopoverTrigger: ({ children }) => (
    <div data-testid="popover-trigger">{children}</div>
  ),
  PopoverContent: ({ children, className }) => (
    <div data-testid="popover-content" className={className}>
      {children}
    </div>
  ),
}))

// Mock NextUI ripple animations
jest.mock('@nextui-org/ripple', () => ({
  useRipple: () => ({
    ripples: [],
    onClick: jest.fn(),
    onClear: jest.fn(),
  }),
}))

// Suppress console errors for tests
const originalError = console.error
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('A dynamic import callback was invoked without --experimental-vm-modules')
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})