import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

// Simple Chat List Component for demo
const ChatListScreenWrapper: React.FC = () => {
  const demoChats = [
    {
      id: '1',
      name: 'Driver John',
      lastMessage: 'I am on my way to pick up your items',
      timestamp: '2 min ago',
      unread: 2
    },
    {
      id: '2', 
      name: 'Support Team',
      lastMessage: 'How can we help you today?',
      timestamp: '1 hour ago',
      unread: 0
    },
    {
      id: '3',
      name: 'Driver Sarah',
      lastMessage: 'Items delivered successfully!',
      timestamp: 'Yesterday',
      unread: 0
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
      </View>
      
      <ScrollView style={styles.chatList}>
        {demoChats.map((chat) => (
          <TouchableOpacity key={chat.id} style={styles.chatItem}>
            <View style={styles.avatar}>
              <Feather name="user" size={24} color="#fff" />
            </View>
            
            <View style={styles.chatContent}>
              <View style={styles.chatHeader}>
                <Text style={styles.chatName}>{chat.name}</Text>
                <Text style={styles.timestamp}>{chat.timestamp}</Text>
              </View>
              
              <View style={styles.messageRow}>
                <Text style={styles.lastMessage} numberOfLines={1}>
                  {chat.lastMessage}
                </Text>
                {chat.unread > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadText}>{chat.unread}</Text>
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0057FF',
  },
  chatList: {
    flex: 1,
  },
  chatItem: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#0057FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  chatContent: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
  },
  timestamp: {
    fontSize: 12,
    color: '#6c757d',
  },
  messageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: 14,
    color: '#6c757d',
    flex: 1,
  },
  unreadBadge: {
    backgroundColor: '#dc3545',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  unreadText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default ChatListScreenWrapper;
