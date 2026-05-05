import { LucideIcon } from 'lucide-react';

export interface Option {
  value: string;
  label: string;
  icon?: LucideIcon;
}

export interface InviteOptionsProps {
  title: string;
  options: Option[];
  selected: string;
  onSelect: (value: string) => void;
  gridCols?: string;
}

export function InviteOptions({
  title,
  options,
  selected,
  onSelect,
  gridCols = 'grid-cols-2 sm:grid-cols-5'
}: InviteOptionsProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-3">
        {title}
      </label>
      <div className={`grid ${gridCols} gap-2`}>
        {options.map(option => {
          const Icon = option.icon;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onSelect(option.value)}
              className={`p-3 rounded-lg border transition-all text-center ${
                selected === option.value
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-card/40 hover:bg-card/60 text-foreground'
              }`}
            >
              {Icon && <Icon className="w-4 h-4 mx-auto mb-1" strokeWidth={2} />}
              <div className="text-xs font-medium">{option.label}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
