import { useState } from 'react';
import { motion } from 'motion/react';
import { MessageHeader } from './MessageHeader';
import { MessageContent } from './MessageContent';
import { MessageImages } from './MessageImages';
import { ReactionsBar, type ReactionGroup } from './ReactionsBar';
import { MoreHorizontal, Pencil, Trash2, Check, X } from 'lucide-react';

interface GramotaMessageProps {
  author: string;
  avatar?: string;
  time: string;
  content: string;
  images?: string[];
  reactions?: ReactionGroup[];
  onReaction?: (messageId: string, emoji: string) => void;
  messageId?: string;
  authorRole?: string;
  authorRoleColor?: string;
  authorBanner?: string;
  authorJoinedAt?: string;
  isOwn?: boolean;
  edited?: boolean;
  onEdit?: (messageId: string, content: string) => void;
  onDelete?: (messageId: string) => void;
}

export function GramotaMessage({ author, avatar, time, content, images, reactions, onReaction, messageId, authorRole, authorRoleColor, authorBanner, authorJoinedAt, isOwn, edited, onEdit, onDelete }: GramotaMessageProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(content);

  const handleSaveEdit = () => {
    if (editText.trim() && messageId && onEdit) {
      onEdit(messageId, editText.trim());
      setEditing(false);
    }
  };

  if (editing) {
    return (
      <div className="px-3 md:px-4 py-2 md:py-3 bg-muted/20 rounded-lg">
        <textarea value={editText} onChange={(e) => setEditText(e.target.value)}
          className="w-full bg-input-background border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/50 resize-none min-h-[60px]"
          autoFocus />
        <div className="flex gap-1 mt-1.5 justify-end">
          <button onClick={() => { setEditing(false); setEditText(content); }} className="w-7 h-7 rounded-md hover:bg-muted/50 flex items-center justify-center text-muted-foreground transition-colors"><X className="w-3.5 h-3.5" /></button>
          <button onClick={handleSaveEdit} disabled={!editText.trim()} className="w-7 h-7 rounded-md bg-primary/90 hover:bg-primary flex items-center justify-center text-primary-foreground transition-colors"><Check className="w-3.5 h-3.5" /></button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="px-3 md:px-5 py-2 md:py-2.5 hover:bg-gradient-to-r hover:from-muted/20 hover:to-transparent rounded-lg transition-all duration-150 group relative border-l-2 border-transparent hover:border-l-primary/20"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.12, ease: 'easeOut' }}
    >
      <MessageHeader author={author} avatar={avatar} time={time} role={authorRole} roleColor={authorRoleColor} bannerId={authorBanner} joinedAt={authorJoinedAt} />
      <MessageContent content={content} />
      {edited && <span className="text-[10px] text-muted-foreground/40 ml-0.5">(измѣнено)</span>}
      {images && <MessageImages images={images} />}
      {onReaction && messageId && (
        <ReactionsBar reactions={reactions || []} onToggle={(emoji) => onReaction(messageId, emoji)} messageId={messageId} />
      )}

      {/* Actions menu on hover */}
      {(isOwn || onDelete) && (
        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="relative">
            <button onClick={() => setShowMenu(!showMenu)}
              className="w-7 h-7 rounded-md hover:bg-muted/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
              <MoreHorizontal className="w-4 h-4" strokeWidth={2} />
            </button>
            {showMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 top-full mt-0.5 z-50 w-36 bg-popover border border-border rounded-lg shadow-xl overflow-hidden">
                  {isOwn && onEdit && (
                    <button onClick={() => { setEditing(true); setShowMenu(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted/50 transition-colors text-left">
                      <Pencil className="w-3.5 h-3.5" strokeWidth={2} /> Редактировати
                    </button>
                  )}
                  {onDelete && (
                    <button onClick={() => { onDelete(messageId || ""); setShowMenu(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors text-left">
                      <Trash2 className="w-3.5 h-3.5" strokeWidth={2} /> Удалити
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}
