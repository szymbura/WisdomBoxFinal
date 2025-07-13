import { View, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { FlipBook } from '@/components/FlipBook';
import { evsProducts } from '@/data/evsData';

export default function FlipBookScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const product = evsProducts.find(p => p.id === id);

  if (!product) {
    console.log('Product not found for flipbook:', id);
    return null;
  }

  console.log('Loading flipbook for product:', product.title);
  console.log('Wisdom blocks count:', product.wisdomBlocks.length);

  // Convert wisdom blocks to flipbook pages
  const pages = product.wisdomBlocks.map((block, index) => ({
    title: block.title,
    content: block.content,
    moduleIndex: index,
    pageNumber: index + 1,
    totalPages: product.wisdomBlocks.length,
  }));

  console.log('Flipbook pages created:', pages.length);

  const handleClose = () => {
    console.log('Closing flipbook');
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
});