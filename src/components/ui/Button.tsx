import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'; // Add more variants as needed
  isLoading?: boolean; // To show loading state
  // Add other custom props like size if needed
}

export const Button: React.FC<ButtonProps> = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', isLoading, children, ...props }, ref) => {
    const baseClasses = 'btn'; // From index.css
    const variantClasses = {
      primary: 'btn-primary', // Assumes .btn-primary is defined in index.css
      secondary: 'btn-secondary', // Assumes .btn-secondary is defined
      outline: 'btn-outline dark:border-muted dark:text-muted-foreground dark:hover:bg-muted/20', // Adjusted for dark mode consistency
      ghost: 'btn-ghost', // Assumes .btn-ghost is defined
      destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90', // Example for destructive
    };

    return (
      <button
        className={`${baseClasses} ${variantClasses[variant]} ${className || ''}`}
        ref={ref}
        disabled={props.disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
