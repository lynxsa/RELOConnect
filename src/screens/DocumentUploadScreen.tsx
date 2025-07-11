import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { liveDataService } from '../services/liveDataService';

interface DocumentType {
  id: string;
  title: string;
  description: string;
  icon: string;
  acceptedFormats: string[];
  required: boolean;
  category: 'business' | 'driver' | 'vehicle' | 'insurance';
}

interface UploadedDocument {
  id: string;
  type: string;
  name: string;
  uri: string;
  size: number;
  status: 'uploading' | 'uploaded' | 'verified' | 'rejected';
  verificationNotes?: string;
  uploadedAt: Date;
}

const DocumentUploadScreen: React.FC = () => {
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [uploading, setUploading] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('business');
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewDocument, setPreviewDocument] = useState<UploadedDocument | null>(null);

  const documentTypes: DocumentType[] = [
    // Business Documents
    {
      id: 'company_registration',
      title: 'Company Registration (CIPC)',
      description: 'Certificate of incorporation from CIPC',
      icon: 'file-text',
      acceptedFormats: ['PDF', 'JPG', 'PNG'],
      required: true,
      category: 'business',
    },
    {
      id: 'tax_certificate',
      title: 'Tax Clearance Certificate',
      description: 'SARS tax clearance certificate',
      icon: 'file-minus',
      acceptedFormats: ['PDF', 'JPG', 'PNG'],
      required: true,
      category: 'business',
    },
    {
      id: 'business_license',
      title: 'Business License',
      description: 'Municipal business license',
      icon: 'award',
      acceptedFormats: ['PDF', 'JPG', 'PNG'],
      required: true,
      category: 'business',
    },
    {
      id: 'vat_certificate',
      title: 'VAT Registration',
      description: 'VAT registration certificate (if applicable)',
      icon: 'percent',
      acceptedFormats: ['PDF', 'JPG', 'PNG'],
      required: false,
      category: 'business',
    },
    // Driver Documents
    {
      id: 'drivers_license',
      title: 'Driver\'s License',
      description: 'Valid South African driver\'s license',
      icon: 'credit-card',
      acceptedFormats: ['JPG', 'PNG', 'PDF'],
      required: true,
      category: 'driver',
    },
    {
      id: 'pdp_certificate',
      title: 'PDP Certificate',
      description: 'Professional Driving Permit',
      icon: 'shield',
      acceptedFormats: ['PDF', 'JPG', 'PNG'],
      required: true,
      category: 'driver',
    },
    {
      id: 'id_document',
      title: 'Identity Document',
      description: 'South African ID or passport',
      icon: 'user',
      acceptedFormats: ['JPG', 'PNG', 'PDF'],
      required: true,
      category: 'driver',
    },
    {
      id: 'criminal_clearance',
      title: 'Police Clearance',
      description: 'Criminal background check certificate',
      icon: 'shield-check',
      acceptedFormats: ['PDF', 'JPG', 'PNG'],
      required: true,
      category: 'driver',
    },
    // Vehicle Documents
    {
      id: 'vehicle_registration',
      title: 'Vehicle Registration',
      description: 'Motor vehicle registration certificate',
      icon: 'truck',
      acceptedFormats: ['PDF', 'JPG', 'PNG'],
      required: true,
      category: 'vehicle',
    },
    {
      id: 'roadworthy_certificate',
      title: 'Roadworthy Certificate',
      description: 'Valid roadworthy inspection certificate',
      icon: 'check-circle',
      acceptedFormats: ['PDF', 'JPG', 'PNG'],
      required: true,
      category: 'vehicle',
    },
    {
      id: 'license_disc',
      title: 'License Disc',
      description: 'Current vehicle license disc',
      icon: 'disc',
      acceptedFormats: ['JPG', 'PNG', 'PDF'],
      required: true,
      category: 'vehicle',
    },
    // Insurance Documents
    {
      id: 'vehicle_insurance',
      title: 'Vehicle Insurance',
      description: 'Comprehensive vehicle insurance certificate',
      icon: 'umbrella',
      acceptedFormats: ['PDF', 'JPG', 'PNG'],
      required: true,
      category: 'insurance',
    },
    {
      id: 'public_liability',
      title: 'Public Liability Insurance',
      description: 'Public liability insurance certificate',
      icon: 'users',
      acceptedFormats: ['PDF', 'JPG', 'PNG'],
      required: true,
      category: 'insurance',
    },
    {
      id: 'goods_in_transit',
      title: 'Goods in Transit Insurance',
      description: 'Insurance for goods being transported',
      icon: 'package',
      acceptedFormats: ['PDF', 'JPG', 'PNG'],
      required: false,
      category: 'insurance',
    },
  ];

  const categories = [
    { id: 'business', title: 'Business', icon: 'briefcase', color: '#0057FF' },
    { id: 'driver', title: 'Driver', icon: 'user', color: '#10B981' },
    { id: 'vehicle', title: 'Vehicle', icon: 'truck', color: '#F59E0B' },
    { id: 'insurance', title: 'Insurance', icon: 'shield', color: '#8B5CF6' },
  ];

  const pickDocument = useCallback(async (documentType: DocumentType) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: documentType.acceptedFormats.includes('PDF') ? 'application/pdf' : 'image/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        await uploadDocument(documentType, asset);
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to pick document');
    }
  }, []);

  const pickImage = useCallback(async (documentType: DocumentType) => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Required', 'Camera permission is required to take photos');
        return;
      }

      Alert.alert(
        'Select Image Source',
        'Choose how you want to add the document',
        [
          { text: 'Camera', onPress: () => takePhoto(documentType) },
          { text: 'Gallery', onPress: () => pickFromGallery(documentType) },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    } catch (error) {
      console.error('Error requesting camera permission:', error);
    }
  }, []);

  const takePhoto = async (documentType: DocumentType) => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadDocument(documentType, result.assets[0]);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const pickFromGallery = async (documentType: DocumentType) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadDocument(documentType, result.assets[0]);
      }
    } catch (error) {
      console.error('Error picking from gallery:', error);
      Alert.alert('Error', 'Failed to pick from gallery');
    }
  };

  const uploadDocument = async (documentType: DocumentType, asset: any) => {
    const documentId = `doc_${Date.now()}`;
    setUploading(documentId);

    // Create FormData for file upload
    const formData = new FormData();
    formData.append('file', {
      uri: asset.uri,
      type: asset.mimeType || 'image/jpeg',
      name: asset.name || `${documentType.id}.${asset.uri.split('.').pop()}`,
    } as any);
    formData.append('documentType', documentType.id);
    formData.append('category', documentType.category);

    try {
      const response = await liveDataService.upload('/documents/upload', formData);
      
      if (response.success) {
        const uploadedDoc: UploadedDocument = {
          id: documentId,
          type: documentType.id,
          name: asset.name || `${documentType.title}`,
          uri: asset.uri,
          size: asset.size || 0,
          status: 'uploaded',
          uploadedAt: new Date(),
        };

        setDocuments(prev => [...prev.filter(d => d.type !== documentType.id), uploadedDoc]);
        Alert.alert('Success', 'Document uploaded successfully');
      } else {
        Alert.alert('Upload Failed', response.message || 'Failed to upload document');
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      Alert.alert('Upload Error', 'Network error while uploading document');
    } finally {
      setUploading(null);
    }
  };

  const deleteDocument = (documentId: string) => {
    Alert.alert(
      'Delete Document',
      'Are you sure you want to delete this document?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setDocuments(prev => prev.filter(d => d.id !== documentId));
          },
        },
      ]
    );
  };

  const previewDocument = (doc: UploadedDocument) => {
    setPreviewDocument(doc);
    setShowPreviewModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'uploading':
        return '#F59E0B';
      case 'uploaded':
        return '#3B82F6';
      case 'verified':
        return '#10B981';
      case 'rejected':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'uploading':
        return 'upload-cloud';
      case 'uploaded':
        return 'clock';
      case 'verified':
        return 'check-circle';
      case 'rejected':
        return 'x-circle';
      default:
        return 'file';
    }
  };

  const filteredDocumentTypes = documentTypes.filter(doc => doc.category === selectedCategory);
  const categoryDocuments = documents.filter(doc => {
    const docType = documentTypes.find(dt => dt.id === doc.type);
    return docType?.category === selectedCategory;
  });

  const renderCategoryTabs = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryTabs}>
      {categories.map((category) => (
        <TouchableOpacity
          key={category.id}
          style={[
            styles.categoryTab,
            selectedCategory === category.id && [styles.categoryTabActive, { borderColor: category.color }],
          ]}
          onPress={() => setSelectedCategory(category.id)}
        >
          <View style={[styles.categoryIcon, { backgroundColor: category.color + '20' }]}>
            <Feather
              name={category.icon as any}
              size={16}
              color={selectedCategory === category.id ? category.color : '#6B7280'}
            />
          </View>
          <Text
            style={[
              styles.categoryTabText,
              selectedCategory === category.id && { color: category.color },
            ]}
          >
            {category.title}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderDocumentType = (docType: DocumentType) => {
    const uploadedDoc = documents.find(d => d.type === docType.id);
    const isUploading = uploading === uploadedDoc?.id;

    return (
      <View key={docType.id} style={styles.documentTypeCard}>
        <View style={styles.documentTypeHeader}>
          <View style={styles.documentTypeInfo}>
            <View style={styles.documentTypeIcon}>
              <Feather name={docType.icon as any} size={20} color="#0057FF" />
            </View>
            <View style={styles.documentTypeDetails}>
              <Text style={styles.documentTypeTitle}>{docType.title}</Text>
              <Text style={styles.documentTypeDescription}>{docType.description}</Text>
              <Text style={styles.documentTypeFormats}>
                Accepts: {docType.acceptedFormats.join(', ')}
              </Text>
            </View>
          </View>
          {docType.required && (
            <View style={styles.requiredBadge}>
              <Text style={styles.requiredText}>Required</Text>
            </View>
          )}
        </View>

        {uploadedDoc ? (
          <View style={styles.uploadedDocument}>
            <View style={styles.uploadedDocInfo}>
              <View style={[styles.statusIcon, { backgroundColor: getStatusColor(uploadedDoc.status) + '20' }]}>
                <Feather
                  name={getStatusIcon(uploadedDoc.status) as any}
                  size={16}
                  color={getStatusColor(uploadedDoc.status)}
                />
              </View>
              <View style={styles.uploadedDocDetails}>
                <Text style={styles.uploadedDocName}>{uploadedDoc.name}</Text>
                <Text style={styles.uploadedDocStatus}>
                  {uploadedDoc.status.charAt(0).toUpperCase() + uploadedDoc.status.slice(1)}
                </Text>
                <Text style={styles.uploadedDocDate}>
                  {uploadedDoc.uploadedAt.toLocaleDateString()}
                </Text>
              </View>
            </View>
            <View style={styles.uploadedDocActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => previewDocument(uploadedDoc)}
              >
                <Feather name="eye" size={16} color="#0057FF" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => deleteDocument(uploadedDoc.id)}
              >
                <Feather name="trash-2" size={16} color="#EF4444" />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.uploadSection}>
            {isUploading ? (
              <View style={styles.uploadingContainer}>
                <ActivityIndicator size="small" color="#0057FF" />
                <Text style={styles.uploadingText}>Uploading...</Text>
              </View>
            ) : (
              <View style={styles.uploadActions}>
                <TouchableOpacity
                  style={[styles.uploadButton, styles.uploadButtonPrimary]}
                  onPress={() => pickDocument(docType)}
                >
                  <Feather name="upload" size={16} color="#FFFFFF" />
                  <Text style={styles.uploadButtonText}>Upload File</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.uploadButton, styles.uploadButtonSecondary]}
                  onPress={() => pickImage(docType)}
                >
                  <Feather name="camera" size={16} color="#0057FF" />
                  <Text style={styles.uploadButtonSecondaryText}>Take Photo</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  const getCompletionStats = () => {
    const requiredDocs = documentTypes.filter(dt => dt.required);
    const uploadedRequired = requiredDocs.filter(dt => 
      documents.some(d => d.type === dt.id && d.status !== 'rejected')
    );
    const verifiedDocs = documents.filter(d => d.status === 'verified');
    
    return {
      total: documentTypes.length,
      uploaded: documents.length,
      required: requiredDocs.length,
      uploadedRequired: uploadedRequired.length,
      verified: verifiedDocs.length,
      completion: Math.round((uploadedRequired.length / requiredDocs.length) * 100),
    };
  };

  const stats = getCompletionStats();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Document Verification</Text>
        <View style={styles.completionBadge}>
          <Text style={styles.completionText}>{stats.completion}%</Text>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.uploadedRequired}/{stats.required}</Text>
          <Text style={styles.statLabel}>Required</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.verified}</Text>
          <Text style={styles.statLabel}>Verified</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.uploaded}</Text>
          <Text style={styles.statLabel}>Total Uploaded</Text>
        </View>
      </View>

      {renderCategoryTabs()}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {filteredDocumentTypes.map(renderDocumentType)}
      </ScrollView>

      <Modal visible={showPreviewModal} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.previewModal}>
          <View style={styles.previewHeader}>
            <Text style={styles.previewTitle}>
              {previewDocument && documentTypes.find(dt => dt.id === previewDocument.type)?.title}
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowPreviewModal(false)}
            >
              <Feather name="x" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          {previewDocument && (
            <View style={styles.previewContent}>
              <Image source={{ uri: previewDocument.uri }} style={styles.previewImage} />
              <View style={styles.previewInfo}>
                <Text style={styles.previewFileName}>{previewDocument.name}</Text>
                <Text style={styles.previewFileStatus}>
                  Status: {previewDocument.status.charAt(0).toUpperCase() + previewDocument.status.slice(1)}
                </Text>
                {previewDocument.verificationNotes && (
                  <Text style={styles.previewNotes}>{previewDocument.verificationNotes}</Text>
                )}
              </View>
            </View>
          )}
        </View>
      </Modal>
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
  completionBadge: {
    backgroundColor: '#0057FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  completionText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  categoryTabs: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoryTabActive: {
    borderWidth: 2,
    backgroundColor: '#F8FAFC',
  },
  categoryIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  categoryTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  documentTypeCard: {
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
  documentTypeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  documentTypeInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  documentTypeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F7FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  documentTypeDetails: {
    flex: 1,
  },
  documentTypeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  documentTypeDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  documentTypeFormats: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  requiredBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  requiredText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D97706',
  },
  uploadSection: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 16,
  },
  uploadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  uploadingText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
  },
  uploadActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  uploadButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  uploadButtonPrimary: {
    backgroundColor: '#0057FF',
  },
  uploadButtonSecondary: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  uploadButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 6,
  },
  uploadButtonSecondaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0057FF',
    marginLeft: 6,
  },
  uploadedDocument: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 16,
  },
  uploadedDocInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  uploadedDocDetails: {
    flex: 1,
  },
  uploadedDocName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  uploadedDocStatus: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  uploadedDocDate: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
  uploadedDocActions: {
    flexDirection: 'row',
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    backgroundColor: '#F9FAFB',
  },
  previewModal: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  closeButton: {
    padding: 8,
  },
  previewContent: {
    flex: 1,
    padding: 20,
  },
  previewImage: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  previewInfo: {
    marginTop: 20,
  },
  previewFileName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  previewFileStatus: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  previewNotes: {
    fontSize: 14,
    color: '#374151',
    marginTop: 8,
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
});

export default DocumentUploadScreen;
