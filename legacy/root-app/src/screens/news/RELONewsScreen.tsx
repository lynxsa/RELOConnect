import React from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Card } from '../../components/ui';
import { NewsArticle } from '../../types';

const mockNews: NewsArticle[] = [
  {
    id: '1',
    title: 'Global Logistics Trends 2025',
    description: 'The logistics industry is evolving rapidly with new technologies and sustainability focus.',
    content: 'Full article content...',
    source: 'Logistics Today',
    publishedAt: new Date(),
    category: 'industry',
    tags: ['logistics', 'trends', '2025'],
  },
  {
    id: '2',
    title: 'Smart Moving Solutions Rise',
    description: 'Technology-driven moving solutions are transforming the relocation industry.',
    content: 'Full article content...',
    source: 'Moving News',
    publishedAt: new Date(),
    category: 'technology',
    tags: ['technology', 'moving', 'innovation'],
  },
];

export default function RELONewsScreen() {
  const { colors } = useTheme();

  const renderNewsItem = ({ item }: { item: NewsArticle }) => (
    <Card style={styles.newsCard} onPress={() => console.log('Read article', item.id)}>
      <View style={styles.newsImage}>
        <Text style={styles.newsIcon}>📰</Text>
      </View>
      
      <View style={styles.newsContent}>
        <Text style={[styles.newsTitle, { color: colors.text }]}>{item.title}</Text>
        <Text style={[styles.newsDescription, { color: colors.textSecondary }]} numberOfLines={2}>
          {item.description}
        </Text>
        
        <View style={styles.newsMeta}>
          <Text style={[styles.newsSource, { color: colors.primary }]}>{item.source}</Text>
          <Text style={[styles.newsDate, { color: colors.textSecondary }]}>
            {item.publishedAt.toLocaleDateString()}
          </Text>
        </View>
      </View>
    </Card>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>RELONews</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
          Stay updated with industry insights
        </Text>
      </View>

      <FlatList
        data={mockNews}
        renderItem={renderNewsItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  listContainer: {
    padding: 16,
  },
  newsCard: {
    flexDirection: 'row',
    marginBottom: 16,
    padding: 12,
  },
  newsImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  newsIcon: {
    fontSize: 32,
  },
  newsContent: {
    flex: 1,
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  newsDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  newsMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  newsSource: {
    fontSize: 12,
    fontWeight: '600',
  },
  newsDate: {
    fontSize: 12,
  },
});
