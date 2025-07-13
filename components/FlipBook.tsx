import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useState, useRef } from 'react';
import { Animated, PanGestureHandler, State } from 'react-native-gesture-handler';
import { ChevronLeft, ChevronRight, BookOpen, Chrome as Home } from 'lucide-react-native';
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

const { width: screenWidth } = Dimensions.get('window');

export function FlipBook({ pages, onClose }: FlipBookProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const soundManager = SoundManager.getInstance();
  const translateX = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  console.log('FlipBook - Component loaded with pages:', pages.length);
  console.log('FlipBook - Pages data:', pages.map(p => ({ title: p.title, content: p.content.substring(0, 50) + '...' })));

  const handlePageTurn = (direction: 'next' | 'prev') => {
    console.log('FlipBook - Page turn:', direction, 'current page:', currentPage);
    soundManager.playClickSound();
    
    // Page turn animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    if (direction === 'next' && currentPage < pages.length - 1) {
      setCurrentPage(currentPage + 1);
    } else if (direction === 'prev' && currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

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
          <Text style={styles.headerTitle}>IPDirector Flipbook</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.pageCounter}>
            {currentPage + 1} / {pages.length}
          </Text>
        </View>
      </View>

      {/* Flipbook Content */}
      <Animated.View style={[styles.bookContainer, { transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.book}>
          {/* Left Page Shadow */}
          <View style={styles.leftShadow} />
          
          {/* Main Page */}
          <ScrollView style={styles.page} showsVerticalScrollIndicator={false}>
            <View style={styles.pageContent}>
              {/* Page Header */}
              <View style={styles.pageHeader}>
                <Text style={styles.moduleTitle}>{currentPageData.title}</Text>
                <View style={styles.pageIndicator}>
                  <Text style={styles.pageNumber}>Page {currentPage + 1}</Text>
                </View>
              </View>

              {/* Content */}
              <View style={styles.contentArea}>
                {formatContent(currentPageData.content)}
              </View>

              {/* Page Footer */}
              <View style={styles.pageFooter}>
                <Text style={styles.footerText}>IPDirector User Playbook</Text>
                <View style={styles.progressDots}>
                  {pages.map((_, index) => (
                    <View
                      key={index}
                      style={[
                        styles.progressDot,
                        index === currentPage && styles.progressDotActive
                      ]}
                    />
                  ))}
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Right Page Shadow */}
          <View style={styles.rightShadow} />
        </View>
      </Animated.View>

      {/* Navigation Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.navButton, currentPage === 0 && styles.navButtonDisabled]}
          onPress={() => handlePageTurn('prev')}
          disabled={currentPage === 0}
        >
          <ChevronLeft size={24} color={currentPage === 0 ? "#64748b" : "#ffffff"} />
          <Text style={[styles.navButtonText, currentPage === 0 && styles.navButtonTextDisabled]}>
            Previous
          </Text>
        </TouchableOpacity>

        <View style={styles.centerInfo}>
          <Text style={styles.currentModule}>
            Module {currentPageData.moduleIndex + 1}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.navButton, currentPage === pages.length - 1 && styles.navButtonDisabled]}
          onPress={() => handlePageTurn('next')}
          disabled={currentPage === pages.length - 1}
        >
          <Text style={[styles.navButtonText, currentPage === pages.length - 1 && styles.navButtonTextDisabled]}>
            Next
          </Text>
          <ChevronRight size={24} color={currentPage === pages.length - 1 ? "#64748b" : "#ffffff"} />
        </TouchableOpacity>
      </View>

      {/* Quick Navigation */}
      <View style={styles.quickNav}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickNavScroll}>
          {pages.map((page, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.quickNavItem,
                index === currentPage && styles.quickNavItemActive
              ]}
              onPress={() => {
                soundManager.playClickSound();
                setCurrentPage(index);
              }}
            >
              <Text style={[
                styles.quickNavText,
                index === currentPage && styles.quickNavTextActive
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
    backgroundColor: '#0f172a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#1e293b',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
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
  headerRight: {
    minWidth: 60,
    alignItems: 'flex-end',
  },
  pageCounter: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  bookContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  book: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  leftShadow: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 20,
    backgroundColor: 'rgba(0,0,0,0.1)',
    zIndex: 1,
  },
  rightShadow: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
    zIndex: 1,
  },
  page: {
    flex: 1,
    backgroundColor: '#fefefe',
  },
  pageContent: {
    padding: 24,
    paddingHorizontal: 32,
    minHeight: '100%',
  },
  pageHeader: {
    borderBottomWidth: 2,
    borderBottomColor: '#3b82f6',
    paddingBottom: 16,
    marginBottom: 24,
  },
  moduleTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
    lineHeight: 32,
  },
  pageIndicator: {
    alignSelf: 'flex-end',
  },
  pageNumber: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  contentArea: {
    flex: 1,
    marginBottom: 40,
  },
  paragraphText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 26,
    marginBottom: 16,
    textAlign: 'justify',
  },
  bulletPoint: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingLeft: 8,
  },
  bullet: {
    fontSize: 16,
    color: '#3b82f6',
    marginRight: 12,
    fontWeight: 'bold',
    minWidth: 16,
  },
  bulletText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    flex: 1,
  },
  spacer: {
    height: 12,
  },
  pageFooter: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  progressDots: {
    flexDirection: 'row',
    gap: 4,
  },
  progressDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#d1d5db',
  },
  progressDotActive: {
    backgroundColor: '#3b82f6',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#1e293b',
    borderTopWidth: 1,
    borderTopColor: '#334155',
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
    backgroundColor: '#334155',
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
  quickNav: {
    backgroundColor: '#1e293b',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  quickNavScroll: {
    paddingHorizontal: 20,
  },
  quickNavItem: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  quickNavItemActive: {
    backgroundColor: '#3b82f6',
  },
  quickNavText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#cbd5e1',
  },
  quickNavTextActive: {
    color: '#ffffff',
  },
});