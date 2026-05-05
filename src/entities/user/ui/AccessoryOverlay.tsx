import type { AvatarSize } from "./UserAvatar";

const SIZE_FACTOR: Record<string, number> = {
  xs: 0.5, sm: 0.6, md: 0.7, lg: 0.8, xl: 0.9, "2xl": 1,
};

interface AccessoryOverlayProps {
  type: string;
  size: AvatarSize;
}

export function AccessoryOverlay({ type, size }: AccessoryOverlayProps) {
  const s = SIZE_FACTOR[size] || 1;
  const sc = (n: number) => n * s;

  switch (type) {
    case "ears_cat":
      return (
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" fill="none">
          {/* Left ear */}
          <path d="M20 45 Q15 15 35 20 Q25 30 25 45Z" fill="#f472b6" stroke="#ec4899" strokeWidth="1" opacity="0.9" />
          <path d="M23 42 Q18 20 33 23 Q26 30 26 42Z" fill="#f9a8d4" opacity="0.6" />
          {/* Right ear */}
          <path d="M80 45 Q85 15 65 20 Q75 30 75 45Z" fill="#f472b6" stroke="#ec4899" strokeWidth="1" opacity="0.9" />
          <path d="M77 42 Q82 20 67 23 Q74 30 74 42Z" fill="#f9a8d4" opacity="0.6" />
        </svg>
      );
    case "ears_bunny":
      return (
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" fill="none">
          <ellipse cx="30" cy="25" rx="6" ry="18" fill="#f5f5f5" stroke="#d4d4d4" strokeWidth="1" opacity="0.9" />
          <ellipse cx="30" cy="25" rx="3" ry="14" fill="#fce7f3" opacity="0.5" />
          <ellipse cx="70" cy="25" rx="6" ry="18" fill="#f5f5f5" stroke="#d4d4d4" strokeWidth="1" opacity="0.9" />
          <ellipse cx="70" cy="25" rx="3" ry="14" fill="#fce7f3" opacity="0.5" />
        </svg>
      );
    case "crown":
      return (
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" fill="none">
          <path d="M15 45 L25 20 L35 35 L50 15 L65 35 L75 20 L85 45 L80 55 L20 55Z" fill="#fbbf24" stroke="#d97706" strokeWidth="1" opacity="0.9" />
          <path d="M15 45 L25 20 L35 35 L50 15 L65 35 L75 20 L85 45 L80 50 L20 50Z" fill="#fde68a" opacity="0.4" />
          <circle cx="50" cy="18" r="3" fill="#ef4444" opacity="0.8" />
          <circle cx="35" cy="30" r="2" fill="#3b82f6" opacity="0.8" />
          <circle cx="65" cy="30" r="2" fill="#3b82f6" opacity="0.8" />
        </svg>
      );
    case "halo":
      return (
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" fill="none">
          <ellipse cx="50" cy="28" rx="25" ry="8" fill="none" stroke="#fbbf24" strokeWidth="2" opacity="0.6" />
          <ellipse cx="50" cy="28" rx="22" ry="6" fill="none" stroke="#fde68a" strokeWidth="1" opacity="0.4" />
        </svg>
      );
    case "glasses":
      return (
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" fill="none">
          <circle cx="35" cy="50" r="12" fill="none" stroke="#333" strokeWidth="1.5" opacity="0.8" />
          <circle cx="65" cy="50" r="12" fill="none" stroke="#333" strokeWidth="1.5" opacity="0.8" />
          <path d="M47 50 L53 50" stroke="#333" strokeWidth="1.5" />
          <path d="M35 40 L35 38" stroke="#333" strokeWidth="1.5" />
          <path d="M65 40 L65 38" stroke="#333" strokeWidth="1.5" />
          <path d="M23 48 Q15 46 10 50" stroke="#333" strokeWidth="1.5" fill="none" />
          <path d="M77 48 Q85 46 90 50" stroke="#333" strokeWidth="1.5" fill="none" />
          <circle cx="35" cy="50" r="11" fill="#a5f3fc" opacity="0.2" />
          <circle cx="65" cy="50" r="11" fill="#a5f3fc" opacity="0.2" />
        </svg>
      );
    case "flower":
      return (
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" fill="none">
          <g transform="translate(75, 28) rotate(15)">
            {[0, 60, 120, 180, 240, 300].map((angle) => (
              <ellipse
                key={angle}
                cx={0}
                cy={-7}
                rx={4}
                ry={6}
                fill="#f472b6"
                opacity="0.8"
                transform={`rotate(${angle})`}
              />
            ))}
            <circle cx="0" cy="0" r="4" fill="#fbbf24" />
          </g>
          <path d="M75 34 Q72 40 70 45" stroke="#22c55e" strokeWidth="1.5" fill="none" />
        </svg>
      );
    default:
      return null;
  }
}
