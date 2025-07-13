import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { Search, Monitor, Camera, Radio, Video, Tv, Server } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { ProductCard } from '@/components/ProductCard';
import { evsProducts } from '@/data/evsData';

export default function DashboardScreen() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = evsProducts.filter(product =>
    product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>EVS Wisdom Box</Text>
      </View>

      {/* Product Grid */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.grid}>
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onPress={() => router.push(`/product/${product.id}`)}
            />
          ))}
        </View>
      </ScrollView>

      {/* Bottom Search Bar */}
      <View style={styles.bottomSearchContainer}>
        <View style={styles.searchContainer}>
          <Search size={20} color="#64748b" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search tools..."
            placeholderTextColor="#64748b"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    paddingTop: 30,
    paddingHorizontal: 20,
    paddingBottom: 4,
    backgroundColor: '#1e293b',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  bottomSearchContainer: {
    backgroundColor: '#0f172a',
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingHorizontal: 20,
    paddingVertical: 8,
    paddingBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#334155',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  grid: {
    padding: 20,
    paddingTop: 8,
    gap: 8,
    paddingBottom: 80,
  },
});