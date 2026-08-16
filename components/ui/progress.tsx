import * as React from "react";
import { cn } from "@/lib/utils";

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number | null;
  max?: number;
  indicatorClassName?: string;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value, max = 100, indicatorClassName, ...props }, ref) => {
    const percentage = value != null ? Math.min(Math.max((value / max) * 100, 0), 100) : 0;
    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value ?? undefined}
        className={cn(
          "relative h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800",
          className
        )}
        {...props}
      >
        <div
          className={cn(
            "h-full w-full flex-1 bg-emerald-600 transition-all duration-300 ease-in-out",
            indicatorClassName
          )}
          style={{ transform: `translateX(-${100 - (percentage || 0)}%)` }}
        />
      </div>
    );
  }
);
Progress.displayName = "Progress";

export { Progress };
