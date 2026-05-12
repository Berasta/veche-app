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
    // own coturn relay — ensures connectivity through symmetric NAT / strict firewalls
    {
      urls: [
        "turn:veche.theaesthetics.ru:3479?transport=udp",
        "turn:veche.theaesthetics.ru:3479?transport=tcp",
      ],
      username: "veche",
      credential: "veche-turn-secret",
    },
  ],
};

/**
 * Wait for ICE gathering to complete (Vanilla ICE / non-trickle).
 * Falls back after timeoutMs to avoid hanging indefinitely.
 * This sidesteps mDNS obfuscation issues between Chrome and WKWebView.
 */
function waitForGathering(pc: RTCPeerConnection, timeoutMs = 10000): Promise<void> {
  if (pc.iceGatheringState === "complete") return Promise.resolve();
  return new Promise((resolve) => {
    const done = () => {
      clearTimeout(timer);
      pc.removeEventListener("icegatheringstatechange", handler);
      resolve();
    };
    const timer = setTimeout(done, timeoutMs);
    function handler() {
      if (pc.iceGatheringState === "complete") done();
    }
    pc.addEventListener("icegatheringstatechange", handler);
  });
}

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
  // viewer side: one RTCPeerConnection to the sharer
  private sharerConn: RTCPeerConnection | null = null;
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

    pc.oniceconnectionstatechange = () =>
      console.log(`[SS sharer→${viewerIdentity}] iceConnectionState:`, pc.iceConnectionState);
    pc.onconnectionstatechange = () =>
      console.log(`[SS sharer→${viewerIdentity}] connectionState:`, pc.connectionState);
    pc.onicegatheringstatechange = () =>
      console.log(`[SS sharer→${viewerIdentity}] iceGatheringState:`, pc.iceGatheringState);
    pc.onicecandidate = (e) =>
      console.log(`[SS sharer→${viewerIdentity}] candidate:`, e.candidate?.candidate ?? "null (done)");

    for (const track of this.localStream!.getTracks()) {
      pc.addTrack(track, this.localStream!);
    }

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    console.log(`[SS sharer→${viewerIdentity}] waiting for gathering...`);
    await waitForGathering(pc);
    console.log(`[SS sharer→${viewerIdentity}] gathering done, sending offer`);
    this.send(viewerIdentity, { type: "SS_OFFER", sdp: pc.localDescription!.sdp! });
  }

  private async _handleOffer(sharerId: string, sdp: string) {
    console.log(`[SS viewer←${sharerId}] received offer, len=${sdp.length}`);
    this._closeViewerConn();
    const pc = new RTCPeerConnection(ICE_CONFIG);
    this.sharerConn = pc;

    pc.oniceconnectionstatechange = () =>
      console.log(`[SS viewer←${sharerId}] iceConnectionState:`, pc.iceConnectionState);
    pc.onconnectionstatechange = () =>
      console.log(`[SS viewer←${sharerId}] connectionState:`, pc.connectionState);
    pc.onicegatheringstatechange = () =>
      console.log(`[SS viewer←${sharerId}] iceGatheringState:`, pc.iceGatheringState);
    pc.onicecandidate = (e) =>
      console.log(`[SS viewer←${sharerId}] candidate:`, e.candidate?.candidate ?? "null (done)");

    // Use addTrack approach for cross-platform robustness (WKWebView / Chrome)
    const remoteStream = new MediaStream();
    pc.ontrack = (e) => {
      console.log(`[SS viewer←${sharerId}] ontrack kind=${e.track.kind} readyState=${e.track.readyState} muted=${e.track.muted}`);
      if (!remoteStream.getTrackById(e.track.id)) {
        remoteStream.addTrack(e.track);
      }
      this.emit(remoteStream);
      e.track.addEventListener("unmute", () => {
        console.log(`[SS viewer←${sharerId}] track unmuted, re-emitting`);
        this.emit(remoteStream);
      }, { once: true });
    };

    // If ICE fails, retry once automatically
    let retried = false;
    pc.onconnectionstatechange = () => {
      console.log(`[SS viewer←${sharerId}] connectionState:`, pc.connectionState);
      if (pc.connectionState === "failed" && !retried && this._sharerId === sharerId) {
        console.log(`[SS viewer←${sharerId}] connection failed, retrying...`);
        retried = true;
        this._closeViewerConn();
        setTimeout(() => {
          if (this._sharerId === sharerId) {
            this.send(sharerId, { type: "SS_REQUEST" });
          }
        }, 500);
      }
    };

    await pc.setRemoteDescription({ type: "offer", sdp });

    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    console.log(`[SS viewer←${sharerId}] waiting for gathering...`);
    await waitForGathering(pc);
    console.log(`[SS viewer←${sharerId}] gathering done, sending answer`);
    this.send(sharerId, { type: "SS_ANSWER", sdp: pc.localDescription!.sdp! });
  }

  private async _handleAnswer(viewerIdentity: string, sdp: string) {
    const pc = this.viewerConns.get(viewerIdentity);
    if (!pc) return;
    await pc.setRemoteDescription({ type: "answer", sdp });
    // ICE candidates are embedded in the SDP (Vanilla ICE) — no separate addIceCandidate needed.
  }

  private async _handleIce(
    from: string,
    candidate: RTCIceCandidateInit | null,
  ) {
    // Vanilla ICE: candidates are embedded in SDP, SS_ICE kept for compat only.
    if (!candidate) return;
    if (from === this._sharerId && this.sharerConn?.remoteDescription) {
      try { await this.sharerConn.addIceCandidate(candidate); } catch { /* ignore */ }
    } else {
      const pc = this.viewerConns.get(from);
      if (pc?.remoteDescription) {
        try { await pc.addIceCandidate(candidate); } catch { /* ignore */ }
      }
    }
  }

  private _closeViewerConn() {
    this.sharerConn?.close();
    this.sharerConn = null;
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
