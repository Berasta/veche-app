import { Room, RoomEvent, RemoteParticipant } from "livekit-client";

type ScreenShareMsg =
  | { type: "SS_QUERY" }
  | { type: "SS_ANNOUNCE" }
  | { type: "SS_STOP" }
  | { type: "SS_REQUEST" }
  | { type: "SS_OFFER"; sdp: string }
  | { type: "SS_ANSWER"; sdp: string }
  | { type: "SS_ICE"; candidate: RTCIceCandidateInit | null };

const ICE_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
    { urls: "stun:stun3.l.google.com:19302" },
  ],
  iceCandidatePoolSize: 4,
};

export type ScreenShareQuality = "1fps" | "5fps" | "10fps" | "15fps" | "24fps" | "30fps" | "60fps" | "120fps" | "144fps";

// FPS presets
const QUALITY_PRESETS: Record<ScreenShareQuality, { idealFps: number; maxFps: number; label: string }> = {
  "1fps":   { idealFps: 1,   maxFps: 1,   label: "1 FPS" },
  "5fps":   { idealFps: 5,   maxFps: 5,   label: "5 FPS" },
  "10fps":  { idealFps: 10,  maxFps: 10,  label: "10 FPS" },
  "15fps":  { idealFps: 15,  maxFps: 15,  label: "15 FPS" },
  "24fps":  { idealFps: 24,  maxFps: 24,  label: "24 FPS" },
  "30fps":  { idealFps: 30,  maxFps: 30,  label: "30 FPS" },
  "60fps":  { idealFps: 60,  maxFps: 60,  label: "60 FPS" },
  "120fps": { idealFps: 120, maxFps: 120, label: "120 FPS" },
  "144fps": { idealFps: 144, maxFps: 144, label: "144 FPS" },
};

export function getQualityPresets() { return QUALITY_PRESETS; }

const LS_QUALITY_KEY = "screenShareQuality";

export function getSavedScreenShareQuality(): ScreenShareQuality {
  try {
    const v = localStorage.getItem(LS_QUALITY_KEY);
    if (v && v in QUALITY_PRESETS) return v as ScreenShareQuality;
  } catch {}
  return "30fps";
}

export function saveScreenShareQuality(q: ScreenShareQuality) {
  try { localStorage.setItem(LS_QUALITY_KEY, q); } catch {}
}

type StreamCb = (stream: MediaStream | null) => void;
type SharerCb = (id: string | null) => void;

export class P2PScreenShare {
  private room: Room;
  readonly localIdentity: string;

  private localStream: MediaStream | null = null;
  // sharer side: one RTCPeerConnection per viewer
  private viewerConns = new Map<string, RTCPeerConnection>();
  // sharer side: buffered ICE candidates per viewer (before answer arrives)
  private pendingViewerIce = new Map<string, RTCIceCandidateInit[]>();
  // viewer side: one RTCPeerConnection to the sharer
  private sharerConn: RTCPeerConnection | null = null;
  // viewer side: buffered ICE candidates from sharer (before offer processed)
  private pendingSharerIce: RTCIceCandidateInit[] = [];
  private _remoteStream: MediaStream | null = null;
  private _sharerId: string | null = null;

  private streamCbs = new Set<StreamCb>();
  private sharerCbs = new Set<SharerCb>();

  constructor(room: Room, localIdentity: string) {
    this.room = room;
    this.localIdentity = localIdentity;
    room.on(RoomEvent.DataReceived, this.onData);
    // Ask if anyone is already sharing
    this.send(null, { type: "SS_QUERY" });
  }

  destroy() {
    this.room.off(RoomEvent.DataReceived, this.onData);
    this._doStop(false);
    this._closeViewerConn();
    this.streamCbs.clear();
    this.sharerCbs.clear();
  }

  // ─── Subscribe ─────────────────────────────────────────────────────────────

  subscribeStream(cb: StreamCb): () => void {
    this.streamCbs.add(cb);
    return () => this.streamCbs.delete(cb);
  }

  subscribeSharer(cb: SharerCb): () => void {
    this.sharerCbs.add(cb);
    return () => this.sharerCbs.delete(cb);
  }

  // ─── Getters ───────────────────────────────────────────────────────────────

  get sharerId() { return this._sharerId; }
  get remoteStream() { return this._remoteStream; }
  get isLocalSharing() { return this._sharerId === this.localIdentity; }

  // ─── Internal helpers ──────────────────────────────────────────────────────

  private emit(stream: MediaStream | null) {
    this._remoteStream = stream;
    this.streamCbs.forEach((cb) => cb(stream));
  }

  private emitSharer(id: string | null) {
    this._sharerId = id;
    this.sharerCbs.forEach((cb) => cb(id));
  }

  private send(target: string | null, msg: ScreenShareMsg) {
    const payload = new TextEncoder().encode(
      JSON.stringify({ ...msg, _ss: 1 }),
    );
    const opts = target
      ? { reliable: true, destinationIdentities: [target] }
      : { reliable: true };
    void this.room.localParticipant.publishData(payload, opts);
  }

  // ─── Incoming data ─────────────────────────────────────────────────────────

