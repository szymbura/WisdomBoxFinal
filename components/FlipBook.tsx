import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Dimensions, ScrollView } from 'react-native';
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

  // IPDirector content split into pages
  const ipDirectorContent = [
    {
      title: "IPDirector: The Ultimate Creative Hub",
      content: "IPDirector, a cornerstone of the EVS suite, is a powerhouse tool that redefines efficiency, creativity, and control in broadcast operations. By seamlessly blending robust hardware with intuitive Windows-based software, it delivers a familiar and streamlined media management experience, even for those new to EVS systems. Whether you're crafting highlight reels, managing live replays, or orchestrating complex playlists, IPDirector empowers your team to focus on storytelling, not technicalities."
    },
    {
      title: "Intuitive Windows-Based Interface",
      content: "Unlike traditional replay or server control panels reliant on rigid \"pages\" and \"banks,\" IPDirector introduces a modern, visual, and user-friendly interface designed for speed and simplicity. Key features include:\n\nVisual Clip Management: Thumbnails and metadata for every clip enable quick identification, previewing, and organization.\n\nPowerful Search Tools: A robust search bar instantly locates clips across all connected EVS servers, with advanced filtering for precision.\n\nMulti-Window Workflow: Work seamlessly across multiple bins, playlists, and tasks in a flexible, multi-window environment.\n\nThis intuitive design ensures operators can navigate with ease, boosting productivity in high-pressure broadcast settings."
    },
    {
      title: "Streamlined Content Control",
      content: "IPDirector transforms media workflows by offering unparalleled flexibility in content management:\n\nEffortless File Operations: Ingest, export, and import files using familiar Windows-like logic, with drag-and-drop functionality between directories and servers.\n\nNetworked Access: Instantly access and manage clips across any connected EVS server, ensuring real-time collaboration.\n\nLive Editing & Replays: Edit clips, create slow-motion sequences, and manage assets on the fly, keeping your production dynamic and responsive.\n\nBy centralizing these functions, IPDirector frees creative teams to prioritize storytelling over file management."
    },
    {
      title: "Advanced Timeline Editing with IP Edit",
      content: "At the heart of IPDirector's creative power is IP Edit, a robust timeline editing tool that rivals top-tier non-linear editors while staying fully integrated with the EVS ecosystem. Key capabilities include:\n\nVisual Timeline: Arrange, trim, and combine clips directly on an intuitive timeline, designed for live production speed.\n\nInstant Previews: See edit results in real time, enabling fast decision-making in high-stakes environments.\n\nDrag-and-Drop Highlights: Build and refine highlight packages or full playlists with minimal effort, streamlining production workflows."
    },
    {
      title: "Sophisticated Playlist Management",
      content: "IPDirector and IP Edit elevate playlist creation with advanced features tailored for complex productions:\n\nDynamic Playlist Functions: Go beyond basic sequencing with tools for show rundowns, dynamic edits, and flexible playlist assembly.\n\nVirtual Elements: Incorporate placeholders, virtual clips, or dynamic elements into playlists for adaptable live production.\n\nColor Coding: Assign colors to clips and playlist segments to quickly identify key moments, transitions, or ad breaks.\n\nBreaks and Pauses: Insert breaks to control broadcast flow, ensuring seamless pacing.\n\nTimed Playback: Schedule clips or playlists to start automatically, ideal for automated rundowns or precise playout.\n\nComprehensive Editing: Use the timeline to edit individual clips or entire playlists, supporting advanced workflows like segmenting, merging, or refining highlight reels."
    },
    {
      title: "The Heart of Live Production",
      content: "With its blend of reliable hardware and innovative software, IPDirector serves as a creative hub within the EVS server network. Whether managing hundreds of clips, assembling highlight reels on the fly, or scheduling intricate playlists, IPDirector and IP Edit deliver unmatched efficiency and intuition. This powerful tool empowers broadcast teams to create compelling content with confidence, making it an indispensable asset for live production."
    }
  ];

  const totalPages = ipDirectorContent.length;
  const currentPageData = ipDirectorContent[currentPage];

  const flipToNext = () => {
    if (isFlipping || currentPage >= totalPages - 1) return;
    
    setIsFlipping(true);
    
    if (soundEnabled) {
      soundManager.playClickSound();
    }

    // Simple slide animation to next page
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

    // Simple slide animation to previous page
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

  // Animation transforms for simple page transition
  const pageTranslateX = flipAnimation.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [screenWidth, 0, -screenWidth],
  });

  const pageOpacity = flipAnimation.interpolate({
    inputRange: [-0.5, 0, 0.5],
    outputRange: [0, 1, 0],
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

      {/* Single Page Container */}
      <View style={styles.pageContainer}>
        <Animated.View
          style={[
            styles.page,
            {
              transform: [{ translateX: pageTranslateX }],
              opacity: pageOpacity,
            }
          ]}
        >
          <ScrollView style={styles.pageScrollView} showsVerticalScrollIndicator={false}>
            <Text style={styles.pageTitle}>{currentPageData?.title}</Text>
            <Text style={styles.pageContent}>{currentPageData?.content}</Text>
          </ScrollView>
          <Text style={styles.pageNumber}>
            {currentPage + 1} / {totalPages}
          </Text>
        </Animated.View>
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
  pageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  page: {
    width: Math.min(screenWidth - 40, 600),
    height: Math.min(screenHeight * 0.65, 500),
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
    padding: 24,
  },
  pageScrollView: {
    flex: 1,
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
  },
  pageNumber: {
    position: 'absolute',
    bottom: 16,
    right: 24,
    fontSize: 14,
    color: '#999',
    fontWeight: '500',
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