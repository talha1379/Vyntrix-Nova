import * as React from "react";

import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-24 w-full rounded-lg border border-border bg-surface-subtle px-3 py-2 text-sm shadow-subtle transition-[background-color,border-color,box-shadow] duration-(--motion-standard) ease-(--ease-standard) placeholder:text-muted-foreground hover:border-border-strong focus-visible:border-border-focus focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
