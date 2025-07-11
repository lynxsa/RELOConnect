import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import mobileChatService, { Conversation } from '../services/mobileChatService';

interface ChatListScreenProps {
  onChatSelect: (partnerId: string, partnerName: string, bookingId?: string) => void;
  onBack: () => void;
}

const ChatListScreen: React.FC<ChatListScreenProps> = ({
  onChatSelect,
  onBack,
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  // Load conversations from API
  const loadConversations = useCallback(async (refresh = false) => {
    try {
      if (refresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const serverUrl = Platform.OS === 'ios' 
        ? 'http://localhost:3001' 
        : 'http://10.0.2.2:3001';

      const authToken = await AsyncStorage.getItem('authToken');
      
      const response = await fetch(`${serverUrl}/api/chat/conversations`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations || []);
        
        // Calculate total unread count
        const unreadCount = data.conversations?.reduce(
          (total: number, conv: Conversation) => total + conv.unreadCount, 
          0
        ) || 0;
        setTotalUnreadCount(unreadCount);
      } else {
        Alert.alert('Error', 'Failed to load conversations');
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
      Alert.alert('Error', 'Failed to load conversations');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Initialize chat service
  useEffect(() => {
    const initializeChat = async () => {
      try {
        // Set up event handlers
        mobileChatService.setEventHandlers({
          onNewMessage: (message) => {
            // Update conversation list with new message
            setConversations(prev => {
              const updated = [...prev];
              const existingIndex = updated.findIndex(
                conv => conv.partnerId === message.senderId || conv.partnerId === message.receiverId
              );

              if (existingIndex !== -1) {
                // Update existing conversation
                const conversation = updated[existingIndex];
                updated[existingIndex] = {
                  ...conversation,
                  latestMessage: message,
                  unreadCount: message.senderId !== mobileChatService.currentUserId 
                    ? conversation.unreadCount + 1 
                    : conversation.unreadCount,
                };
                
                // Move to top
                const updatedConv = updated.splice(existingIndex, 1)[0];
                updated.unshift(updatedConv);
              } else {
                // Create new conversation
                const newConversation: Conversation = {
                  partnerId: message.senderId === mobileChatService.currentUserId 
                    ? message.receiverId 
                    : message.senderId,
                  partner: message.senderId === mobileChatService.currentUserId 
                    ? message.receiver 
                    : message.sender,
                  latestMessage: message,
                  unreadCount: message.senderId !== mobileChatService.currentUserId ? 1 : 0,
                  booking: message.booking,
                };
                updated.unshift(newConversation);
              }

              return updated;
            });

            // Update total unread count
            if (message.senderId !== mobileChatService.currentUserId) {
              setTotalUnreadCount(prev => prev + 1);
            }
          },
          
          onMessagesRead: (data) => {
            // Update unread count when messages are read
            setConversations(prev => 
              prev.map(conv => 
                conv.partnerId === data.readerId 
                  ? { ...conv, unreadCount: Math.max(0, conv.unreadCount - data.count) }
                  : conv
              )
            );
            
            setTotalUnreadCount(prev => Math.max(0, prev - data.count));
          },
          
          onConnectionChange: (connected) => {
            setIsConnected(connected);
          },
          
          onError: (error) => {
            Alert.alert('Chat Error', error);
          },
        });

        // Load initial conversations
        await loadConversations();
      } catch (error) {
        console.error('Error initializing chat list:', error);
        Alert.alert('Error', 'Failed to initialize chat');
      }
    };

    initializeChat();

    return () => {
      mobileChatService.removeEventHandlers();
    };
  }, [loadConversations]);

  // Filter conversations based on search query
  const filteredConversations = conversations.filter(conversation =>
    conversation.partner.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conversation.partner.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conversation.latestMessage.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle chat selection
  const handleChatSelect = (conversation: Conversation) => {
    const partnerName = `${conversation.partner.firstName} ${conversation.partner.lastName}`;
    onChatSelect(conversation.partnerId, partnerName, conversation.booking?.id);
  };

  // Format time for display
  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      // Today - show time
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      // Yesterday
      return 'Yesterday';
    } else if (diffDays < 7) {
      // This week - show day
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      // Older - show date
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  // Truncate message text
  const truncateMessage = (message: string, maxLength = 50): string => {
    return message.length > maxLength ? `${message.substring(0, maxLength)}...` : message;
  };

  // Render conversation item
  const renderConversation = ({ item }: { item: Conversation }) => {
    const partnerName = `${item.partner.firstName} ${item.partner.lastName}`;
    const isUnread = item.unreadCount > 0;
    
    return (
      <TouchableOpacity 
        style={[styles.conversationItem, isUnread && styles.unreadConversation]}
        onPress={() => handleChatSelect(item)}
      >
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {item.partner.firstName.charAt(0).toUpperCase()}
              {item.partner.lastName.charAt(0).toUpperCase()}
            </Text>
          </View>
          
          {item.booking && (
            <View style={styles.bookingBadge}>
              <Ionicons name="receipt" size={10} color="#FFFFFF" />
            </View>
          )}
        </View>

        {/* Content */}
        <View style={styles.conversationContent}>
          <View style={styles.conversationHeader}>
            <Text style={[styles.partnerName, isUnread && styles.unreadText]}>
              {partnerName}
            </Text>
            <Text style={styles.messageTime}>
              {formatTime(item.latestMessage.createdAt)}
            </Text>
          </View>
          
          <View style={styles.messagePreview}>
            <Text 
              style={[
                styles.messageText, 
                isUnread && styles.unreadText,
                item.latestMessage.type === 'SYSTEM' && styles.systemMessage
              ]}
              numberOfLines={1}
            >
              {item.latestMessage.type === 'LOCATION' && '📍 '}
              {item.latestMessage.type === 'SYSTEM' && 'ℹ️ '}
              {truncateMessage(item.latestMessage.message)}
            </Text>
            
            {isUnread && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadCount}>
                  {item.unreadCount > 99 ? '99+' : item.unreadCount.toString()}
                </Text>
              </View>
            )}
          </View>
          
          {item.booking && (
            <Text style={styles.bookingInfo} numberOfLines={1}>
              🚛 {item.booking.pickupAddress} → {item.booking.dropoffAddress}
            </Text>
          )}
        </View>

        {/* Status indicator */}
        <View style={styles.statusContainer}>
          {item.latestMessage.senderId === mobileChatService.currentUserId && (
            <Ionicons 
              name={item.latestMessage.read ? "checkmark-done" : "checkmark"} 
              size={16} 
              color={item.latestMessage.read ? "#0057FF" : "#999999"}
            />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="chatbubbles-outline" size={64} color="#CCCCCC" />
      <Text style={styles.emptyStateTitle}>No conversations yet</Text>
      <Text style={styles.emptyStateText}>
        Start chatting with drivers when you make a booking
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Messages</Text>
          <View style={styles.statusContainer}>
            <View style={[
              styles.connectionDot,
              { backgroundColor: isConnected ? '#00FF00' : '#FF0000' }
            ]} />
            <Text style={styles.statusText}>
              {isConnected ? 'Connected' : 'Connecting...'}
            </Text>
          </View>
        </View>

        {totalUnreadCount > 0 && (
          <View style={styles.totalUnreadBadge}>
            <Text style={styles.totalUnreadText}>
              {totalUnreadCount > 99 ? '99+' : totalUnreadCount.toString()}
            </Text>
          </View>
        )}
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search conversations..."
          placeholderTextColor="#999999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity 
            onPress={() => setSearchQuery('')}
            style={styles.clearButton}
          >
            <Ionicons name="close-circle" size={20} color="#999999" />
          </TouchableOpacity>
        )}
      </View>

      {/* Conversations List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0057FF" />
          <Text style={styles.loadingText}>Loading conversations...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredConversations}
          renderItem={renderConversation}
          keyExtractor={(item) => item.partnerId}
          style={styles.conversationsList}
          contentContainerStyle={[
            styles.conversationsContent,
            filteredConversations.length === 0 && styles.emptyListContent
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => loadConversations(true)}
              colors={['#0057FF']}
              tintColor="#0057FF"
            />
          }
          ListEmptyComponent={renderEmptyState}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0057FF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  connectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#E0E0E0',
  },
  totalUnreadBadge: {
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  totalUnreadText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 8,
    paddingHorizontal: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#333333',
  },
  clearButton: {
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666666',
  },
  conversationsList: {
    flex: 1,
  },
  conversationsContent: {
    paddingBottom: 16,
  },
  emptyListContent: {
    flex: 1,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  unreadConversation: {
    backgroundColor: '#F0F7FF',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0057FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  bookingBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#FF9500',
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  partnerName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
  },
  unreadText: {
    fontWeight: '600',
    color: '#000000',
  },
  messageTime: {
    fontSize: 12,
    color: '#999999',
  },
  messagePreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  messageText: {
    flex: 1,
    fontSize: 14,
    color: '#666666',
    marginRight: 8,
  },
  systemMessage: {
    fontStyle: 'italic',
  },
  unreadBadge: {
    backgroundColor: '#0057FF',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadCount: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  bookingInfo: {
    fontSize: 12,
    color: '#FF9500',
    marginTop: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default ChatListScreen;
