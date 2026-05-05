import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { Menu } from 'lucide-react';

export interface PageHeaderProps {
  icon?: LucideIcon;
  title: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
  onMenuClick?: () => void;
  showMobileMenu?: boolean;
}

export function PageHeader({
  icon: Icon,
  title,
  subtitle,
  actions,
  onMenuClick,
  showMobileMenu = true
}: PageHeaderProps) {
  return (
    <div className="fixed md:sticky top-0 z-30 md:z-10 h-12 w-full bg-background/40 backdrop-blur-xl flex items-center px-2 md:px-4">
      {/* Кнопка меню для мобильных */}
      {showMobileMenu && onMenuClick && (
        <button
          onClick={onMenuClick}
          className="md:hidden w-8 h-8 mr-2 rounded-xl hover:bg-foreground/5 flex items-center justify-center text-foreground/30 hover:text-foreground/60 transition-colors"
        >
          <Menu className="w-4 h-4" strokeWidth={1.5} />
        </button>
      )}

      <div className="flex items-center gap-2.5 flex-1 min-w-0">
        {Icon && <Icon className="w-4 h-4 text-foreground/30 flex-shrink-0" strokeWidth={1.5} />}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm text-foreground/80 tracking-wide truncate">{title}</h3>
          {subtitle && <p className="text-[11px] text-foreground/40 truncate">{subtitle}</p>}
        </div>
      </div>

      {/* Кнопки действий */}
      {actions && (
        <div className="flex gap-0.5 flex-shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}
