import { useState } from 'react';
import { motion } from 'motion/react';
import { MessageContent } from './MessageContent';
import { MessageImages } from './MessageImages';
import { ReactionsBar, type ReactionGroup } from './ReactionsBar';
import { EmojiPicker } from '@shared/ui/EmojiPicker';
import { UserAvatar } from '@entities/user/ui/UserAvatar';
import { UserPopover } from '@entities/user/ui/UserPopover';
import { MoreHorizontal, Pencil, Trash2, Check, X, Smile } from 'lucide-react';

interface GramotaMessageProps {
  author: string;
  avatar?: string;
  time: string;
  content: string;
  images?: string[];
  reactions?: ReactionGroup[];
  onReaction?: (messageId: string, emoji: string) => void;
  messageId?: string;
  authorId?: string;
  authorRole?: string;
  authorRoleColor?: string;
  authorJoinedAt?: string;
  isOwn?: boolean;
  edited?: boolean;
  onEdit?: (messageId: string, content: string) => void;
  onDelete?: (messageId: string) => void;
}

export function GramotaMessage({
  author,
  avatar,
  time,
  content,
  images,
  reactions,
  onReaction,
  messageId,
  authorId,
  authorRole,
  authorRoleColor,
  authorJoinedAt,
  isOwn,
  edited,
  onEdit,
  onDelete,
}: GramotaMessageProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(content);

  const handleSaveEdit = () => {
    if (editText.trim() && messageId && onEdit) {
      onEdit(messageId, editText.trim());
      setEditing(false);
    }
  };

  const avatarUser = {
    id: authorId || '',
    username: author,
    avatarUrl: avatar,
    role: authorRole,
    roleColor: authorRoleColor,
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

  const isHeader = avatar !== undefined;

  return (
    <motion.div
      className="px-3 md:px-5 py-0.5 md:py-1 hover:bg-foreground/[0.02] rounded-xl transition-all duration-150 group relative"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.12, ease: 'easeOut' }}
    >
      <div className="flex gap-3">
        {/* Left: avatar column (w-8 matches UserAvatar size="md") */}
        <div className="flex-shrink-0 w-8 flex justify-center pt-0.5">
          {isHeader ? (
            <UserPopover
              username={author}
              avatarUrl={avatar}
              userId={authorId}
              role={authorRole}
              roleColor={authorRoleColor}
              joinedAt={authorJoinedAt}
            >
              <UserAvatar user={avatarUser} size="md" />
            </UserPopover>
          ) : (
            <span className="text-[9px] text-foreground/20 opacity-0 group-hover:opacity-100 transition-opacity tabular-nums leading-none mt-1 select-none">
              {time}
            </span>
          )}
        </div>

        {/* Right: header row + content */}
        <div className="flex-1 min-w-0">
          {isHeader && (
            <div className="flex items-baseline gap-2 mb-0.5">
              <UserPopover
                username={author}
                avatarUrl={avatar}
                userId={authorId}
                role={authorRole}
                roleColor={authorRoleColor}
                joinedAt={authorJoinedAt}
              >
                <span
                  className="text-sm font-semibold cursor-pointer hover:underline"
                >
                  {author}
                </span>
              </UserPopover>
              <span className="text-xs text-foreground/40">{time}</span>
            </div>
          )}
          <MessageContent content={content} />
          {edited && <span className="text-[10px] text-foreground/30 ml-0.5">(измѣнено)</span>}
          {images && <MessageImages images={images} />}
          {onReaction && messageId && reactions && reactions.length > 0 && (
            <ReactionsBar reactions={reactions} onToggle={(emoji) => onReaction(messageId, emoji)} messageId={messageId} />
          )}
        </div>
      </div>

      {/* Actions on hover */}
      {(onReaction || isOwn || onDelete) && (
        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">

          {/* Emoji reaction picker */}
          {onReaction && messageId && (
            <div className="relative">
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="w-7 h-7 rounded-xl hover:bg-foreground/5 flex items-center justify-center text-foreground/30 hover:text-foreground/60 transition-colors"
              >
                <Smile className="w-3.5 h-3.5" strokeWidth={1.5} />
              </button>
              {showEmojiPicker && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowEmojiPicker(false)} />
                  <div className="absolute right-0 top-full mt-0.5 z-50">
                    <EmojiPicker
                      onSelect={(emoji) => {
                        onReaction(messageId, emoji);
                        setShowEmojiPicker(false);
                      }}
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {/* Three-dot menu (edit / delete) */}
          {(isOwn || onDelete) && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="w-7 h-7 rounded-xl hover:bg-foreground/5 flex items-center justify-center text-foreground/30 hover:text-foreground/60 transition-colors"
              >
                <MoreHorizontal className="w-4 h-4" strokeWidth={1.5} />
              </button>
              {showMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                  <div className="absolute right-0 top-full mt-1.5 z-50 w-40 rounded-2xl shadow-2xl shadow-black/30 overflow-hidden p-1"
                    style={{
                      background: "color-mix(in srgb, var(--background) 55%, transparent)",
                      backdropFilter: "blur(24px) saturate(180%)",
                      WebkitBackdropFilter: "blur(24px) saturate(180%)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    {isOwn && onEdit && (
                      <button
                        onClick={() => { setEditing(true); setShowMenu(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground/70 hover:text-foreground hover:bg-foreground/5 transition-colors text-left rounded-xl"
                      >
                        <Pencil className="w-3.5 h-3.5" strokeWidth={1.5} /> Редактировати
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => { onDelete(messageId || ""); setShowMenu(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive/70 hover:text-destructive hover:bg-destructive/5 transition-colors text-left rounded-xl"
                      >
                        <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} /> Удалити
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
