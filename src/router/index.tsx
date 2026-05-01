import { createBrowserRouter, Suspense } from "react-router";
import { LoginPage, RegisterPage, ServerPage, AppPage } from "@pages/index";
import { AuthLayout } from "@components/layout/AuthLayout";
import { AppLayout } from "@components/layout/AppLayout";
import { ProtectedRoute } from "./ProtectedRoute";
import { AppRoutes } from "./routes";
import { OverlayPage } from "@pages/OverlayPage";
import { lazy } from "react";
import { Loader2 } from "lucide-react";

const Settings = lazy(() => import("@pages/Settings").then((m) => ({ default: m.Settings })));
const ServerSettingsPage = lazy(() => import("@pages/ServerSettingsPage").then((m) => ({ default: m.ServerSettingsPage })));
const VoiceChat = lazy(() => import("@components/voice/VoiceChat").then((m) => ({ default: m.VoiceChat })));
const InvitePage = lazy(() => import("@pages/InvitePage").then((m) => ({ default: m.InvitePage })));

function Lazy({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<div className="flex-1 flex items-center justify-center bg-background"><Loader2 className="w-6 h-6 animate-spin text-primary/50" /></div>}>{children}</Suspense>;
}

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
          { path: AppRoutes.SERVER_SETTINGS, element: <Lazy><ServerSettingsPage /></Lazy> },
          { path: AppRoutes.TEXT_CHANNEL, element: <ServerPage /> },
          { path: AppRoutes.VOICE_CHAT, element: <Lazy><VoiceChat /></Lazy> },
          { path: AppRoutes.SETTINGS, element: <Lazy><Settings /></Lazy> },
        ],
      },
    ],
  },
  {
    path: "/join/:code",
    element: <ProtectedRoute />,
    children: [
      { path: "", element: <Lazy><InvitePage /></Lazy> },
    ],
  },
]);
