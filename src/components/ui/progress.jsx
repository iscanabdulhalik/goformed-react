// src/components/ui/progress.jsx
import * as React from "react";
import { cn } from "@/lib/utils";

const Progress = React.forwardRef(({ className, value = 0, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-gray-200",
        className
      )}
      {...props}
    >
      <div
        className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300 ease-out rounded-full"
        style={{
          width: `${Math.min(Math.max(value, 0), 100)}%`,
        }}
      />
    </div>
  );
});

Progress.displayName = "Progress";

export { Progress };
