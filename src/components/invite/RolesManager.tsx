import { useState, useEffect } from "react";
import { Shield, Plus, Trash2, Pencil } from "lucide-react";
import { listRoles, createRole, updateRole, deleteRole, listAssignments, setUserRole, removeUserRole, type ServerRole, type RoleAssignment, PERMISSIONS } from "@api/rolesApi";
import { pb, PB_URL } from "@api/pb";
import { RoleForm } from "./RoleForm";

const PERMISSION_META: Record<string, { label: string; desc: string }> = {
  [PERMISSIONS.MANAGE_CHANNELS]: { label: "Управление каналами", desc: "Создание, переименование и удаление палат" },
  [PERMISSIONS.MANAGE_INVITES]: { label: "Управление приглашениями", desc: "Создание и удаление ссылок-приглашений" },
  [PERMISSIONS.MANAGE_ROLES]: { label: "Управление ролями", desc: "Изменение прав и назначение ролей" },
  [PERMISSIONS.DELETE_MESSAGES]: { label: "Удаление сообщений", desc: "Удаление грамотъ другихъ бояръ" },
  [PERMISSIONS.KICK_MEMBERS]: { label: "Изгнание участников", desc: "Изгнание бояръ изъ града" },
  [PERMISSIONS.MUTE_MEMBERS]: { label: "Заглушение участников", desc: "Отключение микрофона въ голосовыхъ палатахъ" },
};

export function RolesManager({ serverId }: RolesManagerProps) {
  const [roles, setRoles] = useState<ServerRole[]>([]);
  const [assignments, setAssignments] = useState<RoleAssignment[]>([]);
  const [members, setMembers] = useState<{ id: string; username: string; avatarUrl: string | null }[]>([]);
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const load = async () => {
    const [r, a] = await Promise.all([listRoles(serverId), listAssignments(serverId)]);
    setRoles(r);
    setAssignments(a);
    const sm = await pb.collection("server_members").getFullList({
      filter: `server_id = "${serverId}"`,
      expand: "user_id",
    });
    const seen = new Set<string>();
    const ms: { id: string; username: string; avatarUrl: string | null }[] = [];
    for (const entry of sm as any[]) {
      const u = entry.expand?.user_id;
      if (!u || seen.has(u.id)) continue;
      seen.add(u.id);
      ms.push({
        id: u.id,
        username: u.username || u.email || "Пользователь",
        avatarUrl: u.avatar ? `${PB_URL}/api/files/${u.collectionId}/${u.id}/${u.avatar}` : null,
      });
    }
    setMembers(ms);
  };

  useEffect(() => { load(); }, [serverId]);

  const handleCreate = async (data: { name: string; color: string; permissions: string[] }) => {
    await createRole(serverId, data);
    setShowCreate(false);
    load();
  };

  const handleUpdate = async (id: string, data: { name: string; color: string; permissions: string[] }) => {
    await updateRole(id, data);
    setEditingRoleId(null);
    load();
  };

  const handleDelete = async (id: string) => {
    await deleteRole(id);
    load();
  };

  const userRoleId = (userId: string) => assignments.find((a) => a.user_id === userId)?.role_id || "";
  const userRoleName = (userId: string) => {
    const rid = userRoleId(userId);
    return roles.find((r) => r.id === rid);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" strokeWidth={2} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">Роли града</h3>
            <p className="text-xs text-muted-foreground">{roles.length} ролей · {members.length} участников</p>
          </div>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" strokeWidth={2} />
          <span>Создать</span>
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <RoleForm onSave={handleCreate} onCancel={() => setShowCreate(false)} />
      )}

      {/* Roles list */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Роли</p>
        {roles.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">Нет ролей. Создайте первую!</p>
        ) : (
          roles.map((role) => (
            <div key={role.id} className="bg-card/40 border border-border rounded-lg overflow-hidden">
              {editingRoleId === role.id ? (
                <RoleForm
                  initial={role}
                  onSave={(data) => handleUpdate(role.id, data)}
                  onCancel={() => setEditingRoleId(null)}
                />
              ) : (
                <div className="p-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-3.5 h-3.5 rounded-full flex-shrink-0" style={{ backgroundColor: role.color }} />
                      <span className="text-sm font-medium text-foreground truncate">{role.name}</span>
                      {role.permissions.length > 0 ? (
                        <span className="text-[10px] text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">
                          {role.permissions.length} прав
                        </span>
                      ) : (
                        <span className="text-[10px] text-muted-foreground/50 px-1.5 py-0.5">нет прав</span>
                      )}
                    </div>
                    <div className="flex gap-0.5 flex-shrink-0">
                      <button onClick={() => setEditingRoleId(role.id)} className="w-7 h-7 rounded-md hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                        <Pencil className="w-3.5 h-3.5" strokeWidth={2} />
                      </button>
                      <button onClick={() => handleDelete(role.id)} className="w-7 h-7 rounded-md hover:bg-destructive/20 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="w-3.5 h-3.5" strokeWidth={2} />
                      </button>
                    </div>
                  </div>
                  {role.permissions.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {role.permissions.map((p) => (
                        <span key={p} className="text-[10px] text-muted-foreground bg-muted/30 px-1.5 py-0.5 rounded">
                          {PERMISSION_META[p]?.label || p}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Member assignments */}
      <div className="pt-2 border-t border-border">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Назначение ролей</p>
        <div className="space-y-1">
          {members.map((m) => {
            const role = userRoleName(m.id);
            return (
              <div key={m.id} className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-muted/20 transition-colors">
                <div className="w-7 h-7 rounded-full overflow-hidden bg-muted flex-shrink-0">
                  {m.avatarUrl ? (
                    <img src={m.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs font-bold text-muted-foreground">
                      {m.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <span className="text-sm text-foreground flex-1 truncate">{m.username}</span>
                <select
                  value={userRoleId(m.id)}
                  onChange={(e) => {
                    const v = e.target.value;
                    (v ? setUserRole(serverId, m.id, v) : removeUserRole(serverId, m.id)).then(load);
                  }}
                  className="text-xs bg-input-background border border-border rounded-lg px-2 py-1.5 text-foreground outline-none focus:ring-2 focus:ring-primary/50 min-w-[130px]"
                  style={role ? { borderColor: role.color, color: role.color } : {}}
                >
                  <option value="">Без роли</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id} style={{ color: r.color }}>{r.name}</option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
