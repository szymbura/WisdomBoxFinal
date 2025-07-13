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
  const [flipDirection, setFlipDirection] = useState<'next' | 'prev'>('next');
  
  const soundManager = SoundManager.getInstance();
  
  // Animation values for Turn.js style page turning
  const flipProgress = useRef(new Animated.Value(0)).current;
  const pageElevation = useRef(new Animated.Value(0)).current;
  const shadowIntensity = useRef(new Animated.Value(0)).current;
  const spineGlow = useRef(new Animated.Value(0)).current;

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
    setFlipDirection(direction);
    
    // Play sound
    if (soundEnabled) {
      soundManager.playClickSound();
    }
    
    // Reset animation values
    flipProgress.setValue(0);
    pageElevation.setValue(0);
    shadowIntensity.setValue(0);
    spineGlow.setValue(0);
    
    // Turn.js style page turning animation
    Animated.parallel([
      // Main flip progress (0 to 1)
      Animated.timing(flipProgress, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: false,
      }),
      
      // Page elevation for depth
      Animated.sequence([
        Animated.timing(pageElevation, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(pageElevation, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
      
      // Shadow animation
      Animated.sequence([
        Animated.timing(shadowIntensity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: false,
        }),
        Animated.timing(shadowIntensity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: false,
        }),
      ]),
      
      // Spine glow effect
      Animated.sequence([
        Animated.timing(spineGlow, {
          toValue: 1,
          duration: 500,
          useNativeDriver: false,
        }),
        Animated.timing(spineGlow, {
          toValue: 0,
          duration: 500,
          useNativeDriver: false,
        }),
      ]),
    ]).start(() => {
      // Update page after animation
      const newPage = direction === 'next' ? currentPage + 1 : currentPage - 1;
      setCurrentPage(newPage);
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

  // Get current page data
  const leftPageData = currentPage > 0 ? bookPages[currentPage - 1] : null;
  const rightPageData = currentPage < bookPages.length ? bookPages[currentPage] : null;

  // Turn.js style animation interpolations
  const flipRotateY = flipProgress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: flipDirection === 'next' ? ['0deg', '-90deg', '-180deg'] : ['0deg', '90deg', '180deg'],
  });

  const flipScaleX = flipProgress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0.8, 1],
  });

  const flipTranslateX = flipProgress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, flipDirection === 'next' ? -20 : 20, 0],
  });

  const elevationZ = pageElevation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 20],
  });

  const shadowOpacity = shadowIntensity.interpolate({
    inputRange: [0, 1],
    outputRange: [0.1, 0.8],
  });

  const shadowRadius = shadowIntensity.interpolate({
    inputRange: [0, 1],
    outputRange: [5, 30],
  });

  const spineGlowOpacity = spineGlow.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 1],
  });

  // Page curl effect
  const pageCurlGradient = flipProgress.interpolate({
    inputRange: [0, 0.3, 0.7, 1],
    outputRange: [0, 0.3, 0.7, 0],
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

      {/* Book Container */}
      <View style={styles.bookWrapper}>
        <View style={styles.bookContainer}>
          
          {/* Book Spine with Glow Effect */}
          <Animated.View style={[
            styles.bookSpine,
            {
              shadowOpacity: spineGlowOpacity,
              shadowRadius: spineGlow.interpolate({
                inputRange: [0, 1],
                outputRange: [4, 16],
              }),
            }
          ]}>
            <Text style={styles.spineText}>IPDirector Guide</Text>
          </Animated.View>
          
          {/* Pages Container */}
          <View style={styles.pagesContainer}>
            
            {/* Left Page - Static */}
            <View style={styles.leftPageStatic}>
              {leftPageData ? (
                <View style={styles.pageContent}>
                  <ScrollView style={styles.pageScroll} showsVerticalScrollIndicator={false}>
                    <View style={styles.contentPadding}>
                      <Text style={styles.pageTitle}>{leftPageData.title}</Text>
                      <View style={styles.contentArea}>
                        {formatContent(leftPageData.content)}
                      </View>
                      <Text style={styles.pageNumber}>{leftPageData.pageNumber}</Text>
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
            <View style={styles.rightPageStatic}>
              {rightPageData ? (
                <View style={styles.pageContent}>
                  <ScrollView style={styles.pageScroll} showsVerticalScrollIndicator={false}>
                    <View style={styles.contentPadding}>
                      <Text style={styles.pageTitle}>{rightPageData.title}</Text>
                      <View style={styles.contentArea}>
                        {formatContent(rightPageData.content)}
                      </View>
                      <Text style={styles.pageNumber}>{rightPageData.pageNumber}</Text>
                    </View>
                  </ScrollView>
                </View>
              ) : (
                <View style={styles.endPage}>
                  <View style={styles.endContent}>
                    <BookOpen size={60} color="#3b82f6" />
                    <Text style={styles.endTitle}>End of Guide</Text>
                    <Text style={styles.endDescription}>
                      You've completed the IPDirector guide. Use the navigation to revisit any section.
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {/* Animated Flipping Page Overlay */}
            {isFlipping && (
              <Animated.View style={[
                styles.flippingPageOverlay,
                flipDirection === 'next' ? styles.flippingRightPage : styles.flippingLeftPage,
                {
                  transform: [
                    { perspective: 1200 },
                    { translateX: flipTranslateX },
                    { rotateY: flipRotateY },
                    { scaleX: flipScaleX },
                    { translateZ: elevationZ },
                  ],
                  shadowOpacity: shadowOpacity,
                  shadowRadius: shadowRadius,
                  shadowOffset: { 
                    width: flipDirection === 'next' ? 10 : -10, 
                    height: 15 
                  },
                  shadowColor: '#000000',
                  zIndex: 10,
                }
              ]}>
                {/* Page curl gradient overlay */}
                <Animated.View style={[
                  styles.pageCurlOverlay,
                  {
                    opacity: pageCurlGradient,
                    background: flipDirection === 'next' 
                      ? 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.3) 100%)'
                      : 'linear-gradient(to left, transparent 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.3) 100%)'
                  }
                ]} />
                
                {/* Flipping page content */}
                <View style={styles.pageContent}>
                  <ScrollView style={styles.pageScroll} showsVerticalScrollIndicator={false}>
                    <View style={styles.contentPadding}>
                      {flipDirection === 'next' && rightPageData && (
                        <>
                          <Text style={styles.pageTitle}>{rightPageData.title}</Text>
                          <View style={styles.contentArea}>
                            {formatContent(rightPageData.content)}
                          </View>
                          <Text style={styles.pageNumber}>{rightPageData.pageNumber}</Text>
                        </>
                      )}
                      {flipDirection === 'prev' && leftPageData && (
                        <>
                          <Text style={styles.pageTitle}>{leftPageData.title}</Text>
                          <View style={styles.contentArea}>
                            {formatContent(leftPageData.content)}
                          </View>
                          <Text style={styles.pageNumber}>{leftPageData.pageNumber}</Text>
                        </>
                      )}
                    </View>
                  </ScrollView>
                </View>
              </Animated.View>
            )}

            {/* Binding Shadow */}
            <Animated.View style={[
              styles.bindingShadow,
              {
                opacity: shadowIntensity.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.2, 0.9],
                }),
              }
            ]} />
          </View>
        </View>
      </View>

      {/* Navigation Controls */}
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
              {rightPageData?.title.length > 30 
                ? rightPageData.title.substring(0, 30) + '...' 
                : rightPageData?.title || 'End'}
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
    backgroundColor: '#2c1810',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#3d2817',
    borderBottomWidth: 1,
    borderBottomColor: '#5d4037',
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
    backgroundColor: '#8B4513',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.4,
    shadowRadius: 25,
    elevation: 15,
  },
  bookSpine: {
    position: 'absolute',
    left: '50%',
    top: 12,
    bottom: 12,
    width: 16,
    backgroundColor: '#654321',
    borderRadius: 8,
    transform: [{ translateX: -8 }],
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#8B4513',
  },
  spineText: {
    color: '#D4AF37',
    fontSize: 11,
    fontWeight: 'bold',
    transform: [{ rotate: '90deg' }],
    textAlign: 'center',
  },
  pagesContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    borderRadius: 12,
    overflow: 'visible',
    position: 'relative',
  },
  leftPageStatic: {
    width: PAGE_WIDTH - 8,
    height: '100%',
    backgroundColor: '#fefefe',
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
    borderRightWidth: 1,
    borderRightColor: '#e5e5e5',
  },
  rightPageStatic: {
    width: PAGE_WIDTH - 8,
    height: '100%',
    backgroundColor: '#fefefe',
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: -3, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
    borderLeftWidth: 1,
    borderLeftColor: '#e5e5e5',
  },
  flippingPageOverlay: {
    position: 'absolute',
    top: 0,
    height: '100%',
    backgroundColor: '#fefefe',
    shadowColor: '#000000',
    elevation: 10,
  },
  flippingRightPage: {
    right: 0,
    width: PAGE_WIDTH - 8,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    transformOrigin: 'left center',
  },
  flippingLeftPage: {
    left: 0,
    width: PAGE_WIDTH - 8,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    transformOrigin: 'right center',
  },
  pageCurlOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 12,
    zIndex: 1,
  },
  pageContent: {
    flex: 1,
    backgroundColor: 'transparent',
    zIndex: 2,
  },
  pageScroll: {
    flex: 1,
  },
  contentPadding: {
    padding: 24,
    minHeight: '100%',
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 20,
    lineHeight: 26,
  },
  contentArea: {
    flex: 1,
    marginBottom: 20,
  },
  paragraphText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
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
    marginRight: 8,
    fontWeight: 'bold',
    minWidth: 14,
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
  coverPage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#1e293b',
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  coverContent: {
    alignItems: 'center',
  },
  coverTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
    textAlign: 'center',
  },
  coverSubtitle: {
    fontSize: 18,
    color: '#3b82f6',
    marginBottom: 6,
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
  endPage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#f8fafc',
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  endContent: {
    alignItems: 'center',
  },
  endTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  endDescription: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
  },
  bindingShadow: {
    position: 'absolute',
    left: '50%',
    top: 0,
    bottom: 0,
    width: 6,
    backgroundColor: 'rgba(0,0,0,0.4)',
    transform: [{ translateX: -3 }],
    zIndex: 1,
  },
  controlsContainer: {
    backgroundColor: '#3d2817',
    borderTopWidth: 1,
    borderTopColor: '#5d4037',
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
    minWidth: 110,
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
    color: '#94a3b8',
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
    backgroundColor: '#5d4037',
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
});