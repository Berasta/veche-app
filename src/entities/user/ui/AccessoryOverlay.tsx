import type { AvatarSize } from "./UserAvatar";

const SIZE_FACTOR: Record<string, number> = {
  xs: 0.6, sm: 0.7, md: 0.8, lg: 0.9, xl: 1, "2xl": 1.1,
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
        <svg className="absolute -top-4 left-0 w-full h-[140%] pointer-events-none" viewBox="0 0 100 140" fill="none" style={{ transform: `scale(${s})`, transformOrigin: "center bottom" }}>
          <path d="M10 70 Q0 8 38 18 Q20 35 16 70Z" fill="#f472b6" stroke="#ec4899" strokeWidth="1.5" opacity="0.95" />
          <path d="M90 70 Q100 8 62 18 Q80 35 84 70Z" fill="#f472b6" stroke="#ec4899" strokeWidth="1.5" opacity="0.95" />
          <path d="M14 68 Q6 14 34 20 Q22 35 18 68Z" fill="#f9a8d4" opacity="0.5" />
          <path d="M86 68 Q94 14 66 20 Q78 35 82 68Z" fill="#f9a8d4" opacity="0.5" />
        </svg>
      );
    case "ears_bunny":
      return (
        <svg className="absolute -top-6 left-0 w-full h-[150%] pointer-events-none" viewBox="0 0 100 150" fill="none" style={{ transform: `scale(${s})`, transformOrigin: "center bottom" }}>
          <ellipse cx="22" cy="18" rx="9" ry="32" fill="#f5f5f5" stroke="#d4d4d4" strokeWidth="1.5" opacity="0.95" />
          <ellipse cx="22" cy="18" rx="4" ry="25" fill="#fce7f3" opacity="0.5" />
          <ellipse cx="78" cy="18" rx="9" ry="32" fill="#f5f5f5" stroke="#d4d4d4" strokeWidth="1.5" opacity="0.95" />
          <ellipse cx="78" cy="18" rx="4" ry="25" fill="#fce7f3" opacity="0.5" />
        </svg>
      );
    case "crown":
      return (
        <svg className="absolute -top-4 left-0 w-full h-[130%] pointer-events-none" viewBox="0 0 100 130" fill="none" style={{ transform: `scale(${s})`, transformOrigin: "center bottom" }}>
          <path d="M6 65 L18 18 L35 38 L50 8 L65 38 L82 18 L94 65 L88 72 L12 72Z" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5" opacity="0.95" />
          <path d="M6 65 L18 18 L35 38 L50 8 L65 38 L82 18 L94 65 L88 68 L12 68Z" fill="#fde68a" opacity="0.3" />
          <circle cx="50" cy="12" r="4.5" fill="#ef4444" opacity="0.9" />
          <circle cx="28" cy="32" r="3.5" fill="#3b82f6" opacity="0.9" />
          <circle cx="72" cy="32" r="3.5" fill="#3b82f6" opacity="0.9" />
          <circle cx="14" cy="55" r="3" fill="#22c55e" opacity="0.9" />
          <circle cx="86" cy="55" r="3" fill="#22c55e" opacity="0.9" />
        </svg>
      );
    case "halo":
      return (
        <svg className="absolute -top-6 left-0 w-full h-[140%] pointer-events-none" viewBox="0 0 100 140" fill="none" style={{ transform: `scale(${s})`, transformOrigin: "center bottom" }}>
          <ellipse cx="50" cy="20" rx="36" ry="13" fill="none" stroke="#fbbf24" strokeWidth="3" opacity="0.6" />
          <ellipse cx="50" cy="20" rx="31" ry="10" fill="none" stroke="#fde68a" strokeWidth="1.5" opacity="0.4" />
          <ellipse cx="50" cy="20" rx="40" ry="15" fill="none" stroke="#fbbf24" strokeWidth="1" opacity="0.2" strokeDasharray="4 4" />
        </svg>
      );
    case "glasses":
      return (
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" fill="none" style={{ transform: `scale(${s})`, transformOrigin: "center center" }}>
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
        <svg className="absolute -top-4 left-0 w-full h-[130%] pointer-events-none" viewBox="0 0 100 130" fill="none" style={{ transform: `scale(${s})`, transformOrigin: "center bottom" }}>
          <g transform="translate(82, 22)">
            {[0, 60, 120, 180, 240, 300].map((angle) => (
              <ellipse key={angle} cx={0} cy={-10} rx={6} ry={10} fill="#f472b6" opacity="0.85" transform={`rotate(${angle})`} />
            ))}
            <circle cx="0" cy="0" r="6" fill="#fbbf24" />
          </g>
          <path d="M82 30 Q76 42 72 50" stroke="#22c55e" strokeWidth="2" fill="none" opacity="0.8" />
          <ellipse cx="74" cy="50" rx="3.5" ry="1.5" fill="#22c55e" opacity="0.5" />
        </svg>
      );
    default:
      return null;
  }
}
