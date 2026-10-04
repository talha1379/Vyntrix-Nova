/* eslint-disable react-refresh/only-export-components */

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium cursor-pointer transition-[background-color,border-color,color,box-shadow,transform,opacity] duration-(--motion-standard) ease-(--ease-standard) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 active:translate-y-px [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-subtle hover:bg-primary-hover hover:shadow-elevated active:bg-primary-active active:shadow-subtle",
        destructive:
          "bg-destructive text-destructive-foreground shadow-subtle hover:bg-destructive/90 hover:shadow-elevated active:bg-destructive/80",
        outline:
          "border border-border bg-transparent text-foreground hover:border-border-strong hover:bg-surface-interactive hover:text-foreground",
        secondary:
          "border border-transparent bg-secondary text-secondary-foreground hover:bg-surface-interactive hover:text-foreground active:bg-surface-subtle",
        ghost: "hover:bg-surface-interactive hover:text-foreground active:bg-surface-subtle",
        link: "text-primary hover:text-primary-hover underline-offset-4 hover:underline active:text-primary-active",
      },
      size: {
        default: "h-9 px-4 py-2 text-sm",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8 text-sm",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
