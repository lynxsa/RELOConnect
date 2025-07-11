import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface EarningsData {
  today: number;
  week: number;
  month: number;
  year: number;
}

interface EarningsBreakdown {
  baseEarnings: number;
  bonuses: number;
  tips: number;
  deductions: number;
}

interface EarningsHistory {
  date: string;
  orders: number;
  earnings: number;
  hours: number;
}

const EarningsScreen: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month' | 'year'>('week');
  const [earningsData] = useState<EarningsData>({
    today: 1250.00,
    week: 8750.00,
    month: 32450.00,
    year: 156800.00,
  });

  const [breakdown] = useState<EarningsBreakdown>({
    baseEarnings: 7850.00,
    bonuses: 650.00,
    tips: 250.00,
    deductions: 0.00,
  });

  const [history] = useState<EarningsHistory[]>([
    { date: '2024-01-15', orders: 8, earnings: 1450.00, hours: 9.5 },
    { date: '2024-01-14', orders: 6, earnings: 980.00, hours: 7.0 },
    { date: '2024-01-13', orders: 10, earnings: 1680.00, hours: 10.5 },
    { date: '2024-01-12', orders: 7, earnings: 1150.00, hours: 8.0 },
    { date: '2024-01-11', orders: 9, earnings: 1520.00, hours: 9.0 },
    { date: '2024-01-10', orders: 5, earnings: 820.00, hours: 6.5 },
    { date: '2024-01-09', orders: 11, earnings: 1850.00, hours: 11.0 },
  ]);

  const periods = [
    { key: 'today', label: 'Today' },
    { key: 'week', label: 'This Week' },
    { key: 'month', label: 'This Month' },
    { key: 'year', label: 'This Year' },
  ] as const;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-ZA', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getCurrentEarnings = () => earningsData[selectedPeriod];

  const getAveragePerHour = () => {
    const totalHours = history.reduce((sum, day) => sum + day.hours, 0);
    const totalEarnings = history.reduce((sum, day) => sum + day.earnings, 0);
    return totalHours > 0 ? totalEarnings / totalHours : 0;
  };

  const getTotalOrders = () => history.reduce((sum, day) => sum + day.orders, 0);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <LinearGradient colors={['#0057FF', '#00B2FF']} style={styles.header}>
          <Text style={styles.headerTitle}>Earnings</Text>
          <Text style={styles.headerSubtitle}>Track your income and performance</Text>
        </LinearGradient>

        {/* Period Selector */}
        <View style={styles.periodContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {periods.map((period) => (
              <TouchableOpacity
                key={period.key}
                style={[
                  styles.periodButton,
                  selectedPeriod === period.key && styles.activePeriod,
                ]}
                onPress={() => setSelectedPeriod(period.key)}
              >
                <Text style={[
                  styles.periodText,
                  selectedPeriod === period.key && styles.activePeriodText,
                ]}>
                  {period.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Main Earnings Card */}
        <View style={styles.mainEarningsCard}>
          <Text style={styles.mainEarningsLabel}>
            {periods.find(p => p.key === selectedPeriod)?.label} Earnings
          </Text>
          <Text style={styles.mainEarningsAmount}>
            R{getCurrentEarnings().toFixed(2)}
          </Text>
          <View style={styles.earningsMetrics}>
            <View style={styles.metric}>
              <Text style={styles.metricValue}>R{getAveragePerHour().toFixed(0)}</Text>
              <Text style={styles.metricLabel}>Per Hour</Text>
            </View>
            <View style={styles.metric}>
              <Text style={styles.metricValue}>{getTotalOrders()}</Text>
              <Text style={styles.metricLabel}>Total Orders</Text>
            </View>
            <View style={styles.metric}>
              <Text style={styles.metricValue}>{history.length}</Text>
              <Text style={styles.metricLabel}>Active Days</Text>
            </View>
          </View>
        </View>

        {/* Earnings Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Earnings Breakdown</Text>
          <View style={styles.breakdownCard}>
            <View style={styles.breakdownRow}>
              <View style={styles.breakdownItem}>
                <Ionicons name="cash" size={20} color="#34C759" />
                <Text style={styles.breakdownLabel}>Base Earnings</Text>
              </View>
              <Text style={styles.breakdownAmount}>R{breakdown.baseEarnings.toFixed(2)}</Text>
            </View>
            
            <View style={styles.breakdownRow}>
              <View style={styles.breakdownItem}>
                <Ionicons name="star" size={20} color="#FF9500" />
                <Text style={styles.breakdownLabel}>Bonuses</Text>
              </View>
              <Text style={styles.breakdownAmount}>R{breakdown.bonuses.toFixed(2)}</Text>
            </View>
            
            <View style={styles.breakdownRow}>
              <View style={styles.breakdownItem}>
                <Ionicons name="heart" size={20} color="#FF3B30" />
                <Text style={styles.breakdownLabel}>Tips</Text>
              </View>
              <Text style={styles.breakdownAmount}>R{breakdown.tips.toFixed(2)}</Text>
            </View>
            
            {breakdown.deductions > 0 && (
              <View style={styles.breakdownRow}>
                <View style={styles.breakdownItem}>
                  <Ionicons name="remove-circle" size={20} color="#8E8E93" />
                  <Text style={styles.breakdownLabel}>Deductions</Text>
                </View>
                <Text style={[styles.breakdownAmount, { color: '#FF3B30' }]}>
                  -R{breakdown.deductions.toFixed(2)}
                </Text>
              </View>
            )}
            
            <View style={[styles.breakdownRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalAmount}>
                R{(breakdown.baseEarnings + breakdown.bonuses + breakdown.tips - breakdown.deductions).toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        {/* Recent History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent History</Text>
          {history.map((day, index) => (
            <View key={index} style={styles.historyCard}>
              <View style={styles.historyHeader}>
                <Text style={styles.historyDate}>{formatDate(day.date)}</Text>
                <Text style={styles.historyEarnings}>R{day.earnings.toFixed(2)}</Text>
              </View>
              <View style={styles.historyDetails}>
                <View style={styles.historyDetailItem}>
                  <Ionicons name="document-text" size={14} color="#8E8E93" />
                  <Text style={styles.historyDetailText}>{day.orders} orders</Text>
                </View>
                <View style={styles.historyDetailItem}>
                  <Ionicons name="time" size={14} color="#8E8E93" />
                  <Text style={styles.historyDetailText}>{day.hours}h worked</Text>
                </View>
                <View style={styles.historyDetailItem}>
                  <Ionicons name="trending-up" size={14} color="#8E8E93" />
                  <Text style={styles.historyDetailText}>
                    R{(day.earnings / day.hours).toFixed(0)}/h
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="download" size={24} color="#0057FF" />
              <Text style={styles.actionText}>Download Statement</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="card" size={24} color="#0057FF" />
              <Text style={styles.actionText}>Payment Methods</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="calculator" size={24} color="#0057FF" />
              <Text style={styles.actionText}>Tax Information</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="help-circle" size={24} color="#0057FF" />
              <Text style={styles.actionText}>Earnings Help</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  periodContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  periodButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#E5E5EA',
    marginRight: 12,
  },
  activePeriod: {
    backgroundColor: '#0057FF',
  },
  periodText: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  activePeriodText: {
    color: 'white',
  },
  mainEarningsCard: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  mainEarningsLabel: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 8,
  },
  mainEarningsAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#0057FF',
    marginBottom: 20,
  },
  earningsMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  metric: {
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1D1D1F',
  },
  metricLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1D1D1F',
    marginBottom: 12,
  },
  breakdownCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  breakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  breakdownLabel: {
    fontSize: 14,
    color: '#1D1D1F',
    marginLeft: 8,
  },
  breakdownAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#34C759',
  },
  totalRow: {
    borderBottomWidth: 0,
    borderTopWidth: 2,
    borderTopColor: '#E5E5EA',
    marginTop: 8,
    paddingTop: 16,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1D1D1F',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0057FF',
  },
  historyCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1F',
  },
  historyEarnings: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#34C759',
  },
  historyDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  historyDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyDetailText: {
    fontSize: 12,
    color: '#8E8E93',
    marginLeft: 4,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    width: (width - 64) / 2,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionText: {
    fontSize: 14,
    color: '#1D1D1F',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default EarningsScreen;
