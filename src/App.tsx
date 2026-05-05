import { Toaster } from "sonner";
import { useAppDispatch } from "@app/hooks";
import { fetchCurrentUser } from "@entities/user/model/authSlice";
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
      <Toaster
        position="top-center"
        closeButton
        toastOptions={{
          style: {
            background: "rgba(255,255,255,0.03)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(255,255,255,0.05)",
            color: "rgba(255,255,255,0.7)",
            borderRadius: "12px",
            fontSize: "13px",
            fontFamily: "inherit",
            boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
          },
          success: {
            style: { borderColor: "rgba(34,197,94,0.2)" },
            icon: undefined,
          },
          error: {
            style: { borderColor: "rgba(239,68,68,0.2)" },
          },
        }}
        icons={{ success: undefined, error: undefined, info: undefined, warning: undefined }}
      />
      <RouterProvider router={router} />
    </>
  );
};
