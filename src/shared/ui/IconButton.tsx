import { ButtonHTMLAttributes, forwardRef } from "react";
import { motion } from "motion/react";
import { LucideIcon } from "lucide-react";
import { Tooltip, type TooltipProps } from "./Tooltip";

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  tooltip?: string;
  tooltipSide?: TooltipProps["side"];
  variant?: "default" | "primary" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
  active?: boolean;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      icon: Icon,
      tooltip,
      tooltipSide = "right",
      variant = "default",
      size = "md",
      active = false,
      className = "",
      ...props
    },
    ref,
  ) => {
    const sizes = {
      sm: "w-7 h-7",
      md: "w-8 h-8",
      lg: "w-10 h-10",
    };

    const iconSizes = {
      sm: "w-3.5 h-3.5",
      md: "w-4 h-4",
      lg: "w-5 h-5",
    };

    const variants = {
      default: active
        ? "bg-primary/20 text-primary"
        : "hover:bg-muted/50 text-muted-foreground hover:text-foreground",
      primary: "bg-primary/10 text-primary hover:bg-primary/20",
      ghost: "hover:bg-muted/50 text-muted-foreground hover:text-foreground",
      destructive: "hover:bg-destructive/20 text-destructive",
    };

    const btn = (
      <motion.button
        ref={ref}
        className={`${sizes[size]} rounded-md flex items-center justify-center transition-colors ${variants[variant]} ${className}`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        {...props}
      >
        <Icon className={iconSizes[size]} strokeWidth={2} />
      </motion.button>
    );

    return tooltip ? (
      <Tooltip content={tooltip} side={tooltipSide}>{btn}</Tooltip>
    ) : btn;
  },
);

IconButton.displayName = "IconButton";
