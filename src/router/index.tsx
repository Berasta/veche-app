import { createBrowserRouter } from "react-router";
import { LoginPage, RegisterPage, ServerPage, AppPage } from "@pages/index";
import { AuthLayout } from "@components/layout/AuthLayout";
import { AppLayout } from "@components/layout/AppLayout";
import { ProtectedRoute } from "./ProtectedRoute";
import { AppRoutes } from "./routes";
import { Settings } from "@pages/Settings";
import { ServerSettingsPage } from "@pages/ServerSettingsPage";
import { VoiceChat } from "@components/voice/VoiceChat";
import { InvitePage } from "@pages/InvitePage";
import { OverlayPage } from "@pages/OverlayPage";

export const router = createBrowserRouter([
  {
    path: AppRoutes.OVERLAY,
    element: <OverlayPage />,
  },
  {
    path: AppRoutes.AUTH,
    element: <AuthLayout />,
    children: [
      {
        path: AppRoutes.LOGIN.replace(AppRoutes.AUTH + "/", ""),
        element: <LoginPage />,
      },
      {
        path: AppRoutes.REGISTER.replace(AppRoutes.AUTH + "/", ""),
        element: <RegisterPage />,
      },
    ],
  },
  {
    path: "",
    element: <ProtectedRoute />,
    children: [
      {
        path: AppRoutes.APP,
        element: <AppLayout />,
        children: [
          { path: "", element: <AppPage /> },
          { path: AppRoutes.SERVER, element: <ServerPage /> },
          { path: AppRoutes.SERVER_SETTINGS, element: <ServerSettingsPage /> },
          { path: AppRoutes.TEXT_CHANNEL, element: <ServerPage /> },
          { path: AppRoutes.VOICE_CHAT, element: <VoiceChat /> },
          { path: AppRoutes.SETTINGS, element: <Settings /> },
        ],
      },
    ],
  },
  {
    path: "/join/:code",
    element: <ProtectedRoute />,
    children: [
      { path: "", element: <InvitePage /> },
    ],
  },
]);
