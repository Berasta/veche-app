import { Toaster } from "sonner";
import { useAppDispatch } from "@app/hooks";
import { fetchCurrentUser } from "@entities/user/authSlice";
import { useEffect } from "react";
import { RouterProvider } from "react-router";
import { router } from "./router";

export const App = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        await dispatch(fetchCurrentUser());
      } catch (error) {
        console.error("Failed to fetch current user:", error);
      }
    };

    fetchUser();
  }, []);

  return (
    <>
      <Toaster position="top-center" richColors closeButton />
      <RouterProvider router={router} />
    </>
  );
};
