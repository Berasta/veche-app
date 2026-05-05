import { useState, useEffect, useCallback } from "react";
import { Plus, Link as LinkIcon, Trash2, Copy, Calendar, Users, Clock, Infinity, Loader2 } from "lucide-react";
import { listInvites, createInvite, deleteInvite, type Invite } from "@shared/api/inviteApi";

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

  const loadInvites = useCallback(async () => {
    setLoading(true);
    try { setInvites(await listInvites(serverId)); }
    catch { /* ignore */ }
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

  const handleDelete = async (id: string) => {
    try { await deleteInvite(id); loadInvites(); }
    catch { /* ignore */ }
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/invite/${code}`);
  };

  const fmtDate = (date: string | null) => {
    if (!date) return "никогда";
    return new Date(date).toLocaleDateString("ru-RU", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div>
      {/* Create invite bar */}
      <div className="flex items-center gap-2 mb-4">
        <button onClick={() => handleCreate()}
          disabled={creating}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-foreground/5 hover:bg-foreground/10 text-foreground/60 hover:text-foreground text-sm transition-colors disabled:opacity-30">
          {creating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" strokeWidth={1.5} />}
          Создати
        </button>
      </div>

      {/* Options */}
      <div className="flex flex-wrap gap-2 mb-4">
        {expiryOptions.map((o) => (
          <button key={o.value} onClick={() => setExpiry(o.value)}
            className={`px-2.5 py-1 rounded-lg text-[11px] transition-colors ${
              expiry === o.value ? "bg-foreground/10 text-foreground/80" : "text-foreground/30 hover:text-foreground/50 hover:bg-foreground/[0.03]"
            }`}>
            {o.label}
          </button>
        ))}
        <span className="text-[10px] text-foreground/20 leading-none self-center mx-1">·</span>
        {useOptions.map((o) => (
          <button key={o.value} onClick={() => setMaxUses(o.value)}
            className={`px-2.5 py-1 rounded-lg text-[11px] transition-colors ${
              maxUses === o.value ? "bg-foreground/10 text-foreground/80" : "text-foreground/30 hover:text-foreground/50 hover:bg-foreground/[0.03]"
            }`}>
            {o.label}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="text-sm text-foreground/30 py-4 text-center">Загрузка...</div>
      ) : invites.length === 0 ? (
        <div className="text-sm text-foreground/30 py-8 text-center">Нѣтъ приглашенiй</div>
      ) : (
        <div className="space-y-1">
          {invites.map((inv, i) => (
            <div key={inv.id}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-foreground/[0.02] transition-colors group"
              style={{ animationDelay: `${i * 30}ms` }}
            >
              <code className="text-xs font-mono text-foreground/60 min-w-[8ch]">{inv.code}</code>
              <span className="text-[11px] text-foreground/30 flex items-center gap-1">
                <Calendar className="w-3 h-3" strokeWidth={1.5} /> {fmtDate(inv.expires_at)}
              </span>
              <span className="text-[11px] text-foreground/30 flex items-center gap-1">
                <Users className="w-3 h-3" strokeWidth={1.5} /> {inv.use_count}{inv.max_uses ? `/${inv.max_uses}` : ""}
              </span>
              <div className="ml-auto flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleCopy(inv.code)}
                  className="w-7 h-7 rounded-lg hover:bg-foreground/5 flex items-center justify-center text-foreground/30 hover:text-foreground/60 transition-colors">
                  <Copy className="w-3 h-3" strokeWidth={1.5} />
                </button>
                <button onClick={() => handleDelete(inv.id)}
                  className="w-7 h-7 rounded-lg hover:bg-red-500/10 flex items-center justify-center text-foreground/30 hover:text-red-500/70 transition-colors">
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
