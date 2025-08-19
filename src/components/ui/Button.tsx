import { Loader2 } from "lucide-react";
import React from "react";
import Spiner from "./Spiner";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive"; // Add more variants as needed
  isLoading?: boolean; // To show loading state
  // Add other custom props like size if needed
}

export const Button: React.FC<ButtonProps> = React.forwardRef<
  HTMLButtonElement,
  ButtonProps
>(({ className, variant = "primary", isLoading, children, ...props }, ref) => {
  const baseClasses = "btn"; // From index.css
  const variantClasses = {
    primary: "btn-primary", // Assumes .btn-primary is defined in index.css
    secondary: "btn-secondary", // Assumes .btn-secondary is defined
    outline:
      "btn-outline dark:border-muted dark:text-muted-foreground dark:hover:bg-muted/20", // Adjusted for dark mode consistency
    ghost: "btn-ghost", // Assumes .btn-ghost is defined
    destructive:
      "bg-destructive text-destructive-foreground hover:bg-destructive/90", // Example for destructive
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className || ""}`}
      ref={ref}
      disabled={props.disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Spiner />
      ) : null}
      {children}
    </button>
  );
});

Button.displayName = "Button";

interface ButtonProps2 extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "social";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export const Button2: React.FC<ButtonProps2> = ({
  variant = "primary",
  size = "md",
  loading = false,
  className = "",
  children,
  disabled,
  icon,
  ...props
}) => {
  const baseClasses = `
    relative inline-flex items-center justify-center font-medium rounded-2xl
    transition-all duration-200 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    transform hover:scale-[1.02] active:scale-[0.98]
  `;

  const variants = {
    primary: `
      bg-gradient-to-r from-yellow-400 to-orange-500
      hover:from-yellow-500 hover:to-orange-600
      text-white shadow-lg hover:shadow-xl
      focus:ring-orange-400/50
    `,
    secondary: `
      bg-white/60 backdrop-blur-sm border border-white/20
      hover:bg-white/80 hover:border-white/30
      text-gray-700 hover:text-gray-900
      focus:ring-gray-400/50
    `,
    outline: `
      border-2 border-gray-300 hover:border-gray-400
      text-gray-700 hover:text-gray-900
      bg-white/40 hover:bg-white/60 backdrop-blur-sm
      focus:ring-gray-400/50
    `,
    social: `
      bg-white/80 backdrop-blur-sm border border-white/30
      hover:bg-white/90 hover:border-white/40
      text-gray-700 hover:text-gray-900
      focus:ring-gray-400/50 shadow-sm hover:shadow-md
    `,
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-4 text-base",
    lg: "px-8 py-4 text-lg",
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {icon && !loading && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};

export default Button;
