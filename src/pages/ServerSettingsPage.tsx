import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import { ArrowLeft, Crown, Image, Shield } from "lucide-react";
import { pb, PB_URL } from "@api/pb";
import { useAppSelector } from "@store/hooks";
import { PageHeader } from "@components/ui/PageHeader";
import { RolesManager } from "@components/invite/RolesManager";

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
    } catch {}
  };

  const handleSave = async () => {
    if (!serverId || !name.trim()) return;
    setSaving(true);
    try {
      await pb.collection("servers").update(serverId, { name: name.trim() });
      navigate(`/app/server/${serverId}`);
    } catch {} finally { setSaving(false); }
  };

  return (
    <div className="flex-1 flex flex-col bg-background min-w-0">
      <PageHeader
        icon={Crown}
        title="Настройки града"
        onMenuClick={() => navigate(`/app/server/${serverId}`)}
        actions={
          <button onClick={() => navigate(`/app/server/${serverId}`)} className="w-8 h-8 rounded-md hover:bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" strokeWidth={2} />
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Avatar */}
          <div className="bg-card/40 border border-border rounded-lg p-5">
            <p className="text-sm font-semibold text-foreground mb-3">Аватарка града</p>
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-muted-foreground">
                    {server?.name?.charAt(0)?.toUpperCase() || "Г"}
                  </div>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              <button onClick={() => fileInputRef.current?.click()} className="px-3 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-medium transition-colors">
                <Image className="w-4 h-4 inline mr-1.5" strokeWidth={2} /> Загрузити
              </button>
            </div>
          </div>

          {/* Name */}
          <div className="bg-card/40 border border-border rounded-lg p-5">
            <p className="text-sm font-semibold text-foreground mb-3">Названіе града</p>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-input-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {/* Roles */}
          {serverId && (
            <div className="bg-card/40 border border-border rounded-lg p-5">
              <RolesManager serverId={serverId} />
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button onClick={() => navigate(`/app/server/${serverId}`)} className="px-4 py-2.5 rounded-lg bg-muted hover:bg-muted/80 text-foreground text-sm font-medium transition-colors">Отмѣна</button>
            <button onClick={handleSave} disabled={saving || !name.trim()} className="px-4 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium transition-colors disabled:opacity-50">
              {saving ? "Сохраненіе..." : "Сохранити"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
