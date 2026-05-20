import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { Crown, Edit2, Check, X, LogOut, Headphones, Palette, User, Loader2, Info, Keyboard, RefreshCw, Download, CheckCircle2, AlertCircle } from "lucide-react";
import { ThemeSwitcher } from "@features/theme/ThemeSwitcher";
import { VoiceSettings } from "@features/voice/VoiceSettings";
import { HotkeySettings } from "@features/voice/HotkeySettings";
import { useAppUpdater } from "@shared/hooks/useAppUpdater";
import { useAuth } from "@entities/user/model/useAuth";
import { pb } from "@shared/api/pb";
import { fetchCurrentUser, logout } from "@entities/user/model/authSlice";
import { useAppDispatch } from "@app/hooks";
import { UserAvatar } from "@entities/user/ui/UserAvatar";

import { isTauri } from "@shared/lib/tauri";

const APP_VERSION = __APP_VERSION__;

function useTauriVersion() {
  const [version, setVersion] = useState<string>(APP_VERSION);
  useEffect(() => {
    if (!isTauri()) return;
    import("@tauri-apps/api/app").then(({ getVersion }) =>
      getVersion().then(setVersion).catch(() => {})
    );
  }, []);
  return version;
}

const TABS = [
  { id: "profile", label: "Профиль", icon: User },
  { id: "theme", label: "Тема", icon: Palette },
  { id: "voice", label: "Голосъ", icon: Headphones },
  { id: "hotkeys", label: "Клавиши", icon: Keyboard },
];

