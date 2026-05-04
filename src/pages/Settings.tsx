import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { Crown, Edit2, Image, Check, X, LogOut, Headphones, Palette, Keyboard, User, ArrowLeft, Trash2, Crop } from "lucide-react";
import { ThemeSwitcher } from "../components/ThemeSwitcher";
import { VoiceSettings } from "../components/settings/VoiceSettings";
import { HotkeySettings } from "../components/settings/HotkeySettings";
import { BannerRepositionDialog } from "../components/BannerRepositionDialog";
import { useAuth } from "@store/hooks/useAuth";
import { pb, PB_URL } from "@api/pb";
import { fetchCurrentUser, logout } from "@store/slices/authSlice";
import { useAppDispatch } from "@store/hooks";

const TABS = [
  { id: "profile", label: "Профиль", icon: User },
  { id: "theme", label: "Тема", icon: Palette },
  { id: "voice", label: "Голосъ", icon: Headphones },
  { id: "hotkeys", label: "Клавиши", icon: Keyboard },
];

export function Settings() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [nickname, setNickname] = useState("");
  const [saving, setSaving] = useState(false);
  const [customBannerUrl, setCustomBannerUrl] = useState<string | null>(null);
  const [bannerPosition, setBannerPosition] = useState({ x: 50, y: 50 });
  const [repositionFile, setRepositionFile] = useState<{ url: string; filename: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const bannerInputRef = useRef<HTMLInputElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (user?.banner) {
      const colId = (pb.authStore.record as any)?.collectionId || "_pb_users_auth_";
      setCustomBannerUrl(`${PB_URL}/api/files/${colId}/${user.id}/${user.banner}`);
      try {
        const pos = localStorage.getItem(`bannerPosition_${user.banner}`);
        if (pos) setBannerPosition(JSON.parse(pos));
      } catch {}
    }
  }, [user]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    try {
      const formData = new FormData();
      formData.append("avatar", file);
      await pb.collection("users").update(user.id, formData);
      dispatch(fetchCurrentUser());
    } catch (err) {
      console.error("Ошибка загрузки аватара", err);
    }
  };

  const triggerFileSelect = () => fileInputRef.current?.click();

  const handleCustomUpload = async (file: File) => {
    if (!user) return;
    const formData = new FormData();
    formData.append("banner", file);
    const updated = await pb.collection("users").update(user.id, formData);
    const filename = (updated as any).banner;
    const colId = (updated as any).collectionId || "_pb_users_auth_";
    const url = `${PB_URL}/api/files/${colId}/${user.id}/${filename}`;
    setCustomBannerUrl(url);
    dispatch(fetchCurrentUser());
    setRepositionFile({ url, filename });
  };

  const handleRepositionSave = (x: number, y: number) => {
    setBannerPosition({ x, y });
    setRepositionFile(null);
  };

  const startEditing = () => { setNickname(user?.username || ""); setIsEditing(true); };
  const cancelEditing = () => { setIsEditing(false); setNickname(""); };

  const saveNickname = async () => {
    const trimmed = nickname.trim();
    if (!trimmed || !user || trimmed === user.username) { cancelEditing(); return; }
    setSaving(true);
    try {
      await pb.collection("users").update(user.id, { username: trimmed });
      dispatch(fetchCurrentUser());
      setIsEditing(false);
    } finally { setSaving(false); }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") saveNickname();
    if (e.key === "Escape") cancelEditing();
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row bg-background min-w-0">
      {/* Mobile header */}
      <div className="md:hidden h-12 border-b border-border bg-card/30 backdrop-blur-xl flex items-center px-4 flex-shrink-0">
        <Crown className="w-5 h-5 text-primary mr-2" strokeWidth={2} />
        <h3 className="text-sm font-semibold text-foreground">Настройки</h3>
      </div>

      {/* Nav: horizontal on mobile, vertical sidebar on desktop */}
      <div className="md:w-56 md:border-r border-border bg-card/20 flex-shrink-0 flex md:flex-col overflow-x-auto md:overflow-y-auto md:pt-2">
        <div className="hidden md:block px-4 pb-3 mb-1 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground tracking-wide">Настройки</h3>
        </div>
        <nav className="flex md:flex-col gap-0.5 px-2 py-2 md:py-0 md:flex-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={2} />
                <span className="hidden md:inline">{tab.label}</span>
                <span className="md:hidden text-xs">{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto md:border-t-0">
        {/* Mobile back button */}
        <div className="md:hidden flex items-center gap-2 px-4 h-12 border-b border-border bg-card/30">
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 rounded-md hover:bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" strokeWidth={2} />
          </button>
          <span className="text-sm font-medium text-foreground">Настройки</span>
        </div>
        <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-4 md:space-y-6">

          {/* Profile tab */}
          {activeTab === "profile" && (
            <>
              {/* Banner */}
              <div
                onClick={() => bannerInputRef.current?.click()}
                className="relative w-full aspect-[3.2/1] rounded-lg overflow-hidden border border-primary/20 group bg-black/10 cursor-pointer hover:border-primary/50 transition-colors"
              >
                {customBannerUrl ? (
                  <img src={customBannerUrl} alt="" className="absolute inset-0 w-full h-full object-cover"
                    style={{ objectPosition: `${bannerPosition.x}% ${bannerPosition.y}%` }} />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 text-muted-foreground/40 group-hover:text-muted-foreground/70 transition-colors">
                    <Image className="w-8 h-8" strokeWidth={1} />
                    <span className="text-xs font-medium">Нажмите, чтобы загрузить хоругвь</span>
                  </div>
                )}
                <input ref={bannerInputRef} type="file" accept="image/*" className="hidden" onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  await handleCustomUpload(file);
                }} />
                {customBannerUrl && (
                  <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => { e.stopPropagation(); bannerInputRef.current?.click(); }}
                      className="w-7 h-7 rounded-md bg-background/80 backdrop-blur-sm hover:bg-background text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors shadow-sm border border-border"
                      title="Замѣнити хоругвь">
                      <Image className="w-3.5 h-3.5" strokeWidth={2} />
                    </button>
                    <button onClick={async (e) => { e.stopPropagation(); if (!user) return; await pb.collection("users").update(user.id, { banner: "" }); setCustomBannerUrl(null); dispatch(fetchCurrentUser()); }}
                      className="w-7 h-7 rounded-md bg-background/80 backdrop-blur-sm hover:bg-background text-muted-foreground hover:text-destructive flex items-center justify-center transition-colors shadow-sm border border-border"
                      title="Удалити хоругвь">
                      <Trash2 className="w-3.5 h-3.5" strokeWidth={2} />
                    </button>
                    {customBannerUrl && (
                      <button onClick={(e) => { e.stopPropagation(); const filename = customBannerUrl.split("/").pop() || ""; setRepositionFile({ url: customBannerUrl, filename }); }}
                        className="w-7 h-7 rounded-md bg-background/80 backdrop-blur-sm hover:bg-background text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors shadow-sm border border-border"
                        title="Настроить область">
                        <Crop className="w-3.5 h-3.5" strokeWidth={2} />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Avatar & Name */}
              <div className="relative -mt-12 flex flex-col md:flex-row items-start md:items-end gap-3 md:gap-4">
                <div className="relative group cursor-pointer" onClick={triggerFileSelect}>
                  <div className="w-20 md:w-24 h-20 md:h-24 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center ring-4 ring-background overflow-hidden transition-opacity group-hover:opacity-80">
                    {user?.avatar_url ? (
                      <img src={user.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      <Crown className="w-10 md:w-12 h-10 md:h-12 text-primary" strokeWidth={2} />
                    )}
                  </div>
                  <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <Edit2 className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={2} />
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </div>

                <div className="flex-1 pb-2 min-w-0 w-full md:w-auto">
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <input ref={inputRef} type="text" value={nickname} onChange={(e) => setNickname(e.target.value)}
                        onKeyDown={handleKeyDown} disabled={saving}
                        className="bg-input-background border border-border rounded-md px-3 py-1.5 text-lg font-semibold text-foreground w-full outline-none focus:ring-2 focus:ring-primary/50" />
                      <button onClick={saveNickname} disabled={saving}
                        className="w-8 h-8 rounded-md bg-primary/20 text-primary hover:bg-primary/30 flex items-center justify-center transition-colors flex-shrink-0" title="Сохранити">
                        <Check className="w-4 h-4" strokeWidth={2} />
                      </button>
                      <button onClick={cancelEditing} disabled={saving}
                        className="w-8 h-8 rounded-md hover:bg-muted/50 text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors flex-shrink-0" title="Отмѣна">
                        <X className="w-4 h-4" strokeWidth={2} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 group">
                      <h2 className="text-xl md:text-2xl font-bold text-foreground truncate">{user?.username}</h2>
                      <button onClick={startEditing}
                        className="w-7 h-7 rounded-md opacity-0 group-hover:opacity-100 hover:bg-muted/50 text-muted-foreground hover:text-foreground flex items-center justify-center transition-all flex-shrink-0" title="Измѣнити имя">
                        <Edit2 className="w-3.5 h-3.5" strokeWidth={2} />
                      </button>
                    </div>
                  )}
                  <p className="text-left text-sm text-muted-foreground mt-0.5">{user?.id}</p>
                </div>
              </div>

              {/* Logout */}
              <div className="pt-2">
                <button onClick={() => { pb.authStore.clear(); localStorage.removeItem("authToken"); dispatch(logout()); navigate("/auth/login"); }}
                  className="flex items-center gap-2 w-full px-4 py-2.5 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors">
                  <LogOut className="w-4 h-4" strokeWidth={2} />
                  <span>Выйти изъ града</span>
                </button>
              </div>
            </>
          )}

          {/* Theme tab */}
          {activeTab === "theme" && (
            <div className="bg-card/40 backdrop-blur-sm rounded-lg border border-border p-4">
              <ThemeSwitcher />
            </div>
          )}

          {/* Voice tab */}
          {activeTab === "voice" && (
            <div className="bg-card/40 backdrop-blur-sm rounded-lg border border-border p-4">
              <div className="flex items-center gap-2 mb-4">
                <Headphones className="w-5 h-5 text-primary" strokeWidth={2} />
                <h3 className="text-base font-semibold text-foreground">Голосъ</h3>
              </div>
              <VoiceSettings />
            </div>
          )}

          {/* Hotkeys tab */}
          {activeTab === "hotkeys" && (
            <div className="bg-card/40 backdrop-blur-sm rounded-lg border border-border p-4">
              <div className="flex items-center gap-2 mb-4">
                <Keyboard className="w-5 h-5 text-primary" strokeWidth={2} />
                <h3 className="text-base font-semibold text-foreground">Горячiя клавиши</h3>
              </div>
              <HotkeySettings />
            </div>
          )}

        </div>
      </div>

      {/* Banner Selector Modal */}
      {repositionFile && (
        <BannerRepositionDialog
          bannerUrl={repositionFile.url}
          filename={repositionFile.filename}
          onSave={handleRepositionSave}
          onClose={() => setRepositionFile(null)}
        />
      )}
    </div>
  );
}
