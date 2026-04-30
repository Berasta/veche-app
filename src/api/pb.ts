import PocketBase from "pocketbase";

export const PB_URL = import.meta.env.VITE_PB_URL || "http://localhost:8090";
export const pb = new PocketBase(PB_URL);
