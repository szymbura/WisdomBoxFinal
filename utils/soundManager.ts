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
      // Create soft click sound programmatically
      // Using a very short, soft beep tone
      const clickSoundUri = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT';
      
      const { sound: clickSound } = await Audio.Sound.createAsync(
        { uri: clickSoundUri },
        { shouldPlay: false, volume: 0.1 }
      );
      this.sounds.click = clickSound;

      // Short loading beep - very brief and soft
      const loadingSoundUri = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT';
      
      const { sound: loadingSound } = await Audio.Sound.createAsync(
        { uri: loadingSoundUri },
        { shouldPlay: false, volume: 0.08 }
      );
      this.sounds.loading = loadingSound;

      // Success sound - gentle chime
      const successSoundUri = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT';
      
      const { sound: successSound } = await Audio.Sound.createAsync(
        { uri: successSoundUri },
        { shouldPlay: false, volume: 0.15 }
      );
      this.sounds.success = successSound;

    } catch (error) {
      console.log('Could not load sounds:', error);
    }
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