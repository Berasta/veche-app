import { toast } from "sonner";
import { useState, useEffect } from "react";
import { Mic, Volume2, Headphones } from "lucide-react";

export function VoiceSettings() {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [inputDevice, setInputDevice] = useState(localStorage.getItem("audioInput") || "");
  const [outputDevice, setOutputDevice] = useState(localStorage.getItem("audioOutput") || "");
  const [masterVolume, setMasterVolume] = useState(Number(localStorage.getItem("masterVolume") || 100));

  useEffect(() => {
    navigator.mediaDevices?.enumerateDevices().then((d) => {
      setDevices(d);
      if (!d.length) return;
      if (!inputDevice) {
        const mic = d.find((x) => x.kind === "audioinput");
        if (mic) setInputDevice(mic.deviceId);
      }
      if (!outputDevice) {
        const spk = d.find((x) => x.kind === "audiooutput");
        if (spk) setOutputDevice(spk.deviceId);
      }
    }).catch((err) => {
      console.error("Ошибка полученiя устройствъ", err);
      toast.error("Не удалось получить список аудио-устройствъ");
    });
  }, []);

  const handleInputChange = (deviceId: string) => {
    setInputDevice(deviceId);
    localStorage.setItem("audioInput", deviceId);
  };

  const handleOutputChange = (deviceId: string) => {
    setOutputDevice(deviceId);
    localStorage.setItem("audioOutput", deviceId);
  };

  const handleVolumeChange = (v: number) => {
    setMasterVolume(v);
    localStorage.setItem("masterVolume", String(v));
  };

  const mics = devices.filter((d) => d.kind === "audioinput");
  const speakers = devices.filter((d) => d.kind === "audiooutput");

  return (
    <div className="space-y-5">
      {/* Microphone */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Mic className="w-4 h-4 text-primary" strokeWidth={2} />
          <span className="text-sm font-semibold text-foreground">Микрофонъ</span>
        </div>
        {mics.length > 0 ? (
          <select
            value={inputDevice}
            onChange={(e) => handleInputChange(e.target.value)}
            className="w-full bg-input-background border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/50"
          >
            {mics.map((m) => (
              <option key={m.deviceId} value={m.deviceId}>
                {m.label || `Микрофонъ ${m.deviceId.slice(0, 8)}`}
              </option>
            ))}
          </select>
        ) : (
          <p className="text-xs text-muted-foreground">Не удалось получить список устройствъ</p>
        )}
      </div>

      {/* Speakers */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Headphones className="w-4 h-4 text-primary" strokeWidth={2} />
          <span className="text-sm font-semibold text-foreground">Динамики</span>
        </div>
        {speakers.length > 0 ? (
          <select
            value={outputDevice}
            onChange={(e) => handleOutputChange(e.target.value)}
            className="w-full bg-input-background border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/50"
          >
            {speakers.map((s) => (
              <option key={s.deviceId} value={s.deviceId}>
                {s.label || `Динамики ${s.deviceId.slice(0, 8)}`}
              </option>
            ))}
          </select>
        ) : (
          <p className="text-xs text-muted-foreground">Не удалось получить список устройствъ</p>
        )}
      </div>

      {/* Master volume */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Volume2 className="w-4 h-4 text-primary" strokeWidth={2} />
          <span className="text-sm font-semibold text-foreground">Общая громкость</span>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={0}
            max={100}
            value={masterVolume}
            onChange={(e) => handleVolumeChange(Number(e.target.value))}
            className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer bg-muted [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer"
          />
          <span className="text-sm text-muted-foreground w-8 text-right">{masterVolume}%</span>
        </div>
      </div>
    </div>
  );
}
