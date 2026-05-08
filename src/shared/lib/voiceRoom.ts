import type { Room } from "livekit-client";

type RoomListener = (room: Room | null) => void;

const _listeners = new Set<RoomListener>();
let _activeRoom: Room | null = null;

export function setActiveRoom(room: Room | null): void {
  _activeRoom = room;
  _listeners.forEach((l) => l(room));
}

export function getActiveRoom(): Room | null {
  return _activeRoom;
}

export function subscribeRoom(listener: RoomListener): () => void {
  _listeners.add(listener);
  return () => {
    _listeners.delete(listener);
  };
}
