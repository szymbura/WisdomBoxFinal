import React, { useState, useRef, useEffect } from 'react';
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
  const [pageWidth, setPageWidth] = useState(0);
  const [turningPageFrontContent, setTurningPageFrontContent] = useState<FlipBookPage | null>(null);
  const [turningPageBackContent, setTurningPageBackContent] = useState<FlipBookPage | null>(null);
  const [isFlippingForward, setIsFlippingForward] = useState(true);
  
  const soundManager = SoundManager.getInstance();
  const flipAnimation = useRef(new Animated.Value(0)).current;

  const totalPages = pages.length;
  const leftPageIndex = currentPage;
  const rightPageIndex = currentPage + 1;

  const flipToNext = () => {
    if (isFlipping || rightPageIndex >= totalPages) return;
    
    setIsFlipping(true);
    setIsFlippingForward(true);
    
    // Set content for turning page
    setTurningPageFrontContent(pages[rightPageIndex]);
    setTurningPageBackContent(pages[rightPageIndex + 1] || null);
    
    if (soundEnabled) {
      soundManager.playClickSound();
    }

    Animated.timing(flipAnimation, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start(() => {
      setCurrentPage(currentPage + 1);
      flipAnimation.setValue(0);
      setIsFlipping(false);
      setTurningPageFrontContent(null);
      setTurningPageBackContent(null);
    });
  };

  const flipToPrevious = () => {
    if (isFlipping || currentPage <= 0) return;
    
    setIsFlipping(true);
    setIsFlippingForward(false);
    
    // Set content for turning page (going backwards)
    setTurningPageFrontContent(pages[leftPageIndex]);
    setTurningPageBackContent(pages[leftPageIndex - 1] || null);
    
    if (soundEnabled) {
      soundManager.playClickSound();
    }

    Animated.timing(flipAnimation, {
      toValue: -1,
      duration: 800,
      useNativeDriver: true,
    }).start(() => {
      setCurrentPage(currentPage - 1);
      flipAnimation.setValue(0);
      setIsFlipping(false);
      setTurningPageFrontContent(null);
      setTurningPageBackContent(null);
    });
  };

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
  };

  // Animation interpolations for realistic page turning
  const turningPageRotateY = flipAnimation.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-180deg', '0deg', '180deg'],
  });

  // Transform origin simulation (rotate from left edge)
  const turningPageTranslateX = flipAnimation.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [pageWidth / 2, 0, -pageWidth / 2],
  });

  const shadowOpacity = flipAnimation.interpolate({
    inputRange: [-1, -0.5, 0, 0.5, 1],
    outputRange: [0.3, 0.1, 0, 0.1, 0.3],
  });

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
        <Text style={styles.pageContent} numberOfLines={15}>
          {page.content}
        </Text>
        <Text style={styles.pageNumber}>{page.pageNumber}</Text>
      </View>
    );
  };

  const handlePageLayout = (event: any) => {
    const { width } = event.nativeEvent.layout;
    setPageWidth(width);
  };

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
          {/* Spine */}
          <View style={styles.spine} />
          
          {/* Left Page */}
          <View style={styles.leftPageContainer}>
            {renderPage(pages[leftPageIndex], true)}
          </View>

          {/* Right Page Container */}
          <View style={styles.rightPageContainer} onLayout={handlePageLayout}>
            {/* Static Right Page (underneath) */}
            <View style={styles.staticRightPage}>
              {isFlipping && isFlippingForward 
                ? renderPage(pages[rightPageIndex + 1])
                : isFlipping && !isFlippingForward
                ? renderPage(pages[leftPageIndex - 1])
                : renderPage(pages[rightPageIndex])
              }
            </View>

            {/* Animated Turning Page */}
            {isFlipping && (
              <Animated.View
                style={[
                  styles.animatedTurningPage,
                  {
                    transform: [
                      { perspective: 1200 },
                      { translateX: turningPageTranslateX },
                      { rotateY: turningPageRotateY },
                      { translateX: flipAnimation.interpolate({
                          inputRange: [-1, 0, 1],
                          outputRange: [-pageWidth / 2, 0, pageWidth / 2],
                        })
                      },
                    ],
                  },
                ]}
              >
                {/* Front Face */}
                <View style={styles.pageFront}>
                  {renderPage(turningPageFrontContent)}
                </View>

                {/* Back Face */}
                <View style={styles.pageBack}>
                  {renderPage(turningPageBackContent)}
                </View>
              </Animated.View>
            )}

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

        <View style={styles.pageInfo}>
          <Text style={styles.pageInfoText}>
            Page {currentPage + 1} of {totalPages}
          </Text>
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
  staticRightPage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    zIndex: 1,
  },
  animatedTurningPage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 5,
  },
  pageFront: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    backfaceVisibility: 'hidden',
  },
  pageBack: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    backfaceVisibility: 'hidden',
    transform: [{ rotateY: '180deg' }],
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
  shadowOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000',
    zIndex: 3,
  },
  pageTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
    lineHeight: 24,
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
    fontSize: 16,
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