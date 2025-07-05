import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ReloAI from '../services/reloai';

const { width, height } = Dimensions.get('window');

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  category?: string;
  confidence?: number;
  suggestions?: string[];
}

interface ReloAIChatMobileProps {
  isVisible: boolean;
  onClose: () => void;
}

const ReloAIChatMobile: React.FC<ReloAIChatMobileProps> = ({ isVisible, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'ai',
      content: `🚀 Hi! I'm ReloAI, your South African transport assistant!

I can help you with:
• Route planning and optimization
• Transport costs and pricing
• Safety protocols and compliance
• Real-time traffic and weather
• RELOConnect platform features

💬 Try asking:
"Best route to Cape Town"
"How much to move furniture?"
"Current traffic conditions"`,
      timestamp: new Date(),
      category: 'welcome',
      suggestions: [
        "🗺️ Route to Johannesburg",
        "💰 Moving costs calculator", 
        "🛡️ Safety guidelines",
        "📱 Platform features",
        "🌤️ Weather & traffic",
        "📞 Contact support"
      ]
    }
  ]);
  
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const scrollToBottom = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI processing delay
    setTimeout(() => {
      const aiResponse = ReloAI.processQuery(inputValue);
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponse.response,
        timestamp: new Date(),
        category: aiResponse.category,
        confidence: aiResponse.confidence,
        suggestions: aiResponse.suggestions
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1500);
  };

  const handleSuggestionPress = (suggestion: string) => {
    setInputValue(suggestion);
  };

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'routing': return '#3B82F6'; // Blue
      case 'pricing': return '#10B981'; // Green
      case 'safety': return '#EF4444'; // Red
      case 'conditions': return '#F59E0B'; // Yellow
      default: return '#8B5CF6'; // Purple
    }
  };

  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case 'routing': return 'map-outline';
      case 'pricing': return 'cash-outline';
      case 'safety': return 'shield-checkmark-outline';
      case 'conditions': return 'trending-up-outline';
      default: return 'bulb-outline';
    }
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView 
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* Header */}
          <LinearGradient
            colors={['#8B5CF6', '#3B82F6']}
            style={styles.header}
          >
            <View style={styles.headerContent}>
              <View style={styles.headerLeft}>
                <Ionicons name="bulb" size={28} color="white" />
                <View style={styles.headerText}>
                  <Text style={styles.headerTitle}>ReloAI Assistant</Text>
                  <Text style={styles.headerSubtitle}>Transport Intelligence</Text>
                </View>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </LinearGradient>

          {/* Messages */}
          <ScrollView 
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
          >
            {messages.map((message) => (
              <View
                key={message.id}
                style={[
                  styles.messageContainer,
                  message.type === 'user' ? styles.userMessage : styles.aiMessage
                ]}
              >
                {message.type === 'ai' && (
                  <View style={styles.aiHeader}>
                    <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(message.category) }]}>
                      <Ionicons 
                        name={getCategoryIcon(message.category) as any} 
                        size={12} 
                        color="white" 
                      />
                      <Text style={styles.categoryText}>
                        {message.category || 'general'}
                      </Text>
                    </View>
                    {message.confidence && (
                      <Text style={styles.confidenceText}>
                        {Math.round(message.confidence * 100)}% confident
                      </Text>
                    )}
                  </View>
                )}
                
                <View
                  style={[
                    styles.messageBubble,
                    message.type === 'user' ? styles.userBubble : styles.aiBubble
                  ]}
                >
                  <Text
                    style={[
                      styles.messageText,
                      message.type === 'user' ? styles.userText : styles.aiText
                    ]}
                  >
                    {message.content}
                  </Text>
                  
                  <Text style={styles.timestamp}>
                    {message.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </Text>
                </View>

                {message.suggestions && message.suggestions.length > 0 && (
                  <View style={styles.suggestionsContainer}>
                    <Text style={styles.suggestionsTitle}>Quick suggestions:</Text>
                    <View style={styles.suggestions}>
                      {message.suggestions.map((suggestion, index) => (
                        <TouchableOpacity
                          key={index}
                          onPress={() => handleSuggestionPress(suggestion)}
                          style={styles.suggestionButton}
                        >
                          <Text style={styles.suggestionText}>{suggestion}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            ))}
            
            {isTyping && (
              <View style={[styles.messageContainer, styles.aiMessage]}>
                <View style={[styles.messageBubble, styles.aiBubble]}>
                  <View style={styles.typingIndicator}>
                    <Ionicons name="bulb" size={16} color="#8B5CF6" />
                    <Text style={styles.typingText}>ReloAI is thinking...</Text>
                    <View style={styles.typingDots}>
                      <View style={[styles.dot, styles.dot1]} />
                      <View style={[styles.dot, styles.dot2]} />
                      <View style={[styles.dot, styles.dot3]} />
                    </View>
                  </View>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Input */}
          <View style={styles.inputContainer}>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.textInput}
                value={inputValue}
                onChangeText={setInputValue}
                placeholder="Ask about routes, costs, safety..."
                placeholderTextColor="#9CA3AF"
                multiline
                editable={!isTyping}
              />
              <TouchableOpacity
                onPress={handleSendMessage}
                disabled={isTyping || !inputValue.trim()}
                style={[
                  styles.sendButton,
                  (!inputValue.trim() || isTyping) && styles.sendButtonDisabled
                ]}
              >
                <Ionicons 
                  name="send" 
                  size={20} 
                  color={!inputValue.trim() || isTyping ? "#9CA3AF" : "white"} 
                />
              </TouchableOpacity>
            </View>
            
            {/* Quick Actions */}
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.quickActions}
            >
              <TouchableOpacity
                onPress={() => handleSuggestionPress("Best route from Cape Town to Johannesburg")}
                style={[styles.quickActionButton, { backgroundColor: '#3B82F6' }]}
              >
                <Ionicons name="map-outline" size={14} color="white" />
                <Text style={styles.quickActionText}>Route Plan</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={() => handleSuggestionPress("How much does it cost to move furniture?")}
                style={[styles.quickActionButton, { backgroundColor: '#10B981' }]}
              >
                <Ionicons name="cash-outline" size={14} color="white" />
                <Text style={styles.quickActionText}>Cost Estimate</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={() => handleSuggestionPress("Safety protocols for transport")}
                style={[styles.quickActionButton, { backgroundColor: '#EF4444' }]}
              >
                <Ionicons name="shield-checkmark-outline" size={14} color="white" />
                <Text style={styles.quickActionText}>Safety Info</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={() => handleSuggestionPress("Current traffic conditions N1")}
                style={[styles.quickActionButton, { backgroundColor: '#F59E0B' }]}
              >
                <Ionicons name="trending-up-outline" size={14} color="white" />
                <Text style={styles.quickActionText}>Traffic Update</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingTop: 10,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 20,
  },
  messageContainer: {
    marginBottom: 16,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  aiMessage: {
    alignItems: 'flex-start',
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  categoryText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
    textTransform: 'capitalize',
  },
  confidenceText: {
    fontSize: 11,
    color: '#6B7280',
  },
  messageBubble: {
    maxWidth: width * 0.8,
    padding: 12,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: '#3B82F6',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: 'white',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: 'white',
  },
  aiText: {
    color: '#374151',
  },
  timestamp: {
    fontSize: 11,
    color: 'rgba(0, 0, 0, 0.4)',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  suggestionsContainer: {
    marginTop: 12,
    paddingHorizontal: 4,
  },
  suggestionsTitle: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  suggestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  suggestionButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  suggestionText: {
    fontSize: 12,
    color: '#374151',
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
    marginRight: 12,
  },
  typingDots: {
    flexDirection: 'row',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#8B5CF6',
    marginHorizontal: 1,
  },
  dot1: {
    opacity: 0.4,
  },
  dot2: {
    opacity: 0.7,
  },
  dot3: {
    opacity: 1,
  },
  inputContainer: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 12,
    backgroundColor: '#F9FAFB',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  quickActions: {
    flexDirection: 'row',
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
  },
  quickActionText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
});

export default ReloAIChatMobile;
