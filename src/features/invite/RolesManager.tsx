import { useState, useEffect } from "react";
import { Shield, Plus, Trash2, Pencil } from "lucide-react";
import { listRoles, createRole, updateRole, deleteRole, listAssignments, setUserRole, removeUserRole, type ServerRole, type RoleAssignment, PERMISSIONS } from "@shared/api/rolesApi";
import { pb, PB_URL } from "@shared/api/pb";
import { RoleForm } from "./RoleForm";

const PERMISSION_META: Record<string, { label: string; desc: string }> = {
  [PERMISSIONS.MANAGE_CHANNELS]: { label: "Управление каналами", desc: "Создание, переименование и удаление палат" },
  [PERMISSIONS.MANAGE_INVITES]: { label: "Управление приглашениями", desc: "Создание и удаление ссылок-приглашений" },
  [PERMISSIONS.MANAGE_ROLES]: { label: "Управление ролями", desc: "Изменение прав и назначение ролей" },
  [PERMISSIONS.DELETE_MESSAGES]: { label: "Удаление сообщений", desc: "Удаление грамотъ другихъ бояръ" },
  [PERMISSIONS.KICK_MEMBERS]: { label: "Изгнание участников", desc: "Изгнание бояръ изъ града" },
  [PERMISSIONS.MUTE_MEMBERS]: { label: "Заглушение участников", desc: "Отключение микрофона въ голосовыхъ палатахъ" },
};

export function RolesManager({ serverId }: { serverId: string }) {
  const [roles, setRoles] = useState<ServerRole[]>([]);
  const [assignments, setAssignments] = useState<RoleAssignment[]>([]);
  const [members, setMembers] = useState<{ id: string; username: string; avatarUrl: string | null }[]>([]);
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const load = async () => {
    const [r, a] = await Promise.all([listRoles(serverId), listAssignments(serverId)]);
    setRoles(r);
    setAssignments(a);
    const sm = await pb.collection("server_members").getFullList({ filter: `server_id = "${serverId}"`, expand: "user_id" });
    const seen = new Set<string>();
    const ms: { id: string; username: string; avatarUrl: string | null }[] = [];
    for (const entry of sm as any[]) {
      const u = entry.expand?.user_id;
      if (!u || seen.has(u.id)) continue;
      seen.add(u.id);
      ms.push({ id: u.id, username: u.username || u.email || "Пользователь", avatarUrl: u.avatar ? `${PB_URL}/api/files/${u.collectionId}/${u.id}/${u.avatar}` : null });
    }
    setMembers(ms);
  };

  useEffect(() => { load(); }, [serverId]);

  const userRoleId = (userId: string) => assignments.find((a) => a.user_id === userId)?.role_id || "";

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-foreground/50 uppercase tracking-wider font-semibold">{roles.length} ролей · {members.length} участников</p>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-foreground/5 hover:bg-foreground/10 text-foreground/60 hover:text-foreground text-sm transition-colors">
          <Plus className="w-3.5 h-3.5" strokeWidth={1.5} /> Создать
        </button>
      </div>

      {showCreate && <RoleForm onSave={async (d) => { await createRole(serverId, d); setShowCreate(false); load(); }} onCancel={() => setShowCreate(false)} />}

      {/* Roles list */}
      <div className="space-y-1">
        {roles.length === 0 ? (
          <p className="text-sm text-foreground/30 text-center py-6">Нетъ ролей</p>
        ) : (
          roles.map((role) => (
            <div key={role.id} className="rounded-xl overflow-hidden bg-foreground/[0.02]">
              {editingRoleId === role.id ? (
                <RoleForm initial={role} onSave={async (d) => { await updateRole(role.id, d); setEditingRoleId(null); load(); }} onCancel={() => setEditingRoleId(null)} />
              ) : (
                <div className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: role.color }} />
                      <span className="text-sm text-foreground/70 truncate">{role.name}</span>
                      <span className="text-[10px] text-foreground/30"> {role.permissions.length} прав</span>
                    </div>
                    <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setEditingRoleId(role.id)}
                        className="w-6 h-6 rounded-lg hover:bg-foreground/5 flex items-center justify-center text-foreground/30 hover:text-foreground/60 transition-colors">
                        <Pencil className="w-3 h-3" strokeWidth={1.5} />
                      </button>
                      <button onClick={async () => { await deleteRole(role.id); load(); }}
                        className="w-6 h-6 rounded-lg hover:bg-red-500/10 flex items-center justify-center text-foreground/30 hover:text-red-500/70 transition-colors">
                        <Trash2 className="w-3 h-3" strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Member assignments */}
      <div className="pt-2 relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-foreground/5" />
        <p className="text-xs text-foreground/30 uppercase tracking-wider mt-4 mb-2">Назначение ролей</p>
        <div className="space-y-0.5">
          {members.map((m) => {
            const role = roles.find((r) => r.id === userRoleId(m.id));
            return (
              <div key={m.id} className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-foreground/[0.02] transition-colors">
                <div className="w-7 h-7 rounded-full overflow-hidden bg-foreground/5 flex-shrink-0 flex items-center justify-center text-xs text-foreground/30">
                  {m.avatarUrl ? <img src={m.avatarUrl} alt="" className="w-full h-full object-cover" /> : m.username.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm text-foreground/60 flex-1 truncate">{m.username}</span>
                <select value={userRoleId(m.id)} onChange={(e) => { (e.target.value ? setUserRole(serverId, m.id, e.target.value) : removeUserRole(serverId, m.id)).then(load); }}
                  className="text-xs bg-foreground/5 rounded-lg px-2 py-1.5 text-foreground/60 outline-none focus:ring-1 focus:ring-foreground/20 min-w-[120px]"
                  style={role ? { color: role.color } : {}}>
                  <option value="">Без роли</option>
                  {roles.map((r) => <option key={r.id} value={r.id} style={{ color: r.color }}>{r.name}</option>)}
                </select>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
