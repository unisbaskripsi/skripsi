import React from "react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center h-10 px-4 py-2 rounded-md font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
    
    const variants = {
      primary:
        "bg-[var(--color-primary)] text-white hover:opacity-90 focus:ring-[var(--color-primary)]",
      secondary:
        "bg-white text-[var(--color-secondary)] border border-[var(--color-border)] hover:bg-[var(--color-surface-dim)] focus:ring-[var(--color-secondary)]",
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${className}`}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
