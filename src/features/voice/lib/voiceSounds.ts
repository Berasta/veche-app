/**
 * Звуки голосового чата через Web Audio API.
 * Никаких файлов не требуется — всё генерируется программно.
 */

let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx || ctx.state === "closed") {
    ctx = new AudioContext();
  }
  return ctx;
}

function playTone(
  frequency: number,
  duration: number,
  volume: number,
  type: OscillatorType,
  startTime: number,
  audioCtx: AudioContext,
) {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.type = type;
  osc.frequency.setValueAtTime(frequency, startTime);

  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(volume, startTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

  osc.start(startTime);
  osc.stop(startTime + duration);
}

/** Звук входа участника: два восходящих тона */
export function playJoinSound() {
  try {
    const audioCtx = getCtx();
    const now = audioCtx.currentTime;
    playTone(600, 0.12, 0.18, "sine", now, audioCtx);
    playTone(900, 0.14, 0.18, "sine", now + 0.1, audioCtx);
  } catch {
    // ignore — AudioContext может быть заблокирован до первого жеста
  }
}

/** Звук выхода участника: два нисходящих тона */
export function playLeaveSound() {
  try {
    const audioCtx = getCtx();
    const now = audioCtx.currentTime;
    playTone(900, 0.12, 0.15, "sine", now, audioCtx);
    playTone(600, 0.14, 0.15, "sine", now + 0.1, audioCtx);
  } catch {
    // ignore
  }
}

/** Звук запуска демонстрации экрана: короткий «свист» вверх */
export function playScreenShareSound() {
  try {
    const audioCtx = getCtx();
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.type = "sine";
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.linearRampToValueAtTime(1000, now + 0.18);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.start(now);
    osc.stop(now + 0.25);
  } catch {
    // ignore
  }
}
