import { Crown, Edit2, Image, Check, X, LogOut, Headphones } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { ThemeSwitcher } from "../components/ThemeSwitcher";
import { VoiceSettings } from "../components/settings/VoiceSettings";
import { HotkeySettings } from "../components/settings/HotkeySettings";
import { BannerSelector, banners } from "../components/BannerSelector";
import { useAuth } from "@store/hooks/useAuth";
import { pb } from "@api/pb";
import { fetchCurrentUser, logout } from "@store/slices/authSlice";
import { useAppDispatch } from "@store/hooks";

export function Settings() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [nickname, setNickname] = useState("");
  const [saving, setSaving] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState("default");
  const [showBannerSelector, setShowBannerSelector] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const savedBanner = localStorage.getItem("profileBanner") || "default";
    setSelectedBanner(savedBanner);
  }, []);

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

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleBannerSelect = async (bannerId: string) => {
    setSelectedBanner(bannerId);
    localStorage.setItem("profileBanner", bannerId);
    if (user) {
      try {
        await pb.collection("users").update(user.id, { banner: bannerId });
        dispatch(fetchCurrentUser());
      } catch {}
    }
  };

  const startEditing = () => {
    setNickname(user?.username || "");
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setNickname("");
  };

  const saveNickname = async () => {
    const trimmed = nickname.trim();
    if (!trimmed || !user || trimmed === user.username) {
      cancelEditing();
      return;
    }

    setSaving(true);
    try {
      await pb.collection("users").update(user.id, { username: trimmed });
      dispatch(fetchCurrentUser());
      setIsEditing(false);
    } catch (err: any) {
      console.error("Ошибка сохранения имени", err);
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") saveNickname();
    if (e.key === "Escape") cancelEditing();
  };

  const currentBanner =
    banners.find((b) => b.id === selectedBanner) || banners[0];

  return (
    <div className="w-full flex flex-col bg-background relative z-10">
      {/* Header */}
      <div className="h-12 border-b border-border bg-card/30 backdrop-blur-xl flex items-center px-2 md:px-4 shadow-sm">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Crown
            className="w-5 h-5 text-primary flex-shrink-0"
            strokeWidth={2}
          />
          <h3 className="text-sm text-foreground tracking-wide truncate">
            Профиль боярина
          </h3>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto p-3 md:p-6 space-y-4 md:space-y-6">
          {/* Banner */}
          <div
            className={`relative h-32 rounded-lg overflow-hidden bg-gradient-to-br ${currentBanner.gradient} border border-primary/20 group`}
          >
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: currentBanner.pattern,
              }}
            />

            {/* Edit Banner Button */}
            <button
              onClick={() => setShowBannerSelector(true)}
              className="absolute top-3 right-3 px-3 py-1.5 bg-background/80 backdrop-blur-sm hover:bg-background/95 text-foreground rounded-lg transition-all opacity-0 group-hover:opacity-100 flex items-center gap-2 text-sm border border-border shadow-lg"
            >
              <Image className="w-3.5 h-3.5" strokeWidth={2} />
              <span className="hidden md:inline">Измѣнити хоругвь</span>
            </button>
          </div>

          {/* Avatar & Name */}
          <div className="relative -mt-12 flex flex-col md:flex-row items-start md:items-end gap-3 md:gap-4">
            <div className="w-20 md:w-24 h-20 md:h-24  rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center ring-4 ring-background relative flex-shrink-0">
              {user?.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt="avatar"
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <Crown
                  className="w-10 md:w-12 h-10 md:h-12 text-primary"
                  strokeWidth={2}
                />
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />

              <button
                onClick={triggerFileSelect}
                className="absolute bottom-0 right-0 w-6 md:w-7 h-6 md:h-7 bg-primary text-primary-foreground rounded-full flex items-center justify-center hover:bg-primary/90 transition-colors shadow-lg"
              >
                <Edit2 className="w-3 md:w-3.5 h-3 md:h-3.5" />
              </button>
            </div>

            <div className="flex-1 pb-2 min-w-0 w-full md:w-auto">
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={saving}
                    className="bg-input-background border border-border rounded-md px-3 py-1.5 text-lg font-semibold text-foreground w-full outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <button
                    onClick={saveNickname}
                    disabled={saving}
                    className="w-8 h-8 rounded-md bg-primary/20 text-primary hover:bg-primary/30 flex items-center justify-center transition-colors flex-shrink-0"
                    title="Сохранити"
                  >
                    <Check className="w-4 h-4" strokeWidth={2} />
                  </button>
                  <button
                    onClick={cancelEditing}
                    disabled={saving}
                    className="w-8 h-8 rounded-md hover:bg-muted/50 text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors flex-shrink-0"
                    title="Отмѣна"
                  >
                    <X className="w-4 h-4" strokeWidth={2} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 group">
                  <h2 className="text-xl md:text-2xl font-bold text-foreground truncate">
                    {user?.username}
                  </h2>
                  <button
                    onClick={startEditing}
                    className="w-7 h-7 rounded-md opacity-0 group-hover:opacity-100 hover:bg-muted/50 text-muted-foreground hover:text-foreground flex items-center justify-center transition-all flex-shrink-0"
                    title="Измѣнити имя"
                  >
                    <Edit2 className="w-3.5 h-3.5" strokeWidth={2} />
                  </button>
                </div>
              )}
              <p className="text-left text-sm text-muted-foreground mt-0.5">
                {user?.id}
              </p>
            </div>
          </div>

          {/* Theme Settings */}
          <div className="bg-card/40 backdrop-blur-sm rounded-lg border border-border p-4">
            <ThemeSwitcher />
          </div>

          {/* Voice Settings */}
          <div className="bg-card/40 backdrop-blur-sm rounded-lg border border-border p-4">
            <div className="flex items-center gap-2 mb-4">
              <Headphones className="w-5 h-5 text-primary" strokeWidth={2} />
              <h3 className="text-base font-semibold text-foreground">Голосъ</h3>
            </div>
            <VoiceSettings />
          </div>

          {/* Hotkey Settings */}
          <div className="bg-card/40 backdrop-blur-sm rounded-lg border border-border p-4">
            <HotkeySettings />
          </div>

          {/* Logout */}
          <div className="pt-2">
            <button
              onClick={() => {
                pb.authStore.clear();
                localStorage.removeItem("authToken");
                dispatch(logout());
                navigate("/auth/login");
              }}
              className="flex items-center gap-2 w-full px-4 py-2.5 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="w-4 h-4" strokeWidth={2} />
              <span>Выйти изъ града</span>
            </button>
          </div>


        </div>
      </div>

      {/* Banner Selector Modal */}
      {showBannerSelector && (
        <BannerSelector
          currentBanner={selectedBanner}
          onSelect={handleBannerSelect}
          onClose={() => setShowBannerSelector(false)}
        />
      )}
    </div>
  );
}
