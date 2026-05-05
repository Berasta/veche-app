import { pb } from "@shared/api/pb";
import { fetchCurrentUser } from "./authSlice";

export type ShopItemType = "banner" | "frame";

export interface ShopItem {
  id: string;
  name: string;
  type: ShopItemType;
}

export async function applyShopItem(userId: string, itemId: string, itemType: ShopItemType) {
  const update: Record<string, string> = {};
  if (itemType === "frame") {
    update.avatar_frame = itemId;
  } else if (itemType === "banner") {
    update.banner_skin = itemId;
  }
  await pb.collection("users").update(userId, update);
}

export async function removeShopItem(userId: string, itemType: ShopItemType) {
  const update: Record<string, string | null> = {};
  if (itemType === "frame") {
    update.avatar_frame = null;
  } else if (itemType === "banner") {
    update.banner_skin = null;
  }
  await pb.collection("users").update(userId, update);
}
