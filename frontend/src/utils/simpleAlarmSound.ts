export class SimpleAlarmSound {
  private audio: HTMLAudioElement | null = null;

  constructor() {
    // Create audio element with data URL for a simple beep
    this.createAudioElement();
  }

  private createAudioElement() {
    try {
      // Create a simple beep sound using data URL
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      // This is a fallback - we'll use the Web Audio API method in the main class
      console.log('Audio context created for simple alarm');
    } catch (error) {
      console.warn('Could not create audio context');
    }
  }

  async playSimpleBeep() {
    try {
      // Create a simple beep using the Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Configure the beep
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.type = 'square'; // Square wave for more noticeable sound

      // Volume envelope
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);

      return true;
    } catch (error) {
      console.warn('Failed to play simple beep:', error);
      return false;
    }
  }
}

// Export both classes
export const simpleAlarmSound = new SimpleAlarmSound();
