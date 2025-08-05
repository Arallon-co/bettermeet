'use client';

import React from 'react';
import {
  Input,
  Textarea,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
} from '@nextui-org/react';

// Validation functions
export const validators = {
  required: (value: string) => {
    if (!value || value.trim().length === 0) {
      return 'This field is required';
    }
    return null;
  },

  email: (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (value && !emailRegex.test(value)) {
      return 'Please enter a valid email address';
    }
    return null;
  },

  minLength: (min: number) => (value: string) => {
    if (value && value.length < min) {
      return `Must be at least ${min} characters`;
    }
    return null;
  },

  maxLength: (max: number) => (value: string) => {
    if (value && value.length > max) {
      return `Must be no more than ${max} characters`;
    }
    return null;
  },

  combine: (...validators: Array<(value: string) => string | null>) => {
    return (value: string) => {
      for (const validator of validators) {
        const error = validator(value);
        if (error) return error;
      }
      return null;
    };
  },
};

interface ValidatedInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  validate?: (value: string) => string | null;
  placeholder?: string;
  type?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  errorMessage?: string;
  isInvalid?: boolean;
}

export function ValidatedInput({
  label,
  value,
  onChange,
  validate,
  placeholder,
  type = 'text',
  required = false,
  disabled = false,
  className = '',
  errorMessage,
  isInvalid,
}: ValidatedInputProps) {
  const [error, setError] = React.useState<string | null>(null);
  const [touched, setTouched] = React.useState(false);

  const handleChange = (newValue: string) => {
    onChange(newValue);

    if (touched && validate) {
      const validationError = validate(newValue);
      setError(validationError);
    }
  };

  const handleBlur = () => {
    setTouched(true);
    if (validate) {
      const validationError = validate(value);
      setError(validationError);
    }
  };

  const isFieldInvalid = isInvalid || (touched && error !== null);

  return (
    <Input
      label={label}
      value={value}
      onValueChange={handleChange}
      onBlur={handleBlur}
      placeholder={placeholder}
      type={type}
      isRequired={required}
      isDisabled={disabled}
      isInvalid={isFieldInvalid}
      errorMessage={error || errorMessage}
      className={className}
      variant="bordered"
    />
  );
}

interface FormCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormCard({
  title,
  description,
  children,
  className = '',
}: FormCardProps) {
  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="pb-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground">{title}</h2>
          {description && (
            <p className="text-sm text-foreground-600 mt-1">{description}</p>
          )}
        </div>
      </CardHeader>
      <CardBody className="space-y-4">{children}</CardBody>
    </Card>
  );
}

interface FormActionsProps {
  children: React.ReactNode;
  className?: string;
}

export function FormActions({ children, className = '' }: FormActionsProps) {
  return (
    <div className={`flex flex-col sm:flex-row gap-3 pt-4 ${className}`}>
      {children}
    </div>
  );
}

interface SubmitButtonProps {
  children: React.ReactNode;
  isLoading?: boolean;
  disabled?: boolean;
  onPress: () => void;
  className?: string;
}

export function SubmitButton({
  children,
  isLoading = false,
  disabled = false,
  onPress,
  className = '',
}: SubmitButtonProps) {
  return (
    <Button
      color="primary"
      onPress={onPress}
      isLoading={isLoading}
      isDisabled={disabled}
      className={`flex-1 min-h-[44px] text-white ${className}`}
    >
      {children}
    </Button>
  );
}

// Form validation hook
export function useFormValidation<T extends Record<string, any>>(
  initialValues: T,
  validationSchema: Record<keyof T, (value: any) => string | null>
) {
  const [values, setValues] = React.useState<T>(initialValues);
  const [errors, setErrors] = React.useState<Partial<Record<keyof T, string>>>(
    {}
  );
  const [touched, setTouched] = React.useState<
    Partial<Record<keyof T, boolean>>
  >({});

  const validateField = (field: keyof T, value: any) => {
    const validator = validationSchema[field];
    if (validator) {
      return validator(value);
    }
    return null;
  };

  const setValue = (field: keyof T, value: any) => {
    setValues((prev) => ({ ...prev, [field]: value }));

    if (touched[field]) {
      const error = validateField(field, value);
      setErrors((prev) => ({ ...prev, [field]: error || undefined }));
    }
  };

  const setTouchedField = (field: keyof T) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateField(field, values[field]);
    setErrors((prev) => ({ ...prev, [field]: error || undefined }));
  };

  const validateAll = () => {
    const newErrors: Partial<Record<keyof T, string>> = {};
    let isValid = true;

    Object.keys(validationSchema).forEach((field) => {
      const error = validateField(field as keyof T, values[field as keyof T]);
      if (error) {
        newErrors[field as keyof T] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    setTouched(
      Object.keys(validationSchema).reduce(
        (acc, field) => ({
          ...acc,
          [field]: true,
        }),
        {}
      )
    );

    return isValid;
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  };

  return {
    values,
    errors,
    touched,
    setValue,
    setTouchedField,
    validateAll,
    reset,
    isValid: Object.keys(errors).length === 0,
  };
}
