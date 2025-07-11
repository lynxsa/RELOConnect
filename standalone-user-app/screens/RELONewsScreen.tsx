import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

interface RELONewsScreenProps {
  navigation?: any;
  onBack?: () => void;
}

export default function RELONewsScreen({ navigation, onBack }: RELONewsScreenProps) {
  const newsItems = [
    {
      id: 1,
      title: "New Toll Road Regulations on N3 Route",
      summary: "SANRAL announces updated toll rates affecting Cape Town to Johannesburg corridor",
      category: "Regulations",
      date: "July 5, 2025",
      readTime: "3 min read"
    },
    {
      id: 2,
      title: "Port of Durban Congestion Update",
      summary: "Current delays at container terminals and recommended alternative routes",
      category: "Ports",
      date: "July 4, 2025",
      readTime: "5 min read"
    },
    {
      id: 3,
      title: "Fuel Price Changes Impact Transport Costs",
      summary: "Monthly fuel adjustment affects logistics pricing across South Africa",
      category: "Market",
      date: "July 3, 2025",
      readTime: "4 min read"
    }
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => {
            if (onBack) {
              onBack();
            } else {
              navigation?.goBack();
            }
          }}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>📰 RELONews</Text>
          <Text style={styles.subtitle}>South African logistics insights</Text>
        </View>
      </View>

      {/* News Categories */}
      <View style={styles.categoriesContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity style={[styles.categoryChip, styles.activeCategory]}>
            <Text style={[styles.categoryText, styles.activeCategoryText]}>All News</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.categoryChip}>
            <Text style={styles.categoryText}>Regulations</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.categoryChip}>
            <Text style={styles.categoryText}>Ports</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.categoryChip}>
            <Text style={styles.categoryText}>Market</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.categoryChip}>
            <Text style={styles.categoryText}>Technology</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* News Articles */}
      <View style={styles.content}>
        {newsItems.map((item) => (
          <TouchableOpacity key={item.id} style={styles.newsCard}>
            <View style={styles.newsHeader}>
              <Text style={styles.categoryBadge}>{item.category}</Text>
              <Text style={styles.readTime}>{item.readTime}</Text>
            </View>
            <Text style={styles.newsTitle}>{item.title}</Text>
            <Text style={styles.newsSummary}>{item.summary}</Text>
            <View style={styles.newsFooter}>
              <Text style={styles.newsDate}>{item.date}</Text>
              <TouchableOpacity style={styles.readMoreButton}>
                <Text style={styles.readMoreText}>Read More →</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.comingSoon}>
        <Text style={styles.comingSoonText}>🚧 Coming Soon</Text>
        <Text style={styles.comingSoonDesc}>Full news feed with real-time updates and personalized content</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#f59e0b',
    paddingVertical: 40,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
    padding: 8,
  },
  backIcon: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#fef3c7',
  },
  categoriesContainer: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  categoryChip: {
    backgroundColor: '#ffffff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  activeCategory: {
    backgroundColor: '#f59e0b',
    borderColor: '#f59e0b',
  },
  categoryText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  activeCategoryText: {
    color: '#ffffff',
  },
  content: {
    padding: 20,
    paddingTop: 0,
  },
  newsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  newsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    backgroundColor: '#f59e0b',
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  readTime: {
    fontSize: 12,
    color: '#64748b',
  },
  newsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
    lineHeight: 24,
  },
  newsSummary: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 16,
  },
  newsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  newsDate: {
    fontSize: 12,
    color: '#64748b',
  },
  readMoreButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  readMoreText: {
    fontSize: 14,
    color: '#f59e0b',
    fontWeight: '600',
  },
  comingSoon: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
    margin: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#f59e0b',
    borderStyle: 'dashed',
  },
  comingSoonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f59e0b',
    marginBottom: 8,
  },
  comingSoonDesc: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
});
