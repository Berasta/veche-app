import {
  Mic,
  MicOff,
  PhoneOff,
  Volume2,
  Maximize2,
  Ear,
  EarOff,
  Monitor,
  ChevronUp,
  Check,
} from "lucide-react";
import {
  selectConnected,
  selectConnecting,
  selectReconnecting,
  selectActiveChannelName,
  selectActiveChannelId,
  selectActiveServerId,
  selectParticipantCount,
  selectIsMuted,
  selectSpeakingCount,
  selectError,
  selectIsDeafened,
  selectScreenSharerId,
} from "@entities/room/model/roomSelectors";
import { useAppDispatch, useAppSelector } from "@app/hooks";
import {
  leaveChannel,
  toggleMute,
  toggleDeafen,
} from "@store/thunks/roomThunk";
import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { getP2PScreenShare, getSavedScreenShareQuality } from "./lib/p2pScreenShare";
import type { MuteMode } from "./VoiceControls";
import { Tooltip } from "@shared/ui/Tooltip";
import { getActiveRoom } from "@shared/lib/voiceRoom";
import { Portal } from "@shared/ui/Portal";

export function ActiveVoiceBar() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const connected = useAppSelector(selectConnected);
  const connecting = useAppSelector(selectConnecting);
  const reconnecting = useAppSelector(selectReconnecting);
  const channelName = useAppSelector(selectActiveChannelName);
  const participantCount = useAppSelector(selectParticipantCount);
  const isMuted = useAppSelector(selectIsMuted);
  const isDeafened = useAppSelector(selectIsDeafened);
  const speakingCount = useAppSelector(selectSpeakingCount);
  const activeChannelId = useAppSelector(selectActiveChannelId);
  const activeServerId = useAppSelector(selectActiveServerId);
  const error = useAppSelector(selectError);
  const screenSharerId = useAppSelector(selectScreenSharerId);

  const [muteMode, setMuteMode] = useState<MuteMode>("toggle");
  const [rendered, setRendered] = useState(false);
  const [visible, setVisible] = useState(false);
  const [showDeviceMenu, setShowDeviceMenu] = useState(false);
  const [micDevices, setMicDevices] = useState<MediaDeviceInfo[]>([]);
  const [speakerDevices, setSpeakerDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState(() => localStorage.getItem("audioInput") || "");
  const [selectedSpeakerId, setSelectedSpeakerId] = useState(() => localStorage.getItem("audioOutput") || "");
  const deviceMenuRef = useRef<HTMLDivElement>(null);
  const chevronBtnRef = useRef<HTMLButtonElement>(null);
  const [deviceMenuPos, setDeviceMenuPos] = useState({ bottom: 0, left: 0 });

  useEffect(() => {
    if (!showDeviceMenu) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      const outsideMenu = deviceMenuRef.current && !deviceMenuRef.current.contains(target);
      const outsideBtn = chevronBtnRef.current && !chevronBtnRef.current.contains(target);
      if (outsideMenu && outsideBtn) setShowDeviceMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showDeviceMenu]);

  const openDeviceMenu = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      setMicDevices(devices.filter((d) => d.kind === "audioinput"));
      setSpeakerDevices(devices.filter((d) => d.kind === "audiooutput"));
      if (chevronBtnRef.current) {
        const rect = chevronBtnRef.current.getBoundingClientRect();
        setDeviceMenuPos({ bottom: window.innerHeight - rect.top + 8, left: rect.left });
      }
      setShowDeviceMenu((v) => !v);
    } catch {
      toast.error("Не удалось получить список устройствъ");
    }
  }, []);

  const handleDeviceSelect = useCallback(async (deviceId: string) => {
    setSelectedDeviceId(deviceId);
    localStorage.setItem("audioInput", deviceId);
    const room = getActiveRoom();
    if (room) {
      try {
        await room.switchActiveDevice("audioinput", deviceId);
      } catch {
        toast.error("Не удалось переключить микрофон");
      }
    }
  }, []);

  const handleSpeakerSelect = useCallback(async (deviceId: string) => {
    setSelectedSpeakerId(deviceId);
    localStorage.setItem("audioOutput", deviceId);
    const room = getActiveRoom();
    if (room) {
      try {
        await room.switchActiveDevice("audiooutput", deviceId);
      } catch {
        toast.error("Не удалось переключить динамик");
      }
    }
  }, []);

  const isActive = connected || connecting || !!error;

  useEffect(() => {
    if (isActive) {
      setRendered(true);
      const raf1 = requestAnimationFrame(() => {
        const raf2 = requestAnimationFrame(() => setVisible(true));
        return () => cancelAnimationFrame(raf2);
      });
      return () => cancelAnimationFrame(raf1);
    } else {
      setVisible(false);
      const timer = setTimeout(() => setRendered(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isActive]);

  const isLocalSharing = screenSharerId !== null && screenSharerId === getP2PScreenShare()?.localIdentity;
  const isScreenShareBusy = screenSharerId !== null && !isLocalSharing;

  const handleToggleScreenShare = useCallback(async () => {
    const mgr = getP2PScreenShare();
    if (!mgr) return;
    if (mgr.isLocalSharing) {
      mgr.stopSharing();
    } else {
      const result = await mgr.startSharing(getSavedScreenShareQuality());
      if (result === "busy") toast.error("Кто-то уже демонстрирует экранъ");
    }
  }, []);

  // Читаем режим мьюта из localStorage
  useEffect(() => {
    const readMuteMode = () => {
      try {
        const saved = localStorage.getItem("muteMode");
        if (saved && ["toggle", "push-to-talk", "push-to-mute"].includes(saved)) {
          setMuteMode(saved as MuteMode);
        }
      } catch (err) {
        console.error("Ошибка чтенiя режима мьюта", err);
      }
    };
    readMuteMode();
    const interval = setInterval(readMuteMode, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!rendered) return null;

  return (
    <div
      style={{
        overflow: "hidden",
        maxHeight: visible ? "160px" : "0px",
        transition: "max-height 300ms cubic-bezier(0.16,1,0.3,1)",
      }}
    >
    <div
      style={{
        transform: visible ? "translateY(0)" : "translateY(100%)",
        opacity: visible ? 1 : 0,
        transition: "transform 300ms cubic-bezier(0.16,1,0.3,1), opacity 250ms ease",
      }}
    >
      {error && (
        <div className="px-4 py-1.5 bg-red-500/10 text-red-500 text-xs text-center">
          {error}
        </div>
      )}
      <div className="h-[68px] bg-foreground/[0.02] backdrop-blur-xl flex items-center px-4 gap-3 z-50 relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-foreground/8 pointer-events-none" />

        {connecting ? (
          <div className="flex-1 flex items-center justify-center gap-2 text-sm text-foreground/40">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
            Подключение къ каналу...
          </div>
        ) : connected ? (
          <>
            {/* Left: channel info */}
            <div className="flex-1 flex items-center gap-3 min-w-0">
              <div className="relative flex-shrink-0 w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <Volume2 size={16} className="text-primary" strokeWidth={1.5} />
                {speakingCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-primary rounded-full border-2 border-background animate-pulse" />
                )}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium text-foreground/80 truncate leading-tight">
                  {channelName}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-xs text-foreground/35">{participantCount} уч.</span>
                  {speakingCount > 0 && (
                    <span className="text-xs text-primary font-medium">· {speakingCount} говорит</span>
                  )}
                  {screenSharerId && (
                    <span className="flex items-center gap-0.5 text-xs text-primary">
                      <Monitor size={10} strokeWidth={1.5} />
                      <span>демонстрация</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Center: main controls */}
            <div className="flex items-center gap-2">
              {/* Mic + device selector */}
              <div ref={deviceMenuRef} className="relative flex items-center">
                <Tooltip content={isMuted ? "Включить микрофон" : "Выключить микрофон"} side="top">
                  <div className="relative">
                    <button
                      onClick={() => dispatch(toggleMute())}
                      className={`w-11 h-11 rounded-l-2xl rounded-r-lg flex items-center justify-center transition-all ${
                        isMuted
                          ? "bg-red-500/15 text-red-500 hover:bg-red-500/25"
                          : "bg-foreground/5 text-foreground/50 hover:bg-foreground/10 hover:text-foreground/80"
                      }`}
                    >
                      {isMuted ? <MicOff size={16} /> : <Mic size={16} />}
                    </button>
                    {(muteMode === "push-to-talk" || muteMode === "push-to-mute") && (
                      <span className="absolute -top-1 -right-1 bg-primary/90 text-primary-foreground text-[8px] font-bold px-1 py-0.5 rounded leading-none">
                        {muteMode === "push-to-talk" ? "PTT" : "PTM"}
                      </span>
                    )}
                  </div>
                </Tooltip>
                <Tooltip content="Выбрать микрофонъ" side="top">
                  <button
                    ref={chevronBtnRef}
                    onClick={openDeviceMenu}
                    className={`w-5 h-11 rounded-r-2xl rounded-l-none border-l border-foreground/10 flex items-center justify-center transition-all ${
                      isMuted
                        ? "bg-red-500/15 text-red-400 hover:bg-red-500/25"
                        : "bg-foreground/5 text-foreground/30 hover:bg-foreground/10 hover:text-foreground/60"
                    }`}
                  >
                    <ChevronUp size={10} strokeWidth={2.5} className={`transition-transform duration-200 ${showDeviceMenu ? "rotate-180" : ""}`} />
                  </button>
                </Tooltip>

                {showDeviceMenu && (
                  <Portal>
                    <div
                      ref={deviceMenuRef}
                      style={{
                        position: "fixed",
                        bottom: deviceMenuPos.bottom,
                        left: deviceMenuPos.left,
                        background: "color-mix(in srgb, var(--background) 55%, transparent)",
                        backdropFilter: "blur(24px) saturate(180%)",
                        WebkitBackdropFilter: "blur(24px) saturate(180%)",
                        border: "1px solid rgba(255,255,255,0.08)",
                      }}
                      className="min-w-[240px] rounded-2xl shadow-2xl shadow-black/30 p-1.5 z-[400]"
                    >
                      {/* Input devices */}
                      <div className="px-2.5 pt-1.5 pb-1">
                        <span className="text-[10px] font-semibold text-foreground/30 uppercase tracking-wider">Микрофонъ</span>
                      </div>
                      {micDevices.length === 0 ? (
                        <div className="px-2.5 py-2 text-xs text-foreground/30">Устройства не найдены</div>
                      ) : (
                        micDevices.map((d) => {
                          const isActive = d.deviceId === "default"
                            ? !selectedDeviceId || selectedDeviceId === "default"
                            : selectedDeviceId === d.deviceId;
                          return (
                            <button
                              key={d.deviceId}
                              onClick={() => handleDeviceSelect(d.deviceId)}
                              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left transition-colors ${
                                isActive ? "bg-primary/10" : "hover:bg-foreground/5"
                              }`}
                            >
                              <Mic size={12} className={`flex-shrink-0 ${isActive ? "text-primary" : "text-foreground/30"}`} strokeWidth={isActive ? 2.5 : 1.5} />
                              <span className={`text-xs truncate flex-1 ${isActive ? "text-primary font-medium" : "text-foreground/70"}`}>
                                {d.label || `Микрофон ${d.deviceId.slice(0, 6)}`}
                              </span>
                              {isActive && <Check size={11} className="text-primary flex-shrink-0" strokeWidth={2.5} />}
                            </button>
                          );
                        })
                      )}

                      {/* Divider */}
                      {speakerDevices.length > 0 && (
                        <div className="my-1.5 h-px mx-2" style={{ background: "rgba(255,255,255,0.06)" }} />
                      )}

                      {/* Output devices */}
                      {speakerDevices.length > 0 && (
                        <>
                          <div className="px-2.5 pb-1">
                            <span className="text-[10px] font-semibold text-foreground/30 uppercase tracking-wider">Динамик</span>
                          </div>
                          {speakerDevices.map((d) => {
                            const isActive = d.deviceId === "default"
                              ? !selectedSpeakerId || selectedSpeakerId === "default"
                              : selectedSpeakerId === d.deviceId;
                            return (
                              <button
                                key={d.deviceId}
                                onClick={() => handleSpeakerSelect(d.deviceId)}
                                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left transition-colors ${
                                  isActive ? "bg-primary/10" : "hover:bg-foreground/5"
                                }`}
                              >
                                <Volume2 size={12} className={`flex-shrink-0 ${isActive ? "text-primary" : "text-foreground/30"}`} strokeWidth={isActive ? 2.5 : 1.5} />
                                <span className={`text-xs truncate flex-1 ${isActive ? "text-primary font-medium" : "text-foreground/70"}`}>
                                  {d.label || `Динамик ${d.deviceId.slice(0, 6)}`}
                                </span>
                                {isActive && <Check size={11} className="text-primary flex-shrink-0" strokeWidth={2.5} />}
                              </button>
                            );
                          })}
                        </>
                      )}
                    </div>
                  </Portal>
                )}
              </div>

              <Tooltip content={isDeafened ? "Включить звукъ" : "Оглушити"} side="top">
                <button
                  onClick={() => dispatch(toggleDeafen())}
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
                    isDeafened
                      ? "bg-red-500/15 text-red-500 hover:bg-red-500/25"
                      : "bg-foreground/5 text-foreground/50 hover:bg-foreground/10 hover:text-foreground/80"
                  }`}
                >
                  {isDeafened ? <EarOff size={16} /> : <Ear size={16} />}
                </button>
              </Tooltip>

              <Tooltip
                content={
                  isLocalSharing
                    ? "Остановить демонстрацiю"
                    : isScreenShareBusy
                    ? "Демонстрацiя занята"
                    : "Демонстрировать экранъ"
                }
                side="top"
              >
                <button
                  onClick={handleToggleScreenShare}
                  disabled={isScreenShareBusy}
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
                    isLocalSharing
                      ? "bg-primary/15 text-primary hover:bg-primary/25"
                      : isScreenShareBusy
                      ? "bg-foreground/5 text-foreground/20 cursor-not-allowed"
                      : "bg-foreground/5 text-foreground/50 hover:bg-foreground/10 hover:text-foreground/80"
                  }`}
                >
                  <Monitor size={16} />
                </button>
              </Tooltip>
            </div>

            {/* Right: expand + leave */}
            <div className="flex-1 flex items-center justify-end gap-2">
              {activeServerId && activeChannelId && (
                <Tooltip content="Раскрыть звонокъ" side="top">
                  <button
                    onClick={() => navigate(`/app/server/${activeServerId}/voice/${activeChannelId}`)}
                    className="w-9 h-9 rounded-xl bg-foreground/5 text-foreground/40 hover:bg-foreground/10 hover:text-foreground/70 flex items-center justify-center transition-all"
                  >
                    <Maximize2 size={15} />
                  </button>
                </Tooltip>
              )}

              <Tooltip content="Покинуть каналъ" side="top">
                <button
                  onClick={() => dispatch(leaveChannel())}
                  className="flex items-center gap-2 h-9 px-4 rounded-full bg-red-500/90 hover:bg-red-500 text-white text-sm font-medium transition-all"
                >
                  <PhoneOff size={14} />
                  <span>Выйти</span>
                </button>
              </Tooltip>
            </div>
          </>
        ) : null}
      </div>
    </div>
    </div>
  );
}
