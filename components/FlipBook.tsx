import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Dimensions } from 'react-native';
import { ChevronLeft, ChevronRight, Volume2, VolumeX, X } from 'lucide-react-native';
import SoundManager from '../utils/soundManager';

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

export function FlipBook({ pages, onClose }: FlipBookProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  const soundManager = SoundManager.getInstance();
  const flipAnimation = useRef(new Animated.Value(0)).current;

  const totalPages = pages.length;

  const flipToNext = () => {
    if (isFlipping || currentPage >= totalPages - 1) return;
    
    setIsFlipping(true);
    
    if (soundEnabled) {
      soundManager.playClickSound();
    }

    Animated.timing(flipAnimation, {
      toValue: 1,
      duration: 600,
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
      duration: 600,
      useNativeDriver: true,
    }).start(() => {
      setCurrentPage(currentPage - 1);
      flipAnimation.setValue(0);
      setIsFlipping(false);
    });
  };

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
  };

  const renderPage = (page: FlipBookPage | null, pageNumber?: string) => {
    if (!page) {
      return (
        <View style={styles.page}>
          <Text style={styles.emptyPageText}>End of Book</Text>
          {pageNumber && <Text style={styles.pageNumber}>{pageNumber}</Text>}
        </View>
      );
    }

    return (
      <View style={styles.page}>
        <Text style={styles.pageTitle}>{page.title}</Text>
        <Text style={styles.pageContent}>{page.content}</Text>
        <Text style={styles.pageNumber}>{page.pageNumber}</Text>
      </View>
    );
  };

  // Simple slide animation instead of complex 3D
  const slideTransform = flipAnimation.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [screenWidth * 0.4, 0, -screenWidth * 0.4],
  });

  const opacity = flipAnimation.interpolate({
    inputRange: [-1, -0.5, 0, 0.5, 1],
    outputRange: [0, 0.5, 1, 0.5, 0],
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>EVS Knowledge Flipbook</Text>
        <View style={styles.headerControls}>
          <Pressable onPress={toggleSound} style={styles.soundButton}>
            {soundEnabled ? (
              <Volume2 size={24} color="#666" />
            ) : (
              <VolumeX size={24} color="#666" />
            )}
          </Pressable>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <X size={24} color="#666" />
          </Pressable>
        </View>
      </View>

      {/* Book Container */}
      <View style={styles.bookContainer}>
        <View style={styles.book}>
          {/* Current Page */}
          <Animated.View 
            style={[
              styles.pageContainer,
              {
                transform: [{ translateX: slideTransform }],
                opacity: opacity,
              }
            ]}
          >
            {renderPage(pages[currentPage])}
          </Animated.View>

          {/* Next/Previous Page (underneath) */}
          {isFlipping && (
            <View style={[styles.pageContainer, styles.backgroundPage]}>
              {flipAnimation._value > 0 
                ? renderPage(pages[currentPage + 1])
                : renderPage(pages[currentPage - 1])
              }
            </View>
          )}
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

        <View style={styles.pageInfo}>
          <Text style={styles.pageInfoText}>
            Page {currentPage + 1} of {totalPages}
          </Text>
        </View>

        <Pressable
          onPress={flipToNext}
          style={[styles.navButton, currentPage >= totalPages - 1 && styles.navButtonDisabled]}
          disabled={currentPage >= totalPages - 1 || isFlipping}
        >
          <Text style={[styles.navText, currentPage >= totalPages - 1 && styles.navTextDisabled]}>
            Next
          </Text>
          <ChevronRight size={24} color={currentPage >= totalPages - 1 ? "#ccc" : "#666"} />
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
    paddingTop: 60,
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
  headerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  soundButton: {
    padding: 8,
  },
  closeButton: {
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
    height: Math.min(screenHeight * 0.65, 500),
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  pageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backgroundPage: {
    zIndex: 1,
  },
  page: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
    justifyContent: 'flex-start',
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 30,
  },
  pageContent: {
    fontSize: 16,
    lineHeight: 24,
    color: '#555',
    textAlign: 'justify',
    flex: 1,
  },
  pageNumber: {
    position: 'absolute',
    bottom: 16,
    right: 24,
    fontSize: 14,
    color: '#999',
  },
  emptyPageText: {
    fontSize: 18,
    color: '#999',
    textAlign: 'center',
    marginTop: 100,
    fontStyle: 'italic',
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 32,
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
    minWidth: 100,
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
  pageInfo: {
    alignItems: 'center',
  },
  pageInfoText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
});