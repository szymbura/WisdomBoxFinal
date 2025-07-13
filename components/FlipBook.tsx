import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Animated, PanResponder } from 'react-native';
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
  const [dragStartX, setDragStartX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  
  const soundManager = SoundManager.getInstance();
  
  // Animation values for realistic page flipping
  const flipProgress = useRef(new Animated.Value(0)).current;
  const pageRotateY = useRef(new Animated.Value(0)).current;
  const pageCurlX = useRef(new Animated.Value(0)).current;
  const shadowOpacity = useRef(new Animated.Value(0)).current;
  const pageElevation = useRef(new Animated.Value(0)).current;
  const cornerHover = useRef(new Animated.Value(0)).current;
  
  // Book spine and binding animations
  const spineGlow = useRef(new Animated.Value(0)).current;
  const bookScale = useRef(new Animated.Value(1)).current;

  console.log('FlipBook - Component loaded with pages:', pages.length);
  console.log('FlipBook - Pages data:', pages.map(p => ({ title: p.title, content: p.content.substring(0, 50) + '...' })));

  // Pan responder for drag-to-flip functionality
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: (evt, gestureState) => {
      const touchX = evt.nativeEvent.locationX;
      const isRightEdge = touchX > PAGE_WIDTH * 0.8;
      const isLeftEdge = touchX < PAGE_WIDTH * 0.2;
      return isRightEdge || isLeftEdge;
    },
    
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      return Math.abs(gestureState.dx) > 10;
    },
    
    onPanResponderGrant: (evt, gestureState) => {
      setDragStartX(evt.nativeEvent.locationX);
      setIsDragging(true);
      
      // Start corner hover effect
      Animated.timing(cornerHover, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }).start();
    },
    
    onPanResponderMove: (evt, gestureState) => {
      if (!isDragging) return;
      
      const progress = Math.abs(gestureState.dx) / (PAGE_WIDTH * 0.5);
      const clampedProgress = Math.min(Math.max(progress, 0), 1);
      
      // Update flip animations in real-time
      flipProgress.setValue(clampedProgress);
      pageRotateY.setValue(clampedProgress * 180);
      pageCurlX.setValue(gestureState.dx * 0.5);
      shadowOpacity.setValue(clampedProgress * 0.3);
      pageElevation.setValue(clampedProgress * 10);
    },
    
    onPanResponderRelease: (evt, gestureState) => {
      setIsDragging(false);
      
      const shouldFlip = Math.abs(gestureState.dx) > PAGE_WIDTH * 0.3;
      const isRightSwipe = gestureState.dx > 0;
      
      if (shouldFlip) {
        if (isRightSwipe && currentPage > 0) {
          handlePageTurn('prev');
        } else if (!isRightSwipe && currentPage < pages.length - 1) {
          handlePageTurn('next');
        } else {
          resetPageAnimation();
        }
      } else {
        resetPageAnimation();
      }
      
      // End corner hover effect
      Animated.timing(cornerHover, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    },
  });

  const resetPageAnimation = () => {
    Animated.parallel([
      Animated.timing(flipProgress, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(pageRotateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(pageCurlX, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(shadowOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(pageElevation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePageTurn = (direction: 'next' | 'prev') => {
    if (isFlipping) return;
    
    console.log('FlipBook - Page turn:', direction, 'current page:', currentPage);
    setIsFlipping(true);
    
    // Play page turn sound
    if (soundEnabled) {
      soundManager.playClickSound();
    }
    
    // Realistic page flip animation sequence
    Animated.sequence([
      // Page lift and curl
      Animated.parallel([
        Animated.timing(pageElevation, {
          toValue: 15,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(shadowOpacity, {
          toValue: 0.4,
          duration: 200,
          useNativeDriver: false,
        }),
        Animated.timing(spineGlow, {
          toValue: 1,
          duration: 200,
          useNativeDriver: false,
        }),
      ]),
      
      // Main flip animation
      Animated.parallel([
        Animated.timing(flipProgress, {
          toValue: 1,
          duration: 600,
          useNativeDriver: false,
        }),
        Animated.timing(pageRotateY, {
          toValue: direction === 'next' ? -180 : 180,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(pageCurlX, {
          toValue: direction === 'next' ? -PAGE_WIDTH * 0.1 : PAGE_WIDTH * 0.1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      
      // Page settle
      Animated.parallel([
        Animated.timing(pageElevation, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(shadowOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(spineGlow, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }),
      ]),
    ]).start(() => {
      // Update page and reset animations
      if (direction === 'next' && currentPage < pages.length - 1) {
        setCurrentPage(currentPage + 1);
      } else if (direction === 'prev' && currentPage > 0) {
        setCurrentPage(currentPage - 1);
      }
      
      // Reset all animation values
      flipProgress.setValue(0);
      pageRotateY.setValue(0);
      pageCurlX.setValue(0);
      setIsFlipping(false);
    });
  };

  // Book opening animation on mount
  useEffect(() => {
    Animated.sequence([
      Animated.timing(bookScale, {
        toValue: 1.05,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(bookScale, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const formatContent = (content: string) => {
    if (!content) {
      console.log('FlipBook - No content provided for formatting');
      return [<Text key="empty" style={styles.paragraphText}>No content available</Text>];
    }
    
    const lines = content.split('\n');
    return lines.map((line, index) => {
      if (line.trim().startsWith('•')) {
        return (
          <View key={index} style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>{line.trim().substring(1).trim()}</Text>
          </View>
        );
      } else if (line.trim()) {
        return (
          <Text key={index} style={styles.paragraphText}>
            {line.trim()}
          </Text>
        );
      }
      return <View key={index} style={styles.spacer} />;
    });
  };

  const currentPageData = pages[currentPage];
  
  if (!currentPageData) {
    console.log('FlipBook - No current page data available, currentPage:', currentPage, 'pages length:', pages.length);
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            No content available (Page {currentPage + 1} of {pages.length})
          </Text>
        </View>
      </View>
    );
  }

  console.log('FlipBook - Rendering page:', currentPage + 1, 'Title:', currentPageData.title);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Home size={24} color="#ffffff" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <BookOpen size={24} color="#3b82f6" />
          <Text style={styles.headerTitle}>IPDirector Digital Book</Text>
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

      {/* Book Container */}
      <View style={styles.bookWrapper}>
        <Animated.View style={[
          styles.bookContainer,
          {
            transform: [{ scale: bookScale }]
          }
        ]}>
          
          {/* Book Spine with Glow Effect */}
          <Animated.View style={[
            styles.bookSpine,
            {
              shadowOpacity: spineGlow.interpolate({
                inputRange: [0, 1],
                outputRange: [0.2, 0.6],
              }),
            }
          ]}>
            <Text style={styles.spineText}>IPDirector</Text>
          </Animated.View>

          {/* Left Page (Previous or Cover) */}
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
                <Text style={styles.coverTitle}>IPDirector</Text>
                <Text style={styles.coverSubtitle}>User Playbook</Text>
                <View style={styles.coverDecoration} />
              </View>
            )}
          </View>

          {/* Right Page with Flip Animation */}
          <Animated.View 
            style={[
              styles.rightPage,
              {
                transform: [
                  { perspective: 1000 },
                  { rotateY: pageRotateY.interpolate({
                    inputRange: [-180, 0, 180],
                    outputRange: ['-180deg', '0deg', '180deg'],
                  }) },
                  { translateX: pageCurlX },
                  { translateZ: pageElevation },
                ],
                shadowOpacity: shadowOpacity,
                shadowOffset: {
                  width: shadowOpacity.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 10],
                  }),
                  height: shadowOpacity.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 15],
                  }),
                },
              }
            ]}
            {...panResponder.panHandlers}
          >
            {/* Page Curl Effect */}
            <Animated.View style={[
              styles.pageCurl,
              {
                opacity: flipProgress.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0, 0.3, 0],
                }),
                transform: [
                  { translateX: pageCurlX },
                  { skewX: flipProgress.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '15deg'],
                  }) },
                ],
              }
            ]} />

            {/* Corner Hover Indicator */}
            <Animated.View style={[
              styles.cornerIndicator,
              {
                opacity: cornerHover,
                transform: [
                  { scale: cornerHover.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1.2],
                  }) }
                ],
              }
            ]} />

            <ScrollView style={styles.pageScroll} showsVerticalScrollIndicator={false}>
              <View style={styles.pageContent}>
                <Text style={styles.pageTitle}>{currentPageData.title}</Text>
                <View style={styles.contentArea}>
                  {formatContent(currentPageData.content)}
                </View>
                <Text style={styles.pageNumber}>{currentPage + 1}</Text>
              </View>
            </ScrollView>

            {/* Paper Texture Overlay */}
            <View style={styles.paperTexture} />
          </Animated.View>

          {/* Page Edge Thickness */}
          <View style={styles.pageEdges}>
            {Array.from({ length: Math.min(pages.length, 20) }, (_, i) => (
              <View 
                key={i} 
                style={[
                  styles.pageEdge,
                  { 
                    right: i * 0.5,
                    opacity: i < currentPage ? 0.3 : 0.7,
                  }
                ]} 
              />
            ))}
          </View>
        </Animated.View>
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
            Module {currentPageData.moduleIndex + 1}
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
    borderRadius: 8,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    position: 'relative',
  },
  bookSpine: {
    width: 20,
    height: '100%',
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 10,
    elevation: 5,
  },
  spineText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
    transform: [{ rotate: '-90deg' }],
  },
  leftPage: {
    width: PAGE_WIDTH - 10,
    height: '100%',
    backgroundColor: '#f8f9fa',
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
  rightPage: {
    width: PAGE_WIDTH - 10,
    height: '100%',
    backgroundColor: '#f8f9fa',
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    shadowColor: '#000',
    shadowRadius: 15,
    elevation: 10,
    position: 'relative',
    overflow: 'hidden',
  },
  pageCurl: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 50,
    height: 50,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderBottomLeftRadius: 50,
  },
  cornerIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 20,
    height: 20,
    backgroundColor: 'rgba(59, 130, 246, 0.3)',
    borderRadius: 10,
    zIndex: 10,
  },
  paperTexture: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.02)',
    opacity: 0.5,
  },
  pageEdges: {
    position: 'absolute',
    top: 0,
    right: -10,
    bottom: 0,
    width: 20,
  },
  pageEdge: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: '#ddd',
  },
  coverPage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#1e293b',
  },
  coverTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
    textAlign: 'center',
  },
  coverSubtitle: {
    fontSize: 18,
    color: '#3b82f6',
    marginBottom: 40,
    textAlign: 'center',
  },
  coverDecoration: {
    width: 100,
    height: 4,
    backgroundColor: '#3b82f6',
    borderRadius: 2,
  },
  pageScroll: {
    flex: 1,
  },
  pageContent: {
    padding: 24,
    paddingHorizontal: 32,
    minHeight: '100%',
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 20,
    lineHeight: 28,
    borderBottomWidth: 2,
    borderBottomColor: '#3b82f6',
    paddingBottom: 12,
  },
  contentArea: {
    flex: 1,
    marginBottom: 30,
  },
  paragraphText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 22,
    marginBottom: 12,
    textAlign: 'justify',
  },
  bulletPoint: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingLeft: 8,
  },
  bullet: {
    fontSize: 14,
    color: '#3b82f6',
    marginRight: 12,
    fontWeight: 'bold',
    minWidth: 16,
  },
  bulletText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    flex: 1,
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
    opacity: 0.5,
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
  },
  currentModule: {
    fontSize: 14,
    color: '#cbd5e1',
    fontWeight: '500',
  },
  moduleTitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
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