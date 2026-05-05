import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { ScrollText, Users, MessageSquare } from "lucide-react";
import { groupMessages } from "../../utils/groupMessages";
import { formatMessageTime } from "../../utils/formatTime";
import { GramotaInput, type GramotaInputHandle } from "../GramotaInput";
import { PageHeader } from "../ui/PageHeader";
import { IconButton } from "../ui/IconButton";
import { MessageList } from "../message/MessageList";
import { GramotaMessage } from "../message/GramotaMessage";
import { TypingIndicator } from "../message/TypingIndicator";
import { MessageSkeleton } from "../ui/Skeleton";
import type { ReactionGroup } from "../message/ReactionsBar";
import { useAppDispatch, useAppSelector } from "@store/hooks";
import {
  fetchMessages,
  fetchMoreMessages,
  sendMessage,
  editMessage,
  deleteMessage,
  clearMessages,
  subscribeToChannel,
} from "@store/slices/messagesSlice";
import {
  selectMessages,
  selectMessagesLoading,
  selectMessagesError,
  selectHasMore,
} from "@store/selectors/messagesSelectors";
import { fetchReactions, addReaction, removeReaction } from "@api/reactionApi";
import { pb } from "@api/pb";
import { fetchServerMembers, selectServerMembers } from "@store/slices/membersSlice";
import { useAuth } from "@store/hooks/useAuth";
import { useTypingBroadcast } from "@hooks/useTyping";
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
  const dragRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<GramotaInputHandle>(null);
  const [reactionMap, setReactionMap] = useState<
    Record<string, ReactionGroup[]>
  >({});
  const [roleMap, setRoleMap] = useState<
    Record<string, { name: string; color: string }>
  >({});
  const [joinedAtMap, setJoinedAtMap] = useState<Record<string, string>>({});
  const [isDragging, setIsDragging] = useState(false);
  const { startTyping, stopTyping } = useTypingBroadcast(channelId);

  // Drag-and-drop files
  useEffect(() => {
    const el = dragRef.current;
    if (!el) return;

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer?.types.includes("Files")) {
        setIsDragging(true);
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      if (!el.contains(e.relatedTarget as Node)) {
        setIsDragging(false);
      }
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      const files = Array.from(e.dataTransfer?.files || []).filter((f) =>
        f.type.startsWith("image/"),
      );
      if (files.length > 0) {
        inputRef.current?.addFiles(files);
      }
    };

    el.addEventListener("dragover", handleDragOver);
    el.addEventListener("dragleave", handleDragLeave);
    el.addEventListener("drop", handleDrop);
    return () => {
      el.removeEventListener("dragover", handleDragOver);
      el.removeEventListener("dragleave", handleDragLeave);
      el.removeEventListener("drop", handleDrop);
    };
  }, [channelId, dispatch]);

  useEffect(() => {
    if (!channelId) return;

    dispatch(fetchMessages(channelId));

    const unsubscribe = subscribeToChannel(channelId, dispatch);

    return () => {
      dispatch(clearMessages());
      unsubscribe();
    };
  }, [channelId, dispatch]);

  useEffect(() => {
    if (!serverId) return;
    dispatch(fetchServerMembers(serverId));
  }, [serverId, dispatch]);

  const serverMembers = useAppSelector((state) => serverId ? selectServerMembers(serverId)(state) : []);

  useEffect(() => {
    const map: Record<string, { name: string; color: string }> = {};
    const jMap: Record<string, string> = {};
    for (const m of serverMembers) {
      if (m.role) map[m.userId] = { name: m.role, color: m.roleColor || "#888" };
      if (m.joinedAt) jMap[m.userId] = m.joinedAt;
    }
    setRoleMap(map);
    setJoinedAtMap(jMap);
  }, [serverMembers]);

  const buildReactionMap = useCallback(
    async (chId: string) => {
      const all = await fetchReactions(chId);
      const map: Record<
        string,
        Record<string, { emoji: string; userIds: Set<string> }>
      > = {};
      for (const r of all) {
        if (!map[r.message_id]) map[r.message_id] = {};
        if (!map[r.message_id][r.emoji])
          map[r.message_id][r.emoji] = { emoji: r.emoji, userIds: new Set() };
        map[r.message_id][r.emoji].userIds.add(r.user_id);
      }
      const result: Record<string, ReactionGroup[]> = {};
      for (const [msgId, groups] of Object.entries(map)) {
        result[msgId] = Object.values(groups).map((g) => ({
          emoji: g.emoji,
          count: g.userIds.size,
          hasMe: g.userIds.has(user?.id || ""),
        }));
      }
      setReactionMap(result);
    },
    [user?.id],
  );

  useEffect(() => {
    if (!channelId || messages.length === 0) return;
    buildReactionMap(channelId);
  }, [channelId, messages, buildReactionMap]);

  // Real-time reactions
  useEffect(() => {
    if (!channelId) return;
    pb.collection("reactions").subscribe("*", () => {
      buildReactionMap(channelId);
    });
    return () => {
      pb.collection("reactions").unsubscribe("*");
    };
  }, [channelId, buildReactionMap]);

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

  const handleReaction = useCallback(
    async (messageId: string, emoji: string) => {
      const existing = reactionMap[messageId]?.find((r) => r.emoji === emoji);
      if (existing?.hasMe) {
        await removeReaction(messageId, emoji);
      } else {
        await addReaction(messageId, emoji);
      }
      if (channelId) {
        await buildReactionMap(channelId);
      }
    },
    [reactionMap, channelId, buildReactionMap],
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

        {groupedMessages.map(({ msg, showHeader, dateLabel }) => (
          <div key={msg.id}>
            {dateLabel && (
              <div className="flex items-center gap-3 py-4">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-foreground/5 to-transparent" />
                <span className="text-[10px] font-medium text-foreground/25 uppercase tracking-[0.15em] flex-shrink-0 px-2">
                  {dateLabel}
                </span>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-foreground/5 to-transparent" />
              </div>
            )}
            <GramotaMessage
              author={msg.author_name}
              avatar={showHeader ? msg.author_avatar_urlпоч : undefined}
              time={formatMessageTime(msg.created)}
              content={msg.content}
              images={msg.images.length > 0 ? msg.images : undefined}
              reactions={reactionMap[msg.id]}
              onReaction={handleReaction}
              messageId={msg.id}
              authorId={msg.user_id}
              authorRole={roleMap[msg.user_id]?.name}
              authorRoleColor={roleMap[msg.user_id]?.color}
              authorBanner={msg.author_banner}
              authorJoinedAt={joinedAtMap[msg.user_id]}
              isOwn={user?.id === msg.user_id}
              edited={!!msg.edited_at}
              onEdit={handleEdit}
              onDelete={user?.id === msg.user_id ? handleDelete : undefined}
            />
          </div>
        ))}
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
