import { pb, PB_URL } from "./pb";

export interface Server {
  id: string;
  name: string;
  owner_id: string;
  is_private: boolean;
  avatar?: string;
  avatar_url?: string | null;
}

export interface ListServersResponse {
  servers: Server[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeServer(record: any): Server {
  return {
    id: record.id,
    name: record.name,
    owner_id: record.owner_id,
    is_private: record.is_private || false,
    avatar: record.avatar || undefined,
    avatar_url: record.avatar
      ? `${PB_URL}/api/files/${record.collectionId}/${record.id}/${record.avatar}`
      : null,
  };
}

export async function listServers(userId: string): Promise<Server[]> {
  // Owned servers
  const ownedRaw = await pb.collection("servers").getFullList({
    filter: `owner_id = "${userId}"`,
  });
  const owned = ownedRaw.map(normalizeServer);

  // Member servers — get from server_members
  const memberIds = (await pb.collection("server_members").getFullList<{ server_id: string }>({
    filter: `user_id = "${userId}"`,
  })).map((m) => m.server_id);

  if (memberIds.length === 0) return owned;

  const memberRaw = await pb.collection("servers").getFullList({
    filter: memberIds.map((id: string) => `id = "${id}"`).join(" || "),
  });
  const memberServers = memberRaw.map(normalizeServer);

  // Merge, deduplicate by id
  const seen = new Set(owned.map((s) => s.id));
  return [...owned, ...memberServers.filter((s) => !seen.has(s.id))];
}

export interface Channel {
  id: string;
  name: string;
  server_id: string;
  type: string;
  is_locked?: boolean;
}

export interface ListChannelsResponse {
  channels: Channel[];
}

export async function listChannels(serverId: string): Promise<Channel[]> {
  // Получить все каналы, где server_id = serverId
  const result = await pb.collection("channels").getFullList<Channel>({
    filter: `server_id = "${serverId}"`,
  });
  return result;
}
