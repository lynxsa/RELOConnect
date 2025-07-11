import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import driverChatService from '../../src/services/driverChatService';

interface Message {
  id: string;
  message: string;
  senderId: string;
  bookingId: string;
  isFromDriver: boolean;
  timestamp: Date;
  sender: {
    firstName: string;
    lastName: string;
    avatar?: string;
  };
}

export default function DriverChatScreen() {
  const { booking, customer } = useLocalSearchParams<{
    booking: string;
    customer: string;
  }>();
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [customerName, setCustomerName] = useState('Customer');

  useEffect(() => {
    initializeChat();
    return () => {
      if (booking) {
        driverChatService.leaveBooking(booking);
      }
    };
  }, [booking]);

  const initializeChat = async () => {
    try {
      setIsLoading(true);
      
      // Join the booking chat room
      if (booking) {
        driverChatService.joinBooking(booking);
        
        // Load existing messages
        try {
          const existingMessages = await driverChatService.loadChatHistory(booking);
          setMessages(existingMessages);
        } catch (error) {
          console.log('No existing messages or failed to load:', error);
          setMessages([]);
        }
      }
      
      // Get customer info
      if (customer) {
        try {
          const customerInfo = JSON.parse(customer);
          setCustomerName(`${customerInfo.firstName} ${customerInfo.lastName}`);
        } catch {
          setCustomerName('Customer');
        }
      }
      
      // Set up event handlers
      driverChatService.setEventHandlers({
        onNewMessage: (message: any) => {
          setMessages((prev: any) => [...prev, message]);
          scrollToBottom();
        },
        onConnectionChange: (connected: any) => {
          setIsConnected(connected);
        },
        onError: (error: any) => {
          Alert.alert('Chat Error', error);
        }
      });
      
      setIsConnected(true);
    } catch (error) {
      console.error('Failed to initialize chat:', error);
      Alert.alert('Error', 'Failed to load chat');
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !isConnected) return;

    try {
      await driverChatService.sendMessage(customer, booking, newMessage.trim());
      setNewMessage('');
      scrollToBottom();
    } catch (error) {
      console.error('Failed to send message:', error);
      Alert.alert('Error', 'Failed to send message');
    }
  };

  const sendQuickUpdate = async (updateType: 'arrived' | 'en_route' | 'loading' | 'completed') => {
    try {
      await driverChatService.sendCustomerUpdate(customer, booking, updateType);
      Alert.alert('Success', 'Customer has been notified');
    } catch (error) {
      Alert.alert('Error', 'Failed to send update');
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.messageContainer,
        item.isFromDriver ? styles.driverMessage : styles.customerMessage,
      ]}
    >
      <View
        style={[
          styles.messageBubble,
          item.isFromDriver ? styles.driverBubble : styles.customerBubble,
        ]}
      >
        <Text
          style={[
            styles.messageText,
            item.isFromDriver ? styles.driverMessageText : styles.customerMessageText,
          ]}
        >
          {item.message}
        </Text>
        <Text
          style={[
            styles.messageTime,
            item.isFromDriver ? styles.driverMessageTime : styles.customerMessageTime,
          ]}
        >
          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading chat...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#0057FF" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.customerName}>{customerName}</Text>
          <Text style={styles.bookingId}>Booking #{booking}</Text>
        </View>
        <View style={styles.connectionStatus}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: isConnected ? '#34C759' : '#FF3B30' },
            ]}
          />
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => sendQuickUpdate('en_route')}
        >
          <Ionicons name="car" size={16} color="#34C759" />
          <Text style={styles.quickActionText}>En Route</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => sendQuickUpdate('arrived')}
        >
          <Ionicons name="location" size={16} color="#FF9500" />
          <Text style={styles.quickActionText}>Arrived</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => sendQuickUpdate('loading')}
        >
          <Ionicons name="cube" size={16} color="#007AFF" />
          <Text style={styles.quickActionText}>Loading</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => sendQuickUpdate('completed')}
        >
          <Ionicons name="checkmark-circle" size={16} color="#34C759" />
          <Text style={styles.quickActionText}>Delivered</Text>
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item: Message) => item.id}
        style={styles.messagesList}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={scrollToBottom}
      />

      {/* Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputContainer}
      >
        <View style={styles.inputRow}>
          <TextInput
            style={styles.textInput}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Type a message..."
            multiline
            maxLength={500}
            editable={isConnected}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!newMessage.trim() || !isConnected) && styles.sendButtonDisabled,
            ]}
            onPress={sendMessage}
            disabled={!newMessage.trim() || !isConnected}
          >
            <Ionicons
              name="send"
              size={20}
              color={newMessage.trim() && isConnected ? 'white' : '#999'}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E1E5E9',
  },
  backButton: {
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1D1D1F',
  },
  bookingId: {
    fontSize: 14,
    color: '#8E8E93',
  },
  connectionStatus: {
    marginLeft: 12,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E1E5E9',
    gap: 8,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  quickActionText: {
    fontSize: 12,
    color: '#6C757D',
    marginLeft: 4,
    fontWeight: '500',
  },
  messagesList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messageContainer: {
    marginVertical: 4,
  },
  driverMessage: {
    alignItems: 'flex-end',
  },
  customerMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  driverBubble: {
    backgroundColor: '#0057FF',
  },
  customerBubble: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E1E5E9',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  driverMessageText: {
    color: 'white',
  },
  customerMessageText: {
    color: '#1D1D1F',
  },
  messageTime: {
    fontSize: 12,
    marginTop: 4,
  },
  driverMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  customerMessageTime: {
    color: '#8E8E93',
  },
  inputContainer: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E1E5E9',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E1E5E9',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 100,
    backgroundColor: '#F8F9FA',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0057FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#E1E5E9',
  },
});
