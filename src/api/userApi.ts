import { pb, PB_URL } from "./pb";

export type User = {
  id: string;
  username: string;
  email: string;
  avatar_url?: string;
  banner?: string;
};

export const getUserById = async (id: string) => {
  const user = await pb.collection("users").getOne(id);
  return {
    ...user,
    avatar_url: user.avatar
      ? `${PB_URL}/api/files/${user.collectionId}/${user.id}/${user.avatar}`
      : undefined,
    banner: user.banner || undefined,
  };
};
