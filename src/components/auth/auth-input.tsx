import { forwardRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
}

/**
 * AuthInput - Reusable input component with label and error display
 * Integrates with React Hook Form and provides consistent styling
 */
export const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  ({ label, error, helperText, className, id, ...props }, ref) => {
    const inputId = id || props.name;

    return (
      <div className="space-y-2">
        <Label
          htmlFor={inputId}
          className="text-sm font-medium text-zinc-300"
        >
          {label}
        </Label>
        <Input
          ref={ref}
          id={inputId}
          aria-invalid={!!error}
          aria-describedby={
            error
              ? `${inputId}-error`
              : helperText
                ? `${inputId}-hint`
                : undefined
          }
          className={cn(
            "h-11 rounded-xl border-white/10 bg-white/[0.03] text-zinc-100 placeholder:text-zinc-500 shadow-inner shadow-black/10",
            error &&
              "border-red-500/70 focus-visible:ring-red-500 focus-visible:ring-offset-zinc-950",
            className
          )}
          {...props}
        />
        {error && (
          <p
            id={`${inputId}-error`}
            className="text-sm text-red-400 animate-in fade-in slide-in-from-top-1"
          >
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={`${inputId}-hint`} className="text-sm text-zinc-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

AuthInput.displayName = "AuthInput";

export default AuthInput;