  private onData = (payload: Uint8Array, participant?: RemoteParticipant) => {
    if (!participant) return;
    let msg: Record<string, unknown>;
    try {
      msg = JSON.parse(new TextDecoder().decode(payload)) as Record<string, unknown>;
    } catch {
      return;
    }
    if (!msg._ss) return;

    const from = participant.identity;

    switch (msg.type as ScreenShareMsg["type"]) {
      case "SS_QUERY":
        // If I'm currently sharing, re-announce to the late joiner
        if (this.isLocalSharing) this.send(from, { type: "SS_ANNOUNCE" });
        break;

      case "SS_ANNOUNCE":
        if (this._sharerId && this._sharerId !== from) return; // already have a sharer
        this.emitSharer(from);
        this.send(from, { type: "SS_REQUEST" });
        break;

      case "SS_STOP":
        if (this._sharerId !== from) return;
        this._closeViewerConn();
        this.emitSharer(null);
        this.emit(null);
        break;

      case "SS_REQUEST":
        if (this.localStream) void this._createViewerConn(from);
        break;

      case "SS_OFFER":
        void this._handleOffer(from, msg.sdp as string);
        break;

      case "SS_ANSWER":
        void this._handleAnswer(from, msg.sdp as string);
        break;

      case "SS_ICE":
        void this._handleIce(from, msg.candidate as RTCIceCandidateInit | null);
        break;
    }
  };

  // ─── Public API ────────────────────────────────────────────────────────────

  async startSharing(quality?: ScreenShareQuality): Promise<"ok" | "busy" | "denied"> {
    if (this._sharerId) return "busy";

    const q = quality ?? getSavedScreenShareQuality();
    saveScreenShareQuality(q);
    const preset = QUALITY_PRESETS[q];

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: { ideal: preset.idealFps, max: preset.maxFps } },
        audio: false,
      });
    } catch {
      return "denied";
    }

    this.localStream = stream;
    // Handle user clicking "Stop sharing" in the browser UI
    stream.getVideoTracks()[0].addEventListener("ended", () => this.stopSharing());

    this.emitSharer(this.localIdentity);
    this.send(null, { type: "SS_ANNOUNCE" });
    return "ok";
  }

  stopSharing() {
    if (this._sharerId !== this.localIdentity) return;
    this._doStop(true);
  }

  // ─── Internal WebRTC ───────────────────────────────────────────────────────

  private _doStop(announce: boolean) {
    for (const pc of this.viewerConns.values()) pc.close();
    this.viewerConns.clear();
    this.pendingViewerIce.clear();
    this.localStream?.getTracks().forEach((t) => t.stop());
    this.localStream = null;
    if (this._sharerId === this.localIdentity) {
      if (announce) this.send(null, { type: "SS_STOP" });
      this.emitSharer(null);
    }
  }

  private async _createViewerConn(viewerIdentity: string) {
    this.viewerConns.get(viewerIdentity)?.close();
    const pc = new RTCPeerConnection(ICE_CONFIG);
    this.viewerConns.set(viewerIdentity, pc);

    for (const track of this.localStream!.getTracks()) {
      pc.addTrack(track, this.localStream!);
    }
    pc.onicecandidate = (e) =>
      this.send(viewerIdentity, { type: "SS_ICE", candidate: e.candidate });

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    this.send(viewerIdentity, { type: "SS_OFFER", sdp: offer.sdp! });
  }

  private async _handleOffer(sharerId: string, sdp: string) {
    this._closeViewerConn();
    const pc = new RTCPeerConnection(ICE_CONFIG);
    this.sharerConn = pc;

    pc.ontrack = (e) => this.emit(e.streams[0] ?? new MediaStream([e.track]));
    pc.onicecandidate = (e) =>
      this.send(sharerId, { type: "SS_ICE", candidate: e.candidate });

    await pc.setRemoteDescription({ type: "offer", sdp });

    // Apply any ICE candidates that arrived before the offer was processed
    const queued = this.pendingSharerIce.splice(0);
    for (const c of queued) {
      try { await pc.addIceCandidate(c); } catch { /* ignore stale */ }
    }

    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    this.send(sharerId, { type: "SS_ANSWER", sdp: answer.sdp! });
  }

  private async _handleAnswer(viewerIdentity: string, sdp: string) {
    const pc = this.viewerConns.get(viewerIdentity);
    if (!pc) return;
    await pc.setRemoteDescription({ type: "answer", sdp });

    // Apply any ICE candidates that arrived before the answer was processed
    const queued = this.pendingViewerIce.get(viewerIdentity) ?? [];
    this.pendingViewerIce.delete(viewerIdentity);
    for (const c of queued) {
      try { await pc.addIceCandidate(c); } catch { /* ignore stale */ }
    }
  }

  private async _handleIce(
    from: string,
    candidate: RTCIceCandidateInit | null,
  ) {
    if (!candidate) return;

    if (from === this._sharerId) {
      // Viewer side: candidate from the sharer
      if (this.sharerConn && this.sharerConn.remoteDescription) {
        try { await this.sharerConn.addIceCandidate(candidate); } catch { /* ignore */ }
      } else {
        // Buffer until offer is processed
        this.pendingSharerIce.push(candidate);
      }
    } else {
      // Sharer side: candidate from a viewer
      const pc = this.viewerConns.get(from);
      if (pc && pc.remoteDescription) {
        try { await pc.addIceCandidate(candidate); } catch { /* ignore */ }
      } else {
        // Buffer until answer is processed
        const buf = this.pendingViewerIce.get(from) ?? [];
        buf.push(candidate);
        this.pendingViewerIce.set(from, buf);
      }
    }
  }

  private _closeViewerConn() {
    this.sharerConn?.close();
    this.sharerConn = null;
    this.pendingSharerIce = [];
    this._remoteStream = null;
  }
}

// ─── Module-level singleton ────────────────────────────────────────────────────

let _instance: P2PScreenShare | null = null;

export function initP2PScreenShare(
  room: Room,
  localIdentity: string,
): P2PScreenShare {
  _instance?.destroy();
  _instance = new P2PScreenShare(room, localIdentity);
  return _instance;
}

export function destroyP2PScreenShare() {
  _instance?.destroy();
  _instance = null;
}

export function getP2PScreenShare(): P2PScreenShare | null {
  return _instance;
}
