import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import { toast } from "sonner";
import { Crown, Image, Loader2, Check, Shield, Settings, X } from "lucide-react";
import { pb, PB_URL } from "@shared/api/pb";
import { useAppSelector } from "@app/hooks";
import { RolesManager } from "@features/invite/RolesManager";

type SettingsTab = "overview" | "roles";

const TABS = [
  { id: "overview" as SettingsTab, label: "Общее", icon: Crown },
  { id: "roles" as SettingsTab, label: "Роли", icon: Shield },
];

interface ServerSettingsPageProps {
  serverIdProp?: string;
  onClose?: () => void;
}

export function ServerSettingsPage({ serverIdProp, onClose }: ServerSettingsPageProps = {}) {
  const { serverId: routeServerId } = useParams();
  const navigate = useNavigate();
  const serverId = serverIdProp ?? routeServerId;
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

  const handleClose = () => {
    if (onClose) onClose();
    else navigate(`/app/server/${serverId}`);
  };

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
      toast.success("Настройки сохранены");
    } catch { toast.error("Не удалось сохранить настройки града"); }
    finally { setSaving(false); }
  };

  if (!serverId) return null;

  return (
    <div className="flex flex-col sm:flex-row w-full h-full overflow-hidden">
      {/* Nav sidebar */}
      <div className="sm:w-48 bg-foreground/[0.02] flex-shrink-0 flex sm:flex-col overflow-x-auto sm:overflow-y-auto border-b sm:border-b-0 sm:border-r border-foreground/5">
        <div className="hidden sm:flex items-center gap-2 px-4 pt-4 pb-3 relative">
          <Settings className="w-3.5 h-3.5 text-foreground/30 flex-shrink-0" strokeWidth={1.5} />
          <h3 className="text-xs text-foreground/50 tracking-[0.15em] uppercase font-semibold flex-1">Настройки града</h3>
          <div className="absolute bottom-0 left-3 right-3 h-px bg-gradient-to-r from-transparent via-foreground/15 to-transparent" />
        </div>
        <nav className="flex sm:flex-col gap-0.5 px-2 py-2 sm:py-0 sm:flex-1">
          {TABS.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
                  tab === t.id
                    ? "bg-foreground/[0.06] text-foreground/80"
                    : "text-foreground/30 hover:bg-foreground/[0.03] hover:text-foreground/60"
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={1.5} />
                <span className="text-xs sm:text-sm">{t.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="hidden sm:block mt-auto px-4 py-3 text-[10px] text-foreground/15 font-mono">
          {serverId.slice(0, 8)}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="sticky top-0 flex items-center justify-end px-4 pt-3 pb-1 bg-background/90 backdrop-blur-sm z-10">
          <button
            onClick={handleClose}
            className="w-7 h-7 rounded-xl hover:bg-foreground/10 flex items-center justify-center text-foreground/30 hover:text-foreground/60 transition-colors"
          >
            <X className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>

        <div className="px-5 pb-5 space-y-4">
          {tab === "overview" && (
            <>
              {/* Avatar */}
              <div className="bg-foreground/[0.02] rounded-2xl p-4">
                <p className="text-[10px] font-semibold text-foreground/30 uppercase tracking-widest mb-3">Аватарка града</p>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-foreground/5 flex-shrink-0 flex items-center justify-center">
                    {avatarUrl
                      ? <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                      : <Crown className="w-6 h-6 text-foreground/20" strokeWidth={1.5} />}
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-foreground/5 hover:bg-foreground/10 text-foreground/60 hover:text-foreground text-sm transition-colors"
                  >
                    <Image className="w-3.5 h-3.5" strokeWidth={1.5} /> Загрузити
                  </button>
                </div>
              </div>

              {/* Name */}
              <div className="bg-foreground/[0.02] rounded-2xl p-4">
                <p className="text-[10px] font-semibold text-foreground/30 uppercase tracking-widest mb-3">Названіе града</p>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSave()}
                  className="w-full bg-foreground/5 rounded-xl px-3 py-2 text-sm text-foreground outline-none focus:ring-1 focus:ring-foreground/20"
                />
              </div>

              {/* Save */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={handleSave}
                  disabled={saving || !name.trim()}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-foreground/10 hover:bg-foreground/15 text-foreground/80 text-sm font-medium transition-colors disabled:opacity-30"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" strokeWidth={1.5} />}
                  {saving ? "Сохраненіе..." : "Сохранити"}
                </button>
              </div>
            </>
          )}

          {tab === "roles" && (
            <div className="bg-foreground/[0.02] rounded-2xl p-4">
              <RolesManager serverId={serverId} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
