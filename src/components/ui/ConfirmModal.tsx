import { ReactNode } from "react";
import { Portal } from "./Portal";

interface Props {
  title: string;
  children: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: "primary" | "destructive";
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({ title, children, confirmLabel = "Подтвердити", cancelLabel = "Отмѣна", confirmVariant = "primary", onConfirm, onCancel }: Props) {
  return (
    <Portal>
      <div className="fixed inset-0 z-[70] bg-black/50 flex items-center justify-center" onClick={onCancel}>
        <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
          <div className="px-5 py-4 border-b border-border">
            <h4 className="text-sm font-semibold text-foreground">{title}</h4>
          </div>
          <div className="px-5 py-4">{children}</div>
          <div className="px-5 py-4 border-t border-border flex items-center justify-end gap-2">
            <button onClick={onCancel} className="px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 text-foreground text-sm font-medium transition-colors">{cancelLabel}</button>
            <button onClick={onConfirm} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              confirmVariant === "destructive"
                ? "bg-destructive hover:bg-destructive/80 text-destructive-foreground"
                : "bg-primary hover:bg-primary/90 text-primary-foreground"
            }`}>{confirmLabel}</button>
          </div>
        </div>
      </div>
    </Portal>
  );
}
