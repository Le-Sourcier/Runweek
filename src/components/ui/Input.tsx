import React from 'react';

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  // You can add any custom props specific to your Input component here
  // For example: error?: boolean;
};

export const Input: React.FC<InputProps> = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={`input ${className || ''}`} // Uses .input styles from index.css
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export default Input;
