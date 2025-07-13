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
const BOOK_WIDTH = Math.min(screenWidth * 0.85, 700);
const BOOK_HEIGHT = Math.min(screenHeight * 0.7, 500);
const PAGE_WIDTH = BOOK_WIDTH / 2;

// IPDirector article content split into logical pages
const IPDIRECTOR_PAGES = [
  {
    title: "IPDirector: The Ultimate Creative Hub",
    content: `IPDirector, a cornerstone of the EVS suite, is a powerhouse tool that redefines efficiency, creativity, and control in broadcast operations. By seamlessly blending robust hardware with intuitive Windows-based software, it delivers a familiar and streamlined media management experience, even for those new to EVS systems.

Whether you're crafting highlight reels, managing live replays, or orchestrating complex playlists, IPDirector empowers your team to focus on storytelling, not technicalities.`
  },
  {
    title: "Intuitive Windows-Based Interface",
    content: `Unlike traditional replay or server control panels reliant on rigid "pages" and "banks," IPDirector introduces a modern, visual, and user-friendly interface designed for speed and simplicity. Key features include:

• Visual Clip Management: Thumbnails and metadata for every clip enable quick identification, previewing, and organization.

• Powerful Search Tools: A robust search bar instantly locates clips across all connected EVS servers, with advanced filtering for precision.

• Multi-Window Workflow: Work seamlessly across multiple bins, playlists, and tasks in a flexible, multi-window environment.

This intuitive design ensures operators can navigate with ease, boosting productivity in high-pressure broadcast settings.`
  },
  {
    title: "Streamlined Content Control",
    content: `IPDirector transforms media workflows by offering unparalleled flexibility in content management:

• Effortless File Operations: Ingest, export, and import files using familiar Windows-like logic, with drag-and-drop functionality between directories and servers.

• Networked Access: Instantly access and manage clips across any connected EVS server, ensuring real-time collaboration.

• Live Editing & Replays: Edit clips, create slow-motion sequences, and manage assets on the fly, keeping your production dynamic and responsive.

By centralizing these functions, IPDirector frees creative teams to prioritize storytelling over file management.`
  },
  {
    title: "Advanced Timeline Editing with IP Edit",
    content: `At the heart of IPDirector's creative power is IP Edit, a robust timeline editing tool that rivals top-tier non-linear editors while staying fully integrated with the EVS ecosystem. Key capabilities include:

• Visual Timeline: Arrange, trim, and combine clips directly on an intuitive timeline, designed for live production speed.

• Instant Previews: See edit results in real time, enabling fast decision-making in high-stakes environments.

• Drag-and-Drop Highlights: Build and refine highlight packages or full playlists with minimal effort, streamlining production workflows.`
  },
  {
    title: "Sophisticated Playlist Management",
    content: `IPDirector and IP Edit elevate playlist creation with advanced features tailored for complex productions:

• Dynamic Playlist Functions: Go beyond basic sequencing with tools for show rundowns, dynamic edits, and flexible playlist assembly.

• Virtual Elements: Incorporate placeholders, virtual clips, or dynamic elements into playlists for adaptable live production.

• Color Coding: Assign colors to clips and playlist segments to quickly identify key moments, transitions, or ad breaks.

• Breaks and Pauses: Insert breaks to control broadcast flow, ensuring seamless pacing.`
  },
  {
    title: "Advanced Playlist Features",
    content: `• Timed Playback: Schedule clips or playlists to start automatically, ideal for automated rundowns or precise playout.

• Comprehensive Editing: Use the timeline to edit individual clips or entire playlists, supporting advanced workflows like segmenting, merging, or refining highlight reels.`
  },
  {
    title: "The Heart of Live Production",
    content: `With its blend of reliable hardware and innovative software, IPDirector serves as a creative hub within the EVS server network. Whether managing hundreds of clips, assembling highlight reels on the fly, or scheduling intricate playlists, IPDirector and IP Edit deliver unmatched efficiency and intuition.

This powerful tool empowers broadcast teams to create compelling content with confidence, making it an indispensable asset for live production.`
  }
];

