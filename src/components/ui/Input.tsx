import { Eye, EyeOff } from "lucide-react";
import React from "react";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  // You can add any custom props specific to your Input component here
  // For example: error?: boolean;
};

export const Input: React.FC<InputProps> = React.forwardRef<
  HTMLInputElement,
  InputProps
>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={`input border-input bg-background  ${className || ""}`} // Uses .input styles from index.css
      ref={ref}
      {...props}
    />
  );
});

Input.displayName = "Input";

interface InputProps2 extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  isPassword?: boolean;
}

export const Input2: React.FC<InputProps2> = ({
  label,
  error,
  isPassword = false,
  className = "",
  ...props
}) => {
  const [showPassword, setShowPassword] = React.useState(false);

  const inputType = isPassword
    ? showPassword
      ? "text"
      : "password"
    : props.type;

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="relative">
        <input
          {...props}
          type={inputType}
          className={`
            block w-full px-4 py-4 bg-white/60 backdrop-blur-sm border border-white/20 rounded-2xl
            focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400/50 focus:bg-white/80
            transition-all duration-200 ease-in-out
            placeholder-gray-400 text-gray-900
            ${
              error
                ? "border-red-300 focus:ring-red-400/50 focus:border-red-400/50"
                : ""
            }
            ${isPassword ? "pr-12" : ""}
            ${className}
          `}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        )}
      </div>
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  );
};

export default Input;
