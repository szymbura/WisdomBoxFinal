import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft, Clock, User } from 'lucide-react-native';
import { findWisdomBlock } from '@/data/evsData';
import { InteractiveArticle } from '@/components/InteractiveArticle';

export default function WisdomScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const wisdomBlock = findWisdomBlock(id);

  if (!wisdomBlock) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Wisdom block not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.title}>{wisdomBlock.title}</Text>
      </View>

      {/* Content */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {wisdomBlock.interactiveContent ? (
          <InteractiveArticle sections={wisdomBlock.interactiveContent} />
        ) : (
          <View style={styles.contentContainer}>
            {/* Meta Info */}
            <View style={styles.metaInfo}>
              <View style={styles.metaItem}>
                <Clock size={16} color="#64748b" />
                <Text style={styles.metaText}>5 min read</Text>
              </View>
              <View style={styles.metaItem}>
                <User size={16} color="#64748b" />
                <Text style={styles.metaText}>EVS Team</Text>
              </View>
            </View>

            {/* Content */}
            <View style={styles.content}>
              <Text style={styles.contentText}>{wisdomBlock.content}</Text>
            </View>

            {/* Tags */}
            <View style={styles.tagsContainer}>
              <Text style={styles.tagsTitle}>Tags</Text>
              <View style={styles.tags}>
                {wisdomBlock.tags.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#1e293b',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  backButton: {
    marginRight: 16,
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  metaInfo: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 14,
    color: '#64748b',
  },
  content: {
    marginBottom: 32,
  },
  contentText: {
    fontSize: 16,
    color: '#cbd5e1',
    lineHeight: 24,
  },
  tagsContainer: {
    marginTop: 24,
  },
  tagsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#334155',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 12,
    color: '#3b82f6',
    fontWeight: '500',
  },
  errorText: {
    fontSize: 18,
    color: '#ef4444',
    textAlign: 'center',
    marginTop: 50,
  },
});