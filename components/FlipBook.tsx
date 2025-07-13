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
const BOOK_WIDTH = Math.min(screenWidth * 0.95, 900); // 9" x 6" ratio
const BOOK_HEIGHT = Math.min(screenHeight * 0.8, 600);
const PAGE_WIDTH = BOOK_WIDTH / 2;
const PAGE_THICKNESS = 0.8; // Simulated page thickness

export function FlipBook({ pages, onClose }: FlipBookProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  
  const soundManager = SoundManager.getInstance();
  
  // Enhanced 3D Animation Values
  const flipProgress = useRef(new Animated.Value(0)).current;
  const pageRotateY = useRef(new Animated.Value(0)).current;
  const pageDeformation = useRef(new Animated.Value(0)).current;
  const cornerCurl = useRef(new Animated.Value(0)).current;
  const shadowIntensity = useRef(new Animated.Value(0)).current;
  const pageElevation = useRef(new Animated.Value(0)).current;
  const spineMovement = useRef(new Animated.Value(0)).current;
  const ambientFloat = useRef(new Animated.Value(0)).current;
  const lightingAngle = useRef(new Animated.Value(0)).current;
  const pageSettling = useRef(new Animated.Value(0)).current;
  
  // Interactive hover effects
  const cornerHover = useRef(new Animated.Value(0)).current;
  const pageGlow = useRef(new Animated.Value(0)).current;

  console.log('FlipBook - Component loaded with pages:', pages.length);

  // Ambient floating animation for static book
  useEffect(() => {
    const ambientAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(ambientFloat, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        }),
        Animated.timing(ambientFloat, {
          toValue: 0,
          duration: 4000,
          useNativeDriver: true,
        }),
      ])
    );
    ambientAnimation.start();
    return () => ambientAnimation.stop();
  }, []);

  // Enhanced Pan Responder for realistic page dragging
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: (evt, gestureState) => {
      const touchX = evt.nativeEvent.locationX;
      const isRightEdge = touchX > PAGE_WIDTH * 0.85;
      const isLeftEdge = touchX < PAGE_WIDTH * 0.15;
      return (isRightEdge || isLeftEdge) && !isFlipping;
    },
    
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      return Math.abs(gestureState.dx) > 8;
    },
    
    onPanResponderGrant: (evt, gestureState) => {
      setDragStartX(evt.nativeEvent.locationX);
      setIsDragging(true);
      
      // Enhanced corner hover effect
      Animated.parallel([
        Animated.timing(cornerHover, {
          toValue: 1,
          duration: 150,
          useNativeDriver: false,
        }),
        Animated.timing(pageGlow, {
          toValue: 1,
          duration: 150,
          useNativeDriver: false,
        }),
      ]).start();
    },
    
    onPanResponderMove: (evt, gestureState) => {
      if (!isDragging || isFlipping) return;
      
      const progress = Math.abs(gestureState.dx) / (PAGE_WIDTH * 0.6);
      const clampedProgress = Math.min(Math.max(progress, 0), 1);
      
      // Real-time 3D deformation during drag
      flipProgress.setValue(clampedProgress);
      pageRotateY.setValue(clampedProgress * -45); // 45-degree max angle
      pageDeformation.setValue(clampedProgress * 0.2); // 20% curvature
      cornerCurl.setValue(clampedProgress * 0.15); // 15% curl intensity
      shadowIntensity.setValue(clampedProgress * 0.4); // 40% shadow opacity
      pageElevation.setValue(clampedProgress * 12);
      lightingAngle.setValue(clampedProgress * 45); // 45-degree lighting
    },
    
    onPanResponderRelease: (evt, gestureState) => {
      setIsDragging(false);
      
      const shouldFlip = Math.abs(gestureState.dx) > PAGE_WIDTH * 0.25;
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
      
      // End hover effects
      Animated.parallel([
        Animated.timing(cornerHover, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }),
        Animated.timing(pageGlow, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }),
      ]).start();
    },
  });

  const resetPageAnimation = () => {
    Animated.parallel([
      Animated.timing(flipProgress, {
        toValue: 0,
        duration: 400,
        useNativeDriver: false,
      }),
      Animated.timing(pageRotateY, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(pageDeformation, {
        toValue: 0,
        duration: 400,
        useNativeDriver: false,
      }),
      Animated.timing(cornerCurl, {
        toValue: 0,
        duration: 400,
        useNativeDriver: false,
      }),
      Animated.timing(shadowIntensity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: false,
      }),
      Animated.timing(pageElevation, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePageTurn = (direction: 'next' | 'prev') => {
    if (isFlipping) return;
    
    console.log('FlipBook - Page turn:', direction, 'current page:', currentPage);
    setIsFlipping(true);
    
    // Play realistic page turn sound
    if (soundEnabled) {
      soundManager.playClickSound();
    }
    
    // Enhanced 3D page flip animation sequence (0.6 seconds total)
    Animated.sequence([
      // Phase 1: Page lift and initial curl (0.1s)
      Animated.parallel([
        Animated.timing(pageElevation, {
          toValue: 20,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shadowIntensity, {
          toValue: 0.5,
          duration: 100,
          useNativeDriver: false,
        }),
        Animated.timing(spineMovement, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(cornerCurl, {
          toValue: 0.12,
          duration: 100,
          useNativeDriver: false,
        }),
      ]),
      
      // Phase 2: Main flip with deformation (0.4s)
      Animated.parallel([
        Animated.timing(flipProgress, {
          toValue: 1,
          duration: 400,
          useNativeDriver: false,
        }),
        Animated.timing(pageRotateY, {
          toValue: direction === 'next' ? -180 : 180,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(pageDeformation, {
          toValue: 0.18, // 18% peak curvature
          duration: 200,
          useNativeDriver: false,
        }),
        Animated.timing(lightingAngle, {
          toValue: 45,
          duration: 400,
          useNativeDriver: false,
        }),
      ]),
      
      // Phase 3: Page settling (0.1s)
      Animated.parallel([
        Animated.timing(pageElevation, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shadowIntensity, {
          toValue: 0,
          duration: 100,
          useNativeDriver: false,
        }),
        Animated.timing(spineMovement, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(pageDeformation, {
          toValue: 0,
          duration: 100,
          useNativeDriver: false,
        }),
        Animated.timing(cornerCurl, {
          toValue: 0,
          duration: 100,
          useNativeDriver: false,
        }),
        Animated.timing(pageSettling, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
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
      pageDeformation.setValue(0);
      cornerCurl.setValue(0);
      lightingAngle.setValue(0);
      pageSettling.setValue(0);
      setIsFlipping(false);
    });
  };

  const formatContent = (content: string) => {
    if (!content) {
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
      {/* Enhanced Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Home size={24} color="#ffffff" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <BookOpen size={24} color="#3b82f6" />
          <Text style={styles.headerTitle}>IPDirector: Creative Hub</Text>
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

      {/* 3D Book Container with Ambient Animation */}
      <View style={styles.bookWrapper}>
        <Animated.View style={[
          styles.bookContainer,
          {
            transform: [
              { 
                translateY: ambientFloat.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -3],
                })
              },
              { 
                rotateX: ambientFloat.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '1deg'],
                })
              },
            ]
          }
        ]}>
          
          {/* Enhanced Book Spine with Movement */}
          <Animated.View style={[
            styles.bookSpine,
            {
              transform: [
                { 
                  translateX: spineMovement.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -2],
                  })
                }
              ],
              shadowOpacity: spineMovement.interpolate({
                inputRange: [0, 1],
                outputRange: [0.3, 0.7],
              }),
            }
          ]}>
            <Text style={styles.spineText}>IPDirector</Text>
            <View style={styles.spineDecoration} />
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
                <View style={styles.coverHeader}>
                  <Text style={styles.coverTitle}>IPDirector</Text>
                  <Text style={styles.coverSubtitle}>The Ultimate Creative Hub</Text>
                  <Text style={styles.coverTagline}>for Broadcast Production</Text>
                </View>
                <View style={styles.coverDecoration}>
                  <View style={styles.decorativeLine} />
                  <BookOpen size={40} color="#3b82f6" />
                  <View style={styles.decorativeLine} />
                </View>
                <Text style={styles.coverDescription}>
                  Redefining efficiency, creativity, and control in broadcast operations
                </Text>
              </View>
            )}
          </View>

          {/* Right Page with Enhanced 3D Animation */}
          <Animated.View 
            style={[
              styles.rightPage,
              {
                transform: [
                  { perspective: 1200 },
                  { 
                    rotateY: pageRotateY.interpolate({
                      inputRange: [-180, 0, 180],
                      outputRange: ['-180deg', '0deg', '180deg'],
                    })
                  },
                  { 
                    translateZ: pageElevation.interpolate({
                      inputRange: [0, 20],
                      outputRange: [0, 20],
                    })
                  },
                  { 
                    scaleX: pageDeformation.interpolate({
                      inputRange: [0, 0.2],
                      outputRange: [1, 0.95],
                    })
                  },
                  { 
                    skewY: pageDeformation.interpolate({
                      inputRange: [0, 0.2],
                      outputRange: ['0deg', '2deg'],
                    })
                  },
                ],
                shadowOpacity: shadowIntensity,
                shadowOffset: {
                  width: shadowIntensity.interpolate({
                    inputRange: [0, 0.4],
                    outputRange: [2, 15],
                  }),
                  height: shadowIntensity.interpolate({
                    inputRange: [0, 0.4],
                    outputRange: [2, 20],
                  }),
                },
                shadowRadius: shadowIntensity.interpolate({
                  inputRange: [0, 0.4],
                  outputRange: [4, 25],
                }),
              }
            ]}
            {...panResponder.panHandlers}
          >
            {/* Enhanced Page Curl Effect */}
            <Animated.View style={[
              styles.pageCurl,
              {
                opacity: cornerCurl.interpolate({
                  inputRange: [0, 0.15],
                  outputRange: [0, 0.4],
                }),
                transform: [
                  { 
                    scale: cornerCurl.interpolate({
                      inputRange: [0, 0.15],
                      outputRange: [0.8, 1.2],
                    })
                  },
                  { 
                    rotate: cornerCurl.interpolate({
                      inputRange: [0, 0.15],
                      outputRange: ['0deg', '15deg'],
                    })
                  },
                ],
              }
            ]} />

            {/* Interactive Corner Indicators */}
            <Animated.View style={[
              styles.cornerIndicatorLeft,
              {
                opacity: cornerHover.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.6],
                }),
                transform: [
                  { 
                    scale: cornerHover.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.5, 1.2],
                    })
                  }
                ],
              }
            ]} />
            
            <Animated.View style={[
              styles.cornerIndicatorRight,
              {
                opacity: cornerHover.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.6],
                }),
                transform: [
                  { 
                    scale: cornerHover.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.5, 1.2],
                    })
                  }
                ],
              }
            ]} />

            {/* Page Glow Effect */}
            <Animated.View style={[
              styles.pageGlow,
              {
                opacity: pageGlow.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.1],
                }),
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

            {/* Enhanced Paper Texture with Lighting */}
            <Animated.View style={[
              styles.paperTexture,
              {
                opacity: lightingAngle.interpolate({
                  inputRange: [0, 45],
                  outputRange: [0.02, 0.08],
                }),
              }
            ]} />
          </Animated.View>

          {/* Enhanced Page Edges with Thickness */}
          <View style={styles.pageEdges}>
            {Array.from({ length: Math.min(pages.length, 25) }, (_, i) => (
              <View 
                key={i} 
                style={[
                  styles.pageEdge,
                  { 
                    right: i * PAGE_THICKNESS,
                    opacity: i < currentPage ? 0.4 : 0.8,
                    backgroundColor: i < currentPage ? '#e5e7eb' : '#f3f4f6',
                  }
                ]} 
              />
            ))}
          </View>
        </Animated.View>
      </View>

      {/* Enhanced Navigation Controls */}
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

      {/* Enhanced Page Thumbnails */}
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
              {index === currentPage && (
                <View style={styles.thumbnailIndicator} />
              )}
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
    elevation: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.6,
    shadowRadius: 30,
    position: 'relative',
  },
  bookSpine: {
    width: 24,
    height: '100%',
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: { width: -2, height: 0 },
    shadowRadius: 12,
    elevation: 8,
    borderRightWidth: 1,
    borderRightColor: '#333',
  },
  spineText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
    transform: [{ rotate: '-90deg' }],
    letterSpacing: 1,
  },
  spineDecoration: {
    width: 2,
    height: 40,
    backgroundColor: '#3b82f6',
    marginTop: 20,
    borderRadius: 1,
  },
  leftPage: {
    width: PAGE_WIDTH - 12,
    height: '100%',
    backgroundColor: '#fafafa',
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
  },
  rightPage: {
    width: PAGE_WIDTH - 12,
    height: '100%',
    backgroundColor: '#fafafa',
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    shadowColor: '#000',
    shadowRadius: 20,
    elevation: 15,
    position: 'relative',
    overflow: 'hidden',
  },
  pageCurl: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 60,
    height: 60,
    backgroundColor: 'rgba(0,0,0,0.15)',
    borderBottomLeftRadius: 60,
    zIndex: 5,
  },
  cornerIndicatorLeft: {
    position: 'absolute',
    top: 15,
    left: 15,
    width: 25,
    height: 25,
    backgroundColor: 'rgba(59, 130, 246, 0.4)',
    borderRadius: 12,
    zIndex: 10,
  },
  cornerIndicatorRight: {
    position: 'absolute',
    top: 15,
    right: 15,
    width: 25,
    height: 25,
    backgroundColor: 'rgba(59, 130, 246, 0.4)',
    borderRadius: 12,
    zIndex: 10,
  },
  pageGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#3b82f6',
    zIndex: 1,
  },
  paperTexture: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.05)',
    opacity: 0.8,
    zIndex: 2,
  },
  pageEdges: {
    position: 'absolute',
    top: 2,
    right: -15,
    bottom: 2,
    width: 25,
  },
  pageEdge: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: PAGE_THICKNESS,
    borderRadius: 0.5,
    borderWidth: 0.2,
    borderColor: '#d1d5db',
  },
  coverPage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#1e293b',
  },
  coverHeader: {
    alignItems: 'center',
    marginBottom: 40,
  },
  coverTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 2,
  },
  coverSubtitle: {
    fontSize: 20,
    color: '#3b82f6',
    marginBottom: 4,
    textAlign: 'center',
    fontWeight: '600',
  },
  coverTagline: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  coverDecoration: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
    gap: 20,
  },
  decorativeLine: {
    width: 60,
    height: 2,
    backgroundColor: '#3b82f6',
    borderRadius: 1,
  },
  coverDescription: {
    fontSize: 14,
    color: '#cbd5e1',
    textAlign: 'center',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  pageScroll: {
    flex: 1,
  },
  pageContent: {
    padding: 28,
    paddingHorizontal: 36,
    minHeight: '100%',
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 24,
    lineHeight: 30,
    borderBottomWidth: 2,
    borderBottomColor: '#3b82f6',
    paddingBottom: 16,
  },
  contentArea: {
    flex: 1,
    marginBottom: 32,
  },
  paragraphText: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 24,
    marginBottom: 16,
    textAlign: 'justify',
  },
  bulletPoint: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingLeft: 12,
  },
  bullet: {
    fontSize: 15,
    color: '#3b82f6',
    marginRight: 16,
    fontWeight: 'bold',
    minWidth: 20,
  },
  bulletText: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
    flex: 1,
  },
  spacer: {
    height: 12,
  },
  pageNumber: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 16,
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
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 10,
    minWidth: 120,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  navButtonDisabled: {
    backgroundColor: '#374151',
    opacity: 0.6,
    shadowOpacity: 0,
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginHorizontal: 6,
  },
  navButtonTextDisabled: {
    color: '#64748b',
  },
  centerInfo: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 20,
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
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  thumbnailActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#60a5fa',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 4,
  },
  thumbnailText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#cbd5e1',
  },
  thumbnailTextActive: {
    color: '#ffffff',
  },
  thumbnailIndicator: {
    position: 'absolute',
    bottom: -2,
    left: '50%',
    marginLeft: -3,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#60a5fa',
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