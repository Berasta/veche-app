import { useState, useEffect, useCallback } from "react";
import { getUserPermissions, PERMISSIONS } from "@shared/api/rolesApi";
import { useAuth } from "@entities/user/useAuth";

export function usePermissions(serverId?: string) {
  const { user } = useAuth();
  const [perms, setPerms] = useState<string[]>([]);

  useEffect(() => {
    if (!serverId || !user?.id) { setPerms([]); return; }
    let cancelled = false;
    getUserPermissions(serverId, user.id).then((p) => {
      if (!cancelled) setPerms(p);
    }).catch(() => { if (!cancelled) setPerms([]); });
    return () => { cancelled = true; };
  }, [serverId, user?.id]);

  const can = useCallback((permission: string) => {
    return perms.includes(permission);
  }, [perms]);

  return { can, perms };
}
