import React, { useState, useRef, useEffect } from 'react';
import { Brain, Send, MessageCircle, TrendingUp, Route, Shield, DollarSign, Zap, X, ChevronDown } from 'lucide-react';
import ReloAI from '../lib/reloai';

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  category?: string;
  confidence?: number;
  suggestions?: string[];
}

interface ReloAIChatProps {
  isOpen: boolean;
  onClose: () => void;
}

const ReloAIChat: React.FC<ReloAIChatProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'ai',
      content: `🚀 Welcome to ReloAI! I'm your specialized transport intelligence assistant.

I have comprehensive knowledge of:
• South African transport corridors and logistics
• RELOConnect platform optimization
• Route planning and cost analysis  
• Safety protocols and compliance
• Market intelligence and trends

💬 Try asking me:
• "Best route from Cape Town to Johannesburg"
• "How to reduce transport costs"
• "Current traffic patterns"
• "Safety compliance requirements"`,
      timestamp: new Date(),
      category: 'welcome',
      suggestions: [
        "Show me route optimization tips",
        "Cost saving strategies",
        "Platform performance insights",
        "Safety best practices"
      ]
    }
  ]);
  
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
    }, 1000 + Math.random() * 1500); // Random delay between 1-2.5 seconds
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
  };

  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case 'routing': return <Route className="w-4 h-4" />;
      case 'pricing': return <DollarSign className="w-4 h-4" />;
      case 'safety': return <Shield className="w-4 h-4" />;
      case 'conditions': return <TrendingUp className="w-4 h-4" />;
      default: return <Brain className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'routing': return 'bg-blue-100 text-blue-700';
      case 'pricing': return 'bg-green-100 text-green-700';
      case 'safety': return 'bg-red-100 text-red-700';
      case 'conditions': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-purple-100 text-purple-700';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-all duration-300">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col transform transition-all duration-300 scale-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-t-xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Brain className="w-8 h-8" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            <div>
              <h2 className="text-xl font-bold">ReloAI Transport Intelligence</h2>
              <p className="text-blue-100 text-sm">Your specialized South African transport assistant</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-blue-200 transition-colors duration-200 p-1 rounded-full hover:bg-white hover:bg-opacity-20"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-4 ${
                  message.type === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {message.type === 'ai' && (
                  <div className="flex items-center space-x-2 mb-2">
                    {getCategoryIcon(message.category)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(message.category)}`}>
                      {message.category || 'General'}
                    </span>
                    {message.confidence && (
                      <span className="text-xs text-gray-500">
                        {Math.round(message.confidence * 100)}% confident
                      </span>
                    )}
                  </div>
                )}
                
                <div className="whitespace-pre-line">{message.content}</div>
                
                {message.suggestions && message.suggestions.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-600 mb-2">Quick suggestions:</p>
                    <div className="flex flex-wrap gap-2">
                      {message.suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="text-xs bg-white border border-gray-300 rounded-full px-3 py-1 hover:bg-gray-50 transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="text-xs opacity-70 mt-2">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg p-4 max-w-[80%]">
                <div className="flex items-center space-x-2">
                  <Brain className="w-4 h-4 text-purple-600" />
                  <span className="text-gray-600">ReloAI is analyzing...</span>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t p-4">
          <div className="flex space-x-4">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask me about routes, costs, safety, platform features..."
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600"
              disabled={isTyping}
            />
            <button
              onClick={handleSendMessage}
              disabled={isTyping || !inputValue.trim()}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>Send</span>
            </button>
          </div>
          
          {/* Quick Actions */}
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() => handleSuggestionClick("Route optimization from Cape Town to Johannesburg")}
              className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-200 transition-colors"
            >
              <Route className="w-3 h-3 inline mr-1" />
              Route Analysis
            </button>
            <button
              onClick={() => handleSuggestionClick("Cost optimization strategies for transport")}
              className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full hover:bg-green-200 transition-colors"
            >
              <DollarSign className="w-3 h-3 inline mr-1" />
              Cost Analysis
            </button>
            <button
              onClick={() => handleSuggestionClick("Safety protocols and compliance requirements")}
              className="text-sm bg-red-100 text-red-700 px-3 py-1 rounded-full hover:bg-red-200 transition-colors"
            >
              <Shield className="w-3 h-3 inline mr-1" />
              Safety Guidelines
            </button>
            <button
              onClick={() => handleSuggestionClick("Platform performance insights and analytics")}
              className="text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded-full hover:bg-purple-200 transition-colors"
            >
              <Zap className="w-3 h-3 inline mr-1" />
              Performance Insights
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReloAIChat;