export function Settings({ onClose }: { onClose?: () => void }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { updateInfo, checking, downloading, readyToInstall, checkForUpdates, applyUpdate } = useAppUpdater();
  const appVersion = useTauriVersion();
  const [activeTab, setActiveTab] = useState("profile");
  const [hotkeyResetTrigger, setHotkeyResetTrigger] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [nickname, setNickname] = useState("");
  const [saving, setSaving] = useState(false);
  const [bioText, setBioText] = useState("");
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [savingBio, setSavingBio] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (user?.bio) setBioText(user.bio);
  }, [user]);

  useEffect(() => {
    if (!onClose) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

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

  const saveBio = async () => {
    if (!user) return;
    setSavingBio(true);
    try {
      await pb.collection("users").update(user.id, { bio: bioText.trim() });
      dispatch(fetchCurrentUser());
      setIsEditingBio(false);
    } catch (err) {
      console.warn("[Settings] Failed to save bio:", err);
    } finally {
      setSavingBio(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") saveNickname();
    if (e.key === "Escape") cancelEditing();
  };

  return (
    <div className="flex flex-col sm:flex-row w-full h-full overflow-hidden">
      {/* Nav sidebar */}
      <div className="sm:w-48 bg-foreground/[0.02] flex-shrink-0 flex sm:flex-col overflow-x-auto sm:overflow-y-auto border-b sm:border-b-0 sm:border-r border-foreground/5">
        <div className="hidden sm:flex items-center gap-2 px-4 pt-4 pb-3 relative">
          <Crown className="w-3.5 h-3.5 text-foreground/30 flex-shrink-0" strokeWidth={1.5} />
          <h3 className="text-xs text-foreground/50 tracking-[0.15em] uppercase font-semibold flex-1">Настройки</h3>
          <div className="absolute bottom-0 left-3 right-3 h-px bg-gradient-to-r from-transparent via-foreground/15 to-transparent" />
        </div>
        <nav className="flex sm:flex-col gap-0.5 px-2 py-2 sm:py-0 sm:flex-1">
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
                <span className="text-xs sm:text-sm">{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="sticky top-0 flex items-center justify-end px-4 pt-3 pb-1 bg-background/90 backdrop-blur-sm z-10">
          {onClose && (
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-xl hover:bg-foreground/10 flex items-center justify-center text-foreground/30 hover:text-foreground/60 transition-colors"
            >
              <X className="w-4 h-4" strokeWidth={1.5} />
            </button>
          )}
        </div>
        <div className="px-5 pb-5 space-y-4">

          {/* Profile tab */}
          {activeTab === "profile" && (
            <>
              {/* Avatar & Name */}
              <div className="flex flex-col md:flex-row items-start md:items-end gap-3 md:gap-4">
                <div className="relative group">
                  <div onClick={triggerFileSelect} className="cursor-pointer">
                    {user && (
                      <UserAvatar
                        user={{ id: user.id, username: user.username, avatarUrl: user.avatar_url }}
                        size="2xl"
                      />
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1">
                    <button onClick={triggerFileSelect}
                      className="w-7 h-7 rounded-full bg-background/80 backdrop-blur-sm hover:bg-foreground/10 text-foreground/40 hover:text-foreground/70 flex items-center justify-center transition-colors shadow-sm border border-foreground/5"
                      title="Измѣнити аватарку">
                      <Edit2 className="w-3 h-3" strokeWidth={1.5} />
                    </button>
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
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

              {/* Bio */}
              <div className="bg-foreground/[0.02] rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-semibold text-foreground/30 uppercase tracking-widest">О себѣ</p>
                  {!isEditingBio && (
                    <button
                      onClick={() => setIsEditingBio(true)}
                      className="w-6 h-6 rounded-lg hover:bg-foreground/5 text-foreground/30 hover:text-foreground/60 flex items-center justify-center transition-colors"
                      title="Измѣнити"
                    >
                      <Edit2 className="w-3 h-3" strokeWidth={1.5} />
                    </button>
                  )}
                </div>
                {isEditingBio ? (
                  <div className="space-y-2">
                    <textarea
                      value={bioText}
                      onChange={(e) => setBioText(e.target.value)}
                      maxLength={300}
                      rows={3}
                      className="w-full bg-foreground/5 rounded-xl px-3 py-2 text-sm text-foreground outline-none focus:ring-1 focus:ring-foreground/20 resize-none"
                      placeholder="Расскажите о себѣ..."
                    />
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-foreground/20">{bioText.length}/300</span>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => { setIsEditingBio(false); setBioText(user?.bio ?? ""); }}
                          disabled={savingBio}
                          className="px-3 py-1.5 rounded-xl text-xs text-foreground/40 hover:text-foreground/60 hover:bg-foreground/5 transition-colors"
                        >
                          Отмѣна
                        </button>
                        <button
                          onClick={saveBio}
                          disabled={savingBio}
                          className="px-3 py-1.5 rounded-xl text-xs bg-foreground/10 text-foreground/60 hover:text-foreground flex items-center gap-1.5 transition-colors"
                        >
                          {savingBio ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" strokeWidth={1.5} />}
                          Сохранити
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-foreground/50 leading-snug">
                    {bioText || <span className="italic text-foreground/25">Не заполнено</span>}
                  </p>
                )}
              </div>

              {/* Logout */}
              <div className="pt-2">
                <button onClick={() => { pb.authStore.clear(); dispatch(logout()); navigate("/auth/login"); }}
                  className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm text-red-500/60 hover:text-red-500 hover:bg-red-500/5 transition-colors">
                  <LogOut className="w-4 h-4" strokeWidth={1.5} />
                  <span>Выйти изъ града</span>
                </button>
              </div>

              {/* App version + update status */}
              <div className="pt-1 px-1 space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <Info className="w-3 h-3 text-foreground/15" strokeWidth={1.5} />
                    <span className="text-xs text-foreground/20 font-mono">Вече v{appVersion}</span>
                  </div>
                  <button
                    onClick={readyToInstall ? applyUpdate : checkForUpdates}
                    disabled={checking || downloading}
                    className="flex items-center gap-1 text-xs text-foreground/30 hover:text-foreground/60 transition-colors disabled:pointer-events-none"
                    title={readyToInstall ? "Перезапустить и установить" : "Проверить обновления"}
                  >
                    <RefreshCw className={`w-3 h-3 ${checking ? "animate-spin" : ""}`} strokeWidth={1.5} />
                    <span>{checking ? "Проверка..." : readyToInstall ? "Перезапустить" : "Обновить"}</span>
                  </button>
                </div>
                {downloading && (
                  <div className="flex items-center gap-1.5 text-xs text-primary/70">
                    <Download className="w-3 h-3 animate-pulse" strokeWidth={1.5} />
                    <span>Загружаю обновленiе...</span>
                  </div>
                )}
                {!checking && !downloading && updateInfo?.available && (
                  <div className="flex items-center gap-1.5 text-xs text-primary/80">
                    <Download className="w-3 h-3" strokeWidth={1.5} />
                    <span>Доступна v{updateInfo.version}</span>
                  </div>
                )}
                {!checking && !downloading && updateInfo && !updateInfo.available && (
                  <div className="flex items-center gap-1.5 text-xs text-foreground/20">
                    <CheckCircle2 className="w-3 h-3" strokeWidth={1.5} />
                    <span>Актуальная версiя</span>
                  </div>
                )}
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
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-foreground/70">Горячiя клавиши</h3>
                <button
                  onClick={() => setHotkeyResetTrigger((n) => n + 1)}
                  className="group flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-foreground/5 text-foreground/30 hover:text-foreground/60 transition-colors text-xs"
                  title="Сбросить к умолчанiю"
                >
                  <RefreshCw className="w-3 h-3 transition-transform duration-500 ease-out group-hover:rotate-180" strokeWidth={1.5} />
                  Сбросить
                </button>
              </div>
              <HotkeySettings resetTrigger={hotkeyResetTrigger} />
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

