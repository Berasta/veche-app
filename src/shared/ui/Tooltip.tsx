import { useState, useRef, useEffect, type ReactNode } from "react";
import { Portal } from "./Portal";

type Side = "right" | "left" | "top" | "bottom";

export interface TooltipProps {
  content: string;
  children: ReactNode;
  side?: Side;
  /** Delay in ms before showing the tooltip */
  delay?: number;
}

const GAP = 8;

function getPosition(rect: DOMRect, side: Side): { top: number; left: number } {
  switch (side) {
    case "right":  return { top: rect.top + rect.height / 2, left: rect.right + GAP };
    case "left":   return { top: rect.top + rect.height / 2, left: rect.left - GAP };
    case "top":    return { top: rect.top - GAP,             left: rect.left + rect.width / 2 };
    case "bottom": return { top: rect.bottom + GAP,          left: rect.left + rect.width / 2 };
  }
}

function getTransform(side: Side, visible: boolean): string {
  switch (side) {
    case "right":  return `translateY(-50%) translateX(${visible ? "0px" : "-4px"})`;
    case "left":   return `translateY(-50%) translateX(${visible ? "-100%" : "calc(-100% + 4px)"})`;
    case "top":    return `translateX(-50%) translateY(${visible ? "-100%" : "calc(-100% + 4px)"})`;
    case "bottom": return `translateX(-50%) translateY(${visible ? "0px" : "-4px"})`;
  }
}

export function Tooltip({ content, children, side = "right", delay = 120 }: TooltipProps) {
  const [rendered, setRendered] = useState(false);
  const [visible, setVisible] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  const show = () => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const el = wrapperRef.current;
      if (!el) return;
      // display:contents has zero-rect, use first child element instead
      const rect = (el.firstElementChild ?? el).getBoundingClientRect();
      setPos(getPosition(rect, side));
      setRendered(true);
      requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
    }, delay);
  };

  const hide = () => {
    clearTimeout(timerRef.current);
    setVisible(false);
    timerRef.current = setTimeout(() => setRendered(false), 200);
  };

  useEffect(() => () => clearTimeout(timerRef.current), []);

  return (
    <div ref={wrapperRef} onMouseEnter={show} onMouseLeave={hide} className="contents">
      {children}
      {rendered && (
        <Portal>
          <div
            className="fixed z-[300] px-2.5 py-1 bg-foreground/90 text-background text-xs font-medium rounded-lg shadow-lg whitespace-nowrap"
            style={{
              top: pos.top,
              left: pos.left,
              opacity: visible ? 1 : 0,
              transform: getTransform(side, visible),
              transition: "opacity 160ms cubic-bezier(0.16,1,0.3,1), transform 160ms cubic-bezier(0.16,1,0.3,1)",
              pointerEvents: "none",
            }}
          >
            {content}
          </div>
        </Portal>
      )}
    </div>
  );
}
