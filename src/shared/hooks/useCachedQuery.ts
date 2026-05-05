import { useQuery } from "@tanstack/react-query";
import { pb } from "@shared/api/pb";

type QueryFn<T> = () => Promise<T>;

export function useCachedQuery<T>(key: string[], fn: QueryFn<T>, staleTime = 30_000) {
  return useQuery({
    queryKey: key,
    queryFn: fn,
    staleTime,
    retry: 1,
  });
}

export function useChannels(serverId?: string) {
  return useCachedQuery(
    ["channels", serverId || ""],
    async () => {
      if (!serverId) return [];
      return pb.collection("channels").getFullList({
        filter: `server_id = "${serverId}"`,
      });
    },
    30_000,
  );
}

export function useServers(userId?: string) {
  return useCachedQuery(
    ["servers", userId || ""],
    async () => {
      if (!userId) return [];
      return pb.collection("servers").getFullList({
        filter: `owner_id = "${userId}"`,
      });
    },
    60_000,
  );
}
