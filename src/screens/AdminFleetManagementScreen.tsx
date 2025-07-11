import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { liveDataService } from '../services/liveDataService';

interface FleetStats {
  totalFleetOwners: number;
  totalTrucks: number;
  totalDrivers: number;
  verifiedFleetOwners: number;
  activeTrucks: number;
  availableDrivers: number;
  safetyReports: number;
  pendingVerifications: number;
}

interface FleetOwnerItem {
  id: string;
  companyName: string;
  companyRegistration: string;
  licenseNumber: string;
  totalTrucks: number;
  rating: number;
  isVerified: boolean;
  trustScore?: number;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  createdAt: string;
}

interface SafetyReportItem {
  id: string;
  reportType: string;
  severity: string;
  description: string;
  status: string;
  reportedBy: {
    firstName: string;
    lastName: string;
  };
  reportedAgainst?: {
    firstName: string;
    lastName: string;
  };
  createdAt: string;
}

interface DocumentVerification {
  id: string;
  documentType: string;
  status: string;
  submittedBy: {
    firstName: string;
    lastName: string;
  };
  fleetOwner?: {
    companyName: string;
  };
  createdAt: string;
}

const AdminFleetManagementScreen: React.FC = () => {
  const [stats, setStats] = useState<FleetStats>({
    totalFleetOwners: 0,
    totalTrucks: 0,
    totalDrivers: 0,
    verifiedFleetOwners: 0,
    activeTrucks: 0,
    availableDrivers: 0,
    safetyReports: 0,
    pendingVerifications: 0,
  });
  
  const [fleetOwners, setFleetOwners] = useState<FleetOwnerItem[]>([]);
  const [safetyReports, setSafetyReports] = useState<SafetyReportItem[]>([]);
  const [documentVerifications, setDocumentVerifications] = useState<DocumentVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'fleet' | 'safety' | 'documents'>('overview');
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      // Fetch fleet statistics
      const statsResponse = await liveDataService.get('/admin/fleet-stats');
      if (statsResponse.success) {
        setStats(statsResponse.data);
      }

      // Fetch fleet owners
      const fleetResponse = await liveDataService.get('/admin/fleet-owners');
      if (fleetResponse.success) {
        setFleetOwners(fleetResponse.data);
      }

      // Fetch safety reports
      const safetyResponse = await liveDataService.get('/admin/safety-reports');
      if (safetyResponse.success) {
        setSafetyReports(safetyResponse.data);
      }

      // Fetch document verifications
      const docsResponse = await liveDataService.get('/admin/document-verifications');
      if (docsResponse.success) {
        setDocumentVerifications(docsResponse.data);
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
      Alert.alert('Error', 'Failed to load admin data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchAdminData();
  };

  const handleVerifyFleetOwner = async (fleetOwnerId: string) => {
    try {
      const response = await liveDataService.put(`/admin/fleet-owners/${fleetOwnerId}/verify`);
      if (response.success) {
        Alert.alert('Success', 'Fleet owner verified successfully');
        fetchAdminData();
      } else {
        Alert.alert('Error', 'Failed to verify fleet owner');
      }
    } catch (error) {
      console.error('Error verifying fleet owner:', error);
      Alert.alert('Error', 'Network error while verifying');
    }
  };

  const handleReviewSafetyReport = async (reportId: string, action: 'approve' | 'reject', notes?: string) => {
    try {
      const response = await liveDataService.put(`/admin/safety-reports/${reportId}/review`, {
        action,
        notes,
      });
      if (response.success) {
        Alert.alert('Success', `Safety report ${action}ed successfully`);
        fetchAdminData();
        setShowVerificationModal(false);
      } else {
        Alert.alert('Error', 'Failed to review safety report');
      }
    } catch (error) {
      console.error('Error reviewing safety report:', error);
      Alert.alert('Error', 'Network error while reviewing');
    }
  };

  const handleVerifyDocument = async (docId: string, action: 'approve' | 'reject', notes?: string) => {
    try {
      const response = await liveDataService.put(`/admin/document-verifications/${docId}/review`, {
        action,
        notes,
      });
      if (response.success) {
        Alert.alert('Success', `Document ${action}ed successfully`);
        fetchAdminData();
        setShowVerificationModal(false);
      } else {
        Alert.alert('Error', 'Failed to review document');
      }
    } catch (error) {
      console.error('Error reviewing document:', error);
      Alert.alert('Error', 'Network error while reviewing');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return '#F59E0B';
      case 'approved':
      case 'verified':
        return '#10B981';
      case 'rejected':
        return '#EF4444';
      case 'under_review':
        return '#3B82F6';
      default:
        return '#6B7280';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high':
      case 'critical':
        return '#EF4444';
      case 'medium':
        return '#F59E0B';
      case 'low':
        return '#10B981';
      default:
        return '#6B7280';
    }
  };

  const renderStatsCard = (title: string, value: number, icon: string, color: string) => (
    <View style={[styles.statsCard, { borderLeftColor: color }]}>
      <View style={styles.statsContent}>
        <View style={styles.statsHeader}>
          <Text style={styles.statsValue}>{value}</Text>
          <View style={[styles.statsIcon, { backgroundColor: color + '20' }]}>
            <Feather name={icon as any} size={20} color={color} />
          </View>
        </View>
        <Text style={styles.statsTitle}>{title}</Text>
      </View>
    </View>
  );

  const renderOverviewTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>Fleet Management Overview</Text>
      
      <View style={styles.statsGrid}>
        {renderStatsCard('Fleet Owners', stats.totalFleetOwners, 'users', '#0057FF')}
        {renderStatsCard('Total Trucks', stats.totalTrucks, 'truck', '#10B981')}
        {renderStatsCard('Total Drivers', stats.totalDrivers, 'user-check', '#8B5CF6')}
        {renderStatsCard('Verified Fleets', stats.verifiedFleetOwners, 'shield-check', '#06B6D4')}
        {renderStatsCard('Active Trucks', stats.activeTrucks, 'activity', '#F59E0B')}
        {renderStatsCard('Available Drivers', stats.availableDrivers, 'user-plus', '#EC4899')}
        {renderStatsCard('Safety Reports', stats.safetyReports, 'alert-triangle', '#EF4444')}
        {renderStatsCard('Pending Verification', stats.pendingVerifications, 'clock', '#84CC16')}
      </View>

      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionGrid}>
          <TouchableOpacity style={styles.actionCard} onPress={() => setSelectedTab('fleet')}>
            <Feather name="users" size={24} color="#0057FF" />
            <Text style={styles.actionTitle}>Manage Fleet Owners</Text>
            <Text style={styles.actionDescription}>Verify and manage fleet owners</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionCard} onPress={() => setSelectedTab('safety')}>
            <Feather name="shield" size={24} color="#EF4444" />
            <Text style={styles.actionTitle}>Safety Reports</Text>
            <Text style={styles.actionDescription}>Review safety incidents</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionCard} onPress={() => setSelectedTab('documents')}>
            <Feather name="file-check" size={24} color="#10B981" />
            <Text style={styles.actionTitle}>Document Verification</Text>
            <Text style={styles.actionDescription}>Approve documents</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  const renderFleetTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>Fleet Owners Management</Text>
      
      {fleetOwners.map((fleet) => (
        <View key={fleet.id} style={styles.fleetCard}>
          <View style={styles.fleetHeader}>
            <View style={styles.fleetInfo}>
              <Text style={styles.fleetCompanyName}>{fleet.companyName}</Text>
              <Text style={styles.fleetOwnerName}>
                {fleet.user.firstName} {fleet.user.lastName}
              </Text>
              <Text style={styles.fleetContact}>{fleet.user.email}</Text>
            </View>
            <View style={[styles.verificationBadge, { backgroundColor: fleet.isVerified ? '#10B981' : '#F59E0B' }]}>
              <Text style={styles.verificationText}>
                {fleet.isVerified ? 'Verified' : 'Pending'}
              </Text>
            </View>
          </View>

          <View style={styles.fleetStats}>
            <View style={styles.fleetStatItem}>
              <Text style={styles.fleetStatValue}>{fleet.totalTrucks}</Text>
              <Text style={styles.fleetStatLabel}>Trucks</Text>
            </View>
            <View style={styles.fleetStatItem}>
              <Text style={styles.fleetStatValue}>{fleet.rating.toFixed(1)}</Text>
              <Text style={styles.fleetStatLabel}>Rating</Text>
            </View>
            <View style={styles.fleetStatItem}>
              <Text style={styles.fleetStatValue}>{fleet.licenseNumber}</Text>
              <Text style={styles.fleetStatLabel}>License</Text>
            </View>
          </View>

          <View style={styles.fleetActions}>
            {!fleet.isVerified && (
              <TouchableOpacity
                style={[styles.actionBtn, styles.verifyBtn]}
                onPress={() => handleVerifyFleetOwner(fleet.id)}
              >
                <Feather name="check-circle" size={16} color="#FFFFFF" />
                <Text style={styles.verifyBtnText}>Verify</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={[styles.actionBtn, styles.detailsBtn]}>
              <Feather name="eye" size={16} color="#0057FF" />
              <Text style={styles.detailsBtnText}>Details</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );

  const renderSafetyTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>Safety Reports</Text>
      
      {safetyReports.map((report) => (
        <View key={report.id} style={styles.reportCard}>
          <View style={styles.reportHeader}>
            <View style={styles.reportInfo}>
              <Text style={styles.reportType}>{report.reportType.replace('_', ' ')}</Text>
              <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(report.severity) }]}>
                <Text style={styles.severityText}>{report.severity}</Text>
              </View>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(report.status) }]}>
              <Text style={styles.statusText}>{report.status.replace('_', ' ')}</Text>
            </View>
          </View>

          <Text style={styles.reportDescription}>{report.description}</Text>

          <View style={styles.reportDetails}>
            <Text style={styles.reportDetailLabel}>Reported by:</Text>
            <Text style={styles.reportDetailValue}>
              {report.reportedBy.firstName} {report.reportedBy.lastName}
            </Text>
          </View>

          {report.reportedAgainst && (
            <View style={styles.reportDetails}>
              <Text style={styles.reportDetailLabel}>Reported against:</Text>
              <Text style={styles.reportDetailValue}>
                {report.reportedAgainst.firstName} {report.reportedAgainst.lastName}
              </Text>
            </View>
          )}

          <View style={styles.reportDetails}>
            <Text style={styles.reportDetailLabel}>Date:</Text>
            <Text style={styles.reportDetailValue}>
              {new Date(report.createdAt).toLocaleDateString()}
            </Text>
          </View>

          {report.status === 'PENDING' && (
            <View style={styles.reportActions}>
              <TouchableOpacity
                style={[styles.actionBtn, styles.approveBtn]}
                onPress={() => {
                  setSelectedItem(report);
                  setShowVerificationModal(true);
                }}
              >
                <Feather name="check" size={16} color="#FFFFFF" />
                <Text style={styles.approveBtnText}>Review</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );

  const renderDocumentsTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>Document Verifications</Text>
      
      {documentVerifications.map((doc) => (
        <View key={doc.id} style={styles.documentCard}>
          <View style={styles.documentHeader}>
            <View style={styles.documentInfo}>
              <Text style={styles.documentType}>{doc.documentType.replace('_', ' ')}</Text>
              <Text style={styles.documentSubmitter}>
                Submitted by: {doc.submittedBy.firstName} {doc.submittedBy.lastName}
              </Text>
              {doc.fleetOwner && (
                <Text style={styles.documentFleet}>
                  Fleet: {doc.fleetOwner.companyName}
                </Text>
              )}
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(doc.status) }]}>
              <Text style={styles.statusText}>{doc.status.replace('_', ' ')}</Text>
            </View>
          </View>

          <View style={styles.documentDetails}>
            <Text style={styles.documentDate}>
              Submitted: {new Date(doc.createdAt).toLocaleDateString()}
            </Text>
          </View>

          {doc.status === 'PENDING' && (
            <View style={styles.documentActions}>
              <TouchableOpacity
                style={[styles.actionBtn, styles.approveBtn]}
                onPress={() => handleVerifyDocument(doc.id, 'approve')}
              >
                <Feather name="check" size={16} color="#FFFFFF" />
                <Text style={styles.approveBtnText}>Approve</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, styles.rejectBtn]}
                onPress={() => handleVerifyDocument(doc.id, 'reject')}
              >
                <Feather name="x" size={16} color="#FFFFFF" />
                <Text style={styles.rejectBtnText}>Reject</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Fleet Management</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
          <Feather name="refresh-cw" size={20} color="#0057FF" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        {[
          { id: 'overview', title: 'Overview', icon: 'bar-chart-2' },
          { id: 'fleet', title: 'Fleet', icon: 'users' },
          { id: 'safety', title: 'Safety', icon: 'shield' },
          { id: 'documents', title: 'Documents', icon: 'file-text' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, selectedTab === tab.id && styles.tabActive]}
            onPress={() => setSelectedTab(tab.id as any)}
          >
            <Feather 
              name={tab.icon as any} 
              size={16} 
              color={selectedTab === tab.id ? '#0057FF' : '#6B7280'} 
            />
            <Text style={[styles.tabText, selectedTab === tab.id && styles.tabTextActive]}>
              {tab.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <RefreshControl refreshing={refreshing} onRefresh={onRefresh}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading admin data...</Text>
          </View>
        ) : (
          <>
            {selectedTab === 'overview' && renderOverviewTab()}
            {selectedTab === 'fleet' && renderFleetTab()}
            {selectedTab === 'safety' && renderSafetyTab()}
            {selectedTab === 'documents' && renderDocumentsTab()}
          </>
        )}
      </RefreshControl>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  refreshButton: {
    padding: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#0057FF',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginLeft: 6,
  },
  tabTextActive: {
    color: '#0057FF',
    fontWeight: 'bold',
  },
  tabContent: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statsCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statsContent: {},
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statsValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
  },
  statsIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsTitle: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  quickActions: {
    marginTop: 24,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 12,
  },
  actionDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
  },
  fleetCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  fleetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  fleetInfo: {
    flex: 1,
  },
  fleetCompanyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  fleetOwnerName: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  fleetContact: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  verificationBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  verificationText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  fleetStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  fleetStatItem: {
    alignItems: 'center',
  },
  fleetStatValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  fleetStatLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  fleetActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
  verifyBtn: {
    backgroundColor: '#10B981',
  },
  verifyBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 6,
  },
  detailsBtn: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  detailsBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0057FF',
    marginLeft: 6,
  },
  reportCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  reportInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  reportType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginRight: 12,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  severityText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  reportDescription: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 12,
  },
  reportDetails: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  reportDetailLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    width: 100,
  },
  reportDetailValue: {
    fontSize: 12,
    color: '#111827',
    flex: 1,
  },
  reportActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
  },
  approveBtn: {
    backgroundColor: '#10B981',
  },
  approveBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 6,
  },
  rejectBtn: {
    backgroundColor: '#EF4444',
  },
  rejectBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 6,
  },
  documentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  documentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  documentInfo: {
    flex: 1,
  },
  documentType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  documentSubmitter: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  documentFleet: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  documentDetails: {
    marginBottom: 12,
  },
  documentDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  documentActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
});

export default AdminFleetManagementScreen;
