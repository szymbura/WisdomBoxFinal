class SoundManager {
  private static instance: SoundManager;
  private audioContext: AudioContext | null = null;
  private isEnabled: boolean = true;
  private isInitialized: boolean = false;
  private clickSoundBuffer: AudioBuffer | null = null;
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

  // Load the WAV click sound with cross-browser compatibility
  private async loadClickSound(): Promise<void> {
    if (this.clickSoundBuffer || this.isLoadingSound) {
      return; // Already loaded or loading
    }

    this.isLoadingSound = true;
    
    try {
      console.log('🔊 Loading WAV click sound...');
      
      // Try multiple URL formats for maximum compatibility
      const soundUrls = [
        '/click-sound.wav',           // New royalty-free sound (primary)
        './click-sound.wav',          // Alternative path
        '/fin-click.wav',
        './fin-click.wav',
        'https://github.com/szymbura/WisdomBoxFinal/raw/main/fin%20click.wav',
        // Public domain backup sounds
        'https://opengameart.org/sites/default/files/button-click.wav'
      ];

      let response: Response | null = null;
      let workingUrl = '';

      // Try each URL until one works
      for (const url of soundUrls) {
        try {
          console.log(`🔊 Trying to load from: ${url}`);
          response = await fetch(url);
          
          if (response.ok) {
            workingUrl = url;
            console.log(`🔊 Successfully fetched from: ${url}`);
            break;
          } else {
            console.warn(`🔊 Failed to fetch from ${url}: ${response.status}`);
          }
        } catch (fetchError) {
          console.warn(`🔊 Fetch error for ${url}:`, fetchError);
          continue;
        }
      }

      if (!response || !response.ok) {
        throw new Error('All sound URLs failed to load');
      }
      
      // Verify content type
      const contentType = response.headers.get('content-type');
      if (contentType && !contentType.includes('audio') && !contentType.includes('wav')) {
        console.warn(`🔊 Unexpected content-type: ${contentType}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      
      if (arrayBuffer.byteLength === 0) {
        throw new Error('Empty audio file received');
      }

      console.log(`🔊 Audio file loaded: ${arrayBuffer.byteLength} bytes from ${workingUrl}`);
      
      if (!this.audioContext) {
        await this.initializeAudio();
      }
      
      if (this.audioContext) {
        // Decode with error handling for different browsers
        try {
          this.clickSoundBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
          console.log('🔊 WAV click sound decoded successfully!', {
            duration: this.clickSoundBuffer.duration,
            sampleRate: this.clickSoundBuffer.sampleRate,
            channels: this.clickSoundBuffer.numberOfChannels
          });
        } catch (decodeError) {
          console.error('🔊 Audio decode error:', decodeError);
          throw new Error(`Failed to decode audio: ${decodeError.message}`);
        }
      }
      
    } catch (error) {
      console.warn('🔊 Failed to load WAV click sound:', error);
      console.log('🔊 Will use fallback generated sound');
    } finally {
      this.isLoadingSound = false;
    }
  }

  // Play the click sound with instant response
  async playClickSound() {
    try {
      // Initialize audio if needed (handles user interaction requirement)
      if (!this.isInitialized) {
        console.log('🔊 Audio not initialized, attempting to initialize...');
        const initialized = await this.initializeAudio();
        if (!initialized) {
          console.warn('🔊 Audio initialization failed, using silent mode');
          return;
        }
      }
      
      // Ensure click sound is loaded
      if (!this.clickSoundBuffer && !this.isLoadingSound) {
        await this.loadClickSound();
      }
      
      console.log('🔊 Playing click sound...');
      
      // Use custom WAV sound if available, otherwise fall back to generated sound
      if (this.clickSoundBuffer && this.audioContext) {
        await this.playCustomClickSound();
      } else {
        console.log('🔊 Custom sound not available, using fallback');
        await this.playGeneratedClickSound();
      }
    } catch (error) {
      console.warn('🔊 Click sound playback failed:', error);
      // Don't throw error to avoid breaking UI interaction
    }
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
    console.log('🔊 Sound manager ready - sounds will be loaded on demand');
    // Attempt to preload if audio context is available
    if (this.isInitialized) {
      this.preloadClickSound();
    }
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
      this.clickSoundBuffer = null;
      this.isInitialized = false;
      this.preloadAttempted = false;
      console.log('🔊 Audio cleanup completed');
    } catch (error) {
      console.error('🔊 Error during audio cleanup:', error);
    }
  }
}

export default SoundManager;