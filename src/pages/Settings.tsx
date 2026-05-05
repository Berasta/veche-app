import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { Crown, Edit2, Image, Check, X, LogOut, Headphones, Palette, Keyboard, User, ArrowLeft, Trash2, Crop, Gem, Loader2 } from "lucide-react";
import { ThemeSwitcher } from "@features/theme/ThemeSwitcher";
import { VoiceSettings } from "@features/voice/VoiceSettings";
import { HotkeySettings } from "@features/voice/HotkeySettings";
import { BannerRepositionDialog } from "@entities/user/ui/BannerRepositionDialog";
import { Shop } from "../features/shop/Shop";
import { useAuth } from "@entities/user/model/useAuth";
import { pb, PB_URL } from "@shared/api/pb";
import { fetchCurrentUser, logout } from "@entities/user/model/authSlice";
import { useAppDispatch } from "@app/hooks";
import { UserAvatar, type UserAvatarData } from "@entities/user/ui/UserAvatar";
import { Portal } from "@shared/ui/Portal";
import { applyShopItem, removeShopItem } from "@entities/user/model/userApi";

const TABS = [
  { id: "profile", label: "Профиль", icon: User },
  { id: "theme", label: "Тема", icon: Palette },
  { id: "voice", label: "Голосъ", icon: Headphones },
  { id: "shop", label: "Магазинъ", icon: Gem },
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
  const [showFrameSelector, setShowFrameSelector] = useState(false);
  const [localAccessory, setLocalAccessory] = useState<string | undefined>(() => {
    try { return localStorage.getItem("avatarAccessory") || undefined; } catch { return undefined; }
  });
  const [localBannerSkin, setLocalBannerSkin] = useState<string | undefined>(() => {
    try { return localStorage.getItem("bannerSkin") || undefined; } catch { return undefined; }
  });
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
      <div className="md:hidden h-12 bg-background/40 backdrop-blur-xl flex items-center px-4 flex-shrink-0">
        <Crown className="w-4 h-4 text-foreground/30 mr-2" strokeWidth={1.5} />
        <h3 className="text-sm font-medium text-foreground/80">Настройки</h3>
      </div>

      {/* Nav: horizontal on mobile, vertical sidebar on desktop */}
      <div className="md:w-56 bg-background/40 flex-shrink-0 flex md:flex-col overflow-x-auto md:overflow-y-auto md:pt-2 relative">
        <div className="md:absolute md:right-0 md:top-0 md:bottom-0 md:w-px bg-foreground/5 pointer-events-none" />
        <div className="hidden md:block px-5 pb-2 mb-2 relative">
          <h3 className="text-xs text-foreground/50 tracking-[0.15em] uppercase font-semibold">Настройки</h3>
          <div className="absolute bottom-0 left-3 right-3 h-px bg-foreground/5" />
        </div>
        <nav className="flex md:flex-col gap-0.5 px-2 py-2 md:py-0 md:flex-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-foreground/[0.06] text-foreground/80"
                    : "text-foreground/30 hover:bg-foreground/[0.03] hover:text-foreground/60"
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={1.5} />
                <span className="hidden md:inline">{tab.label}</span>
                <span className="md:hidden text-xs">{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Mobile back button */}
        <div className="md:hidden flex items-center gap-2 px-4 h-12 bg-background/40">
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 rounded-xl hover:bg-foreground/5 flex items-center justify-center text-foreground/30 hover:text-foreground/60 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
          </button>
          <span className="text-sm text-foreground/80">Настройки</span>
        </div>
        <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-4 md:space-y-6">

          {/* Profile tab */}
          {activeTab === "profile" && (
            <>
              {/* Banner */}
              <div
                onClick={() => bannerInputRef.current?.click()}
                className="relative w-full aspect-[3.2/1] rounded-xl overflow-hidden bg-foreground/[0.02] group cursor-pointer hover:bg-foreground/[0.04] transition-colors"
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
                      className="w-7 h-7 rounded-lg bg-background/60 backdrop-blur-sm hover:bg-foreground/10 text-foreground/30 hover:text-foreground/60 flex items-center justify-center transition-colors"
                      title="Замѣнити хоругвь">
                      <Image className="w-3.5 h-3.5" strokeWidth={1.5} />
                    </button>
                    <button onClick={async (e) => { e.stopPropagation(); if (!user) return; await pb.collection("users").update(user.id, { banner: "" }); setCustomBannerUrl(null); dispatch(fetchCurrentUser()); }}
                      className="w-7 h-7 rounded-lg bg-background/60 backdrop-blur-sm hover:bg-foreground/10 text-foreground/30 hover:text-red-500/70 flex items-center justify-center transition-colors"
                      title="Удалити хоругвь">
                      <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                    </button>
                    {customBannerUrl && (
                      <button onClick={(e) => { e.stopPropagation(); const filename = customBannerUrl.split("/").pop() || ""; setRepositionFile({ url: customBannerUrl, filename }); }}
                        className="w-7 h-7 rounded-lg bg-background/60 backdrop-blur-sm hover:bg-foreground/10 text-foreground/30 hover:text-foreground/60 flex items-center justify-center transition-colors"
                        title="Настроить область">
                        <Crop className="w-3.5 h-3.5" strokeWidth={1.5} />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Avatar & Name */}
              <div className="relative -mt-12 flex flex-col md:flex-row items-start md:items-end gap-3 md:gap-4">
                <div className="relative group">
                  <div onClick={() => setShowFrameSelector(true)} className="cursor-pointer">
                    {user && (
                      <UserAvatar
                        user={{ id: user.id, username: user.username, avatarUrl: user.avatar_url, avatarFrame: user.avatar_frame }}
                        size="2xl"
                      />
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1">
                    <button onClick={() => setShowFrameSelector(true)}
                      className="w-7 h-7 rounded-full bg-background/80 backdrop-blur-sm hover:bg-foreground/10 text-foreground/40 hover:text-foreground/70 flex items-center justify-center transition-colors shadow-sm border border-foreground/5"
                      title="Измѣнити аватарку или оправу">
                      <Edit2 className="w-3 h-3" strokeWidth={1.5} />
                    </button>
                  </div>
                </div>

                <div className="flex-1 pb-2 min-w-0 w-full md:w-auto">
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <input ref={inputRef} type="text" value={nickname} onChange={(e) => setNickname(e.target.value)}
                        onKeyDown={handleKeyDown} disabled={saving}
                        className="flex-1 bg-foreground/5 rounded-xl px-3 py-2 text-sm text-foreground outline-none focus:ring-1 focus:ring-foreground/20" />
                      <button onClick={saveNickname} disabled={saving}
                        className="w-8 h-8 rounded-xl bg-foreground/10 text-foreground/60 hover:text-foreground flex items-center justify-center transition-colors flex-shrink-0" title="Сохранити">
                        {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" strokeWidth={1.5} />}
                      </button>
                      <button onClick={cancelEditing} disabled={saving}
                        className="w-8 h-8 rounded-xl hover:bg-foreground/5 text-foreground/30 hover:text-foreground/60 flex items-center justify-center transition-colors flex-shrink-0" title="Отмѣна">
                        <X className="w-3.5 h-3.5" strokeWidth={1.5} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 group">
                      <h2 className="text-xl md:text-2xl font-bold text-foreground/80 truncate">{user?.username}</h2>
                      <button onClick={startEditing}
                        className="w-7 h-7 rounded-xl opacity-0 group-hover:opacity-100 hover:bg-foreground/5 text-foreground/30 hover:text-foreground/60 flex items-center justify-center transition-all flex-shrink-0" title="Измѣнити имя">
                        <Edit2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                      </button>
                    </div>
                  )}
                  <p className="text-xs text-foreground/20 mt-1 font-mono">{user?.id}</p>
                </div>
              </div>

              {/* Logout */}
              <div className="pt-2">
                <button onClick={() => { pb.authStore.clear(); localStorage.removeItem("authToken"); dispatch(logout()); navigate("/auth/login"); }}
                  className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm text-red-500/60 hover:text-red-500 hover:bg-red-500/5 transition-colors">
                  <LogOut className="w-4 h-4" strokeWidth={1.5} />
                  <span>Выйти изъ града</span>
                </button>
              </div>
            </>
          )}

          {/* Theme tab */}
          {activeTab === "theme" && (
            <div className="bg-foreground/[0.02] backdrop-blur-sm rounded-xl p-4">
              <ThemeSwitcher />
            </div>
          )}

          {/* Voice tab */}
          {activeTab === "voice" && (
            <div className="bg-foreground/[0.02] backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 mb-4">
                <Headphones className="w-4 h-4 text-foreground/30" strokeWidth={1.5} />
                <h3 className="text-sm font-medium text-foreground/80">Голосъ</h3>
              </div>
              <VoiceSettings />
            </div>
          )}

          {/* Hotkeys tab */}
          {activeTab === "hotkeys" && (
            <div className="bg-foreground/[0.02] backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 mb-4">
                <Keyboard className="w-4 h-4 text-foreground/30" strokeWidth={1.5} />
                <h3 className="text-sm font-medium text-foreground/80">Горячiя клавиши</h3>
              </div>
              <HotkeySettings />
            </div>
          )}

          {/* Shop tab */}
          {activeTab === "shop" && (
            <div className="bg-foreground/[0.02] backdrop-blur-sm rounded-xl p-4">
              <Shop />
            </div>
          )}

        </div>
      </div>

      {/* Avatar & Frame Modal */}
      {showFrameSelector && user && (
        <Portal>
          <div className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowFrameSelector(false)}>
            <div className="bg-background/80 backdrop-blur-xl rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="p-5 space-y-5">
                {/* Avatar preview */}
                <div className="flex flex-col items-center gap-3">
                      <UserAvatar user={{ id: user.id, username: user.username, avatarUrl: user.avatar_url, avatarFrame: user.avatar_frame, avatarAccessory: user.avatar_accessory || localAccessory }} size="2xl" />
                  <span className="text-sm text-foreground/60">{user.username}</span>
                  <button onClick={() => { fileInputRef.current?.click(); setShowFrameSelector(false); }}
                    className="px-4 py-2 rounded-xl bg-foreground/5 hover:bg-foreground/10 text-foreground/60 hover:text-foreground text-sm font-medium transition-colors">
                    Загрузити аватарку
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </div>

                {/* Frame selection */}
                <div>
                  <p className="text-[10px] font-semibold text-foreground/30 uppercase tracking-widest mb-2">Оправы</p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    <FrameOption name="" empty active={!user.avatar_frame} onClick={async () => { await removeShopItem(user.id, "frame"); dispatch(fetchCurrentUser()); setShowFrameSelector(false); }} />
                    {["frame_royal", "frame_violet", "frame_ruby", "frame_ancient", "frame_arcane", "frame_rainbow", "frame_neon", "frame_fire", "frame_ice", "frame_shadow", "frame_shine", "frame_aura", "frame_holo", "frame_pulsar", "frame_matrix", "frame_stardust", "frame_arc", "frame_storm"].map((id) => {
                      const labels: Record<string, string> = {
                        frame_royal: "Царская", frame_violet: "Боярская", frame_ruby: "Рубиновая",
                        frame_ancient: "Древнее сіяніе", frame_arcane: "Чародѣйскій",
                        frame_rainbow: "Радужная", frame_neon: "Неоновая", frame_fire: "Пламенная", frame_ice: "Ледяная", frame_shadow: "Призрачная",
                        frame_shine: "Блестящая", frame_aura: "Аура", frame_holo: "Голографическая", frame_pulsar: "Пульсар", frame_matrix: "Матрица", frame_stardust: "Звѣздная пыль", frame_arc: "Электродуга", frame_storm: "Гроза"
                      };
                      const rings: Record<string, string> = {
                        frame_royal: "ring-2 ring-yellow-500", frame_violet: "ring-2 ring-violet-500", frame_ruby: "ring-2 ring-red-500",
                        frame_ancient: "ring-2 ring-transparent animate-[frame-ancient_2s_ease-in-out_infinite]",
                        frame_arcane: "ring-2 ring-transparent animate-[frame-arcane_2.5s_ease-in-out_infinite]",
                        frame_rainbow: "ring-2 ring-transparent animate-[frame-rainbow_3s_linear_infinite]",
                        frame_neon: "ring-2 ring-transparent animate-[frame-neon_1.5s_ease-in-out_infinite]",
                        frame_fire: "ring-2 ring-transparent animate-[frame-flame_3s_ease-in-out_infinite]",
                        frame_ice: "ring-2 ring-transparent animate-[frame-ice_3s_ease-in-out_infinite]",
                        frame_shadow: "ring-2 ring-transparent animate-[frame-shadow_2s_ease-in-out_infinite]",
                        frame_shine: "ring-2 ring-transparent animate-[frame-shine_3s_linear_infinite]",
                        frame_aura: "ring-2 ring-transparent animate-[frame-aura_2.5s_ease-in-out_infinite]",
                        frame_holo: "ring-2 ring-transparent animate-[frame-holo_4s_linear_infinite]",
                        frame_pulsar: "ring-2 ring-transparent animate-[frame-pulsar_3s_ease-in-out_infinite]",
                        frame_matrix: "ring-2 ring-transparent animate-[frame-matrix_2s_linear_infinite]",
                        frame_stardust: "ring-2 ring-transparent animate-[frame-stardust_4s_ease-in-out_infinite]",
                        frame_arc: "ring-2 ring-transparent animate-[frame-arc_2s_linear_infinite]",
                        frame_storm: "ring-2 ring-transparent animate-[frame-storm_6s_ease-in-out_infinite]"
                      };
                      return (
                        <FrameOption key={id} name={labels[id]} frameClass={rings[id]} active={user.avatar_frame === id}
                          onClick={async () => { await applyShopItem(user.id, id, "frame"); dispatch(fetchCurrentUser()); setShowFrameSelector(false); }} />
                      );
                    })}
                  </div>
                </div>

                {/* Banner skins */}
                <div>
                  <p className="text-[10px] font-semibold text-foreground/30 uppercase tracking-widest mb-2">Скины хоругви</p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    <FrameOption name="" empty active={!(user.banner_skin || localBannerSkin)} onClick={async () => {
                      await removeShopItem(user.id, "banner");
                      localStorage.removeItem("bannerSkin");
                      setLocalBannerSkin(undefined);
                      dispatch(fetchCurrentUser());
                      setShowFrameSelector(false);
                    }} />
                    {["banner_golden", "banner_crimson", "banner_azure", "banner_emerald", "banner_aurora", "banner_inferno"].map((id) => {
                      const bsLabels: Record<string, string> = {
                        banner_golden: "Златая", banner_crimson: "Червлёная", banner_azure: "Лазурная",
                        banner_emerald: "Изумрудная", banner_aurora: "Сѣверное сіяніе", banner_inferno: "Адское пламя"
                      };
                      const bsPreviews: Record<string, string> = {
                        banner_golden: "bg-gradient-to-r from-yellow-400/80 via-amber-500/80 to-orange-600/80",
                        banner_crimson: "bg-gradient-to-r from-red-600/80 via-rose-700/80 to-purple-800/80",
                        banner_azure: "bg-gradient-to-r from-blue-500/80 via-cyan-600/80 to-teal-700/80",
                        banner_emerald: "bg-gradient-to-r from-emerald-500/80 via-green-600/80 to-teal-800/80",
                        banner_aurora: "bg-gradient-to-r from-green-400/80 via-blue-500/80 to-purple-600/80",
                        banner_inferno: "bg-gradient-to-r from-red-600/80 via-orange-500/80 to-yellow-400/80"
                      };
                      const isActive = (user.banner_skin || localBannerSkin) === id;
                      return (
                        <FrameOption key={id} name={bsLabels[id]} frameClass={bsPreviews[id]} active={isActive}
                          onClick={async () => {
                            await applyShopItem(user.id, id, "banner");
                            localStorage.setItem("bannerSkin", id);
                            setLocalBannerSkin(id);
                            dispatch(fetchCurrentUser());
                            setShowFrameSelector(false);
                          }} />
                      );
                    })}
                  </div>
                </div>

                {/* Accessories */}
                <div>
                  <p className="text-[10px] font-semibold text-foreground/30 uppercase tracking-widest mb-2">Украшенія на аватарку</p>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    <FrameOption name="" empty active={!(user.avatar_accessory || localAccessory)} onClick={async () => { await removeShopItem(user.id, "accessory"); localStorage.removeItem("avatarAccessory"); setLocalAccessory(undefined); dispatch(fetchCurrentUser()); setShowFrameSelector(false); }} />
                    {["ears_cat", "ears_bunny", "crown", "halo", "glasses", "flower"].map((id) => {
                      const accLabels: Record<string, string> = { ears_cat: "Кошачьи уши", ears_bunny: "Заячьи уши", crown: "Корона", halo: "Нимбъ", glasses: "Очки", flower: "Цвѣтокъ" };
                      const isActive = (user.avatar_accessory || localAccessory) === id;
                      return (
                        <AccessoryOption key={id} name={accLabels[id]} active={isActive}
                          onClick={async () => { await applyShopItem(user.id, id, "accessory"); localStorage.setItem("avatarAccessory", id); setLocalAccessory(id); dispatch(fetchCurrentUser()); setShowFrameSelector(false); }} />
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Portal>
      )}

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

function FrameOption({ name, frameClass, active, empty, onClick }: { name: string; frameClass?: string; active: boolean; empty?: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${
        active ? "border-primary/30 bg-primary/[0.04]" : "border-foreground/5 bg-foreground/[0.02] hover:border-foreground/10"
      }`}
    >
      {empty ? (
        <div className={`w-12 h-12 rounded-full bg-foreground/5 flex items-center justify-center text-foreground/30 ${active ? "ring-2 ring-primary/50" : ""}`}>
          <X className="w-4 h-4" strokeWidth={1.5} />
        </div>
      ) : (
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${active ? "ring-2 ring-primary/50" : ""}`}>
          <div className={`w-full h-full rounded-full ${frameClass || "bg-foreground/5"} flex items-center justify-center`}>
            <div className="w-7 h-7 rounded-full bg-background flex items-center justify-center text-[10px] font-bold text-foreground/30">
              {name?.slice(0, 2)}
            </div>
          </div>
        </div>
      )}
      <span className="text-[10px] text-foreground/50 text-center leading-tight">{name || "Нѣтъ"}</span>
    </button>
  );
}

function AccessoryOption({ name, active, onClick }: { name: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border transition-all ${
        active ? "border-primary/30 bg-primary/[0.04]" : "border-foreground/5 bg-foreground/[0.02] hover:border-foreground/10"
      }`}
    >
      <div className={`w-10 h-10 rounded-full bg-foreground/5 flex items-center justify-center overflow-hidden ${active ? "ring-2 ring-primary/50" : ""}`}>
        <svg viewBox="0 0 100 100" className="w-8 h-8" fill="none">
          <circle cx="50" cy="50" r="30" fill="#d4d4d4" opacity="0.3" />
          {name?.includes("уши") || name?.includes("Уши") ? (
            <>
              <path d="M30 45 Q20 15 40 25 Q32 32 32 45Z" fill="#d4d4d4" opacity="0.7" />
              <path d="M70 45 Q80 15 60 25 Q68 32 68 45Z" fill="#d4d4d4" opacity="0.7" />
            </>
          ) : name === "Корона" ? (
            <path d="M25 55 L35 30 L45 45 L50 25 L55 45 L65 30 L75 55Z" fill="#fbbf24" opacity="0.8" />
          ) : name === "Нимбъ" ? (
            <ellipse cx="50" cy="35" rx="18" ry="5" fill="none" stroke="#fbbf24" strokeWidth="2" opacity="0.6" />
          ) : name === "Очки" ? (
            <>
              <circle cx="38" cy="50" r="9" fill="none" stroke="#666" strokeWidth="1.5" />
              <circle cx="62" cy="50" r="9" fill="none" stroke="#666" strokeWidth="1.5" />
              <path d="M47 50 L53 50" stroke="#666" strokeWidth="1.5" />
            </>
          ) : name === "Цвѣтокъ" ? (
            <>
              {[0, 60, 120, 180, 240, 300].map((a) => (
                <ellipse key={a} cx={70} cy={38} rx={2.5} ry={4} fill="#f472b6" opacity="0.7" transform={`rotate(${a} 70 38)`} />
              ))}
              <circle cx="70" cy="38" r="2.5" fill="#fbbf24" />
            </>
          ) : null}
        </svg>
      </div>
      <span className="text-[9px] text-foreground/50 text-center leading-tight">{name}</span>
    </button>
  );
}
