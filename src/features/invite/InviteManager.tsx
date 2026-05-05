import { useState, useEffect, useCallback } from "react";
import { Plus, Link as LinkIcon, Clock, Infinity, UserPlus } from "lucide-react";
import { InviteCard } from "./InviteCard";
import { InviteOptions } from "./InviteOptions";
import { listInvites, createInvite, deleteInvite, type Invite } from "@api/inviteApi";

interface InviteManagerProps {
  serverId: string;
}

const expiryOptions = [
  { value: "3600", label: "1 часъ", icon: Clock },
  { value: "86400", label: "1 день", icon: Clock },
  { value: "604800", label: "Недѣля", icon: Clock },
  { value: "2592000", label: "30 дней", icon: Clock },
  { value: "0", label: "Никогда", icon: Infinity },
];

const useOptions = [
  { value: "1", label: "1 разъ" },
  { value: "5", label: "5 разъ" },
  { value: "10", label: "10 разъ" },
  { value: "25", label: "25 разъ" },
  { value: "0", label: "Безлимитъ" },
];

export function InviteManager({ serverId }: InviteManagerProps) {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [expiry, setExpiry] = useState("86400");
  const [maxUses, setMaxUses] = useState("0");
  const [error, setError] = useState<string | null>(null);

  const loadInvites = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listInvites(serverId);
      setInvites(data);
      setError(null);
    } catch (err: any) {
      setError(err?.message || "Не удалось загрузить приглашенiя");
    } finally {
      setLoading(false);
    }
  }, [serverId]);

  useEffect(() => {
    loadInvites();
  }, [loadInvites]);

  const handleCreate = async () => {
    setError(null);
    try {
      let expiresAt: string | null = null;
      const expiryNum = Number(expiry);
      if (expiryNum > 0) {
        expiresAt = new Date(Date.now() + expiryNum * 1000).toISOString();
      }

      const useLimit = Number(maxUses);
      await createInvite({
        server_id: serverId,
        expires_at: expiresAt,
        max_uses: useLimit > 0 ? useLimit : null,
      });
      setShowCreate(false);
      setExpiry("86400");
      setMaxUses("0");
      loadInvites();
    } catch (err: any) {
      setError(err?.message || "Не удалось создать приглашенiе");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteInvite(id);
      loadInvites();
    } catch (err) {
      console.error("Ошибка удаленiя приглашенiя", err);
    }
  };

  const handleCopy = (code: string) => {
    const inviteUrl = `${window.location.origin}/invite/${code}`;
    // Note: /invite/ is handled by the meta server for OG tags,
    // then redirects to /join/CODE for the SPA
    navigator.clipboard.writeText(inviteUrl);
  };

  const formatExpiryDate = (date: string | null) => {
    if (!date) return "никогда";
    return new Date(date).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div>
      {error && (
        <div className="mb-4 p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-primary" strokeWidth={2} />
          <h3 className="text-base font-semibold text-foreground">Приглашенiя</h3>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" strokeWidth={2} />
          <span>Создати</span>
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="p-4 bg-card/60 border border-border rounded-lg mb-4 space-y-4">
          <InviteOptions
            title="Срокъ дѣйствiя"
            options={expiryOptions}
            selected={expiry}
            onSelect={setExpiry}
          />
          <InviteOptions
            title="Максимумъ использованiй"
            options={useOptions}
            selected={maxUses}
            onSelect={setMaxUses}
          />
          <button
            onClick={handleCreate}
            className="w-full px-4 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-medium transition-colors"
          >
            <LinkIcon className="w-4 h-4 inline mr-1.5" strokeWidth={2} />
            Создати ссылку-приглашенiе
          </button>
        </div>
      )}

      {/* Invites list */}
      {loading ? (
        <div className="text-sm text-muted-foreground py-4 text-center">
          Загрузка приглашенiй...
        </div>
      ) : invites.length === 0 ? (
        <div className="text-sm text-muted-foreground py-4 text-center">
          Нѣтъ приглашенiй. Создайте первое!
        </div>
      ) : (
        <div className="space-y-2">
          {invites.map((invite, i) => (
            <InviteCard
              key={invite.id}
              code={invite.code}
              expiresAt={invite.expires_at}
              maxUses={invite.max_uses}
              uses={invite.use_count}
              index={i}
              onCopy={() => handleCopy(invite.code)}
              onDelete={() => handleDelete(invite.id)}
              formatExpiryDate={formatExpiryDate}
            />
          ))}
        </div>
      )}
    </div>
  );
}
