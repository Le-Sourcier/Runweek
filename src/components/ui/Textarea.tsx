import React from "react";

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  // Custom props for Textarea if any
};

export const Textarea: React.FC<TextareaProps> = React.forwardRef<
  HTMLTextAreaElement,
  TextareaProps
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={`input border-input bg-background ${className || ""}`} // Using .input styles from index.css for consistency
      ref={ref}
      {...props}
    />
  );
});

Textarea.displayName = "Textarea";

export default Textarea;
