import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useState, useRef } from 'react';
import { Animated } from 'react-native';
import { ChevronDown, ChevronRight, BookOpen } from 'lucide-react-native';
import SoundManager from '@/utils/soundManager';

interface InteractiveSection {
  title: string;
  text: string;
}

interface InteractiveArticleProps {
  sections: InteractiveSection[];
}

export function InteractiveArticle({ sections }: InteractiveArticleProps) {
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([0])); // First section expanded by default
  const soundManager = SoundManager.getInstance();
  const animatedValues = useRef(
    sections.map(() => new Animated.Value(0))
  ).current;
  const scaleValues = useRef(
    sections.map(() => new Animated.Value(1))
  ).current;

  const toggleSection = (index: number) => {
    // Initialize audio and play click sound
    console.log('🔊 User clicked section, playing click sound...');
    soundManager.playClickSound();
    
    // Scale animation for button press feedback
    Animated.sequence([
      Animated.timing(scaleValues[index], {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValues[index], {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    const newExpanded = new Set(expandedSections);
    const isCurrentlyExpanded = newExpanded.has(index);
    
    if (newExpanded.has(index)) {
      // Collapse animation
      Animated.timing(animatedValues[index], {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
      newExpanded.delete(index);
    } else {
      // Expand animation
      Animated.timing(animatedValues[index], {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }).start();
      newExpanded.add(index);
    }
    setExpandedSections(newExpanded);
  };

  const formatText = (text: string) => {
    // Split text by bullet points and format them
    const lines = text.split('\n');
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

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <BookOpen size={24} color="#3b82f6" />
        <Text style={styles.headerTitle}>Interactive Guide</Text>
      </View>

      {sections.map((section, index) => {
        const isExpanded = expandedSections.has(index);
        const isFirst = index === 0;
        
        return (
          <View key={index} style={[styles.section, isFirst && styles.firstSection]}>
            <Animated.View style={{ transform: [{ scale: scaleValues[index] }] }}>
              <TouchableOpacity
                style={[styles.sectionHeader, isExpanded && styles.sectionHeaderExpanded]}
                onPress={() => toggleSection(index)}
                activeOpacity={0.8}
              >
                <View style={styles.sectionHeaderContent}>
                  <Text style={[styles.sectionTitle, isFirst && styles.firstSectionTitle]}>
                    {section.title}
                  </Text>
                  <Animated.View
                    style={{
                      transform: [{
                        rotate: animatedValues[index].interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0deg', '90deg'],
                        })
                      }]
                    }}
                  >
                    <ChevronRight size={20} color={isExpanded ? "#3b82f6" : "#64748b"} />
                  </Animated.View>
                </View>
              </TouchableOpacity>
            </Animated.View>

            <Animated.View
              style={[
                styles.sectionContent,
                {
                  maxHeight: animatedValues[index].interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 1000], // Adjust based on content height
                  }),
                  opacity: animatedValues[index].interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0, 0.5, 1],
                  }),
                }
              ]}
              pointerEvents={isExpanded ? 'auto' : 'none'}
            >
              {isExpanded && (
                <Animated.View 
                  style={[
                    styles.contentContainer,
                    {
                      transform: [{
                        translateY: animatedValues[index].interpolate({
                          inputRange: [0, 1],
                          outputRange: [-20, 0],
                        })
                      }]
                    }
                  ]}
                >
                  {formatText(section.text)}
                </Animated.View>
              )}
            </Animated.View>
          </View>
        );
      })}

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Tap any section to expand or collapse its content
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#1e293b',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 12,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: '#1e293b',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    overflow: 'hidden',
  },
  firstSection: {
    borderColor: '#3b82f6',
    borderWidth: 2,
  },
  sectionHeader: {
    padding: 16,
    backgroundColor: '#1e293b',
  },
  sectionHeaderExpanded: {
    backgroundColor: '#334155',
    borderBottomWidth: 1,
    borderBottomColor: '#475569',
  },
  sectionHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    flex: 1,
    marginRight: 12,
    lineHeight: 22,
  },
  firstSectionTitle: {
    fontSize: 18,
    color: '#3b82f6',
  },
  sectionContent: {
    backgroundColor: '#0f172a',
    overflow: 'hidden',
  },
  contentContainer: {
    padding: 20,
    paddingTop: 16,
  },
  paragraphText: {
    fontSize: 15,
    color: '#cbd5e1',
    lineHeight: 24,
    marginBottom: 12,
  },
  bulletPoint: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingLeft: 8,
  },
  bullet: {
    fontSize: 15,
    color: '#3b82f6',
    marginRight: 12,
    fontWeight: 'bold',
    minWidth: 16,
  },
  bulletText: {
    fontSize: 15,
    color: '#cbd5e1',
    lineHeight: 22,
    flex: 1,
  },
  spacer: {
    height: 8,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#64748b',
    fontStyle: 'italic',
    textAlign: 'center',
  },
});