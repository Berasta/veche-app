import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { ScrollText, Users, MessageSquare } from "lucide-react";
import { groupMessages } from "../../utils/groupMessages";
import { formatMessageTime } from "../../utils/formatTime";
import { GramotaInput } from "../GramotaInput";
import { PageHeader } from "../ui/PageHeader";
import { IconButton } from "../ui/IconButton";
import { MessageList } from "../message/MessageList";
import { GramotaMessage } from "../message/GramotaMessage";
import { MessageSkeleton } from "../ui/Skeleton";
import type { ReactionGroup } from "../message/ReactionsBar";
import { useAppDispatch, useAppSelector } from "@store/hooks";
import {
  fetchMessages,
  sendMessage,
  subscribeToChannel,
  clearMessages,
} from "@store/slices/messagesSlice";
import {
  selectMessages,
  selectMessagesLoading,
  selectMessagesError,
} from "@store/selectors/messagesSelectors";
import { fetchReactions, addReaction, removeReaction } from "@api/reactionApi";
import { getRoleMap } from "@api/rolesApi";
import { pb } from "@api/pb";
import { useAuth } from "@store/hooks/useAuth";
interface GramotaAreaProps {
  channelId?: string;
  channelName?: string;
  serverId?: string;
  onMenuClick?: () => void;
  showMembers?: boolean;
  onToggleMembers?: () => void;
}

export function GramotaArea({ channelId, channelName, serverId, onMenuClick, showMembers, onToggleMembers }: GramotaAreaProps) {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const messages = useAppSelector(selectMessages);
  const loading = useAppSelector(selectMessagesLoading);
  const error = useAppSelector(selectMessagesError);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [reactionMap, setReactionMap] = useState<Record<string, ReactionGroup[]>>({});
  const [roleMap, setRoleMap] = useState<Record<string, { name: string; color: string }>>({});
  const [joinedAtMap, setJoinedAtMap] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!channelId) return;

    dispatch(fetchMessages(channelId));
    const unsubscribe = subscribeToChannel(channelId, dispatch);

    return () => {
      unsubscribe();
      dispatch(clearMessages());
    };
  }, [channelId, dispatch]);

  useEffect(() => {
    if (!serverId) return;
    getRoleMap(serverId).then(setRoleMap).catch(() => {});
    pb.collection("server_members").getFullList({
      filter: `server_id = "${serverId}"`,
    }).then((list) => {
      const map: Record<string, string> = {};
      for (const entry of list as any[]) {
        map[entry.user_id] = entry.created;
      }
      setJoinedAtMap(map);
    }).catch(() => {});
  }, [serverId]);

  const buildReactionMap = useCallback(async (chId: string) => {
    const all = await fetchReactions(chId);
    const map: Record<string, Record<string, { emoji: string; userIds: Set<string> }>> = {};
    for (const r of all) {
      if (!map[r.message_id]) map[r.message_id] = {};
      if (!map[r.message_id][r.emoji]) map[r.message_id][r.emoji] = { emoji: r.emoji, userIds: new Set() };
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
  }, [user?.id]);

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
    return () => { pb.collection("reactions").unsubscribe("*"); };
  }, [channelId, buildReactionMap]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const groupedMessages = useMemo(() => groupMessages(messages), [messages]);

  const handleSend = useCallback((content: string, files?: File[]) => {
    if (!channelId) return;
    dispatch(sendMessage({ channelId, content, files }));
  }, [channelId, dispatch]);

  const handleReaction = useCallback(async (messageId: string, emoji: string) => {
    const existing = reactionMap[messageId]?.find((r) => r.emoji === emoji);
    if (existing?.hasMe) {
      await removeReaction(messageId, emoji);
    } else {
      await addReaction(messageId, emoji);
    }
    if (channelId) {
      await buildReactionMap(channelId);
    }
  }, [reactionMap, channelId, buildReactionMap]);

  if (!channelId) {
    return (
      <div className="flex-1 flex flex-col bg-background relative z-10 min-w-0">
        <PageHeader title="Грамоты" onMenuClick={onMenuClick} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <ScrollText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" strokeWidth={1.5} />
            <p className="text-sm text-muted-foreground">Выберите палату для чтенія грамотъ</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-background relative z-10 min-w-0">
      <PageHeader
        title={channelName || "Грамоты"}
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

      <MessageList>
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
            <p className="text-sm text-muted-foreground">Нѣтъ грамотъ въ сей палатѣ</p>
          </div>
        )}

        {groupedMessages.map(({ msg, showHeader, dateLabel }) => (
            <div key={msg.id}>
              {dateLabel && (
                <div className="flex items-center gap-3 py-3">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider flex-shrink-0">{dateLabel}</span>
                  <div className="h-px flex-1 bg-border" />
                </div>
              )}
              <GramotaMessage
                author={msg.author_name}
                avatar={showHeader ? (msg.author_avatar_url || undefined) : undefined}
                time={formatMessageTime(msg.created)}
                content={msg.content}
                images={msg.images.length > 0 ? msg.images : undefined}
                reactions={reactionMap[msg.id]}
                onReaction={handleReaction}
                messageId={msg.id}
                authorRole={roleMap[msg.user_id]?.name}
                authorRoleColor={roleMap[msg.user_id]?.color}
                authorBanner={msg.author_banner}
                authorJoinedAt={joinedAtMap[msg.user_id]}
              />
            </div>
          ))}
        <div ref={bottomRef} />
      </MessageList>

      <div className="border-t border-border bg-card/30 backdrop-blur-xl">
        <GramotaInput onSend={handleSend} />
      </div>
    </div>
  );
}
