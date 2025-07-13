import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Clock, User } from 'lucide-react-native';
import { WisdomBlock } from '@/data/evsData';

interface WisdomCardProps {
  block: WisdomBlock;
  onPress: () => void;
}

export function WisdomCard({ block, onPress }: WisdomCardProps) {
  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <Text style={styles.title}>{block.title}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {block.description}
        </Text>
        
        <View style={styles.metaInfo}>
          <View style={styles.metaItem}>
            <Clock size={14} color="#64748b" />
            <Text style={styles.metaText}>5 min read</Text>
          </View>
          <View style={styles.metaItem}>
            <User size={14} color="#64748b" />
            <Text style={styles.metaText}>EVS Team</Text>
          </View>
        </View>

        <View style={styles.tags}>
          {block.tags.slice(0, 3).map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
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
    marginBottom: 16,
    overflow: 'hidden',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
    lineHeight: 24,
  },
  description: {
    fontSize: 14,
    color: '#cbd5e1',
    lineHeight: 20,
    marginBottom: 16,
  },
  metaInfo: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#64748b',
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    backgroundColor: '#334155',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 10,
    color: '#3b82f6',
    fontWeight: '500',
  },
});