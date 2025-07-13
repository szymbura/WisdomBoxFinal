import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft, BookOpen } from 'lucide-react-native';
import { WisdomCard } from '@/components/WisdomCard';
import { evsProducts } from '@/data/evsData';

export default function ProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const product = evsProducts.find(p => p.id === id);

  if (!product) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Product not found</Text>
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
        <Text style={styles.title}>{product.title}</Text>
      </View>

      {/* Product Description */}
      <View style={styles.productInfo}>
        <Text style={styles.productDescription}>{product.description}</Text>
        
        {/* Flipbook Button - Only show for IPDirector */}
        {product.id === 'ipdirector' && (
          <TouchableOpacity 
            style={styles.flipbookButton}
            onPress={() => router.push(`/flipbook/${product.id}`)}
          >
            <BookOpen size={20} color="#ffffff" />
            <Text style={styles.flipbookButtonText}>Open Digital Flipbook</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Wisdom Blocks */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.wisdomContainer}>
          <Text style={styles.sectionTitle}>Knowledge Base</Text>
          <View style={styles.wisdomGrid}>
            {product.wisdomBlocks.map((block) => (
              <WisdomCard
                key={block.id}
                block={block}
                onPress={() => router.push(`/wisdom/${block.id}`)}
              />
            ))}
          </View>
        </View>
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
  productInfo: {
    padding: 20,
    backgroundColor: '#1e293b',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  productDescription: {
    fontSize: 16,
    color: '#cbd5e1',
    lineHeight: 24,
  },
  flipbookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
    alignSelf: 'flex-start',
  },
  flipbookButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 8,
  },
  scrollView: {
    flex: 1,
  },
  wisdomContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  wisdomGrid: {
    gap: 16,
  },
  errorText: {
    fontSize: 18,
    color: '#ef4444',
    textAlign: 'center',
    marginTop: 50,
  },
});