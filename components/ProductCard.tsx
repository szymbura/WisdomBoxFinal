import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Monitor, Camera, Radio, Video, Tv, Server } from 'lucide-react-native';
import { Product } from '@/data/evsData';

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
  cpu: Server, // fallback for cpu icon
};

export function ProductCard({ product, onPress }: ProductCardProps) {
  const IconComponent = iconMap[product.icon as keyof typeof iconMap] || Monitor;

  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <IconComponent size={32} color="#3b82f6" />
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title}>{product.title}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {product.description}
        </Text>
        
        <View style={styles.footer}>
          <View style={styles.statusContainer}>
            <View style={[
              styles.statusDot,
              { backgroundColor: product.status === 'online' ? '#10b981' : '#ef4444' }
            ]} />
            <Text style={styles.statusText}>
              {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
            </Text>
          </View>
          
          <Text style={styles.articleCount}>
            {product.wisdomBlocks.length} articles
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#cbd5e1',
    lineHeight: 20,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  articleCount: {
    fontSize: 12,
    color: '#64748b',
  },
});