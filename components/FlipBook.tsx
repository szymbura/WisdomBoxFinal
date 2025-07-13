import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Dimensions } from 'react-native';
import { ChevronLeft, ChevronRight, Volume2, VolumeX } from 'lucide-react-native';
import SoundManager from '../utils/soundManager';

interface FlipBookProps {
  pages: Array<{
    id: string;
    title: string;
    content: string;
    image?: string;
  }>;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export function FlipBook({ pages }: FlipBookProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const soundManager = SoundManager.getInstance();
  const flipAnimation = useRef(new Animated.Value(0)).current;

  const totalPages = pages.length;
  const leftPageIndex = currentPage;
  const rightPageIndex = currentPage + 1;

  const flipToNext = () => {
    if (isFlipping || rightPageIndex >= totalPages) return;
    
    setIsFlipping(true);
    if (soundEnabled) {
      soundManager.playClickSound();
    }

    Animated.timing(flipAnimation, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start(() => {
      setCurrentPage(currentPage + 1);
      flipAnimation.setValue(0);
      setIsFlipping(false);
    });
  };

  const flipToPrevious = () => {
    if (isFlipping || currentPage <= 0) return;
    
    setIsFlipping(true);
    if (soundEnabled) {
      soundManager.playClickSound();
    }

    Animated.timing(flipAnimation, {
      toValue: -1,
      duration: 1000,
      useNativeDriver: true,
    }).start(() => {
      setCurrentPage(currentPage - 1);
      flipAnimation.setValue(0);
      setIsFlipping(false);
    });
  };

  const goToPage = (pageIndex: number) => {
    if (isFlipping || pageIndex < 0 || pageIndex >= totalPages) return;
    setCurrentPage(pageIndex);
  };

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
  };

  // Animation interpolations
  const rightPageRotateY = flipAnimation.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['0deg', '0deg', '180deg'],
  });

  const rightPageOpacity = flipAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0, 0],
  });

  const nextPageOpacity = flipAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
  });

  const shadowOpacity = flipAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.1, 0.3, 0.1],
  });

  const renderPage = (page: any, isLeft: boolean = false) => {
    if (!page) return null;

    return (
      <View style={[styles.page, isLeft ? styles.leftPage : styles.rightPage]}>
        <Text style={styles.pageTitle}>{page.title}</Text>
        <Text style={styles.pageContent}>{page.content}</Text>
        <Text style={styles.pageNumber}>
          {isLeft ? leftPageIndex + 1 : rightPageIndex + 1}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Interactive Flipbook</Text>
        <Pressable onPress={toggleSound} style={styles.soundButton}>
          {soundEnabled ? (
            <Volume2 size={24} color="#666" />
          ) : (
            <VolumeX size={24} color="#666" />
          )}
        </Pressable>
      </View>

      {/* Book Container */}
      <View style={styles.bookContainer}>
        <View style={styles.book}>
          {/* Spine */}
          <View style={styles.spine} />
          
          {/* Left Page */}
          <View style={styles.leftPageContainer}>
            {renderPage(pages[leftPageIndex], true)}
          </View>

          {/* Right Page Container */}
          <View style={styles.rightPageContainer}>
            {/* Current Right Page */}
            <Animated.View
              style={[
                styles.animatedPage,
                {
                  transform: [
                    { perspective: 1200 },
                    { rotateY: rightPageRotateY },
                  ],
                  opacity: rightPageOpacity,
                },
              ]}
            >
              {renderPage(pages[rightPageIndex])}
            </Animated.View>

            {/* Next Page (revealed during flip) */}
            <Animated.View
              style={[
                styles.animatedPage,
                styles.nextPage,
                {
                  opacity: nextPageOpacity,
                },
              ]}
            >
              {renderPage(pages[rightPageIndex + 1])}
            </Animated.View>

            {/* Shadow overlay */}
            <Animated.View
              style={[
                styles.shadowOverlay,
                {
                  opacity: shadowOpacity,
                },
              ]}
            />
          </View>
        </View>
      </View>

      {/* Navigation */}
      <View style={styles.navigation}>
        <Pressable
          onPress={flipToPrevious}
          style={[styles.navButton, currentPage <= 0 && styles.navButtonDisabled]}
          disabled={currentPage <= 0 || isFlipping}
        >
          <ChevronLeft size={24} color={currentPage <= 0 ? "#ccc" : "#666"} />
          <Text style={[styles.navText, currentPage <= 0 && styles.navTextDisabled]}>
            Previous
          </Text>
        </Pressable>

        <View style={styles.pageIndicators}>
          {Array.from({ length: Math.ceil(totalPages / 2) }, (_, i) => (
            <Pressable
              key={i}
              onPress={() => goToPage(i * 2)}
              style={[
                styles.pageIndicator,
                Math.floor(currentPage / 2) === i && styles.pageIndicatorActive,
              ]}
            />
          ))}
        </View>

        <Pressable
          onPress={flipToNext}
          style={[styles.navButton, rightPageIndex >= totalPages && styles.navButtonDisabled]}
          disabled={rightPageIndex >= totalPages || isFlipping}
        >
          <Text style={[styles.navText, rightPageIndex >= totalPages && styles.navTextDisabled]}>
            Next
          </Text>
          <ChevronRight size={24} color={rightPageIndex >= totalPages ? "#ccc" : "#666"} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  soundButton: {
    padding: 8,
  },
  bookContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  book: {
    width: Math.min(screenWidth - 40, 600),
    height: Math.min(screenHeight * 0.6, 400),
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
    overflow: 'hidden',
  },
  spine: {
    width: 4,
    backgroundColor: '#8B4513',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
    zIndex: 10,
  },
  leftPageContainer: {
    flex: 1,
  },
  rightPageContainer: {
    flex: 1,
    position: 'relative',
  },
  page: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
    justifyContent: 'flex-start',
  },
  leftPage: {
    borderRightWidth: 1,
    borderRightColor: '#f0f0f0',
  },
  rightPage: {
    borderLeftWidth: 1,
    borderLeftColor: '#f0f0f0',
  },
  animatedPage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
  },
  nextPage: {
    zIndex: 1,
  },
  shadowOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000',
    zIndex: 5,
  },
  pageTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  pageContent: {
    fontSize: 14,
    lineHeight: 20,
    color: '#555',
    textAlign: 'justify',
  },
  pageNumber: {
    position: 'absolute',
    bottom: 16,
    right: 24,
    fontSize: 12,
    color: '#999',
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f8f8f8',
  },
  navButtonDisabled: {
    backgroundColor: '#f0f0f0',
  },
  navText: {
    fontSize: 14,
    color: '#666',
    marginHorizontal: 4,
  },
  navTextDisabled: {
    color: '#ccc',
  },
  pageIndicators: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pageIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ddd',
    marginHorizontal: 4,
  },
  pageIndicatorActive: {
    backgroundColor: '#666',
  },
});