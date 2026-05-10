import { useEffect, useState } from "react";
import { Monitor, CheckCircle2, Loader2 } from "lucide-react";
import { getScreenSources, type ScreenSource } from "@shared/lib/screenSources";
import { isTauri } from "@shared/lib/tauri";

interface Props {
  selectedIndex: number | null;
  onSelect: (source: ScreenSource) => void;
  onSourcesLoaded?: (sources: ScreenSource[]) => void;
}

export function ScreenSourcePicker({ selectedIndex, onSelect, onSourcesLoaded }: Props) {
  const [sources, setSources] = useState<ScreenSource[] | null>(null);

  useEffect(() => {
    if (!isTauri()) {
      setSources([]);
      onSourcesLoaded?.([]);
      return;
    }
    getScreenSources().then((s) => {
      setSources(s);
      onSourcesLoaded?.(s);
    });
  // onSourcesLoaded intentionally omitted — stable reference expected from caller
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Still loading
  if (sources === null) {
    return (
      <div className="flex items-center gap-2 text-xs text-foreground/30 py-2">
        <Loader2 className="w-3 h-3 animate-spin" />
        <span>Загружаю экраны...</span>
      </div>
    );
  }

  // No sources (non-Tauri or single-monitor already auto-selected elsewhere)
  if (sources.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-foreground/40 uppercase tracking-wider">
        Выберите экранъ
      </p>
      <div className={`grid gap-2 ${sources.length > 1 ? "grid-cols-2" : "grid-cols-1 max-w-[50%]"}`}>
        {sources.map((source) => {
          const isSelected = selectedIndex === source.index;
          return (
            <button
              key={source.index}
              onClick={() => onSelect(source)}
              className={`relative rounded-lg border overflow-hidden text-left transition-all ${
                isSelected
                  ? "border-primary ring-1 ring-primary/50"
                  : "border-border hover:border-foreground/20"
              }`}
            >
              {/* Thumbnail placeholder (thumbnails via Rust command TBD) */}
              <div className="w-full aspect-video bg-foreground/[0.03] flex items-center justify-center">
                <Monitor
                  className={`w-8 h-8 ${isSelected ? "text-primary/40" : "text-foreground/15"}`}
                  strokeWidth={1}
                />
              </div>
              {/* Label */}
              <div className="px-2 py-1.5">
                <p className="text-xs text-foreground/50 truncate">{source.name}</p>
              </div>
              {/* Selected indicator */}
              {isSelected && (
                <div className="absolute top-1.5 right-1.5">
                  <CheckCircle2
                    className="w-4 h-4 text-primary"
                    strokeWidth={2}
                  />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
