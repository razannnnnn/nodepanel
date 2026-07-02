import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { type VariantProps, cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#78A9FF]/50 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-[#78A9FF] text-[#0B1017] hover:bg-[#5A8FEF] shadow-sm",
        destructive: "bg-[#F87171] text-white hover:bg-[#EF5A5A] shadow-sm",
        success: "bg-[#4ADE80] text-[#0B1017] hover:bg-[#3ACC70] shadow-sm",
        outline: "border shadow-sm hover:bg-[var(--bg-card)]",
        secondary: "hover:bg-[var(--bg-card-hover)]",
        ghost: "hover:bg-[var(--bg-card)]",
        link: "text-[#78A9FF] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-lg px-6",
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
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, style, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    const mergedStyle: React.CSSProperties = { ...getVariantStyles(variant), ...style };
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        style={mergedStyle}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

function getVariantStyles(variant?: string | null): React.CSSProperties {
  switch (variant) {
    case "outline":
      return { borderColor: "var(--border-default)", color: "var(--text-primary)" };
    case "secondary":
      return { backgroundColor: "var(--bg-card)", color: "var(--text-primary)" };
    case "ghost":
      return { color: "var(--text-secondary)" };
    default:
      return {};
  }
}

export { Button, buttonVariants };
