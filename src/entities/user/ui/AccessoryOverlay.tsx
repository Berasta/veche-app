import type { AvatarSize } from "./UserAvatar";

const SIZE_FACTOR: Record<string, number> = {
  xs: 0.7, sm: 0.8, md: 0.9, lg: 1, xl: 1.1, "2xl": 1.2,
};

interface AccessoryOverlayProps {
  type: string;
  size: AvatarSize;
}

export function AccessoryOverlay({ type, size }: AccessoryOverlayProps) {
  const s = SIZE_FACTOR[size] || 1;

  switch (type) {
    case "ears_cat":
      return (
        <svg className="absolute -top-2 left-0 w-full h-[120%] pointer-events-none" viewBox="0 0 100 120" fill="none">
          <path d="M12 60 Q0 5 38 15 Q22 30 18 60Z" fill="#f472b6" stroke="#ec4899" strokeWidth="1.5" opacity="0.95" />
          <path d="M88 60 Q100 5 62 15 Q78 30 82 60Z" fill="#f472b6" stroke="#ec4899" strokeWidth="1.5" opacity="0.95" />
          <path d="M15 58 Q6 12 34 18 Q24 30 20 58Z" fill="#f9a8d4" opacity="0.5" />
          <path d="M85 58 Q94 12 66 18 Q76 30 80 58Z" fill="#f9a8d4" opacity="0.5" />
        </svg>
      );
    case "ears_bunny":
      return (
        <svg className="absolute -top-4 left-0 w-full h-[130%] pointer-events-none" viewBox="0 0 100 130" fill="none">
          <ellipse cx="22" cy="18" rx="9" ry="28" fill="#f5f5f5" stroke="#d4d4d4" strokeWidth="1.5" opacity="0.95" />
          <ellipse cx="22" cy="18" rx="4" ry="22" fill="#fce7f3" opacity="0.5" />
          <ellipse cx="78" cy="18" rx="9" ry="28" fill="#f5f5f5" stroke="#d4d4d4" strokeWidth="1.5" opacity="0.95" />
          <ellipse cx="78" cy="18" rx="4" ry="22" fill="#fce7f3" opacity="0.5" />
        </svg>
      );
    case "crown":
      return (
        <svg className="absolute -top-2 left-0 w-full h-[115%] pointer-events-none" viewBox="0 0 100 115" fill="none">
          <path d="M8 55 L20 15 L35 35 L50 8 L65 35 L80 15 L92 55 L88 62 L12 62Z" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5" opacity="0.95" />
          <path d="M8 55 L20 15 L35 35 L50 8 L65 35 L80 15 L92 55 L88 58 L12 58Z" fill="#fde68a" opacity="0.3" />
          <circle cx="50" cy="12" r="4" fill="#ef4444" opacity="0.9" />
          <circle cx="28" cy="30" r="3" fill="#3b82f6" opacity="0.9" />
          <circle cx="72" cy="30" r="3" fill="#3b82f6" opacity="0.9" />
          <circle cx="15" cy="46" r="2.5" fill="#22c55e" opacity="0.9" />
          <circle cx="85" cy="46" r="2.5" fill="#22c55e" opacity="0.9" />
        </svg>
      );
    case "halo":
      return (
        <svg className="absolute -top-4 left-0 w-full h-[120%] pointer-events-none" viewBox="0 0 100 120" fill="none">
          <ellipse cx="50" cy="22" rx="35" ry="12" fill="none" stroke="#fbbf24" strokeWidth="3" opacity="0.6" />
          <ellipse cx="50" cy="22" rx="30" ry="9" fill="none" stroke="#fde68a" strokeWidth="1.5" opacity="0.4" />
          <ellipse cx="50" cy="22" rx="38" ry="14" fill="none" stroke="#fbbf24" strokeWidth="1" opacity="0.2" strokeDasharray="4 4" />
        </svg>
      );
    case "glasses":
      return (
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" fill="none">
          <circle cx="33" cy="48" r="15" fill="none" stroke="#2d2d2d" strokeWidth="2.5" opacity="0.9" />
          <circle cx="67" cy="48" r="15" fill="none" stroke="#2d2d2d" strokeWidth="2.5" opacity="0.9" />
          <path d="M48 48 L52 48" stroke="#2d2d2d" strokeWidth="2.5" />
          <path d="M33 34 L33 31" stroke="#2d2d2d" strokeWidth="2.5" />
          <path d="M67 34 L67 31" stroke="#2d2d2d" strokeWidth="2.5" />
          <path d="M18 46 Q8 44 5 48" stroke="#2d2d2d" strokeWidth="2.5" fill="none" />
          <path d="M82 46 Q92 44 95 48" stroke="#2d2d2d" strokeWidth="2.5" fill="none" />
          <circle cx="33" cy="48" r="14" fill="#a5f3fc" opacity="0.15" />
          <circle cx="67" cy="48" r="14" fill="#a5f3fc" opacity="0.15" />
        </svg>
      );
    case "flower":
      return (
        <svg className="absolute -top-2 left-0 w-full h-[115%] pointer-events-none" viewBox="0 0 100 115" fill="none">
          <g transform="translate(82, 25)">
            {[0, 60, 120, 180, 240, 300].map((angle) => (
              <ellipse key={angle} cx={0} cy={-10} rx={5.5} ry={9} fill="#f472b6" opacity="0.85" transform={`rotate(${angle})`} />
            ))}
            <circle cx="0" cy="0" r="5.5" fill="#fbbf24" />
          </g>
          <path d="M82 33 Q78 42 74 48" stroke="#22c55e" strokeWidth="2" fill="none" opacity="0.8" />
          <ellipse cx="76" cy="48" rx="3.5" ry="1.5" fill="#22c55e" opacity="0.5" />
        </svg>
      );
    default:
      return null;
  }
}
