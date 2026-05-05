import { Calendar, Users, Copy, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';

export interface InviteCardProps {
  code: string;
  expiresAt: string | null;
  maxUses: number | null;
  uses: number;
  index?: number;
  onCopy: () => void;
  onDelete: () => void;
  formatExpiryDate: (date: string | null) => string;
}

export function InviteCard({
  code,
  expiresAt,
  maxUses,
  uses,
  index = 0,
  onCopy,
  onDelete,
  formatExpiryDate
}: InviteCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="p-4 bg-card/40 border border-border rounded-lg hover:bg-card/60 transition-colors"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <code className="text-sm font-mono text-foreground bg-background/50 px-2 py-1 rounded">
              {code}
            </code>
            <button
              onClick={onCopy}
              className="p-1 hover:bg-muted rounded transition-colors"
            >
              <Copy className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={2} />
            </button>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" strokeWidth={2} />
              <span>Истекаетъ: {formatExpiryDate(expiresAt)}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Users className="w-3 h-3" strokeWidth={2} />
              <span>
                Использовано: {uses}
                {maxUses ? ` / ${maxUses}` : ' (безъ предѣла)'}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={onDelete}
          className="p-2 hover:bg-destructive/20 text-destructive rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4" strokeWidth={2} />
        </button>
      </div>
    </motion.div>
  );
}
