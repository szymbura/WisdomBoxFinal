class SoundManager {
  private static instance: SoundManager;
  private audioContext: AudioContext | null = null;
  private isEnabled: boolean = true;
  private isInitialized: boolean = false;
  private clickSoundBuffer: AudioBuffer | null = null;
  private isLoadingSound: boolean = false;

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
      
      // Test with a very short beep to confirm audio is working
      await this.playTone(800, 0.1, 0.1);
      console.log('🔊 Audio test successful!');
      
      return true;
    } catch (error) {
      console.error('🔊 Failed to initialize audio:', error);
      return false;
    }
  }

  // Load the custom click sound from GitHub
  private async loadClickSound(): Promise<void> {
    if (this.clickSoundBuffer || this.isLoadingSound) {
      return; // Already loaded or loading
    }

    this.isLoadingSound = true;
    
    try {
      console.log('🔊 Loading custom click sound from GitHub...');
      
      const response = await fetch('/11L-Create_a_short%2C_soft-1752403098790.mp3');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch sound: ${response.status}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      
      if (!this.audioContext) {
        await this.initializeAudio();
      }
      
      if (this.audioContext) {
        this.clickSoundBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
        console.log('🔊 Custom click sound loaded successfully!');
      }
      
    } catch (error) {
      console.error('🔊 Failed to load custom click sound:', error);
      console.log('🔊 Will fall back to generated click sound');
    } finally {
      this.isLoadingSound = false;
    }
  }

  // Play the custom click sound
  private async playCustomClickSound(): Promise<void> {
    try {
      if (!this.audioContext || !this.clickSoundBuffer) {
        console.log('🔊 Custom sound not available, using fallback');
        return;
      }

      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      // Create audio source from buffer
      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();
      
      source.buffer = this.clickSoundBuffer;
      
      // Set volume to match professional specs (-15dB ≈ 0.178)
      gainNode.gain.setValueAtTime(0.178, this.audioContext.currentTime);
      
      // Connect nodes
      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      // Play the sound
      source.start(this.audioContext.currentTime);
      
      console.log('🔊 Playing custom click sound');
      
    } catch (error) {
      console.error('🔊 Error playing custom click sound:', error);
    }
  }

  // Play a tone with specified frequency, duration, and volume
  private async playTone(frequency: number, duration: number, volume: number = 0.1): Promise<void> {
    try {
      if (!this.audioContext || !this.isEnabled) {
        console.log('🔊 Audio not available or disabled');
        return;
      }

      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      // Create oscillator for tone generation
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      // Configure oscillator
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
      
      // Configure volume with fade in/out
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.01);
      gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + duration - 0.01);
      
      // Connect nodes
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      // Play the tone
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration);
      
      console.log(`🔊 Playing tone: ${frequency}Hz for ${duration}s at ${volume} volume`);
      
    } catch (error) {
      console.error('🔊 Error playing tone:', error);
    }
  }

  async loadSounds() {
    console.log('🔊 Sound manager ready (sounds will be generated on demand)');
  }

  async playClickSound() {
    if (!this.isInitialized) {
      console.log('🔊 Audio not initialized, attempting to initialize...');
      await this.initializeAudio();
    }
    
    // Try to load custom sound if not already loaded
    if (!this.clickSoundBuffer && !this.isLoadingSound) {
      await this.loadClickSound();
    }
    
    console.log('🔊 Playing click sound...');
    
    // Use custom sound if available, otherwise fall back to generated sound
    if (this.clickSoundBuffer) {
      await this.playCustomClickSound();
    } else {
      await this.playClickTone();
    }
  }

  // Create a more realistic click sound
  private async playClickTone(): Promise<void> {
    try {
      if (!this.audioContext || !this.isEnabled) {
        console.log('🔊 Audio not available or disabled');
        return;
      }

      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      // Create professional-grade click sound matching specifications
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      const filterNode = this.audioContext.createBiquadFilter();
      
      // Professional click characteristics
      oscillator.type = 'sine';
      
      // Frequency profile: gentle click with smooth attack
      oscillator.frequency.setValueAtTime(1200, this.audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(400, this.audioContext.currentTime + 0.075);
      
      // Low-pass filter to remove harsh frequencies above 8kHz
      filterNode.type = 'lowpass';
      filterNode.frequency.setValueAtTime(8000, this.audioContext.currentTime);
      filterNode.Q.setValueAtTime(0.5, this.audioContext.currentTime); // Minimal resonance
      
      // Volume envelope: -15dB peak (between -12dB to -18dB spec)
      // 0.178 ≈ -15dB, smooth attack and quick decay
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.178, this.audioContext.currentTime + 0.005); // Smooth attack (5ms)
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.075); // Quick decay (70ms)
      
      // Professional signal chain: oscillator -> filter -> gain -> output
      oscillator.connect(filterNode);
      filterNode.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      // Duration: 75ms (within 50-100ms spec)
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.075);
      
      console.log('🔊 Playing professional click sound (75ms, -15dB, <8kHz)');
      
    } catch (error) {
      console.error('🔊 Error playing click sound:', error);
    }
  }

  async playLoadingSound() {
    if (!this.isInitialized) {
      console.log('🔊 Audio not initialized, attempting to initialize...');
      await this.initializeAudio();
    }
    console.log('🔊 Playing loading sound...');
    await this.playTone(600, 0.3, 0.06);
  }

  async playSuccessSound() {
    if (!this.isInitialized) {
      console.log('🔊 Audio not initialized, attempting to initialize...');
      await this.initializeAudio();
    }
    console.log('🔊 Playing success sound...');
    await this.playTone(1000, 0.5, 0.12);
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