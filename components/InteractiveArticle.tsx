import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react-native';

interface InteractiveSection {
  title: string;
  text: string;
}

interface InteractiveArticleProps {
  sections: InteractiveSection[];
}

export function InteractiveArticle({ sections }: InteractiveArticleProps) {
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([0]));

  const toggleSection = (index: number) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedSections(newExpanded);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {sections.map((section, index) => {
        const isExpanded = expandedSections.has(index);
        
        return (
          <View key={index} style={styles.section}>
            <TouchableOpacity
              style={styles.sectionHeader}
              onPress={() => toggleSection(index)}
              activeOpacity={0.7}
            >
              <Text style={styles.sectionTitle}>{section.title}</Text>
              {isExpanded ? (
                <ChevronDown size={20} color="#3b82f6" />
              ) : (
                <ChevronRight size={20} color="#64748b" />
              )}
            </TouchableOpacity>
            
            {isExpanded && (
              <View style={styles.sectionContent}>
                <Text style={styles.sectionText}>{section.text}</Text>
              </View>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 16,
    backgroundColor: '#1e293b',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#334155',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    flex: 1,
    marginRight: 12,
  },
  sectionContent: {
    padding: 16,
  },
  sectionText: {
    fontSize: 14,
    color: '#cbd5e1',
    lineHeight: 22,
  },
});