import { motion } from 'motion/react';
import { MessageHeader } from './MessageHeader';
import { MessageContent } from './MessageContent';
import { MessageImages } from './MessageImages';
import { ReactionsBar, type ReactionGroup } from './ReactionsBar';

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
}

export function GramotaMessage({ author, avatar, time, content, images, reactions, onReaction, messageId, authorRole, authorRoleColor, authorBanner, authorJoinedAt }: GramotaMessageProps) {
  return (
    <motion.div
      className="px-3 md:px-4 py-2 md:py-3 hover:bg-muted/30 rounded-lg transition-colors"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      <MessageHeader author={author} avatar={avatar} time={time} role={authorRole} roleColor={authorRoleColor} bannerId={authorBanner} joinedAt={authorJoinedAt} />
      <MessageContent content={content} />
      {images && <MessageImages images={images} />}
      {onReaction && messageId && (
        <ReactionsBar reactions={reactions || []} onToggle={(emoji) => onReaction(messageId, emoji)} messageId={messageId} />
      )}
    </motion.div>
  );
}
