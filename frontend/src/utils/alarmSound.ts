export class AlarmSound {
  private audioContext: AudioContext | null = null;
  private isPlaying = false;

  constructor() {
    this.initAudioContext();
  }

  private initAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('Web Audio API not supported');
    }
  }

  private async createBeepSound(frequency: number = 800, duration: number = 200) {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
    oscillator.type = 'square'; // Square wave is more attention-grabbing

    // Create envelope for smooth sound
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.4, this.audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration / 1000);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration / 1000);
  }

  async playAlarm() {
    if (this.isPlaying) return;
    
    this.isPlaying = true;
    
    try {
      if (this.audioContext?.state === 'suspended') {
        await this.audioContext.resume();
      }

      // Play a sequence of attention-grabbing beeps
      await this.createBeepSound(1000, 200); // High beep
      setTimeout(() => this.createBeepSound(800, 200), 250); // Medium beep
      setTimeout(() => this.createBeepSound(1200, 200), 500); // Higher beep
      
      setTimeout(() => {
        this.isPlaying = false;
      }, 800);
      
    } catch (error) {
      console.warn('Failed to play alarm sound:', error);
      this.isPlaying = false;
      // Fallback to system beep
      this.fallbackBeep();
    }
  }

  async playAlarmPattern() {
    if (this.isPlaying) return;
    
    this.isPlaying = true;
    
    try {
      if (this.audioContext?.state === 'suspended') {
        await this.audioContext.resume();
      }

      // Create urgent alarm pattern
      const pattern = [
        { freq: 1000, delay: 0, duration: 150 },
        { freq: 1200, delay: 200, duration: 150 },
        { freq: 1000, delay: 400, duration: 150 },
        { freq: 1200, delay: 600, duration: 150 },
        { freq: 1400, delay: 800, duration: 200 }
      ];

      pattern.forEach(({ freq, delay, duration }) => {
        setTimeout(() => this.createBeepSound(freq, duration), delay);
      });

      setTimeout(() => {
        this.isPlaying = false;
      }, 1200);

    } catch (error) {
      console.warn('Failed to play alarm pattern:', error);
      this.isPlaying = false;
      this.fallbackBeep();
    }
  }

  private fallbackBeep() {
    // Fallback method using console.log with special character
    console.log('\x07'); // Bell character
    
    // Try to use system notification sound
    try {
      const utterance = new SpeechSynthesisUtterance('');
      utterance.volume = 0;
      speechSynthesis.speak(utterance);
    } catch (error) {
      console.log('🔔 ALARM! Timer notification');
    }
  }

  // Method to test if audio is working
  async testSound() {
    try {
      if (this.audioContext?.state === 'suspended') {
        await this.audioContext.resume();
      }
      await this.createBeepSound(800, 300);
      return true;
    } catch (error) {
      console.warn('Audio test failed:', error);
      return false;
    }
  }
}

export const alarmSound = new AlarmSound();
