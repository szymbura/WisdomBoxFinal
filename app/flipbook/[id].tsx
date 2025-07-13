import { View, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { FlipBook } from '@/components/FlipBook';
import { evsProducts } from '@/data/evsData';

export default function FlipBookScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const product = evsProducts.find(p => p.id === id);

  console.log('FlipBookScreen - Route params:', { id });
  console.log('FlipBookScreen - Found product:', product?.title);

  if (!product) {
    console.log('FlipBookScreen - Product not found for flipbook:', id);
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Product not found: {id}</Text>
        </View>
      </View>
    );
  }

  console.log('FlipBookScreen - Loading flipbook for product:', product.title);
  console.log('FlipBookScreen - Wisdom blocks count:', product.wisdomBlocks.length);

  // Convert wisdom blocks to flipbook pages
  const pages = product.wisdomBlocks.map((block, index) => ({
    title: block.title,
    content: block.content,
    moduleIndex: index,
    pageNumber: index + 1,
    totalPages: product.wisdomBlocks.length,
  }));

  console.log('FlipBookScreen - Flipbook pages created:', pages.length);
  console.log('FlipBookScreen - First page title:', pages[0]?.title);

  const handleClose = () => {
    console.log('FlipBookScreen - Closing flipbook');
    router.back();
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <FlipBook pages={pages} onClose={handleClose} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#ffffff',
    fontSize: 18,
    textAlign: 'center',
  },
});