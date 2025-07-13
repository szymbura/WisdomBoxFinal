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
  
  // Animation values for natural page turning
  const leftPageRotation = useRef(new Animated.Value(0)).current;
  const rightPageRotation = useRef(new Animated.Value(0)).current;
  const pageElevation = useRef(new Animated.Value(0)).current;
  const shadowIntensity = useRef(new Animated.Value(0)).current;
  const spineGlow = useRef(new Animated.Value(0)).current;
  const pageCurl = useRef(new Animated.Value(0)).current;

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
    leftPageRotation.setValue(0);
    rightPageRotation.setValue(0);
    pageElevation.setValue(0);
    shadowIntensity.setValue(0);
    spineGlow.setValue(0);
    pageCurl.setValue(0);
    
    // Natural page turning animation
    Animated.parallel([
      // Left page rotation (0° to -180° when turning forward, -180° to 0° when turning back)
      Animated.timing(leftPageRotation, {
        toValue: direction === 'next' ? -180 : 0,
        duration: 800,
        useNativeDriver: true,
      }),
      
      // Right page rotation (0° to 180° when turning back, 180° to 0° when turning forward)
      Animated.timing(rightPageRotation, {
        toValue: direction === 'prev' ? 180 : 0,
        duration: 800,
        useNativeDriver: true,
      }),
      
      // Page elevation for depth
      Animated.sequence([
        Animated.timing(pageElevation, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(pageElevation, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
      
      // Shadow animation
      Animated.sequence([
        Animated.timing(shadowIntensity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: false,
        }),
        Animated.timing(shadowIntensity, {
          toValue: 0,
          duration: 400,
          useNativeDriver: false,
        }),
      ]),
      
      // Spine glow effect
      Animated.sequence([
        Animated.timing(spineGlow, {
          toValue: 1,
          duration: 400,
          useNativeDriver: false,
        }),
        Animated.timing(spineGlow, {
          toValue: 0,
          duration: 400,
          useNativeDriver: false,
        }),
      ]),
      
      // Page curl effect
      Animated.sequence([
        Animated.timing(pageCurl, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(pageCurl, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
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

  // Animation interpolations for natural page turning
  const leftPageRotateY = leftPageRotation.interpolate({
    inputRange: [-180, 0],
    outputRange: ['-180deg', '0deg'],
  });

  const rightPageRotateY = rightPageRotation.interpolate({
    inputRange: [0, 180],
    outputRange: ['0deg', '180deg'],
  });

  const elevationZ = pageElevation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 15],
  });

  const shadowOpacity = shadowIntensity.interpolate({
    inputRange: [0, 1],
    outputRange: [0.1, 0.6],
  });

  const shadowRadius = shadowIntensity.interpolate({
    inputRange: [0, 1],
    outputRange: [5, 25],
  });

  const spineGlowOpacity = spineGlow.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  const pageCurlScale = pageCurl.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.98],
  });

  const pageCurlSkew = pageCurl.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '1deg'],
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
                outputRange: [4, 12],
              }),
            }
          ]}>
            <Text style={styles.spineText}>IPDirector Guide</Text>
          </Animated.View>
          
          {/* Pages Container */}
          <View style={styles.pagesContainer}>
            
            {/* Left Page */}
            <Animated.View style={[
              styles.leftPage,
              {
                transform: [
                  { perspective: 1200 },
                  { rotateY: leftPageRotateY },
                  { translateZ: elevationZ },
                  { scaleX: pageCurlScale },
                  { skewY: pageCurlSkew },
                ],
                shadowOpacity: shadowOpacity,
                shadowRadius: shadowRadius,
                shadowOffset: { width: 5, height: 8 },
                shadowColor: '#000000',
                zIndex: isFlipping && flipDirection === 'next' ? 10 : 1,
              }
            ]}>
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
            </Animated.View>

            {/* Right Page */}
            <Animated.View style={[
              styles.rightPage,
              {
                transform: [
                  { perspective: 1200 },
                  { rotateY: rightPageRotateY },
                  { translateZ: elevationZ },
                  { scaleX: pageCurlScale },
                  { skewY: pageCurlSkew },
                ],
                shadowOpacity: shadowOpacity,
                shadowRadius: shadowRadius,
                shadowOffset: { width: -5, height: 8 },
                shadowColor: '#000000',
                zIndex: isFlipping && flipDirection === 'prev' ? 10 : 1,
              }
            ]}>
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
            </Animated.View>

            {/* Binding Shadow */}
            <Animated.View style={[
              styles.bindingShadow,
              {
                opacity: shadowIntensity.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.2, 0.8],
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
    backgroundColor: '#1a1a1a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#2a2a2a',
    borderBottomWidth: 1,
    borderBottomColor: '#444',
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
    borderRadius: 12,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  bookSpine: {
    position: 'absolute',
    left: '50%',
    top: 8,
    bottom: 8,
    width: 12,
    backgroundColor: '#654321',
    borderRadius: 6,
    transform: [{ translateX: -6 }],
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 15,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    elevation: 5,
  },
  spineText: {
    color: '#D4AF37',
    fontSize: 10,
    fontWeight: 'bold',
    transform: [{ rotate: '90deg' }],
    textAlign: 'center',
  },
  pagesContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    borderRadius: 8,
    overflow: 'visible',
    position: 'relative',
  },
  leftPage: {
    width: PAGE_WIDTH - 6,
    height: '100%',
    backgroundColor: '#fafafa',
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    transformOrigin: 'right center',
  },
  rightPage: {
    width: PAGE_WIDTH - 6,
    height: '100%',
    backgroundColor: '#fafafa',
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    transformOrigin: 'left center',
  },
  pageContent: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  pageScroll: {
    flex: 1,
  },
  contentPadding: {
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
  endPage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#f8fafc',
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  endContent: {
    alignItems: 'center',
  },
  endTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  endDescription: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },
  bindingShadow: {
    position: 'absolute',
    left: '50%',
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: 'rgba(0,0,0,0.3)',
    transform: [{ translateX: -2 }],
    zIndex: 1,
  },
  controlsContainer: {
    backgroundColor: '#2a2a2a',
    borderTopWidth: 1,
    borderTopColor: '#444',
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
});