import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import { toast } from "sonner";
import { ArrowLeft, Crown, Image, Loader2, Check } from "lucide-react";
import { pb, PB_URL } from "@shared/api/pb";
import { useAppSelector } from "@app/hooks";
import { PageHeader } from "@shared/ui/PageHeader";
import { RolesManager } from "@features/invite/RolesManager";

export function ServerSettingsPage() {
  const { serverId } = useParams();
  const navigate = useNavigate();
  const servers = useAppSelector((state) => state.servers.servers);
  const server = servers.find((s) => s.id === serverId);

  const [name, setName] = useState(server?.name || "");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (server) {
      setName(server.name);
      setAvatarUrl((server as any).avatar_url || null);
    }
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
    } catch {
      toast.error("Не удалось загрузить аватарку града");
    }
  };

  const handleSave = async () => {
    if (!serverId || !name.trim()) return;
    setSaving(true);
    try {
      await pb.collection("servers").update(serverId, { name: name.trim() });
      navigate(`/app/server/${serverId}`);
    } catch {
      toast.error("Не удалось сохранить настройки града");
    } finally { setSaving(false); }
  };

  return (
    <div className="flex-1 flex flex-col bg-background min-w-0">
      <PageHeader
        icon={Crown}
        title="Настройки града"
        onMenuClick={() => navigate(`/app/server/${serverId}`)}
        actions={
          <button onClick={() => navigate(`/app/server/${serverId}`)}
            className="w-8 h-8 rounded-xl hover:bg-foreground/5 flex items-center justify-center text-foreground/30 hover:text-foreground/60 transition-colors">
            <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-2xl mx-auto space-y-5">

          {/* Avatar */}
          <div className="bg-foreground/[0.02] rounded-xl p-5">
            <p className="text-xs text-foreground/50 uppercase tracking-wider font-semibold mb-3">Аватарка града</p>
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-foreground/5 flex-shrink-0 flex items-center justify-center">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Crown className="w-8 h-8 text-foreground/20" strokeWidth={1.5} />
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              <button onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 rounded-xl bg-foreground/5 hover:bg-foreground/10 text-foreground/60 hover:text-foreground text-sm font-medium transition-colors">
                <Image className="w-4 h-4 inline mr-1.5" strokeWidth={1.5} /> Загрузити
              </button>
            </div>
          </div>

          {/* Name */}
          <div className="bg-foreground/[0.02] rounded-xl p-5">
            <p className="text-xs text-foreground/50 uppercase tracking-wider font-semibold mb-3">Названіе града</p>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-foreground/5 rounded-xl px-4 py-2.5 text-sm text-foreground outline-none focus:ring-1 focus:ring-foreground/20"
            />
          </div>

          {/* Roles */}
          {serverId && (
            <div className="bg-foreground/[0.02] rounded-xl p-5">
              <RolesManager serverId={serverId} />
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2">
            <button onClick={() => navigate(`/app/server/${serverId}`)}
              className="flex-1 px-4 py-2.5 rounded-xl bg-foreground/5 hover:bg-foreground/10 text-foreground/60 hover:text-foreground text-sm font-medium transition-colors">
              Отмѣна
            </button>
            <button onClick={handleSave} disabled={saving || !name.trim()}
              className="flex-1 px-4 py-2.5 rounded-xl bg-foreground/10 hover:bg-foreground/15 text-foreground/80 text-sm font-medium transition-colors disabled:opacity-30">
              {saving ? <Loader2 className="w-4 h-4 animate-spin inline" /> : <Check className="w-4 h-4 inline mr-1" strokeWidth={1.5} />}
              {saving ? "Сохраненіе..." : "Сохранити"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
