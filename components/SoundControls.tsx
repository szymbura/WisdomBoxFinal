import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react-native';
import SoundManager from '@/utils/soundManager';

export function SoundControls() {
  const soundManager = SoundManager.getInstance();
  const [clickSoundsEnabled, setClickSoundsEnabled] = useState(true);
  const [volume, setVolume] = useState(0.3);

  useEffect(() => {
    setClickSoundsEnabled(soundManager.getClickSoundsEnabled());
    setVolume(soundManager.getVolume());
  }, []);

  const handleToggleClickSounds = (enabled: boolean) => {
    setClickSoundsEnabled(enabled);
    soundManager.setClickSoundsEnabled(enabled);
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    soundManager.setVolume(newVolume);
  };

  const testClickSound = async () => {
    await soundManager.playClickSound();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sound Settings</Text>
      
      {/* Click Sounds Toggle */}
      <View style={styles.setting}>
        <View style={styles.settingInfo}>
          <Text style={styles.settingLabel}>Click Sounds</Text>
          <Text style={styles.settingDescription}>
            Play subtle sounds when interacting with articles
          </Text>
        </View>
        <Switch
          value={clickSoundsEnabled}
          onValueChange={handleToggleClickSounds}
          trackColor={{ false: '#334155', true: '#3b82f6' }}
          thumbColor={clickSoundsEnabled ? '#ffffff' : '#64748b'}
        />
      </View>

      {/* Volume Control */}
      {clickSoundsEnabled && (
        <View style={styles.setting}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Volume</Text>
            <Text style={styles.settingDescription}>
              {Math.round(volume * 100)}%
            </Text>
          </View>
          <View style={styles.volumeControls}>
            <TouchableOpacity
              style={styles.volumeButton}
              onPress={() => handleVolumeChange(Math.max(0, volume - 0.1))}
              accessible={true}
              accessibilityLabel="Decrease volume"
            >
              <VolumeX size={20} color="#64748b" />
            </TouchableOpacity>
            
            <View style={styles.volumeBar}>
              <View style={[styles.volumeFill, { width: `${volume * 100}%` }]} />
            </View>
            
            <TouchableOpacity
              style={styles.volumeButton}
              onPress={() => handleVolumeChange(Math.min(1, volume + 0.1))}
              accessible={true}
              accessibilityLabel="Increase volume"
            >
              <Volume2 size={20} color="#64748b" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Test Button */}
      {clickSoundsEnabled && (
        <TouchableOpacity
          style={styles.testButton}
          onPress={testClickSound}
          accessible={true}
          accessibilityLabel="Test click sound"
          accessibilityHint="Play a sample click sound"
        >
          <Text style={styles.testButtonText}>Test Sound</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 20,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
  },
  setting: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#cbd5e1',
    lineHeight: 20,
  },
  volumeControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  volumeButton: {
    padding: 8,
  },
  volumeBar: {
    width: 80,
    height: 4,
    backgroundColor: '#334155',
    borderRadius: 2,
    overflow: 'hidden',
  },
  volumeFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 2,
  },
  testButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  testButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
  },
});