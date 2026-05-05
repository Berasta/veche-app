import { Portal } from "@components/ui/Portal";

interface Props {
  type: "text" | "voice";
  value: string;
  onChange: (v: string) => void;
  onSave: () => void;
  onClose: () => void;
}

export function CreateChannelModal({ type, value, onChange, onSave, onClose }: Props) {
  return (
    <Portal>
      <div className="fixed inset-0 z-[70] bg-black/50 flex items-start justify-center pt-[15vh]" onClick={onClose}>
        <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
          <div className="px-5 py-4 border-b border-border">
            <h4 className="text-sm font-semibold text-foreground">
              Создати {type === "text" ? "текстовую" : "голосовую"} палату
            </h4>
          </div>
          <div className="p-5">
            <input
              autoFocus
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") onSave(); if (e.key === "Escape") onClose(); }}
              placeholder={type === "text" ? "общая-бесѣда" : "Общiй гласъ"}
              className="w-full bg-input-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div className="px-5 py-4 border-t border-border flex items-center justify-end gap-2">
            <button onClick={onClose} className="px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 text-foreground text-sm font-medium transition-colors">Отмѣна</button>
            <button onClick={onSave} disabled={!value.trim()} className="px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium transition-colors disabled:opacity-50">Создати</button>
          </div>
        </div>
      </div>
    </Portal>
  );
}
