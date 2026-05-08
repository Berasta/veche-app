import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, Copy, Calendar, Users, Clock, Loader2, Crown, User } from "lucide-react";
import { toast } from "sonner";
import { listInvites, createInvite, deleteInvite, type Invite } from "@shared/api/inviteApi";
import { pb } from "@shared/api/pb";

interface InviteManagerProps {
  serverId: string;
}

const expiryOptions = [
  { value: "3600", label: "1 час" },
  { value: "86400", label: "1 день" },
  { value: "604800", label: "Недѣля" },
  { value: "2592000", label: "30 дней" },
  { value: "0", label: "Никогда" },
];

const useOptions = [
  { value: "1", label: "1 раз" },
  { value: "5", label: "5 раз" },
  { value: "10", label: "10 раз" },
  { value: "25", label: "25 раз" },
  { value: "0", label: "Безлимит" },
];

export function InviteManager({ serverId }: InviteManagerProps) {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [expiry, setExpiry] = useState("86400");
  const [maxUses, setMaxUses] = useState("0");
  const [userNames, setUserNames] = useState<Record<string, string>>({});

  const loadInvites = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listInvites(serverId);
      setInvites(data);
      // Load creator names
      const ids = [...new Set(data.map((i) => i.created_by).filter(Boolean))];
      const names: Record<string, string> = {};
      await Promise.all(ids.map(async (id) => {
        try {
          const user = await pb.collection("users").getOne(id);
          names[id] = user.username || "Пользователь";
        } catch { names[id] = "Неизвѣстный"; }
      }));
      setUserNames(names);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [serverId]);

  useEffect(() => { loadInvites(); }, [loadInvites]);

  const handleCreate = async () => {
    setCreating(true);
    try {
      let expiresAt: string | null = null;
      const expiryNum = Number(expiry);
      if (expiryNum > 0) expiresAt = new Date(Date.now() + expiryNum * 1000).toISOString();
      const useLimit = Number(maxUses);
      await createInvite({ server_id: serverId, expires_at: expiresAt, max_uses: useLimit > 0 ? useLimit : null });
      setExpiry("86400"); setMaxUses("0");
      loadInvites();
    } catch { /* ignore */ }
    finally { setCreating(false); }
  };

  const totalUses = invites.reduce((s, i) => s + i.use_count, 0);
  const activeInvites = invites.filter((i) => !i.expires_at || new Date(i.expires_at) > new Date()).length;

  return (
    <div>
      {/* Stats */}
      <div className="flex items-center gap-4 mb-4 text-xs text-foreground/40">
        <span className="flex items-center gap-1"><Users className="w-3 h-3" strokeWidth={1.5} /> {invites.length} ссылокъ</span>
        <span className="flex items-center gap-1"><User className="w-3 h-3" strokeWidth={1.5} /> {totalUses} использованiй</span>
        <span className="flex items-center gap-1"><Clock className="w-3 h-3" strokeWidth={1.5} /> {activeInvites} активныхъ</span>
      </div>

      {/* Create */}
      <div className="flex items-center gap-2 mb-3">
        <button onClick={() => handleCreate()}
          disabled={creating}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-foreground/5 hover:bg-foreground/10 text-foreground/60 hover:text-foreground text-sm transition-colors disabled:opacity-30">
          {creating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" strokeWidth={1.5} />}
          Создати ссылку
        </button>
      </div>

      {/* Options */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {expiryOptions.map((o) => (
          <button key={o.value} onClick={() => setExpiry(o.value)}
            className={`px-2 py-1 rounded-lg text-[11px] transition-colors ${expiry === o.value ? "bg-foreground/10 text-foreground/80" : "text-foreground/30 hover:text-foreground/50 hover:bg-foreground/[0.03]"}`}>
            {o.label}
          </button>
        ))}
        <span className="text-[10px] text-foreground/20 self-center">|</span>
        {useOptions.map((o) => (
          <button key={o.value} onClick={() => setMaxUses(o.value)}
            className={`px-2 py-1 rounded-lg text-[11px] transition-colors ${maxUses === o.value ? "bg-foreground/10 text-foreground/80" : "text-foreground/30 hover:text-foreground/50 hover:bg-foreground/[0.03]"}`}>
            {o.label}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="text-xs text-foreground/30 py-4 text-center">Загрузка...</div>
      ) : invites.length === 0 ? (
        <div className="text-xs text-foreground/30 py-8 text-center">Нѣтъ приглашенiй</div>
      ) : (
        <div className="space-y-0.5">
          {invites.map((inv) => (
            <div key={inv.id}
              className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-foreground/[0.02] transition-colors group">
              <code className="text-xs font-mono text-foreground/50 min-w-[7ch]">{inv.code}</code>
              <div className="flex-1 flex items-center gap-2 text-[11px] text-foreground/30 min-w-0">
                <span className="flex items-center gap-1 flex-shrink-0">
                  <Calendar className="w-3 h-3" strokeWidth={1.5} /> {fmtDate(inv.expires_at)}
                </span>
                <span className="flex items-center gap-1 flex-shrink-0">
                  <Users className="w-3 h-3" strokeWidth={1.5} /> {inv.use_count}{inv.max_uses ? `/${inv.max_uses}` : ""}
                </span>
                {userNames[inv.created_by] && (
                  <span className="flex items-center gap-1 truncate">
                    <Crown className="w-3 h-3" strokeWidth={1.5} /> {userNames[inv.created_by]}
                  </span>
                )}
                <span className="text-[10px] text-foreground/20 flex-shrink-0">
                  {new Date(inv.created).toLocaleDateString("ru-RU", { day: "numeric", month: "short" })}
                </span>
              </div>
              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                <button onClick={() => copyCode(inv.code)}
                  className="w-6 h-6 rounded-lg hover:bg-foreground/5 flex items-center justify-center text-foreground/30 hover:text-foreground/60 transition-colors">
                  <Copy className="w-3 h-3" strokeWidth={1.5} />
                </button>
                <button onClick={() => handleDelete(inv.id)}
                  className="w-6 h-6 rounded-lg hover:bg-red-500/10 flex items-center justify-center text-foreground/30 hover:text-red-500/70 transition-colors">
                  <Trash2 className="w-3 h-3" strokeWidth={1.5} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function fmtDate(date: string | null) {
  if (!date) return "никогда";
  const d = new Date(date);
  if (d < new Date()) return "истекла";
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}

function copyCode(code: string) {
  const isTauriApp = window.location.origin.includes("tauri.localhost") || window.location.origin.startsWith("tauri://");
  const link = isTauriApp
    ? `veche://invite/${code}`
    : `${window.location.origin}/invite/${code}`;
  navigator.clipboard.writeText(link);
  toast.success("Ссылка скопирована");
}
