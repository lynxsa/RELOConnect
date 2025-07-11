import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import mobileChatService, { ChatMessage, TypingStatus } from '../services/mobileChatService';
import mobilePushNotificationService from '../services/mobilePushNotificationService';

interface ChatScreenProps {
  partnerId: string;
  partnerName: string;
  bookingId?: string;
  onBack: () => void;
}

const ChatScreen: React.FC<ChatScreenProps> = ({
  partnerId,
  partnerName,
  bookingId,
  onBack,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // Load messages from API
  const loadMessages = useCallback(async () => {
    try {
      setIsLoading(true);
      const serverUrl = Platform.OS === 'ios' 
        ? 'http://localhost:3001' 
        : 'http://10.0.2.2:3001';

      const authToken = await AsyncStorage.getItem('authToken');
      const endpoint = bookingId 
        ? `/api/chat/booking/${bookingId}`
        : `/api/chat/messages/${partnerId}`;

      const response = await fetch(`${serverUrl}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
        
        // Mark messages as read
        if (data.messages?.length > 0) {
          await mobileChatService.markMessagesAsRead(partnerId, bookingId);
        }
      } else {
        Alert.alert('Error', 'Failed to load messages');
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      Alert.alert('Error', 'Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  }, [partnerId, bookingId]);

  // Initialize chat service and load messages
  useEffect(() => {
    const initializeChat = async () => {
      try {
        // Set up event handlers
        mobileChatService.setEventHandlers({
          onNewMessage: (message: ChatMessage) => {
            if (
              (message.senderId === partnerId && message.receiverId === mobileChatService.currentUserId) ||
              (message.senderId === mobileChatService.currentUserId && message.receiverId === partnerId)
            ) {
              setMessages(prev => [...prev, message]);
              
              // Mark as read if it's from the partner
              if (message.senderId === partnerId) {
                mobileChatService.markMessagesAsRead(partnerId, bookingId);
              }
            }
          },
          
          onMessageSent: () => {
            setIsSending(false);
          },
          
          onUserTyping: (data: TypingStatus) => {
            if (data.userId === partnerId) {
              setPartnerTyping(true);
            }
          },
          
          onUserStoppedTyping: (data: TypingStatus) => {
            if (data.userId === partnerId) {
              setPartnerTyping(false);
            }
          },
          
          onConnectionChange: (connected: boolean) => {
            setIsConnected(connected);
          },
          
          onError: (error: string) => {
            Alert.alert('Chat Error', error);
          },
        });

        // Join booking room if applicable
        if (bookingId) {
          await mobileChatService.joinBooking(bookingId);
        }

        // Load initial messages
        await loadMessages();
      } catch (error) {
        console.error('Error initializing chat:', error);
        Alert.alert('Error', 'Failed to initialize chat');
      }
    };

    initializeChat();

    // Cleanup
    return () => {
      mobileChatService.removeEventHandlers();
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [partnerId, bookingId, loadMessages]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  // Handle typing
  const handleTyping = (text: string) => {
    setInputText(text);

    // Start typing indicator
    if (text.length > 0 && !isTyping) {
      setIsTyping(true);
      mobileChatService.startTyping(partnerId, bookingId);
    }

    // Stop typing after 1 second of inactivity
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        mobileChatService.stopTyping(partnerId, bookingId);
      }
    }, 1000);
  };

  // Send message
  const sendMessage = async () => {
    if (!inputText.trim() || isSending) return;

    const messageText = inputText.trim();
    setInputText('');
    setIsSending(true);

    // Stop typing
    if (isTyping) {
      setIsTyping(false);
      mobileChatService.stopTyping(partnerId, bookingId);
    }

    try {
      await mobileChatService.sendMessage(partnerId, messageText, 'TEXT', bookingId);
    } catch (error) {
      console.error('Error sending message:', error);
      setIsSending(false);
      Alert.alert('Error', 'Failed to send message');
      
      // Restore message text
      setInputText(messageText);
    }
  };

  // Send location
  const sendLocation = async () => {
    try {
      // Get current location (this would integrate with the location service)
      const mockLocation = {
        latitude: -26.2041,
        longitude: 28.0473,
        address: 'Johannesburg, South Africa'
      };

      await mobileChatService.sendLocationMessage(
        partnerId,
        mockLocation.latitude,
        mockLocation.longitude,
        mockLocation.address,
        bookingId
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to send location');
    }
  };

  // Render message item
  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isOwnMessage = item.senderId === mobileChatService.currentUserId;
    
    return (
      <View style={[
        styles.messageContainer,
        isOwnMessage ? styles.ownMessage : styles.partnerMessage
      ]}>
        <View style={[
          styles.messageBubble,
          isOwnMessage ? styles.ownBubble : styles.partnerBubble
        ]}>
          {item.type === 'SYSTEM' && (
            <Ionicons 
              name="information-circle" 
              size={16} 
              color={isOwnMessage ? '#FFFFFF' : '#666666'} 
              style={styles.systemIcon}
            />
          )}
          
          {item.type === 'LOCATION' && (
            <Ionicons 
              name="location" 
              size={16} 
              color={isOwnMessage ? '#FFFFFF' : '#0057FF'} 
              style={styles.locationIcon}
            />
          )}
          
          <Text style={[
            styles.messageText,
            isOwnMessage ? styles.ownMessageText : styles.partnerMessageText,
            item.type === 'SYSTEM' && styles.systemMessageText
          ]}>
            {item.message}
          </Text>
          
          <Text style={[
            styles.messageTime,
            isOwnMessage ? styles.ownTimeText : styles.partnerTimeText
          ]}>
            {new Date(item.createdAt).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </Text>
        </View>
        
        {isOwnMessage && (
          <Ionicons 
            name={item.read ? "checkmark-done" : "checkmark"} 
            size={16} 
            color={item.read ? "#0057FF" : "#999999"}
            style={styles.readStatus}
          />
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.partnerName}>{partnerName}</Text>
          <View style={styles.statusContainer}>
            <View style={[
              styles.connectionDot,
              { backgroundColor: isConnected ? '#00FF00' : '#FF0000' }
            ]} />
            <Text style={styles.statusText}>
              {partnerTyping ? 'typing...' : (isConnected ? 'online' : 'offline')}
            </Text>
          </View>
        </View>

        {bookingId && (
          <TouchableOpacity style={styles.bookingButton}>
            <Ionicons name="receipt-outline" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>

      {/* Messages */}
      <KeyboardAvoidingView 
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0057FF" />
            <Text style={styles.loadingText}>Loading messages...</Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            style={styles.messagesList}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          />
        )}

        {/* Input */}
        <View style={styles.inputContainer}>
          <TouchableOpacity 
            onPress={sendLocation}
            style={styles.attachButton}
          >
            <Ionicons name="location" size={24} color="#0057FF" />
          </TouchableOpacity>

          <TextInput
            ref={inputRef}
            style={styles.textInput}
            value={inputText}
            onChangeText={handleTyping}
            placeholder="Type a message..."
            placeholderTextColor="#999999"
            multiline
            maxLength={1000}
            editable={isConnected}
          />

          <TouchableOpacity 
            onPress={sendMessage}
            style={[
              styles.sendButton,
              (!inputText.trim() || isSending || !isConnected) && styles.sendButtonDisabled
            ]}
            disabled={!inputText.trim() || isSending || !isConnected}
          >
            {isSending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons name="send" size={20} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
  partnerName: {
    fontSize: 18,
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
  bookingButton: {
    marginLeft: 16,
  },
  chatContainer: {
    flex: 1,
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
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingVertical: 16,
  },
  messageContainer: {
    marginHorizontal: 16,
    marginVertical: 4,
  },
  ownMessage: {
    alignItems: 'flex-end',
  },
  partnerMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
  },
  ownBubble: {
    backgroundColor: '#0057FF',
  },
  partnerBubble: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  systemIcon: {
    marginBottom: 4,
  },
  locationIcon: {
    marginBottom: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  ownMessageText: {
    color: '#FFFFFF',
  },
  partnerMessageText: {
    color: '#333333',
  },
  systemMessageText: {
    fontStyle: 'italic',
    fontSize: 14,
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
  },
  ownTimeText: {
    color: '#E0E0E0',
  },
  partnerTimeText: {
    color: '#999999',
  },
  readStatus: {
    marginTop: 4,
    marginRight: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  attachButton: {
    marginRight: 12,
    marginBottom: 8,
  },
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#F8F9FA',
  },
  sendButton: {
    marginLeft: 12,
    backgroundColor: '#0057FF',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
});

export default ChatScreen;
