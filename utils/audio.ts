// Simple Web Audio API synthesizer for UI sounds
// This ensures we have sound without external assets loading

let audioCtx: AudioContext | null = null;

const initAudio = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

const playTone = (freq: number, type: 'sine' | 'triangle', duration: number, delay: number = 0) => {
  const ctx = initAudio();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.value = freq;
  
  gain.gain.setValueAtTime(0.05, ctx.currentTime + delay);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(ctx.currentTime + delay);
  osc.stop(ctx.currentTime + delay + duration);
};

export const playSound = {
  click: () => {
    // Soft water droplet sound
    playTone(800, 'sine', 0.1);
    playTone(1200, 'sine', 0.1, 0.05);
  },
  win: () => {
    // Magical arpeggio
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C Major
    notes.forEach((note, i) => playTone(note, 'triangle', 0.3, i * 0.1));
    playTone(1318.51, 'sine', 0.6, 0.4); // High E
  },
  loss: () => {
    // Sad descending tones
    playTone(440, 'triangle', 0.3);
    playTone(415.30, 'triangle', 0.3, 0.2);
    playTone(392.00, 'triangle', 0.5, 0.4);
  },
  draw: () => {
    // Neutral chord
    playTone(440, 'sine', 0.3);
    playTone(554.37, 'sine', 0.3);
  },
  start: () => {
    // Rising "Whoosh"
    playTone(300, 'sine', 0.2);
    playTone(600, 'sine', 0.3, 0.1);
  }
};