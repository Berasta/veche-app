import { pb } from "@shared/api/pb";

export type ShopItemType = "banner" | "frame" | "accessory";

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
  } else if (itemType === "accessory") {
    update.avatar_accessory = itemId;
  }
  await pb.collection("users").update(userId, update);
}

export async function removeShopItem(userId: string, itemType: ShopItemType) {
  const update: Record<string, string | null> = {};
  if (itemType === "frame") {
    update.avatar_frame = null;
  } else if (itemType === "banner") {
    update.banner_skin = null;
  } else if (itemType === "accessory") {
    update.avatar_accessory = null;
  }
  await pb.collection("users").update(userId, update);
}
