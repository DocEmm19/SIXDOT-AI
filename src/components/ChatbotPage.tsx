import React, { useState, useRef, useEffect } from 'react';
import { Send, ArrowLeft, Bot, User, Upload, Search, MessageSquare, Loader2 } from 'lucide-react';
import MedicalLogo from './MedicalLogo';
import { User as UserType } from '../App';
import ThemeToggle from './ThemeToggle';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
}

interface ChatbotPageProps {
  user: UserType;
  onBack: () => void;
  initialContext: 'upload' | 'medicine-search' | 'question';
}

const ChatbotPage: React.FC<ChatbotPageProps> = ({ user, onBack, initialContext }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initialize with context-specific welcome message
    const welcomeMessage = getWelcomeMessage();
    setMessages([{
      id: Date.now().toString(),
      type: 'bot',
      content: welcomeMessage,
      timestamp: new Date()
    }]);
    
    // Focus input after component mounts
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, [initialContext]);

  const getWelcomeMessage = () => {
    switch (initialContext) {
      case 'upload':
        return "Hello! I'm your MediLens AI assistant. I can help you analyze prescriptions, medical documents, or any health-related content. You can upload files, share URLs, or simply describe what you'd like to know about your prescription.";
      case 'medicine-search':
        return "Hi there! I'm here to help you find detailed information about medicines. Just tell me the name of any medication, and I'll provide you with usage instructions, dosage, side effects, interactions, and more from trusted medical databases.";
      case 'question':
        return "Welcome! I'm your AI health assistant. Feel free to ask me any questions about medications, health conditions, symptoms, or general medical information. I'm here to provide you with accurate, helpful answers.";
      default:
        return "Hello! I'm your MediLens AI assistant. How can I help you today?";
    }
  };

  const getContextIcon = () => {
    switch (initialContext) {
      case 'upload':
        return <Upload className="w-5 h-5" />;
      case 'medicine-search':
        return <Search className="w-5 h-5" />;
      case 'question':
        return <MessageSquare className="w-5 h-5" />;
      default:
        return <Bot className="w-5 h-5" />;
    }
  };

  const getContextTitle = () => {
    switch (initialContext) {
      case 'upload':
        return 'Prescription Analysis';
      case 'medicine-search':
        return 'Medicine Information';
      case 'question':
        return 'Health Questions';
      default:
        return 'AI Assistant';
    }
  };

  const simulateLLMResponse = async (userMessage: string): Promise<string> => {
    try {
      const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL;
      
      if (!webhookUrl) {
        throw new Error('N8N webhook URL not configured. Please set VITE_N8N_WEBHOOK_URL in your .env file.');
      }
      
      console.log('🚀 Sending request to webhook:', webhookUrl);
      console.log('📤 Request payload:', {
        message: userMessage,
        context: initialContext,
        userEmail: user.email,
        userName: user.name,
        timestamp: new Date().toISOString(),
        source: 'medilens-chatbot'
      });
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'MediLens-Chatbot/1.0',
        },
        body: JSON.stringify({
          message: userMessage,
          context: initialContext,
          userEmail: user.email,
          userName: user.name,
          timestamp: new Date().toISOString(),
          source: 'medilens-chatbot'
        })
      });

      console.log('📥 Response status:', response.status);
      console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const responseText = await response.text();
      console.log('📄 Raw response:', responseText);
      
      let data;
      try {
        data = JSON.parse(responseText);
        console.log('✅ Parsed JSON response:', data);
      } catch (parseError) {
        console.error('⚠️ Failed to parse JSON response:', parseError);
        // If response is not JSON, treat it as plain text
        return responseText || 'Received response from workflow but could not parse it.';
      }
      
      // Return the response from n8n workflow
      return data.response || data.message || data.output || responseText || 'No response received from the workflow.';
      
    } catch (error) {
      console.error('💥 Error calling n8n webhook:', error);
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.error('🌐 Network error detected - check webhook URL and connectivity');
        throw new Error('Network error: Unable to connect to the n8n webhook. Please verify the webhook URL is correct and accessible.');
      }
      
      throw new Error(`AI service error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    const loadingMessage: Message = {
      id: (Date.now() + 1).toString(),
      type: 'bot',
      content: '',
      timestamp: new Date(),
      isLoading: true
    };

    setMessages(prev => [...prev, userMessage, loadingMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await simulateLLMResponse(inputMessage.trim());
      
      setMessages(prev => prev.map(msg => 
        msg.id === loadingMessage.id 
          ? { ...msg, content: response, isLoading: false }
          : msg
      ));
    } catch (error) {
      setMessages(prev => prev.map(msg => 
        msg.id === loadingMessage.id 
          ? { 
              ...msg, 
              content: 'I apologize, but I encountered an error processing your request. Please try again or contact support if the issue persists.',
              isLoading: false 
            }
          : msg
      ));
    }

    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="chatbot-page min-h-screen bg-gradient-to-br from-[var(--bg-dark)] to-[var(--bg-secondary)] relative">
      {/* Header */}
      <div className="header bg-[var(--glass-bg)] backdrop-blur-[30px] border-b border-[var(--glass-border)] p-4 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="back-btn p-2 bg-[rgba(255,255,255,0.1)] border border-[var(--glass-border)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.15)] transition-all duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <MedicalLogo size={40} />
            <div>
              <h1 className="text-[var(--text-primary)] text-xl font-['Orbitron'] font-semibold flex items-center gap-2">
                {getContextIcon()}
                {getContextTitle()}
              </h1>
              <p className="text-[var(--text-secondary)] text-sm">
                AI-powered healthcare assistant
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-[var(--text-secondary)] text-sm">
              {user.name}
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="chat-container max-w-4xl mx-auto p-4 h-[calc(100vh-140px)] flex flex-col">
        {/* Messages Area */}
        <div className="messages-area flex-1 overflow-y-auto mb-4 space-y-4 pr-2">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`message-wrapper flex ${
                message.type === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`message max-w-[80%] p-4 rounded-2xl ${
                  message.type === 'user'
                    ? 'bg-gradient-to-r from-[var(--primary-cyan)] to-[var(--primary-purple)] text-white ml-12'
                    : 'bg-[var(--glass-bg)] backdrop-blur-[20px] border border-[var(--glass-border)] text-[var(--text-primary)] mr-12'
                }`}
              >
                <div className="message-header flex items-center gap-2 mb-2">
                  {message.type === 'user' ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4 text-[var(--primary-cyan)]" />
                  )}
                  <span className="text-sm font-medium">
                    {message.type === 'user' ? 'You' : 'MediLens AI'}
                  </span>
                  <span className="text-xs opacity-70 ml-auto">
                    {message.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>
                <div className="message-content">
                  {message.isLoading ? (
                    <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Thinking...</span>
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap leading-relaxed">
                      {message.content}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="input-area bg-[var(--glass-bg)] backdrop-blur-[20px] border border-[var(--glass-border)] rounded-2xl p-4">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Ask about ${getContextTitle().toLowerCase()}...`}
                className="w-full p-3 bg-[rgba(255,255,255,0.08)] border border-[var(--glass-border)] rounded-xl text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--primary-cyan)] focus:shadow-[0_0_0_3px_rgba(0,212,170,0.15)] resize-none"
                disabled={isLoading}
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="send-btn p-3 bg-gradient-to-r from-[var(--primary-cyan)] to-[var(--primary-purple)] text-white rounded-xl hover:shadow-[0_4px_12px_rgba(0,212,170,0.3)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:transform hover:-translate-y-1"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
          <div className="mt-2 text-xs text-[var(--text-muted)] text-center">
            Press Enter to send • This AI provides educational information only
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatbotPage;