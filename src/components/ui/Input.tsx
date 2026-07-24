import React from "react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", label, error, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label className="text-xs font-semibold tracking-wide text-[var(--color-secondary)]">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`flex h-10 w-full rounded-2xl border border-[var(--color-border)] bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 ${
            error ? "border-[var(--color-error)] focus:ring-[var(--color-error)]" : ""
          } ${className}`}
          {...props}
        />
        {error && <span className="text-xs text-[var(--color-error)]">{error}</span>}
      </div>
    );
  }
);
Input.displayName = "Input";
