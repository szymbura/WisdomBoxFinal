import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Animated } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, BookOpen, Home, Volume2, VolumeX } from 'lucide-react-native';
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
    content: `Unlike traditional replay or server control panels reliant on rigid "pages" and "banks," IPDirector introduces a modern, visual, and user-friendly interface designed for speed and simplicity.

Key features include:

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
    content: `At the heart of IPDirector's creative power is IP Edit, a robust timeline editing tool that rivals top-tier non-linear editors while staying fully integrated with the EVS ecosystem.

Key capabilities include:

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
  
  const soundManager = SoundManager.getInstance();
  
  // Animation values for realistic page flipping
  const flipAnim = useRef(new Animated.Value(0)).current;
  const shadowAnim = useRef(new Animated.Value(0)).current;
  const curveAnim = useRef(new Animated.Value(0)).current;
  const nextPageAnim = useRef(new Animated.Value(0)).current;

  // Use IPDirector pages instead of passed pages
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
    
    // Realistic page flip animation sequence
    Animated.parallel([
      // Main page flip with 3D rotation effect
      Animated.sequence([
        Animated.timing(flipAnim, {
          toValue: direction === 'next' ? 1 : -1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(flipAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
      
      // Shadow animation
      Animated.sequence([
        Animated.timing(shadowAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: false,
        }),
        Animated.timing(shadowAnim, {
          toValue: 0,
          duration: 350,
          useNativeDriver: false,
        }),
      ]),
      
      // Page curve effect
      Animated.sequence([
        Animated.timing(curveAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(curveAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]),
      
      // Next page reveal
      Animated.sequence([
        Animated.delay(150),
        Animated.timing(nextPageAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(nextPageAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      // Update page after animation
      if (direction === 'next' && currentPage < bookPages.length - 1) {
        setCurrentPage(currentPage + 1);
      } else if (direction === 'prev' && currentPage > 0) {
        setCurrentPage(currentPage - 1);
      }
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
  
  if (!currentPageData) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No content available</Text>
        </View>
      </View>
    );
  }

  // Animation interpolations for realistic effects
  const flipRotation = flipAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-180deg', '0deg', '180deg'],
  });

  const shadowOpacity = shadowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.1, 0.4],
  });

  const curveScale = curveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.98],
  });

  const nextPageScale = nextPageAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.95, 1],
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

      {/* Realistic Book Container */}
      <View style={styles.bookWrapper}>
        <Animated.View style={[
          styles.bookContainer,
          {
            shadowOpacity: shadowOpacity,
            transform: [{ scale: curveScale }]
          }
        ]}>
          
          {/* Left Page (Previous) */}
          <View style={styles.leftPage}>
            {currentPage > 0 ? (
              <ScrollView style={styles.pageScroll} showsVerticalScrollIndicator={false}>
                <View style={styles.pageContent}>
                  <Text style={styles.pageTitle}>
                    {bookPages[currentPage - 1]?.title}
                  </Text>
                  <View style={styles.contentArea}>
                    {formatContent(bookPages[currentPage - 1]?.content || '')}
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

          {/* Right Page with Realistic Flip Animation */}
          <Animated.View 
            style={[
              styles.rightPage,
              {
                transform: [
                  { perspective: 1000 },
                  { rotateY: flipRotation },
                  { scale: nextPageScale }
                ]
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

      {/* Page Thumbnails */}
      <View style={styles.thumbnailStrip}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbnailScroll}>
          {bookPages.map((page, index) => (
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