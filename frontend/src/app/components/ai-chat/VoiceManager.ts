// ============================================================
// VoiceManager — Web Speech API wrapper
// ============================================================

export class VoiceManager {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private recognition: any = null;
  private synthesis: SpeechSynthesis | null = null;
  private utterance: SpeechSynthesisUtterance | null = null;
  private isSpeaking = false;

  readonly isSupported: boolean;

  constructor() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    const SpeechRec = w.SpeechRecognition || w.webkitSpeechRecognition;

    this.isSupported = !!(SpeechRec && window.speechSynthesis);

    if (SpeechRec) {
      this.recognition = new SpeechRec();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.maxAlternatives = 1;
    }

    if (window.speechSynthesis) {
      this.synthesis = window.speechSynthesis;
    }
  }

  /** Start listening. Returns a Promise resolving to the final transcript. */
  startListening(
    language = 'en-IN',
    onInterim?: (partial: string) => void
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.recognition) {
        reject(new Error('Speech recognition not supported'));
        return;
      }

      this.recognition.lang = language === 'hi' ? 'hi-IN' : language === 'gu' ? 'gu-IN' : 'en-IN';

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.recognition.onresult = (event: any) => {
        const result = event.results[event.results.length - 1];
        const transcript = result[0].transcript;
        if (result.isFinal) {
          resolve(transcript);
        } else {
          onInterim?.(transcript);
        }
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.recognition.onerror = (event: any) => {
        reject(new Error(event.error));
      };

      this.recognition.onend = () => {
        resolve('');
      };

      try {
        this.recognition.start();
      } catch (e) {
        reject(e);
      }
    });
  }

  stopListening(): void {
    try {
      this.recognition?.stop();
    } catch {}
  }

  /** Speak text aloud. Strips markdown symbols first. */
  speak(text: string, lang = 'en'): void {
    if (!this.synthesis) return;
    this.stopSpeaking();

    const clean = text
      .replace(/#{1,6}\s/g, '')
      .replace(/\*{1,2}([^*]+)\*{1,2}/g, '$1')
      .replace(/`[^`]+`/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/^\s*[-*]\s+/gm, '')
      .replace(/\n{2,}/g, '. ')
      .slice(0, 800); // cap length for TTS

    this.utterance = new SpeechSynthesisUtterance(clean);
    this.utterance.lang = lang === 'hi' ? 'hi-IN' : lang === 'gu' ? 'gu-IN' : 'en-IN';
    this.utterance.rate = 1.0;
    this.utterance.pitch = 1.0;
    this.utterance.volume = 1.0;
    this.isSpeaking = true;

    this.utterance.onend = () => { this.isSpeaking = false; };
    this.utterance.onerror = () => { this.isSpeaking = false; };

    this.synthesis.speak(this.utterance);
  }

  stopSpeaking(): void {
    if (this.synthesis && this.isSpeaking) {
      this.synthesis.cancel();
      this.isSpeaking = false;
    }
  }

  get speaking(): boolean {
    return this.isSpeaking;
  }
}

export const voiceManager = new VoiceManager();
