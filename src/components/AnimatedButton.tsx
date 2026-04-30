import { motion } from 'motion/react';
import { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface AnimatedButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  loading?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit';
}

export function AnimatedButton({
  children,
  onClick,
  className = '',
  variant = 'primary',
  loading = false,
  disabled = false,
  type = 'button',
}: AnimatedButtonProps) {
  const baseClasses = 'relative overflow-hidden px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed';

  const variantClasses = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-muted text-foreground hover:bg-muted/80',
    ghost: 'hover:bg-muted/50 text-foreground',
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      {/* Ripple effect background */}
      <motion.div
        className="absolute inset-0 bg-white/10"
        initial={{ scale: 0, opacity: 0 }}
        whileHover={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
      />

      {/* Content */}
      <span className="relative flex items-center justify-center gap-2">
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Loader2 className="w-4 h-4 animate-spin" />
          </motion.div>
        )}
        {children}
      </span>
    </motion.button>
  );
}

// Вариант с иконкой
export function IconButton({
  icon: Icon,
  onClick,
  className = '',
  tooltip,
}: {
  icon: any;
  onClick?: () => void;
  className?: string;
  tooltip?: string;
}) {
  return (
    <motion.button
      onClick={onClick}
      className={`w-8 h-8 rounded-md hover:bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors ${className}`}
      title={tooltip}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      <Icon className="w-4 h-4" strokeWidth={2} />
    </motion.button>
  );
}
