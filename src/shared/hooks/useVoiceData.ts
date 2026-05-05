import { toast } from "sonner";
import { useState, useEffect } from "react";
import { getUserById } from "@api/userApi";
import { getRoleMap } from "@api/rolesApi";
import { pb } from "@api/pb";

export function useVoiceData(serverId?: string, participantIds?: string[]) {
  const [userDataMap, setUserDataMap] = useState<Record<string, { username: string; avatarUrl?: string; banner?: string }>>({});
  const [roleMap, setRoleMap] = useState<Record<string, { name: string; color: string }>>({});
  const [joinedAtMap, setJoinedAtMap] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!participantIds || participantIds.length === 0) return;
    const missing = participantIds.filter((id) => !userDataMap[id]);
    if (missing.length === 0) return;
    let cancelled = false;
    Promise.all(missing.map(async (id) => {
      try {
        const user = await getUserById(id);
        return { id, data: { username: user.username, avatarUrl: user.avatar_url, banner: user.banner } };
      } catch (err) {
        console.error("Ошибка загрузки пользователя голосовой палаты", err);
        return { id, data: { username: id, avatarUrl: undefined, banner: undefined } };
      }
    })).then((results) => {
      if (cancelled) return;
      setUserDataMap((prev) => {
        const next = { ...prev };
        results.forEach((r) => { next[r.id] = r.data; });
        return next;
      });
    });
    return () => { cancelled = true; };
  }, [participantIds]);

  useEffect(() => {
    if (!serverId) return;
    Promise.all([
      getRoleMap(serverId),
      pb.collection("server_members").getFullList({ filter: `server_id = "${serverId}"` }, { $autoCancel: false }),
    ]).then(([roles, members]) => {
      setRoleMap(roles);
      const map: Record<string, string> = {};
      (members as any[]).forEach((entry: any) => { map[entry.user_id] = entry.created; });
      setJoinedAtMap(map);
    }).catch((err) => {
      console.error("Ошибка загрузки голосовых данных", err);
      toast.error("Не удалось загрузить данные голосовой палаты");
    });
  }, [serverId]);

  return { userDataMap, roleMap, joinedAtMap };
}
