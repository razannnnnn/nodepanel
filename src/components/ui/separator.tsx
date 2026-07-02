import * as React from "react";
import * as SeparatorPrimitive from "@radix-ui/react-separator";
import { cn } from "@/lib/utils";

const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>
>(({ className, orientation = "horizontal", decorative = true, ...props }, ref) => (
  <SeparatorPrimitive.Root
    ref={ref}
    decorative={decorative}
    orientation={orientation}
    className={cn("shrink-0", className)}
    style={{
      backgroundColor: "var(--border-default)",
      ...(orientation === "horizontal" ? { height: "1px", width: "100%" } : { height: "100%", width: "1px" }),
    }}
    {...props}
  />
));
Separator.displayName = "Separator";

export { Separator };
