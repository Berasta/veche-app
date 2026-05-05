import { useSelector } from "react-redux";
import { RootState } from "..";

export function useAuth() {
  const { user, token, loading, error } = useSelector(
    (state: RootState) => state.auth,
  );

  const isAuthenticated = Boolean(user);

  return { user, token, loading, error, isAuthenticated };
}
