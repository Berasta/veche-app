import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { ScrollText, Users } from "lucide-react";
import { groupMessages } from "@shared/lib/groupMessages";
import { formatMessageTime } from "@shared/lib/formatTime";
import { GramotaInput, type GramotaInputHandle } from "@features/send-message/GramotaInput";
import { PageHeader } from "@shared/ui/PageHeader";
import { IconButton } from "@shared/ui/IconButton";
import { MessageList } from "@entities/message/ui/MessageList";
import { GramotaMessage } from "@entities/message/ui/GramotaMessage";
import { TypingIndicator } from "@entities/message/ui/TypingIndicator";
import { MessageSkeleton } from "@shared/ui/Skeleton";
import { useAppDispatch, useAppSelector } from "@app/hooks";
import {
  fetchMessages,
  fetchMoreMessages,
  sendMessage,
  editMessage,
  deleteMessage,
  clearMessages,
  subscribeToChannel,
} from "@entities/message/model/messagesSlice";
import {
  selectMessages,
  selectMessagesLoading,
  selectMessagesError,
  selectHasMore,
} from "@entities/message/model/messagesSelectors";
import { selectServerMembers } from "@entities/member/model/membersSlice";
import type { MemberData } from "@entities/member/model/membersSlice";
import { useAuth } from "@entities/user/model/useAuth";
import { useTypingBroadcast } from "@shared/hooks/useTyping";
import { useDragAndDrop } from "@shared/hooks/useDragAndDrop";
import { useChannelReactions } from "./hooks/useChannelReactions";
interface GramotaAreaProps {
  channelId?: string;
  channelName?: string;
  serverId?: string;
  onMenuClick?: () => void;
  showMembers?: boolean;
  onToggleMembers?: () => void;
}

export function GramotaArea({
  channelId,
  channelName,
  serverId,
  onMenuClick,
  showMembers,
  onToggleMembers,
}: GramotaAreaProps) {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const messages = useAppSelector(selectMessages);
  const loading = useAppSelector(selectMessagesLoading);
  const error = useAppSelector(selectMessagesError);
  const hasMore = useAppSelector(selectHasMore);
  const [loadingMore, setLoadingMore] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<GramotaInputHandle>(null);
  const { startTyping, stopTyping } = useTypingBroadcast(channelId);

  const { dragRef, isDragging } = useDragAndDrop(
    useCallback((files: File[]) => inputRef.current?.addFiles(files), []),
  );

  const { reactionMap, handleReaction } = useChannelReactions(
    channelId,
    messages,
    user?.id,
  );

  useEffect(() => {
    if (!channelId) return;
    dispatch(fetchMessages(channelId));
    const unsubscribe = subscribeToChannel(channelId, dispatch);
    return () => {
      dispatch(clearMessages());
      unsubscribe();
    };
  }, [channelId, dispatch]);

  const serverMembers = useAppSelector((state) =>
    serverId ? selectServerMembers(serverId)(state) : [],
  );

  const memberByUserId = useMemo(
    () => Object.fromEntries(serverMembers.map((m: MemberData) => [m.userId, m])),
    [serverMembers],
  );

  const joinedAtMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const m of serverMembers) {
      if (m.joinedAt) map[m.userId] = m.joinedAt;
    }
    return map;
  }, [serverMembers]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const groupedMessages = useMemo(() => groupMessages(messages), [messages]);

  const handleSend = useCallback(
    (content: string, files?: File[]) => {
      if (!channelId) return;
      dispatch(sendMessage({ channelId, content, files }));
    },
    [channelId, dispatch],
  );

  const handleEdit = useCallback(
    (msgId: string, newContent: string) => {
      dispatch(editMessage({ id: msgId, content: newContent }));
    },
    [dispatch],
  );

  const handleDelete = useCallback(
    (msgId: string) => {
      dispatch(deleteMessage(msgId));
    },
    [dispatch],
  );

  const handleLoadMore = useCallback(() => {
    if (!channelId || loadingMore || !hasMore) return;
    const oldest = messages[0];
    if (!oldest) return;
    setLoadingMore(true);
    dispatch(fetchMoreMessages({ channelId, before: oldest.created })).finally(
      () => {
        setLoadingMore(false);
      },
    );
  }, [channelId, loadingMore, hasMore, messages, dispatch]);

  if (!channelId) {
    return (
      <div className="flex-1 flex flex-col bg-background relative z-10 min-w-0">
        <PageHeader title="Грамоты" onMenuClick={onMenuClick} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <ScrollText
              className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3"
              strokeWidth={1.5}
            />
            <p className="text-sm text-muted-foreground">
              Выберите палату для чтенія грамотъ
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={dragRef}
      className="flex-1 flex flex-col bg-background relative z-10 min-w-0"
    >
      {isDragging && (
        <div className="absolute inset-0 z-50 bg-primary/5 border-2 border-dashed border-primary/40 rounded-lg flex items-center justify-center pointer-events-none">
          <p className="text-sm font-medium text-primary">
            Перетащите изображенія сюда
          </p>
        </div>
      )}
      <PageHeader
        title={channelName || "Грамоты"}
        subtitle={<TypingIndicator channelId={channelId} />}
        onMenuClick={onMenuClick}
        actions={
          onToggleMembers ? (
            <IconButton
              icon={Users}
              onClick={onToggleMembers}
              active={showMembers}
              tooltip="Люди града"
            />
          ) : undefined
        }
      />

      <MessageList
        onLoadMore={handleLoadMore}
        hasMore={hasMore}
        loadingMore={loadingMore}
      >
        {loading && messages.length === 0 && (
          <div className="space-y-1 py-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <MessageSkeleton key={i} />
            ))}
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center py-12 px-4">
            <p className="text-sm text-red-500 text-center">{error}</p>
          </div>
        )}

        {!loading && !error && messages.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <p className="text-sm text-muted-foreground">
              Нѣтъ грамотъ въ сей палатѣ
            </p>
          </div>
        )}

        {groupedMessages.map(({ msg, showHeader, dateLabel }) => {
          const member = memberByUserId[msg.user_id];
          return (
            <div key={msg.id}>
              {dateLabel && (
                <div className="flex items-center gap-3 py-4">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-foreground/15 to-transparent" />
                  <span className="text-[10px] font-medium text-foreground/50 uppercase tracking-[0.15em] flex-shrink-0 px-2">
                    {dateLabel}
                  </span>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-foreground/15 to-transparent" />
                </div>
              )}
              <GramotaMessage
                author={member?.username || "Пользователь"}
                avatar={showHeader ? member?.avatarUrl : undefined}
                time={formatMessageTime(msg.created)}
                content={msg.content}
                images={msg.images.length > 0 ? msg.images : undefined}
                reactions={reactionMap[msg.id]}
                onReaction={handleReaction}
                messageId={msg.id}
                authorId={msg.user_id}
                authorRole={member?.role}
                authorRoleColor={member?.roleColor}
                authorJoinedAt={joinedAtMap[msg.user_id]}
                isOwn={user?.id === msg.user_id}
                edited={!!msg.edited_at}
                onEdit={handleEdit}
                onDelete={user?.id === msg.user_id ? handleDelete : undefined}
              />
            </div>
          );
        })}
        <div ref={bottomRef} />
      </MessageList>

      <div className="bg-foreground/[0.02] backdrop-blur-xl">
        <GramotaInput
          ref={inputRef}
          onSend={handleSend}
          onTyping={startTyping}
          onTypingEnd={stopTyping}
        />
      </div>
    </div>
  );
}
