import { pb } from "./pb";

export interface Invite {
  id: string;
  server_id: string;
  created_by: string;
  code: string;
  expires_at: string | null;
  max_uses: number | null;
  use_count: number;
  created: string;
}

function generateCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function listInvites(serverId: string): Promise<Invite[]> {
  const result = await pb.collection("invitations").getFullList<Invite>({
    filter: `server_id = "${serverId}"`,
    sort: "-created",
  });
  return result;
}

export async function createInvite(data: {
  server_id: string;
  expires_at: string | null;
  max_uses: number | null;
}): Promise<Invite> {
  const record = await pb.collection("invitations").create({
    server_id: data.server_id,
    created_by: pb.authStore.record!.id,
    code: generateCode(),
    expires_at: data.expires_at,
    max_uses: data.max_uses,
    use_count: 0,
  });
  return record as unknown as Invite;
}

export async function deleteInvite(id: string): Promise<void> {
  await pb.collection("invitations").delete(id);
}

export async function getInviteByCode(code: string): Promise<Invite | null> {
  const result = await pb.collection("invitations").getList(1, 1, {
    filter: `code = "${code}"`,
  });
  return result.items.length > 0 ? (result.items[0] as unknown as Invite) : null;
}

export async function incrementInviteUse(id: string): Promise<void> {
  const invite = await pb.collection("invitations").getOne(id);
  await pb.collection("invitations").update(id, {
    use_count: (invite.use_count || 0) + 1,
  });
}
