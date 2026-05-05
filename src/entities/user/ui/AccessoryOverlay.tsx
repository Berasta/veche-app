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
  const g = (n: number) => n * s;

  switch (type) {
    case "ears_cat":
      return (
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" fill="none">
          <path d="M15 50 Q5 5 40 15 Q25 28 22 50Z" fill="#f472b6" stroke="#ec4899" strokeWidth="1.5" opacity="0.95" />
          <path d="M85 50 Q95 5 60 15 Q75 28 78 50Z" fill="#f472b6" stroke="#ec4899" strokeWidth="1.5" opacity="0.95" />
          <path d="M18 48 Q10 12 36 19 Q26 28 24 48Z" fill="#f9a8d4" opacity="0.5" />
          <path d="M82 48 Q90 12 64 19 Q74 28 76 48Z" fill="#f9a8d4" opacity="0.5" />
        </svg>
      );
    case "ears_bunny":
      return (
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" fill="none">
          <ellipse cx="25" cy="22" rx="8" ry="24" fill="#f5f5f5" stroke="#d4d4d4" strokeWidth="1.5" opacity="0.95" />
          <ellipse cx="25" cy="22" rx="4" ry="18" fill="#fce7f3" opacity="0.5" />
          <ellipse cx="75" cy="22" rx="8" ry="24" fill="#f5f5f5" stroke="#d4d4d4" strokeWidth="1.5" opacity="0.95" />
          <ellipse cx="75" cy="22" rx="4" ry="18" fill="#fce7f3" opacity="0.5" />
        </svg>
      );
    case "crown":
      return (
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" fill="none">
          <path d="M10 52 L22 18 L35 35 L50 12 L65 35 L78 18 L90 52 L85 60 L15 60Z" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5" opacity="0.95" />
          <path d="M10 52 L22 18 L35 35 L50 12 L65 35 L78 18 L90 52 L85 55 L15 55Z" fill="#fde68a" opacity="0.3" />
          <circle cx="50" cy="16" r="4" fill="#ef4444" opacity="0.9" />
          <circle cx="32" cy="32" r="3" fill="#3b82f6" opacity="0.9" />
          <circle cx="68" cy="32" r="3" fill="#3b82f6" opacity="0.9" />
          <circle cx="20" cy="44" r="2.5" fill="#22c55e" opacity="0.9" />
          <circle cx="80" cy="44" r="2.5" fill="#22c55e" opacity="0.9" />
        </svg>
      );
    case "halo":
      return (
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" fill="none">
          <ellipse cx="50" cy="25" rx="32" ry="10" fill="none" stroke="#fbbf24" strokeWidth="3" opacity="0.7" />
          <ellipse cx="50" cy="25" rx="28" ry="8" fill="none" stroke="#fde68a" strokeWidth="1.5" opacity="0.4" />
          <ellipse cx="50" cy="25" rx="35" ry="12" fill="none" stroke="#fbbf24" strokeWidth="1" opacity="0.2" strokeDasharray="4 4" />
        </svg>
      );
    case "glasses":
      return (
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" fill="none">
          <circle cx="33" cy="52" r="15" fill="none" stroke="#2d2d2d" strokeWidth="2.5" opacity="0.9" />
          <circle cx="67" cy="52" r="15" fill="none" stroke="#2d2d2d" strokeWidth="2.5" opacity="0.9" />
          <path d="M48 52 L52 52" stroke="#2d2d2d" strokeWidth="2.5" />
          <path d="M33 38 L33 35" stroke="#2d2d2d" strokeWidth="2.5" />
          <path d="M67 38 L67 35" stroke="#2d2d2d" strokeWidth="2.5" />
          <path d="M18 50 Q8 48 5 52" stroke="#2d2d2d" strokeWidth="2.5" fill="none" />
          <path d="M82 50 Q92 48 95 52" stroke="#2d2d2d" strokeWidth="2.5" fill="none" />
          <circle cx="33" cy="52" r="14" fill="#a5f3fc" opacity="0.15" />
          <circle cx="67" cy="52" r="14" fill="#a5f3fc" opacity="0.15" />
        </svg>
      );
    case "flower":
      return (
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" fill="none">
          <g transform="translate(80, 28)">
            {[0, 60, 120, 180, 240, 300].map((angle) => (
              <ellipse key={angle} cx={0} cy={-9} rx={5} ry={8} fill="#f472b6" opacity="0.85" transform={`rotate(${angle})`} />
            ))}
            <circle cx="0" cy="0" r="5" fill="#fbbf24" />
          </g>
          <path d="M80 34 Q76 42 73 48" stroke="#22c55e" strokeWidth="2" fill="none" opacity="0.8" />
          <ellipse cx="75" cy="48" rx="3" ry="1.5" fill="#22c55e" opacity="0.5" />
        </svg>
      );
    default:
      return null;
  }
}
