export enum AppRoutes {
  AUTH = "/auth",
  LOGIN = "/auth/login",
  REGISTER = "/auth/register",

  APP = "/app",
  SERVER = "/app/server/:serverId",
  VOICE_CHAT = "/app/server/:serverId/voice/:channelId",
  SERVER_SETTINGS = "/app/server/:serverId/settings",

  SETTINGS = "/app/settings",
  TEXT_CHANNEL = "/app/server/:serverId/text/:channelId",
  ONBOARDING = "/app/onboarding",

  OVERLAY = "/overlay",
}
