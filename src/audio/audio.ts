// Original, royalty-free audio generated with the Web Audio API plus the Web Speech
// announcer. No copyrighted show audio is used.

type Sfx = 'correct' | 'wrong' | 'bank' | 'eliminate' | 'reveal' | 'click'

class AudioManager {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private pulseTimer: number | null = null
  private padNodes: { osc: OscillatorNode; gain: GainNode }[] = []
  muted = false

  private ensure(): AudioContext {
    if (!this.ctx) {
      const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      this.ctx = new Ctor()
      this.master = this.ctx.createGain()
      this.master.gain.value = 0.5
      this.master.connect(this.ctx.destination)
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume()
    return this.ctx
  }

  setMuted(m: boolean) {
    this.muted = m
    if (this.master) this.master.gain.value = m ? 0 : 0.5
    if (m) {
      this.stopPulse()
      this.stopPad()
      window.speechSynthesis?.cancel()
    }
  }

  private tone(freq: number, start: number, dur: number, type: OscillatorType = 'sine', vol = 0.3) {
    const ctx = this.ensure()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(freq, ctx.currentTime + start)
    gain.gain.setValueAtTime(0, ctx.currentTime + start)
    gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + start + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + dur)
    osc.connect(gain)
    gain.connect(this.master!)
    osc.start(ctx.currentTime + start)
    osc.stop(ctx.currentTime + start + dur + 0.05)
  }

  play(sfx: Sfx) {
    if (this.muted) return
    this.ensure()
    switch (sfx) {
      case 'correct':
        this.tone(880, 0, 0.18, 'triangle', 0.3)
        this.tone(1320, 0.08, 0.2, 'triangle', 0.25)
        break
      case 'wrong':
        this.tone(180, 0, 0.45, 'sawtooth', 0.3)
        this.tone(120, 0.02, 0.5, 'square', 0.2)
        break
      case 'bank':
        this.tone(1040, 0, 0.12, 'square', 0.25)
        this.tone(1560, 0.1, 0.22, 'square', 0.22)
        break
      case 'eliminate':
        this.tone(440, 0, 0.5, 'sawtooth', 0.3)
        this.tone(330, 0.25, 0.6, 'sawtooth', 0.3)
        this.tone(220, 0.55, 0.9, 'sawtooth', 0.3)
        break
      case 'reveal':
        this.tone(523, 0, 0.25, 'triangle', 0.25)
        this.tone(659, 0.18, 0.3, 'triangle', 0.25)
        this.tone(784, 0.36, 0.5, 'triangle', 0.28)
        break
      case 'click':
        this.tone(660, 0, 0.05, 'square', 0.12)
        break
    }
  }

  /** Low rhythmic pulse used during rounds — the classic tension "tick". */
  startPulse(bpm = 100) {
    if (this.muted) return
    this.ensure()
    this.stopPulse()
    const interval = 60000 / bpm
    const beat = () => {
      this.tone(70, 0, 0.12, 'sine', 0.22)
      this.tone(140, 0, 0.06, 'sine', 0.1)
    }
    beat()
    this.pulseTimer = window.setInterval(beat, interval)
  }

  stopPulse() {
    if (this.pulseTimer !== null) {
      clearInterval(this.pulseTimer)
      this.pulseTimer = null
    }
  }

  /** Soft ambient pad used on intro / menu screens. */
  startPad() {
    if (this.muted) return
    const ctx = this.ensure()
    this.stopPad()
    const freqs = [110, 164.81, 220]
    freqs.forEach((f) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = f
      gain.gain.value = 0.05
      osc.connect(gain)
      gain.connect(this.master!)
      osc.start()
      this.padNodes.push({ osc, gain })
    })
  }

  stopPad() {
    this.padNodes.forEach(({ osc, gain }) => {
      try {
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx!.currentTime + 0.4)
        osc.stop(this.ctx!.currentTime + 0.5)
      } catch {
        /* noop */
      }
    })
    this.padNodes = []
  }

  /** Spoken announcer via the Web Speech API. */
  say(text: string, opts: { rate?: number; pitch?: number; hostVoice?: boolean } = {}) {
    if (this.muted) return
    const synth = window.speechSynthesis
    if (!synth) return
    const u = new SpeechSynthesisUtterance(text)
    u.rate = opts.rate ?? 0.95
    u.pitch = opts.pitch ?? 0.8
    const voices = synth.getVoices()
    // hostVoice: prefer a clipped female English voice for the on-screen host;
    // otherwise prefer a deeper male announcer voice
    const preferred = opts.hostVoice
      ? voices.find((v) => /hazel|susan|zira|kate|serena|google uk english female/i.test(v.name)) ||
        voices.find((v) => v.lang.startsWith('en-GB')) ||
        voices.find((v) => v.lang.startsWith('en'))
      : voices.find((v) => /daniel|david|google uk english male|alex/i.test(v.name)) ||
        voices.find((v) => v.lang.startsWith('en'))
    if (preferred) u.voice = preferred
    synth.speak(u)
  }

  stopSpeech() {
    window.speechSynthesis?.cancel()
  }
}

export const audio = new AudioManager()
