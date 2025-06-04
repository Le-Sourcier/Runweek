import React from 'react';
import { ChevronDown } from 'lucide-react';

// Simplified Select component structure

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children: React.ReactNode;
  onValueChange?: (value: string) => void;
  defaultValue?: string;
}

export const Select: React.FC<SelectProps> = ({ children, className, onValueChange, defaultValue, ...props }) => {
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (onValueChange) {
      onValueChange(event.target.value);
    }
    if (props.onChange) {
      props.onChange(event);
    }
  };

  return (
    <div className={`relative w-full ${className || ''}`}>
      <select
        className="input appearance-none w-full pr-8" // Use .input style, remove default arrow, add padding for custom arrow
        defaultValue={defaultValue}
        {...props}
        onChange={handleChange}
      >
        {children}
      </select>
      <ChevronDown
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none"
        size={16}
      />
    </div>
  );
};

interface SelectItemProps extends React.OptionHTMLAttributes<HTMLOptionElement> {
  children: React.ReactNode;
  value: string;
}

export const SelectItem: React.FC<SelectItemProps> = ({ children, value, ...props }) => {
  return (
    <option value={value} {...props}>
      {children}
    </option>
  );
};

// Dummy components to match the structure used in the form, though they don't do much for a native select
export const SelectTrigger: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => (
  <div className={className}>{children}</div> // This will wrap the SelectValue, but the actual trigger is the select itself
);

export const SelectValue: React.FC<{ placeholder?: string }> = ({ placeholder }) => (
  // This is mainly a conceptual placeholder for the native select's displayed value.
  // The actual display is handled by the browser's rendering of the <select> element.
  // If a value is selected, it shows. If not, and there's no placeholder option, it might show the first option.
  // To truly show a placeholder, you'd typically have an <option value="" disabled selected>{placeholder}</option>
  <span>{placeholder}</span> // This won't actually render as the select's value display area.
);

export const SelectContent: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  // The options are passed directly as children to Select for a native select.
  // This component is part of the custom select API but is a no-op here.
  <>{children}</>
);

export default Select;
