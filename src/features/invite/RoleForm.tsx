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
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="h-2" style={{ backgroundColor: color }} />
      <div className="p-4 space-y-4">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Название роли, напр. Хранитель"
          className="w-full bg-input-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/50" autoFocus />

        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">Цветъ</p>
          <div className="flex gap-2">
            {COLORS.map((c) => (
              <button key={c.value} onClick={() => setColor(c.value)}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform ${color === c.value ? "scale-110 ring-2 ring-offset-2 ring-offset-background" : "hover:scale-105"}`}
                style={{ backgroundColor: c.value }} title={c.label}>
                {color === c.value && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">Права</p>
          <div className="space-y-1.5">
            {Object.entries(PERMISSION_META).map(([key, meta]) => (
              <button key={key} type="button" onClick={() => toggle(key)}
                className={`w-full text-left px-3 py-2.5 rounded-lg border transition-all ${perms.includes(key) ? "border-primary bg-primary/10" : "border-border bg-card/40 hover:bg-muted/30"}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-foreground">{meta.label}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{meta.desc}</div>
                  </div>
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${perms.includes(key) ? "bg-primary border-primary" : "border-muted-foreground/30"}`}>
                    {perms.includes(key) && <Check className="w-3 h-3 text-primary-foreground" strokeWidth={3} />}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          <button onClick={onCancel} className="flex-1 px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 text-foreground text-sm font-medium transition-colors">Отмена</button>
          <button onClick={() => name.trim() && onSave({ name: name.trim(), color, permissions: perms })}
            className="flex-1 px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium transition-colors disabled:opacity-50"
            disabled={!name.trim()}>{initial ? "Сохранить" : "Создать"}</button>
        </div>
      </div>
    </div>
  );
}
