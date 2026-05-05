import { motion } from "motion/react";
import { Portal } from "@components/ui/Portal";
import { useState, useRef } from "react";

const serverColors = [
  "from-violet-500 to-purple-600",
  "from-blue-500 to-cyan-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-rose-500 to-pink-600",
  "from-sky-500 to-indigo-600",
  "from-lime-500 to-green-600",
  "from-red-500 to-rose-600",
];

export interface ServerButtonProps {
  name: string;
  avatarUrl?: string | null;
  isSelected: boolean;
  onClick: () => void;
  index?: number;
}

export function ServerButton({
  name,
  avatarUrl,
  isSelected,
  onClick,
  index = 0,
}: ServerButtonProps) {
  const initials = name.charAt(0).toUpperCase();
  const colorClass = serverColors[index % serverColors.length];
  const [showTooltip, setShowTooltip] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  const handleMouseEnter = () => {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setTooltipPos({
        top: rect.top + rect.height / 2,
        left: rect.right + 12,
      });
    }
    setShowTooltip(true);
  };
  const handleMouseLeave = () => setShowTooltip(false);

  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <motion.button
        ref={btnRef}
        onClick={onClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={
          `cursor-pointer w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-200 relative overflow-hidden ` +
          (isSelected
            ? "bg-primary/15 text-primary ring-1 ring-primary/30"
            : "text-foreground/40 hover:text-foreground/70 hover:bg-foreground/5") +
          (isSelected ? "" : "")
        }
        title={name}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
        ) : (
          <span className={`w-full h-full flex items-center justify-center text-xs font-bold bg-gradient-to-br ${colorClass} text-white`}>
            {initials}
          </span>
        )}

        {/* Active indicator */}
        {isSelected && (
          <motion.div
            className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full"
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </motion.button>

      {/* Tooltip через портал */}
      <Portal>
        <div
          className={`fixed px-3 py-1.5 bg-popover text-popover-foreground rounded-md text-sm whitespace-nowrap shadow-lg border border-border z-50 transition-opacity duration-150 ${showTooltip ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          style={{
            top: tooltipPos.top,
            left: tooltipPos.left,
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
          }}
        >
          {name}
        </div>
      </Portal>
    </motion.div>
  );
}
