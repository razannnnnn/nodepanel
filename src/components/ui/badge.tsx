import * as React from "react";
import { type VariantProps, cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "text-[#78A9FF] border",
        success: "text-[#4ADE80] border",
        danger: "text-[#F87171] border",
        warning: "text-[#FBBF24] border",
        secondary: "border",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, style, ...props }: BadgeProps) {
  const bgStyle = getBadgeStyle(variant);
  return (
    <span
      className={cn(badgeVariants({ variant }), className)}
      style={{ ...bgStyle, ...style }}
      {...props}
    />
  );
}

function getBadgeStyle(variant?: string | null): React.CSSProperties {
  switch (variant) {
    case "default":
      return {
        backgroundColor: "var(--color-primary-muted)",
        borderColor: "rgba(120, 169, 255, 0.2)",
        color: "#78A9FF",
      };
    case "success":
      return {
        backgroundColor: "var(--color-success-muted)",
        borderColor: "rgba(74, 222, 128, 0.2)",
        color: "#4ADE80",
      };
    case "danger":
      return {
        backgroundColor: "var(--color-danger-muted)",
        borderColor: "rgba(248, 113, 113, 0.2)",
        color: "#F87171",
      };
    case "warning":
      return {
        backgroundColor: "var(--color-warning-muted)",
        borderColor: "rgba(251, 191, 36, 0.2)",
        color: "#FBBF24",
      };
    case "secondary":
      return {
        backgroundColor: "var(--bg-card)",
        borderColor: "var(--border-default)",
        color: "var(--text-secondary)",
      };
    default:
      return {};
  }
}

export { Badge, badgeVariants };
