import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { Monitor, Camera, Radio, Video, Tv, Server, Cpu } from 'lucide-react-native';
import SoundManager from '@/utils/soundManager';

interface Product {
  id: string;
  title: string;
  description: string;
  icon: string;
  status: 'online' | 'offline' | 'maintenance';
  wisdomBlocks: any[];
}

interface ProductCardProps {
  product: Product;
  onPress: () => void;
}

const iconMap = {
  monitor: Monitor,
  camera: Camera,
  radio: Radio,
  video: Video,
  tv: Tv,
  server: Server,
  cpu: Cpu,
};

export function ProductCard({ product, onPress }: ProductCardProps) {
  const IconComponent = iconMap[product.icon as keyof typeof iconMap] || Monitor;
  const [isLaunching, setIsLaunching] = useState(false);
  const soundManager = SoundManager.getInstance();

  const handleLaunchTool = async (e: any) => {
    // Play click sound when launching
    soundManager.playClickSound();
    
    e.stopPropagation(); // Prevent card click when launching tool
    setIsLaunching(true);
    
    try {
      // Simulate tool launch process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Navigate to a launch page or show success
      router.push(`/launch/${product.id}`);
    } catch (error) {
      console.error('Failed to launch tool:', error);
    } finally {
      setIsLaunching(false);
    }
  };
  
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.cardContent}>
        {/* Status Indicator */}
        <View style={styles.statusContainer}>
          <View style={[
            styles.statusDot,
            { backgroundColor: product.status === 'online' ? '#10b981' : '#ef4444' }
          ]} />
        </View>

        {/* Icon */}
        <View style={styles.iconContainer}>
          <IconComponent size={32} color="#ffffff" />
        </View>

        {/* Title */}
        <Text style={styles.title}>{product.title}</Text>

        {/* Description */}
        <Text style={styles.description}>{product.description}</Text>

        {/* Launch Button */}
        <TouchableOpacity 
          style={[
            styles.launchButton,
            isLaunching && styles.launchButtonLoading
          ]}
          onPress={handleLaunchTool}
          disabled={isLaunching}
        >
          <Text style={styles.launchButtonText}>
            {isLaunching ? 'Launching...' : 'Launch Tool'}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 20,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardContent: {
    alignItems: 'flex-start',
  },
  statusContainer: {
    alignSelf: 'flex-end',
    marginBottom: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  iconContainer: {
    width: 56,
    height: 56,
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#cbd5e1',
    lineHeight: 20,
    marginBottom: 20,
  },
  launchButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignSelf: 'stretch',
  },
  launchButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
  },
  launchButtonLoading: {
    backgroundColor: '#1e40af',
    opacity: 0.7,
  },
});