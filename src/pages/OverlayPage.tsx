import { useEffect, useState } from "react";
import { Mic, MicOff, Headphones, HeadphoneOff } from "lucide-react";
import { isTauri } from "@lib/tauri";

interface OverlayState {
  isMuted: boolean;
  isDeafened: boolean;
  speaking: string[];
}

export function OverlayPage() {
  const [state, setState] = useState<OverlayState>({
    isMuted: false,
    isDeafened: false,
    speaking: [],
  });

  useEffect(() => {
    if (!isTauri()) return;

    let unlisten: (() => void)[] = [];

    import("@tauri-apps/api/event").then(({ listen }) => {
      listen<OverlayState>("overlay-state", (event) => {
        setState(event.payload);
      }).then((fn) => unlisten.push(fn));
    });

    return () => {
      unlisten.forEach((fn) => fn());
    };
  }, []);

  return (
    <div className="fixed inset-0 flex items-end justify-center p-4 pointer-events-none select-none bg-transparent">
      <div className="flex items-center gap-3 bg-black/70 backdrop-blur-xl rounded-2xl px-5 py-3 border border-white/10 shadow-2xl">
        <div className="flex items-center gap-2">
          {state.isDeafened ? (
            <HeadphoneOff className="w-5 h-5 text-red-400" />
          ) : state.isMuted ? (
            <MicOff className="w-5 h-5 text-red-400" />
          ) : (
            <Mic className="w-5 h-5 text-green-400" />
          )}
          <span className="text-xs text-gray-400 font-mono">
            {state.isDeafened
              ? "ГЛУХЪ"
              : state.isMuted
                ? "БЕЗГЛАСЕНЪ"
                : "ГЛАСЕНЪ"}
          </span>
        </div>

        {state.speaking.length > 0 && (
          <div className="h-4 w-px bg-white/10" />
        )}

        {state.speaking.map((name) => (
          <div
            key={name}
            className="flex items-center gap-1.5"
          >
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-sm text-white font-medium">{name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
