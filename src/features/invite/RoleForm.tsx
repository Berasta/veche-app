import { useState } from "react";
import { Check } from "lucide-react";
import { PERMISSIONS, type ServerRole } from "@shared/api/rolesApi";

const PERMISSION_META: Record<string, { label: string; desc: string }> = {
  [PERMISSIONS.MANAGE_CHANNELS]: { label: "Управление каналами", desc: "Создание, переименование и удаление палат" },
  [PERMISSIONS.MANAGE_INVITES]: { label: "Управление приглашениями", desc: "Создание и удаление ссылок-приглашений" },
  [PERMISSIONS.MANAGE_ROLES]: { label: "Управление ролями", desc: "Изменение прав и назначение ролей" },
  [PERMISSIONS.DELETE_MESSAGES]: { label: "Удаление сообщений", desc: "Удаление грамотъ другихъ бояръ" },
  [PERMISSIONS.KICK_MEMBERS]: { label: "Изгнание участников", desc: "Изгнание бояръ изъ града" },
  [PERMISSIONS.MUTE_MEMBERS]: { label: "Заглушение участников", desc: "Отключение микрофона въ голосовыхъ палатахъ" },
};

const COLORS = [
  { value: "#e87a5d", label: "Рдяный" },
  { value: "#67b8e3", label: "Лазурный" },
  { value: "#7cb342", label: "Зелёный" },
  { value: "#e8a020", label: "Златой" },
  { value: "#c0392b", label: "Червлёный" },
  { value: "#a07dd6", label: "Фиолетовый" },
  { value: "#9e9e9e", label: "Серый" },
  { value: "#b84a6a", label: "Вишнёвый" },
];

interface Props {
  initial?: ServerRole;
  onSave: (data: { name: string; color: string; permissions: string[] }) => void;
  onCancel: () => void;
}

export function RoleForm({ initial, onSave, onCancel }: Props) {
  const [name, setName] = useState(initial?.name || "");
  const [color, setColor] = useState(initial?.color || COLORS[0].value);
  const [perms, setPerms] = useState<string[]>(initial?.permissions || []);
  const toggle = (p: string) => setPerms((prev) => prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]);

  return (
    <div className="rounded-xl overflow-hidden bg-foreground/[0.02] p-4 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Названіе роли"
          className="flex-1 bg-foreground/5 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-foreground/20 outline-none focus:ring-1 focus:ring-foreground/20" autoFocus />
      </div>

      <div>
        <p className="text-[11px] text-foreground/50 mb-2">Цвѣтъ</p>
        <div className="flex gap-1.5">
          {COLORS.map((c) => (
            <button key={c.value} onClick={() => setColor(c.value)}
              className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${color === c.value ? "scale-110 ring-1 ring-foreground/30 ring-offset-2 ring-offset-background" : "hover:scale-105 opacity-60 hover:opacity-100"}`}
              style={{ backgroundColor: c.value }} title={c.label}>
              {color === c.value && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-[11px] text-foreground/50 mb-2">Права</p>
        <div className="space-y-1">
          {Object.entries(PERMISSION_META).map(([key, meta]) => (
            <button key={key} type="button" onClick={() => toggle(key)}
              className={`w-full text-left px-3 py-2 rounded-lg transition-all ${perms.includes(key) ? "bg-foreground/[0.06]" : "hover:bg-foreground/[0.02]"}`}>
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm text-foreground/70">{meta.label}</div>
                  <div className="text-[11px] text-foreground/30">{meta.desc}</div>
                </div>
                <div className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${perms.includes(key) ? "bg-foreground/30 border-foreground/30" : "border-foreground/10"}`}>
                  {perms.includes(key) && <Check className="w-2.5 h-2.5 text-background" strokeWidth={3} />}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <button onClick={onCancel} className="flex-1 px-4 py-2 rounded-xl bg-foreground/5 hover:bg-foreground/10 text-foreground/60 hover:text-foreground text-sm transition-colors">Отмѣна</button>
        <button onClick={() => name.trim() && onSave({ name: name.trim(), color, permissions: perms })}
          className="flex-1 px-4 py-2 rounded-xl bg-foreground/10 hover:bg-foreground/15 text-foreground/80 text-sm transition-colors disabled:opacity-30"
          disabled={!name.trim()}>{initial ? "Сохранити" : "Создати"}</button>
      </div>
    </div>
  );
}
