import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import { toast } from "sonner";
import { ArrowLeft, Crown, Image, Loader2, Check, Shield, Settings } from "lucide-react";
import { pb, PB_URL } from "@shared/api/pb";
import { useAppSelector } from "@app/hooks";
import { RolesManager } from "@features/invite/RolesManager";

type SettingsTab = "overview" | "roles";

export function ServerSettingsPage() {
  const { serverId } = useParams();
  const navigate = useNavigate();
  const servers = useAppSelector((state) => state.servers.servers);
  const server = servers.find((s) => s.id === serverId);
  const [tab, setTab] = useState<SettingsTab>("overview");

  const [name, setName] = useState(server?.name || "");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (server) { setName(server.name); setAvatarUrl((server as any).avatar_url || null); }
  }, [server]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !serverId) return;
    try {
      const formData = new FormData();
      formData.append("avatar", file);
      await pb.collection("servers").update(serverId, formData);
      const updated = await pb.collection("servers").getOne(serverId);
      setAvatarUrl(updated.avatar ? `${PB_URL}/api/files/${updated.collectionId}/${updated.id}/${updated.avatar}` : null);
    } catch { toast.error("Не удалось загрузить аватарку града"); }
  };

  const handleSave = async () => {
    if (!serverId || !name.trim()) return;
    setSaving(true);
    try {
      await pb.collection("servers").update(serverId, { name: name.trim() });
      navigate(`/app/server/${serverId}`);
    } catch { toast.error("Не удалось сохранить настройки града"); }
    finally { setSaving(false); }
  };

  if (!serverId) return null;

  return (
    <div className="flex-1 flex flex-col bg-background min-w-0">
      {/* Top bar */}
      <div className="h-12 bg-background/40 backdrop-blur-xl flex items-center px-4 border-b border-foreground/5">
        <button onClick={() => navigate(`/app/server/${serverId}`)}
          className="w-8 h-8 rounded-lg hover:bg-foreground/5 flex items-center justify-center text-foreground/30 hover:text-foreground/60 transition-colors mr-2">
          <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
        </button>
        <span className="text-sm text-foreground/80 font-medium">{server?.name || "Градъ"}</span>
        <Settings className="w-3.5 h-3.5 text-foreground/30 ml-2" strokeWidth={1.5} />
      </div>

      <div className="flex-1 flex min-h-0">
        {/* Sidebar */}
        <div className="w-48 bg-foreground/[0.02] flex-shrink-0 flex flex-col p-2 border-r border-foreground/5">
          <div className="text-[10px] font-semibold text-foreground/30 uppercase tracking-widest px-3 py-2">Настройки града</div>
          <button onClick={() => setTab("overview")}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${tab === "overview" ? "bg-foreground/[0.06] text-foreground/80" : "text-foreground/40 hover:text-foreground/60 hover:bg-foreground/[0.03]"}`}>
            <Crown className="w-4 h-4" strokeWidth={1.5} /> Общее
          </button>
          <button onClick={() => setTab("roles")}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${tab === "roles" ? "bg-foreground/[0.06] text-foreground/80" : "text-foreground/40 hover:text-foreground/60 hover:bg-foreground/[0.03]"}`}>
            <Shield className="w-4 h-4" strokeWidth={1.5} /> Роли
          </button>
          <div className="mt-auto px-3 py-2 text-[10px] text-foreground/20">server id: {serverId.slice(0, 8)}</div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {tab === "overview" && (
            <div className="max-w-xl mx-auto space-y-4">
              <h2 className="text-base font-semibold text-foreground/80 mb-4">Общее</h2>

              {/* Avatar */}
              <div className="bg-foreground/[0.02] rounded-xl p-4">
                <p className="text-xs text-foreground/50 mb-3">Аватарка града</p>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-foreground/5 flex-shrink-0 flex items-center justify-center">
                    {avatarUrl ? <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                    : <Crown className="w-6 h-6 text-foreground/20" strokeWidth={1.5} />}
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                  <button onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-lg bg-foreground/5 hover:bg-foreground/10 text-foreground/60 hover:text-foreground text-sm transition-colors">
                    <Image className="w-3.5 h-3.5 inline mr-1.5" strokeWidth={1.5} /> Загрузити
                  </button>
                </div>
              </div>

              {/* Name */}
              <div className="bg-foreground/[0.02] rounded-xl p-4">
                <p className="text-xs text-foreground/50 mb-3">Названіе града</p>
                <input value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full bg-foreground/5 rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:ring-1 focus:ring-foreground/20" />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2">
                <button onClick={handleSave} disabled={saving || !name.trim()}
                  className="px-5 py-2 rounded-lg bg-foreground/10 hover:bg-foreground/15 text-foreground/80 text-sm font-medium transition-colors disabled:opacity-30 flex items-center gap-1.5">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" strokeWidth={1.5} />}
                  {saving ? "Сохраненіе..." : "Сохранити"}
                </button>
              </div>
            </div>
          )}

          {tab === "roles" && (
            <div className="max-w-xl mx-auto space-y-4">
              <h2 className="text-base font-semibold text-foreground/80 mb-4">Роли</h2>
              <div className="bg-foreground/[0.02] rounded-xl p-4">
                <RolesManager serverId={serverId} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
