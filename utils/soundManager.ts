import { Audio } from 'expo-av';

class SoundManager {
  private static instance: SoundManager;
  private sounds: { [key: string]: Audio.Sound } = {};
  private isEnabled: boolean = true;

  private constructor() {}

  static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  async loadSounds() {
    try {
      // Loading sound - gentle beep sequence
      const { sound: loadingSound } = await Audio.Sound.createAsync(
        require('../assets/sounds/loading.mp3'),
        { shouldPlay: false, volume: 0.3 }
      );
      this.sounds.loading = loadingSound;

      // Click sound - soft click
      const { sound: clickSound } = await Audio.Sound.createAsync(
        require('../assets/sounds/click.mp3'),
        { shouldPlay: false, volume: 0.2 }
      );
      this.sounds.click = clickSound;

      // Success sound - pleasant chime
      const { sound: successSound } = await Audio.Sound.createAsync(
        require('../assets/sounds/success.mp3'),
        { shouldPlay: false, volume: 0.4 }
      );
      this.sounds.success = successSound;

      // Error sound - subtle alert
      const { sound: errorSound } = await Audio.Sound.createAsync(
        require('../assets/sounds/error.mp3'),
        { shouldPlay: false, volume: 0.3 }
      );
      this.sounds.error = errorSound;

      console.log('🔊 All sounds loaded successfully');
    } catch (error) {
      console.log('🔊 Could not load sounds, using fallback:', error);
      // Fallback to programmatic sounds if files don't exist
      await this.loadFallbackSounds();
    }
  }

  private async loadFallbackSounds() {
    try {
      // Create simple beep sounds programmatically
      const beepUri = this.createBeepSound(440, 0.1); // A4 note, 100ms
      const clickUri = this.createBeepSound(800, 0.05); // Higher pitch, shorter
      const successUri = this.createBeepSound(523, 0.2); // C5 note, 200ms
      const errorUri = this.createBeepSound(220, 0.15); // A3 note, 150ms

      const { sound: loadingSound } = await Audio.Sound.createAsync(
        { uri: beepUri },
        { shouldPlay: false, volume: 0.2 }
      );
      this.sounds.loading = loadingSound;

      const { sound: clickSound } = await Audio.Sound.createAsync(
        { uri: clickUri },
        { shouldPlay: false, volume: 0.1 }
      );
      this.sounds.click = clickSound;

      const { sound: successSound } = await Audio.Sound.createAsync(
        { uri: successUri },
        { shouldPlay: false, volume: 0.3 }
      );
      this.sounds.success = successSound;

      const { sound: errorSound } = await Audio.Sound.createAsync(
        { uri: errorUri },
        { shouldPlay: false, volume: 0.2 }
      );
      this.sounds.error = errorSound;

      console.log('🔊 Fallback sounds loaded successfully');
    } catch (error) {
      console.log('🔊 Could not load fallback sounds:', error);
    }
  }

  private createBeepSound(frequency: number, duration: number): string {
    // Create a simple sine wave beep
    const sampleRate = 44100;
    const samples = Math.floor(sampleRate * duration);
    const buffer = new ArrayBuffer(44 + samples * 2);
    const view = new DataView(buffer);
    
    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + samples * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, samples * 2, true);
    
    // Generate sine wave
    for (let i = 0; i < samples; i++) {
      const sample = Math.sin(2 * Math.PI * frequency * i / sampleRate) * 0.3;
      const envelope = Math.sin(Math.PI * i / samples); // Fade in/out
      view.setInt16(44 + i * 2, sample * envelope * 32767, true);
    }
    
    const blob = new Blob([buffer], { type: 'audio/wav' });
    return URL.createObjectURL(blob);
  }

  async playSound(soundName: string) {
    console.log(`🔊 Attempting to play sound: ${soundName}, enabled: ${this.isEnabled}, sound exists: ${!!this.sounds[soundName]}`);
    if (!this.isEnabled || !this.sounds[soundName]) return;
    
    try {
      console.log(`🔊 Playing sound: ${soundName}`);
      await this.sounds[soundName].replayAsync();
      console.log(`🔊 Sound played successfully: ${soundName}`);
    } catch (error) {
      console.log(`🔊 Could not play sound ${soundName}:`, error);
    }
  }

  async playClickSound() {
    await this.playSound('click');
  }

  async playLoadingSound() {
    console.log('🔊 playLoadingSound called');
    await this.playSound('loading');
  }

  async playSuccessSound() {
    await this.playSound('success');
  }

  async playErrorSound() {
    await this.playSound('error');
  }

  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  async cleanup() {
    for (const sound of Object.values(this.sounds)) {
      try {
        await sound.unloadAsync();
      } catch (error) {
        console.log('Error unloading sound:', error);
      }
    }
    this.sounds = {};
  }
}

export default SoundManager;