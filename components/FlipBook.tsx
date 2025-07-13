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
  const shadowAnimation = useRef(new Animated.Value(0)).current;

  const totalPages = pages.length;

  const flipToNext = () => {
    if (isFlipping || currentPage >= totalPages - 1) return;
    
    setIsFlipping(true);
    
    if (soundEnabled) {
      soundManager.playClickSound();
    }

    // Animate the page flip and shadow
    Animated.parallel([
      Animated.timing(flipAnimation, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(shadowAnimation, {
        toValue: 1,
        duration: 800,
        useNativeDriver: false,
      })
    ]).start(() => {
      setCurrentPage(currentPage + 1);
      flipAnimation.setValue(0);
      shadowAnimation.setValue(0);
      setIsFlipping(false);
    });
  };

  const flipToPrevious = () => {
    if (isFlipping || currentPage <= 0) return;
    
    setIsFlipping(true);
    
    if (soundEnabled) {
      soundManager.playClickSound();
    }

    // Animate the page flip and shadow
    Animated.parallel([
      Animated.timing(flipAnimation, {
        toValue: -1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(shadowAnimation, {
        toValue: 1,
        duration: 800,
        useNativeDriver: false,
      })
    ]).start(() => {
      setCurrentPage(currentPage - 1);
      flipAnimation.setValue(0);
      shadowAnimation.setValue(0);
      setIsFlipping(false);
    });
  };

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
  };

  const renderPage = (page: FlipBookPage | null, isLeft: boolean = false) => {
    if (!page) {
      return (
        <View style={[styles.page, isLeft ? styles.leftPage : styles.rightPage]}>
          <Text style={styles.emptyPageText}>End of Book</Text>
        </View>
      );
    }

    return (
      <View style={[styles.page, isLeft ? styles.leftPage : styles.rightPage]}>
        <Text style={styles.pageTitle}>{page.title}</Text>
        <Text style={styles.pageContent}>{page.content}</Text>
        <Text style={styles.pageNumber}>{page.pageNumber}</Text>
      </View>
    );
  };

  // Calculate the current left and right pages
  const leftPage = currentPage > 0 ? pages[currentPage - 1] : null;
  const rightPage = pages[currentPage];
  const nextPage = currentPage < totalPages - 1 ? pages[currentPage + 1] : null;
  const prevPage = currentPage > 1 ? pages[currentPage - 2] : null;

  // Animation transforms for realistic page turning
  const pageRotateY = flipAnimation.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['0deg', '0deg', '-180deg'],
  });

  const pageTranslateX = flipAnimation.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [0, 0, 0],
  });

  const pageScale = flipAnimation.interpolate({
    inputRange: [-1, -0.5, 0, 0.5, 1],
    outputRange: [1, 0.95, 1, 0.95, 1],
  });

  // Shadow opacity for depth effect
  const shadowOpacity = shadowAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.3, 0],
  });

  // Page curl effect
  const curlTransform = flipAnimation.interpolate({
    inputRange: [0, 0.3, 0.7, 1],
    outputRange: [0, 15, 45, 0],
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
          {/* Book Spine */}
          <View style={styles.spine} />
          
          {/* Left Page (Static) */}
          <View style={styles.leftPageContainer}>
            {renderPage(leftPage, true)}
          </View>

          {/* Right Page (Static - underneath) */}
          <View style={styles.rightPageContainer}>
            {renderPage(isFlipping && flipAnimation._value > 0 ? nextPage : rightPage, false)}
          </View>

          {/* Flipping Page (Animated) */}
          {isFlipping && (
            <Animated.View
              style={[
                styles.flippingPage,
                {
                  transform: [
                    { perspective: 1000 },
                    { rotateY: pageRotateY },
                    { translateX: pageTranslateX },
                    { scale: pageScale },
                  ],
                  zIndex: 10,
                }
              ]}
            >
              {/* Front of flipping page */}
              <View style={[styles.page, styles.rightPage, { backfaceVisibility: 'hidden' }]}>
                {flipAnimation._value > 0 ? renderPage(rightPage, false) : renderPage(leftPage, true)}
              </View>
              
              {/* Back of flipping page */}
              <View style={[
                styles.page, 
                styles.leftPage, 
                { 
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backfaceVisibility: 'hidden',
                  transform: [{ rotateY: '180deg' }]
                }
              ]}>
                {flipAnimation._value > 0 ? renderPage(nextPage, false) : renderPage(prevPage, true)}
              </View>

              {/* Page curl shadow */}
              <Animated.View
                style={[
                  styles.pageCurl,
                  {
                    opacity: shadowOpacity,
                    transform: [{ rotate: `${curlTransform}deg` }],
                  }
                ]}
              />
            </Animated.View>
          )}

          {/* Book shadow */}
          <Animated.View
            style={[
              styles.bookShadow,
              {
                opacity: shadowOpacity,
              }
            ]}
          />
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
    width: Math.min(screenWidth - 40, 700),
    height: Math.min(screenHeight * 0.65, 500),
    flexDirection: 'row',
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
  spine: {
    width: 4,
    backgroundColor: '#d0d0d0',
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '50%',
    marginLeft: -2,
    zIndex: 5,
  },
  leftPageContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  rightPageContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  flippingPage: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '50%',
    height: '100%',
    backgroundColor: '#fff',
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
  pageTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 28,
  },
  pageContent: {
    fontSize: 14,
    lineHeight: 22,
    color: '#555',
    textAlign: 'justify',
    flex: 1,
  },
  pageNumber: {
    position: 'absolute',
    bottom: 16,
    right: 24,
    fontSize: 12,
    color: '#999',
  },
  emptyPageText: {
    fontSize: 18,
    color: '#999',
    textAlign: 'center',
    marginTop: 100,
    fontStyle: 'italic',
  },
  pageCurl: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 20,
    height: 20,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderBottomLeftRadius: 20,
  },
  bookShadow: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '50%',
    width: 20,
    backgroundColor: 'rgba(0,0,0,0.1)',
    zIndex: 1,
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