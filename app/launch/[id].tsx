class SoundManager {
  private static instance: SoundManager;
  private audioContext: AudioContext | null = null;
  private isEnabled: boolean = true;
  private isInitialized: boolean = false;
  private clickSoundBuffer: AudioBuffer | null = null;
  private volume: number = 0.3; // Default volume (30%)
  private userPreferences = {
    clickSoundsEnabled: true,
    volume: 0.3
  };
  private isLoadingSound: boolean = false;
  private preloadAttempted: boolean = false;

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
      
      // Preload click sound after initialization
      if (!this.preloadAttempted) {
        this.preloadClickSound();
      }
      
      return true;
    } catch (error) {
      console.error('🔊 Failed to initialize audio:', error);
      return false;
    }
  }

  // Preload the click sound for instant playback
  private async preloadClickSound(): Promise<void> {
    if (this.preloadAttempted || this.isLoadingSound) {
      return;
    }

    this.preloadAttempted = true;
    await this.loadClickSound();
  }

  // Play the click sound with instant response
  async playClickSound() {
    if (!this.userPreferences.clickSoundsEnabled || !this.isEnabled) {
      return;
    }

    if (!this.isInitialized) {
      await this.initializeAudio();
    }

    try {
      if (this.clickSoundBuffer) {
        // Use pre-loaded buffer for instant response
        await this.playBufferedSound(this.clickSoundBuffer);
      } else {
        // Fallback to generated tone
        await this.playTone(800, 0.15, this.userPreferences.volume * 0.5);
      }
    } catch (error) {
      console.warn('🔊 Click sound failed, using fallback');
      await this.playTone(800, 0.15, this.userPreferences.volume * 0.5);
    }
  }

  // Load click sound for better performance
  async loadClickSound(): Promise<void> {
    if (!this.audioContext || this.clickSoundBuffer) {
      return;
    }

    try {
      // Generate a professional click sound buffer
      this.clickSoundBuffer = await this.generateClickSoundBuffer();
      console.log('🔊 Click sound buffer loaded');
    } catch (error) {
      console.warn('🔊 Failed to load click sound buffer:', error);
    }
  }

  // Generate a professional click sound buffer
  private async generateClickSoundBuffer(): Promise<AudioBuffer> {
    if (!this.audioContext) {
      throw new Error('Audio context not initialized');
    }

    const sampleRate = this.audioContext.sampleRate;
    const duration = 0.15; // 150ms - professional and quick
    const length = sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    // Create a subtle, professional click sound
    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      
      // Multi-layered sound for richness
      const freq1 = 1200; // Primary frequency
      const freq2 = 2400; // Harmonic
      const freq3 = 600;  // Sub-harmonic
      
      // Exponential decay envelope for natural sound
      const envelope = Math.exp(-t * 15);
      
      // Combine frequencies with different weights
      const wave1 = Math.sin(2 * Math.PI * freq1 * t) * 0.6;
      const wave2 = Math.sin(2 * Math.PI * freq2 * t) * 0.2;
      const wave3 = Math.sin(2 * Math.PI * freq3 * t) * 0.2;
      
      data[i] = (wave1 + wave2 + wave3) * envelope * 0.3; // Keep it subtle
    }

    return buffer;
  }

  // Play a buffered sound for instant response
  private async playBufferedSound(buffer: AudioBuffer): Promise<void> {
    if (!this.audioContext) {
      return;
    }

    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    const source = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();
    
    source.buffer = buffer;
    gainNode.gain.setValueAtTime(this.userPreferences.volume, this.audioContext.currentTime);
    
    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    source.start(0);
  }

  // User preference controls
  setClickSoundsEnabled(enabled: boolean): void {
    this.userPreferences.clickSoundsEnabled = enabled;
    console.log(`🔊 Click sounds ${enabled ? 'enabled' : 'disabled'}`);
  }

  setVolume(volume: number): void {
    this.userPreferences.volume = Math.max(0, Math.min(1, volume));
    console.log(`🔊 Volume set to ${Math.round(this.userPreferences.volume * 100)}%`);
  }

  getClickSoundsEnabled(): boolean {
    return this.userPreferences.clickSoundsEnabled;
  }

  getVolume(): number {
    return this.userPreferences.volume;
  }

  // Play the custom WAV click sound
  private async playCustomClickSound(): Promise<void> {
    try {
      if (!this.audioContext || !this.clickSoundBuffer) {
        throw new Error('Audio context or buffer not available');
      }

      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      // Create audio source from buffer
      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();
      
      source.buffer = this.clickSoundBuffer;
      
      // Set volume for comfortable listening (adjust as needed)
      gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
      
      // Connect nodes
      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      // Play the sound
      source.start(this.audioContext.currentTime);
      
      console.log('🔊 Playing custom WAV click sound');
      
    } catch (error) {
      console.error('🔊 Error playing custom click sound:', error);
      throw error;
    }
  }

  // Fallback generated click sound for maximum reliability
  private async playGeneratedClickSound(): Promise<void> {
    try {
      if (!this.audioContext || !this.isEnabled) {
        return;
      }

      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      // Create professional-grade click sound
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      const filterNode = this.audioContext.createBiquadFilter();
      
      // Professional click characteristics
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(1200, this.audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(400, this.audioContext.currentTime + 0.075);
      
      // Low-pass filter to remove harsh frequencies
      filterNode.type = 'lowpass';
      filterNode.frequency.setValueAtTime(8000, this.audioContext.currentTime);
      filterNode.Q.setValueAtTime(0.5, this.audioContext.currentTime);
      
      // Volume envelope
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.178, this.audioContext.currentTime + 0.005);
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.075);
      
      // Connect signal chain
      oscillator.connect(filterNode);
      filterNode.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      // Play for 75ms
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.075);
      
      console.log('🔊 Playing fallback generated click sound');
      
    } catch (error) {
      console.error('🔊 Error playing generated click sound:', error);
    }
  }

  // Legacy methods for compatibility
  async loadSounds() {
    if (!this.isInitialized) {
      await this.initializeAudio();
    }
    await this.loadClickSound();
    console.log('🔊 Sound manager ready - all sounds loaded');
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

  async playErrorSound() {
    if (!this.isInitialized) {
      await this.initializeAudio();
    }
    console.log('🔊 Playing error sound...');
    await this.playTone(400, 0.8, 0.15);
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
      this.clickSoundBuffer = null;
      if (this.audioContext) {
        await this.audioContext.close();
        this.audioContext = null;
      }
      this.isInitialized = false;
      this.preloadAttempted = false;
      console.log('🔊 Audio cleanup completed');
    } catch (error) {
      console.error('🔊 Error during audio cleanup:', error);
    }
  }
}

export default SoundManager;