export function FlipBook({ pages, onClose }: FlipBookProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [pageToFlipContent, setPageToFlipContent] = useState<FlipBookPage | null>(null);
  
  const soundManager = SoundManager.getInstance();
  
  // Animation values for realistic 3D book flipping
  const flipAnim = useRef(new Animated.Value(0)).current;
  const shadowAnim = useRef(new Animated.Value(0)).current;
  const spineGlowAnim = useRef(new Animated.Value(0)).current;
  const pageElevationAnim = useRef(new Animated.Value(0)).current;
  const pageCurlAnim = useRef(new Animated.Value(0)).current;
  const overlayOpacityAnim = useRef(new Animated.Value(0)).current;
  
  // Flip direction and page tracking
  const currentFlipDirection = useRef(0); // 1 for next, -1 for previous
  const isFlippingLeftPage = useRef(false);

  // Use IPDirector pages
  const bookPages = IPDIRECTOR_PAGES.map((page, index) => ({
    ...page,
    moduleIndex: index,
    pageNumber: index + 1,
    totalPages: IPDIRECTOR_PAGES.length
  }));

  const handlePageTurn = (direction: 'next' | 'prev') => {
    if (isFlipping) return;
    
    const canTurn = direction === 'next' ? currentPage < bookPages.length - 1 : currentPage > 0;
    if (!canTurn) return;
    
    setIsFlipping(true);
    
    // Play sound
    if (soundEnabled) {
      soundManager.playClickSound();
    }
    
    // Determine flip parameters
    const newCurrentPage = direction === 'next' ? currentPage + 1 : currentPage - 1;
    currentFlipDirection.current = direction === 'next' ? 1 : -1;
    isFlippingLeftPage.current = direction === 'prev';
    
    // Set the content of the page that will be animated
    if (direction === 'next') {
      // Flipping right page forward - animate current right page content
      setPageToFlipContent(bookPages[currentPage]);
    } else {
      // Flipping left page backward - animate current left page content
      setPageToFlipContent(currentPage > 0 ? bookPages[currentPage - 1] : null);
    }
    
    // Reset all animations
    flipAnim.setValue(0);
    shadowAnim.setValue(0);
    spineGlowAnim.setValue(0);
    pageElevationAnim.setValue(0);
    pageCurlAnim.setValue(0);
    overlayOpacityAnim.setValue(1);
    
    // Realistic 3D page flip animation sequence
    Animated.parallel([
      // Main page flip with 3D rotation
      Animated.sequence([
        // Page lift
        Animated.timing(pageElevationAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        // Main flip rotation
        Animated.timing(flipAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        // Page settle
        Animated.timing(pageElevationAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
      
      // Page curl effect
      Animated.sequence([
        Animated.timing(pageCurlAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(pageCurlAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
      
      // Dynamic shadow animation
      Animated.sequence([
        Animated.timing(shadowAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(shadowAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: false,
        }),
      ]),
      
      // Spine glow effect
      Animated.sequence([
        Animated.timing(spineGlowAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: false,
        }),
        Animated.timing(spineGlowAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: false,
        }),
      ]),
      
      // Overlay fade out at the end
      Animated.sequence([
        Animated.delay(700),
        Animated.timing(overlayOpacityAnim, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      // Update page after animation
      setCurrentPage(newCurrentPage);
      setPageToFlipContent(null);
      setIsFlipping(false);
    });
  };

  const formatContent = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, index) => {
      if (line.trim() === '') {
        return <View key={index} style={styles.spacer} />;
      } else if (line.trim().startsWith('•')) {
        return (
          <View key={index} style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>{line.trim().substring(1).trim()}</Text>
          </View>
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

  const currentPageData = bookPages[currentPage];
  const leftPageData = currentPage > 0 ? bookPages[currentPage - 1] : null;
  
  if (!currentPageData) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No content available</Text>
        </View>
      </View>
    );
  }

  // Animation interpolations for realistic 3D effects
  const flipRotationY = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: currentFlipDirection.current === 1 ? ['0deg', '-180deg'] : ['0deg', '180deg'],
  });

  const pageElevation = pageElevationAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 15, 0],
  });

  const shadowIntensity = shadowAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.1, 0.6, 0.1],
  });

  const shadowRadius = shadowAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [5, 25, 5],
  });

  const spineGlow = spineGlowAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.8, 0],
  });

  const pageCurlScaleX = pageCurlAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0.9, 1],
  });

  const pageCurlTranslateX = pageCurlAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, currentFlipDirection.current * -10, 0],
  });

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

      {/* Book Container with 3D Perspective */}
      <View style={styles.bookWrapper}>
        <View style={styles.bookContainer}>
          
          {/* Book Spine with Glow Effect */}
          <Animated.View style={[
            styles.bookSpine,
            {
              shadowOpacity: spineGlow,
              backgroundColor: spineGlowAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['#2a2a2a', '#3b82f6'],
              }),
            }
          ]} />
          
          {/* Left Page - Static */}
          <View style={styles.leftPageContainer}>
            {leftPageData ? (
              <View style={styles.page}>
                <ScrollView style={styles.pageScroll} showsVerticalScrollIndicator={false}>
                  <View style={styles.pageContent}>
                    <Text style={styles.pageTitle}>{leftPageData.title}</Text>
                    <View style={styles.contentArea}>
                      {formatContent(leftPageData.content)}
                    </View>
                    <Text style={styles.pageNumber}>{currentPage}</Text>
                  </View>
                </ScrollView>
              </View>
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

          {/* Right Page - Static */}
          <View style={styles.rightPageContainer}>
            <View style={styles.page}>
              <ScrollView style={styles.pageScroll} showsVerticalScrollIndicator={false}>
                <View style={styles.pageContent}>
                  <Text style={styles.pageTitle}>{currentPageData.title}</Text>
                  <View style={styles.contentArea}>
                    {formatContent(currentPageData.content)}
                  </View>
                  <Text style={styles.pageNumber}>{currentPage + 1}</Text>
                </View>
              </ScrollView>
            </View>
          </View>

          {/* Flipping Page Overlay - Only visible during animation */}
          {isFlipping && pageToFlipContent && (
            <Animated.View style={[
              styles.flippingPageOverlay,
              isFlippingLeftPage.current ? styles.flippingPageLeft : styles.flippingPageRight,
              {
                opacity: overlayOpacityAnim,
                transform: [
                  { perspective: 1200 },
                  { translateX: isFlippingLeftPage.current ? 0 : PAGE_WIDTH },
                  { translateX: pageCurlTranslateX },
                  { rotateY: flipRotationY },
                  { scaleX: pageCurlScaleX },
                  { translateZ: pageElevation },
                  { translateX: isFlippingLeftPage.current ? 0 : -PAGE_WIDTH },
                ],
                shadowOpacity: shadowIntensity,
                shadowRadius: shadowRadius,
                shadowOffset: {
                  width: currentFlipDirection.current * 5,
                  height: 5,
                },
                zIndex: 10,
              }
            ]}>
              <View style={styles.page}>
                <ScrollView style={styles.pageScroll} showsVerticalScrollIndicator={false}>
                  <View style={styles.pageContent}>
                    <Text style={styles.pageTitle}>{pageToFlipContent.title}</Text>
                    <View style={styles.contentArea}>
                      {formatContent(pageToFlipContent.content)}
                    </View>
                    <Text style={styles.pageNumber}>
                      {isFlippingLeftPage.current ? currentPage : currentPage + 1}
                    </Text>
                  </View>
                </ScrollView>
              </View>
            </Animated.View>
          )}

          {/* Page Shadow Overlay for depth */}
          <Animated.View style={[
            styles.pageShadowOverlay,
            {
              opacity: shadowIntensity.interpolate({
                inputRange: [0.1, 0.6],
                outputRange: [0, 0.3],
                extrapolate: 'clamp',
              }),
            }
          ]} />
        </View>
      </View>

      {/* Navigation Controls - Below Book */}
      <View style={styles.controlsContainer}>
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
              Page {currentPage + 1} of {bookPages.length}
            </Text>
            <Text style={styles.moduleTitle}>
              {currentPageData.title.length > 30 
                ? currentPageData.title.substring(0, 30) + '...' 
                : currentPageData.title}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.navButton, currentPage === bookPages.length - 1 && styles.navButtonDisabled]}
            onPress={() => handlePageTurn('next')}
            disabled={currentPage === bookPages.length - 1 || isFlipping}
          >
            <Text style={[styles.navButtonText, currentPage === bookPages.length - 1 && styles.navButtonTextDisabled]}>
              Next
            </Text>
            <ChevronRight size={24} color={currentPage === bookPages.length - 1 ? "#64748b" : "#ffffff"} />
          </TouchableOpacity>
        </View>

        {/* Page Indicators */}
        <View style={styles.pageIndicators}>
          {bookPages.map((_, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.pageIndicator,
                index === currentPage && styles.pageIndicatorActive
              ]}
              onPress={() => {
                if (!isFlipping && index !== currentPage) {
                  // Determine direction and animate to target page
                  const direction = index > currentPage ? 'next' : 'prev';
                  setCurrentPage(index);
                  if (soundEnabled) {
                    soundManager.playClickSound();
                  }
                }
              }}
            >
              <Text style={[
                styles.indicatorText,
                index === currentPage && styles.indicatorTextActive
              ]}>
                {index + 1}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
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
    paddingBottom: 10,
  },
  bookContainer: {
    width: BOOK_WIDTH,
    height: BOOK_HEIGHT,
    position: 'relative',
    flexDirection: 'row',
    backgroundColor: 'transparent',
    borderRadius: 8,
  },
  bookSpine: {
    position: 'absolute',
    left: '50%',
    top: 0,
    bottom: 0,
    width: 6,
    backgroundColor: '#2a2a2a',
    zIndex: 5,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 10,
    elevation: 5,
    transform: [{ translateX: -3 }],
    borderRadius: 3,
  },
  leftPageContainer: {
    width: PAGE_WIDTH,
    height: '100%',
    backgroundColor: '#fafafa',
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  rightPageContainer: {
    width: PAGE_WIDTH,
    height: '100%',
    backgroundColor: '#fafafa',
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    borderLeftWidth: 1,
    borderLeftColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  flippingPageOverlay: {
    position: 'absolute',
    top: 0,
    width: PAGE_WIDTH,
    height: '100%',
    backgroundColor: '#fafafa',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  flippingPageLeft: {
    left: 0,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
  },
  flippingPageRight: {
    right: 0,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    borderLeftWidth: 1,
    borderLeftColor: '#e5e7eb',
  },
  page: {
    flex: 1,
    backgroundColor: '#fafafa',
    borderRadius: 8,
  },
  coverPage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#1e293b',
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  coverContent: {
    alignItems: 'center',
  },
  coverTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  coverSubtitle: {
    fontSize: 16,
    color: '#3b82f6',
    marginBottom: 4,
    textAlign: 'center',
    fontWeight: '600',
  },
  coverTagline: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 25,
  },
  coverDecoration: {
    marginBottom: 25,
  },
  coverDescription: {
    fontSize: 11,
    color: '#cbd5e1',
    textAlign: 'center',
    lineHeight: 16,
  },
  pageScroll: {
    flex: 1,
  },
  pageContent: {
    padding: 20,
    minHeight: '100%',
  },
  pageTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
    lineHeight: 24,
  },
  contentArea: {
    flex: 1,
    marginBottom: 16,
  },
  paragraphText: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 18,
    marginBottom: 10,
    textAlign: 'justify',
  },
  bulletPoint: {
    flexDirection: 'row',
    marginBottom: 6,
    paddingLeft: 6,
  },
  bullet: {
    fontSize: 13,
    color: '#3b82f6',
    marginRight: 6,
    fontWeight: 'bold',
    minWidth: 12,
  },
  bulletText: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 18,
    flex: 1,
  },
  spacer: {
    height: 6,
  },
  pageNumber: {
    fontSize: 11,
    color: '#9ca3af',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  pageShadowOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '48%',
    right: '48%',
    backgroundColor: 'rgba(0,0,0,0.2)',
    pointerEvents: 'none',
    zIndex: 1,
  },
  controlsContainer: {
    backgroundColor: '#1a1a1a',
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingBottom: 10,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
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
  pageIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingBottom: 10,
    gap: 8,
  },
  pageIndicator: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  pageIndicatorActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#60a5fa',
  },
  indicatorText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#cbd5e1',
  },
  indicatorTextActive: {
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