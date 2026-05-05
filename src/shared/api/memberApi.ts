import { pb } from "./pb";

export interface ServerMember {
  id: string;
  server_id: string;
  user_id: string;
  role: string;
  created: string;
}

export async function addServerMember(serverId: string): Promise<void> {
  const existing = await pb.collection("server_members").getList(1, 1, {
    filter: `server_id = "${serverId}" && user_id = "${pb.authStore.record!.id}"`,
  }, { $autoCancel: false });
  if (existing.items.length > 0) return;
  await pb.collection("server_members").create({
    server_id: serverId,
    user_id: pb.authStore.record!.id,
    role: "member",
  });
}

export async function getMemberServerIds(): Promise<string[]> {
  const result = await pb.collection("server_members").getFullList<{ server_id: string }>({
    filter: `user_id = "${pb.authStore.record!.id}"`,
  });
  return result.map((m) => m.server_id);
}
