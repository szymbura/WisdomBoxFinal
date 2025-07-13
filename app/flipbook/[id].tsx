import { View, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { FlipBook } from '@/components/FlipBook';
import { evsProducts } from '@/data/evsData';

export default function FlipBookScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const product = evsProducts.find(p => p.id === id);

  if (!product) {
    return null;
  }

  // Convert wisdom blocks to flipbook pages
  const pages = product.wisdomBlocks.map((block, index) => ({
    title: block.title,
    content: block.content,
    moduleIndex: index,
    pageNumber: index + 1,
    totalPages: product.wisdomBlocks.length,
  }));

  const handleClose = () => {
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