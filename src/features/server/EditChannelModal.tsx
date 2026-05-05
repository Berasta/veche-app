import { Portal } from "@shared/ui/Portal";

interface Props {
  name: string;
  onChange: (name: string) => void;
  onSave: () => void;
  onClose: () => void;
}

export function EditChannelModal({ name, onChange, onSave, onClose }: Props) {
  return (
    <Portal>
      <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-background/80 backdrop-blur-xl rounded-2xl w-full max-w-sm overflow-hidden" onClick={(e) => e.stopPropagation()}>
          <div className="p-5 space-y-4">
            <h4 className="text-sm font-medium text-foreground/80">Переименовати палату</h4>
            <input autoFocus value={name} onChange={(e) => onChange(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") onSave(); if (e.key === "Escape") onClose(); }}
              className="w-full bg-foreground/5 rounded-xl px-3 py-2.5 text-sm text-foreground outline-none focus:ring-1 focus:ring-foreground/20" />
            <div className="flex items-center justify-end gap-2">
              <button onClick={onClose} className="px-4 py-2 rounded-xl bg-foreground/5 hover:bg-foreground/10 text-foreground/60 hover:text-foreground text-sm transition-colors">Отмѣна</button>
              <button onClick={onSave} disabled={!name.trim()} className="px-4 py-2 rounded-xl bg-foreground/10 hover:bg-foreground/15 text-foreground/80 text-sm transition-colors disabled:opacity-30">Сохранити</button>
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
}
