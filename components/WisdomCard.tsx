class SoundManager {
  private static instance: SoundManager;
  private audioContext: AudioContext | null = null;
  private isEnabled: boolean = true;
  private isInitialized: boolean = false;

  private constructor() {}

  static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  // Initialize audio context with user interaction
  async initializeAudio(): Promise<boolean> {
    try {
      console.log('🔊 Initializing audio context...');
      
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      // Resume if suspended (browser autoplay policy)
      if (this.audioContext.state === 'suspended') {
        console.log('🔊 Resuming suspended audio context...');
        await this.audioContext.resume();
      }

      this.isInitialized = true;
      console.log('🔊 Audio context initialized successfully, state:', this.audioContext.state);
      
      return true;
    } catch (error) {
      console.error('🔊 Failed to initialize audio:', error);
      return false;
    }
  }

  // Play the click sound with instant response
  async playClickSound() {
    if (!this.isInitialized) {
      await this.initializeAudio();
    }
    console.log('🔊 Playing click sound...');
    await this.playTone(800, 0.1, 0.05);
  }

  // Legacy methods for compatibility
  async loadSounds() {
    console.log('🔊 Sound manager ready - sounds will be loaded on demand');
  }

  async playLoadingSound() {
    if (!this.isInitialized) {
      await this.initializeAudio();
    }
    console.log('🔊 Playing loading sound...');
    await this.playTone(600, 0.3, 0.06);
  }

  async playSuccessSound() {
    if (!this.isInitialized) {
      await this.initializeAudio();
    }
    console.log('🔊 Playing success sound...');
    await this.playTone(1000, 0.5, 0.12);
  }

  // Play a tone with specified frequency, duration, and volume
  private async playTone(frequency: number, duration: number, volume: number = 0.1): Promise<void> {
    try {
      if (!this.audioContext || !this.isEnabled) {
        return;
      }

      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
      
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.01);
      gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + duration - 0.01);
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration);
      
    } catch (error) {
      console.error('🔊 Error playing tone:', error);
    }
  }

  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    console.log(`🔊 Audio ${enabled ? 'enabled' : 'disabled'}`);
  }

  async cleanup() {
    try {
      if (this.audioContext) {
        await this.audioContext.close();
        this.audioContext = null;
      }
      this.isInitialized = false;
      console.log('🔊 Audio cleanup completed');
    } catch (error) {
      console.error('🔊 Error during audio cleanup:', error);
    }
  }
}

export default SoundManager;