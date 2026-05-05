import { pb, PB_URL } from "./pb";

export interface ServerRole {
  id: string;
  server_id: string;
  name: string;
  color: string;
  permissions: string[];
  created: string;
}

export interface RoleAssignment {
  id: string;
  server_id: string;
  user_id: string;
  role_id: string;
  expand?: {
    role_id?: ServerRole;
    user_id?: {
      id: string;
      username: string;
      avatar: string | null;
      collectionId: string;
    };
  };
}

export const PERMISSIONS = {
  MANAGE_CHANNELS: "manage_channels",
  MANAGE_INVITES: "manage_invites",
  MANAGE_ROLES: "manage_roles",
  DELETE_MESSAGES: "delete_messages",
  KICK_MEMBERS: "kick_members",
  MUTE_MEMBERS: "mute_members",
} as const;

export const DEFAULT_ROLES = [
  { name: "Администратор", color: "#e87a5d", permissions: Object.values(PERMISSIONS) },
  { name: "Модератор", color: "#67b8e3", permissions: [PERMISSIONS.DELETE_MESSAGES, PERMISSIONS.MUTE_MEMBERS] },
  { name: "Участник", color: "#9e9e9e", permissions: [] },
];

export async function listRoles(serverId: string): Promise<ServerRole[]> {
  return pb.collection("server_roles").getFullList<ServerRole>({
    filter: `server_id = "${serverId}"`,
  });
}

export async function createRole(serverId: string, data: { name: string; color: string; permissions: string[] }): Promise<ServerRole> {
  return pb.collection("server_roles").create<ServerRole>({
    server_id: serverId,
    ...data,
  });
}

export async function updateRole(roleId: string, data: { name?: string; color?: string; permissions?: string[] }): Promise<ServerRole> {
  return pb.collection("server_roles").update<ServerRole>(roleId, data);
}

export async function deleteRole(roleId: string): Promise<void> {
  await pb.collection("server_roles").delete(roleId);
}

export async function listAssignments(serverId: string): Promise<RoleAssignment[]> {
  return pb.collection("server_role_assignments").getFullList<RoleAssignment>({
    filter: `server_id = "${serverId}"`,
    expand: "role_id,user_id",
  });
}

export async function setUserRole(serverId: string, userId: string, roleId: string): Promise<void> {
  const existing = await pb.collection("server_role_assignments").getList(1, 1, {
    filter: `server_id = "${serverId}" && user_id = "${userId}"`,
  });
  if (existing.items.length > 0) {
    await pb.collection("server_role_assignments").update(existing.items[0].id, { role_id: roleId });
  } else {
    await pb.collection("server_role_assignments").create({ server_id: serverId, user_id: userId, role_id: roleId });
  }
}

export async function removeUserRole(serverId: string, userId: string): Promise<void> {
  const existing = await pb.collection("server_role_assignments").getList(1, 1, {
    filter: `server_id = "${serverId}" && user_id = "${userId}"`,
  });
  if (existing.items.length > 0) {
    await pb.collection("server_role_assignments").delete(existing.items[0].id);
  }
}

export async function getRoleMap(serverId: string): Promise<Record<string, { name: string; color: string }>> {
  const assignments = await pb.collection("server_role_assignments").getFullList<RoleAssignment>({
    filter: `server_id = "${serverId}"`,
    expand: "role_id",
  }, { $autoCancel: false });
  const map: Record<string, { name: string; color: string }> = {};
  for (const a of assignments) {
    const role = a.expand?.role_id;
    if (role) {
      map[a.user_id] = { name: role.name, color: role.color };
    }
  }
  return map;
}

export async function getUserPermissions(serverId: string, userId: string): Promise<string[]> {
  try {
    const assignments = await pb.collection("server_role_assignments").getFullList<RoleAssignment>({
      filter: `server_id = "${serverId}" && user_id = "${userId}"`,
      expand: "role_id",
    }, { $autoCancel: false });
    console.log("[getUserPermissions] assignments:", assignments.length, assignments);
    const perms = new Set<string>();
    for (const a of assignments) {
      const role = a.expand?.role_id;
      console.log("[getUserPermissions] role:", role?.name, role?.permissions);
      if (role?.permissions) {
        role.permissions.forEach((p) => perms.add(p));
      }
    }
    console.log("[getUserPermissions] result:", Array.from(perms));
    return Array.from(perms);
  } catch (e) {
    console.error("[getUserPermissions] error:", e);
    return [];
  }
}
