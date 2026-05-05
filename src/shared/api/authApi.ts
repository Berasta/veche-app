import { pb, PB_URL } from "./pb";

// Регистрация пользователя через PocketBase SDK
export async function pbRegisterUser({
  email,
  password,
  username,
}: RegisterInput) {
  return pb
    .collection("users")
    .create({ email, password, passwordConfirm: password, username });
}

// Авторизация пользователя через PocketBase SDK
export async function pbLoginUser({ email, password }: LoginInput) {
  return pb.collection("users").authWithPassword(email, password);
}

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  avatar_url?: string;
  banner?: string;
  created_at?: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface AuthMeResponse {
  user: AuthUser;
}

export interface RegisterInput {
  username: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export async function registerUser(
  input: RegisterInput,
): Promise<AuthResponse> {
  const record = await pbRegisterUser(input);
  // После регистрации сразу логиним пользователя
  const authData = await pbLoginUser({
    email: input.email,
    password: input.password,
  });
  return {
    token: authData.token,
    user: {
      id: record.id,
      username: record.username,
      email: record.email,
      avatar_url: record.avatar
        ? `${PB_URL}/api/files/${record.collectionId}/${record.id}/${record.avatar}`
        : undefined,
      banner: record.banner || undefined,
      created_at: record.created,
    },
  };
}

export async function loginUser(input: LoginInput): Promise<AuthResponse> {
  const authData = await pbLoginUser(input);
  const user = authData.record;
  pb.authStore.save(authData.token, user);

  return {
    token: authData.token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      avatar_url: user.avatar
        ? `${PB_URL}/api/files/${user.collectionId}/${user.id}/${user.avatar}`
        : undefined,
      banner: user.banner || undefined,
      created_at: user.created,
    },
  };
}

export async function getCurrentUser(): Promise<AuthMeResponse> {
  await pb.collection("users").authRefresh();
  const user = pb.authStore.record;
  if (!user) throw new Error("Not authenticated");
  return {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      avatar_url: user.avatar
        ? `${PB_URL}/api/files/${user.collectionId}/${user.id}/${user.avatar}`
        : undefined,
      banner: user.banner || undefined,
      created_at: user.created,
    },
  };
}
