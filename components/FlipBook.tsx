import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Animated } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, BookOpen, Chrome as Home, Volume2, VolumeX } from 'lucide-react-native';
import { router } from 'expo-router';
import SoundManager from '@/utils/soundManager';

interface FlipBookPage {
  title: string;
  content: string;
  moduleIndex: number;
  pageNumber: number;
  totalPages: number;
}

interface FlipBookProps {
  pages: FlipBookPage[];
  onClose: () => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const BOOK_WIDTH = Math.min(screenWidth * 0.9, 800);
const BOOK_HEIGHT = Math.min(screenHeight * 0.75, 600);
const PAGE_WIDTH = BOOK_WIDTH / 2;

export function FlipBook({ pages, onClose }: FlipBookProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  const soundManager = SoundManager.getInstance();
  
  // Simple animation values
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  console.log('FlipBook - Component loaded with pages:', pages.length);

  const handlePageTurn = (direction: 'next' | 'prev') => {
    if (isFlipping) return;
    
    console.log('FlipBook - Page turn:', direction, 'current page:', currentPage);
    setIsFlipping(true);
    
    // Play sound
    if (soundEnabled) {
      soundManager.playClickSound();
    }
    
    // Simple slide animation
    Animated.sequence([
      Animated.timing(slideAnim, {
        toValue: direction === 'next' ? -50 : 50,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0.7,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Update page
      if (direction === 'next' && currentPage < pages.length - 1) {
        setCurrentPage(currentPage + 1);
      } else if (direction === 'prev' && currentPage > 0) {
        setCurrentPage(currentPage - 1);
      }
      setIsFlipping(false);
    });
  };

  const formatContent = (content: string) => {
    if (!content) {
      return [<Text key="empty" style={styles.paragraphText}>No content available</Text>];
    }
    
    const lines = content.split('\n');
    return lines.map((line, index) => {
      if (line.trim() === '') {
        return <View key={index} style={styles.spacer} />;
      } else if (line.trim().endsWith(':') && !line.includes('.')) {
        // Section headers
        return (
          <Text key={index} style={styles.sectionHeader}>
            {line.trim()}
          </Text>
        );
      } else {
        return (
          <Text key={index} style={styles.paragraphText}>
            {line.trim()}
          </Text>
        );
      }
    });
  };

  const currentPageData = pages[currentPage];
  
  if (!currentPageData) {
    console.log('FlipBook - No current page data available');
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No content available</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Home size={24} color="#ffffff" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <BookOpen size={24} color="#3b82f6" />
          <Text style={styles.headerTitle}>IPDirector Guide</Text>
        </View>
        <TouchableOpacity 
          style={styles.soundButton} 
          onPress={() => setSoundEnabled(!soundEnabled)}
        >
          {soundEnabled ? (
            <Volume2 size={20} color="#ffffff" />
          ) : (
            <VolumeX size={20} color="#64748b" />
          )}
        </TouchableOpacity>
      </View>

      {/* Simple Book Container */}
      <View style={styles.bookWrapper}>
        <View style={styles.bookContainer}>
          
          {/* Left Page */}
          <View style={styles.leftPage}>
            {currentPage > 0 ? (
              <ScrollView style={styles.pageScroll} showsVerticalScrollIndicator={false}>
                <View style={styles.pageContent}>
                  <Text style={styles.pageTitle}>
                    {pages[currentPage - 1]?.title}
                  </Text>
                  <View style={styles.contentArea}>
                    {formatContent(pages[currentPage - 1]?.content || '')}
                  </View>
                  <Text style={styles.pageNumber}>{currentPage}</Text>
                </View>
              </ScrollView>
            ) : (
              <View style={styles.coverPage}>
                <View style={styles.coverContent}>
                  <Text style={styles.coverTitle}>IPDirector</Text>
                  <Text style={styles.coverSubtitle}>The Ultimate Creative Hub</Text>
                  <Text style={styles.coverTagline}>for Broadcast Production</Text>
                  <View style={styles.coverDecoration}>
                    <BookOpen size={40} color="#3b82f6" />
                  </View>
                  <Text style={styles.coverDescription}>
                    Complete guide to broadcast efficiency and creativity
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Right Page with Simple Animation */}
          <Animated.View 
            style={[
              styles.rightPage,
              {
                opacity: fadeAnim,
                transform: [{ translateX: slideAnim }]
              }
            ]}
          >
            <ScrollView style={styles.pageScroll} showsVerticalScrollIndicator={false}>
              <View style={styles.pageContent}>
                <Text style={styles.pageTitle}>{currentPageData.title}</Text>
                <View style={styles.contentArea}>
                  {formatContent(currentPageData.content)}
                </View>
                <Text style={styles.pageNumber}>{currentPage + 1}</Text>
              </View>
            </ScrollView>
          </Animated.View>
        </View>
      </View>

      {/* Navigation Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.navButton, currentPage === 0 && styles.navButtonDisabled]}
          onPress={() => handlePageTurn('prev')}
          disabled={currentPage === 0 || isFlipping}
        >
          <ChevronLeft size={24} color={currentPage === 0 ? "#64748b" : "#ffffff"} />
          <Text style={[styles.navButtonText, currentPage === 0 && styles.navButtonTextDisabled]}>
            Previous
          </Text>
        </TouchableOpacity>

        <View style={styles.centerInfo}>
          <Text style={styles.currentModule}>
            Page {currentPage + 1} of {pages.length}
          </Text>
          <Text style={styles.moduleTitle}>
            {currentPageData.title.length > 30 
              ? currentPageData.title.substring(0, 30) + '...' 
              : currentPageData.title}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.navButton, currentPage === pages.length - 1 && styles.navButtonDisabled]}
          onPress={() => handlePageTurn('next')}
          disabled={currentPage === pages.length - 1 || isFlipping}
        >
          <Text style={[styles.navButtonText, currentPage === pages.length - 1 && styles.navButtonTextDisabled]}>
            Next
          </Text>
          <ChevronRight size={24} color={currentPage === pages.length - 1 ? "#64748b" : "#ffffff"} />
        </TouchableOpacity>
      </View>

      {/* Page Thumbnails */}
      <View style={styles.thumbnailStrip}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbnailScroll}>
          {pages.map((page, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.thumbnail,
                index === currentPage && styles.thumbnailActive
              ]}
              onPress={() => {
                if (!isFlipping && index !== currentPage) {
                  setCurrentPage(index);
                  if (soundEnabled) {
                    soundManager.playClickSound();
                  }
                }
              }}
            >
              <Text style={[
                styles.thumbnailText,
                index === currentPage && styles.thumbnailTextActive
              ]}>
                {index + 1}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  closeButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginLeft: 8,
  },
  soundButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  bookWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  bookContainer: {
    width: BOOK_WIDTH,
    height: BOOK_HEIGHT,
    flexDirection: 'row',
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
  leftPage: {
    width: PAGE_WIDTH,
    height: '100%',
    backgroundColor: '#fafafa',
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
  },
  rightPage: {
    width: PAGE_WIDTH,
    height: '100%',
    backgroundColor: '#fafafa',
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  coverPage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#1e293b',
  },
  coverContent: {
    alignItems: 'center',
  },
  coverTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  coverSubtitle: {
    fontSize: 18,
    color: '#3b82f6',
    marginBottom: 4,
    textAlign: 'center',
    fontWeight: '600',
  },
  coverTagline: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 30,
  },
  coverDecoration: {
    marginBottom: 30,
  },
  coverDescription: {
    fontSize: 12,
    color: '#cbd5e1',
    textAlign: 'center',
    lineHeight: 18,
  },
  pageScroll: {
    flex: 1,
  },
  pageContent: {
    padding: 24,
    minHeight: '100%',
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 20,
    lineHeight: 28,
  },
  contentArea: {
    flex: 1,
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginTop: 16,
    marginBottom: 8,
    lineHeight: 22,
  },
  paragraphText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 12,
    textAlign: 'justify',
  },
  spacer: {
    height: 8,
  },
  pageNumber: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#1a1a1a',
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 100,
  },
  navButtonDisabled: {
    backgroundColor: '#374151',
    opacity: 0.6,
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginHorizontal: 4,
  },
  navButtonTextDisabled: {
    color: '#64748b',
  },
  centerInfo: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 16,
  },
  currentModule: {
    fontSize: 16,
    color: '#cbd5e1',
    fontWeight: '600',
  },
  moduleTitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
    textAlign: 'center',
  },
  thumbnailStrip: {
    backgroundColor: '#1a1a1a',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  thumbnailScroll: {
    paddingHorizontal: 20,
  },
  thumbnail: {
    width: 40,
    height: 40,
    borderRadius: 6,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbnailActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#60a5fa',
  },
  thumbnailText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#cbd5e1',
  },
  thumbnailTextActive: {
    color: '#ffffff',
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