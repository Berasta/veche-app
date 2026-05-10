import { pb } from "./pb";

export type User = {
  id: string;
  username: string;
  email: string;
  avatar_url?: string;
  banner?: string;
  avatar_frame?: string;
  bio?: string;
};

export const getUserById = async (id: string) => {
  const user = await pb.collection("users").getOne(id);
  return {
    ...user,
    avatar_url: user.avatar ? pb.files?.getUrl(user, user.avatar) : undefined,
    banner: user.banner || undefined,
    avatar_frame: user.avatar_frame || undefined,
    bio: user.bio || undefined,
  };
};
