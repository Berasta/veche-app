import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { Menu } from 'lucide-react';

export interface PageHeaderProps {
  icon?: LucideIcon;
  title: string;
  subtitle?: string;
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
    <div className="sticky top-0 z-10 h-12 border-b border-border bg-card/30 backdrop-blur-xl flex items-center px-2 md:px-4 shadow-sm">
      {/* Кнопка меню для мобильных */}
      {showMobileMenu && onMenuClick && (
        <button
          onClick={onMenuClick}
          className="md:hidden w-8 h-8 mr-2 rounded-md hover:bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
      )}

      <div className="flex items-center gap-2 flex-1 min-w-0">
        {Icon && <Icon className="w-5 h-5 text-primary flex-shrink-0" strokeWidth={2} />}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm text-foreground tracking-wide truncate">{title}</h3>
          {subtitle && <p className="text-xs text-muted-foreground truncate">{subtitle}</p>}
        </div>
      </div>

      {/* Кнопки действий */}
      {actions && (
        <div className="flex gap-1 flex-shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}
