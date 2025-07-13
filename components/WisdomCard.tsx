import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Book, ChevronRight } from 'lucide-react-native';

interface WisdomBlock {
  id: string;
  title: string;
  description: string;
  content: string;
  tags: string[];
}

interface WisdomCardProps {
  block: WisdomBlock;
  onPress: () => void;
}

export function WisdomCard({ block, onPress }: WisdomCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.cardContent}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <Book size={24} color="#3b82f6" />
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.title}>{block.title}</Text>
          <Text style={styles.description}>{block.description}</Text>
          
          {/* Tags */}
          <View style={styles.tags}>
            {block.tags.slice(0, 2).map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
            {block.tags.length > 2 && (
              <Text style={styles.moreTagsText}>+{block.tags.length - 2} more</Text>
            )}
          </View>
        </View>

        {/* Arrow */}
        <ChevronRight size={20} color="#64748b" />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    backgroundColor: '#334155',
    borderRadius: 8,
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
    marginBottom: 8,
  },
  tags: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tag: {
    backgroundColor: '#334155',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  tagText: {
    fontSize: 11,
    color: '#3b82f6',
    fontWeight: '500',
  },
  moreTagsText: {
    fontSize: 11,
    color: '#64748b',
  },
});