import React, { useState, useRef, useEffect } from 'react';
import { Send, ArrowLeft, Bot, User, Upload, Search, MessageSquare, Loader2, Plus, Menu, X, Clock, Trash2 } from 'lucide-react';
import MedicalLogo from './MedicalLogo';
import { User as UserType } from '../App';
import ThemeToggle from './ThemeToggle';
import { 
  createChatSession, 
  insertChatMessage, 
  getChatMessages, 
  updateChatSessionTitle,
  getChatSessions,
  deleteChatSession,
  getCurrentUser,
  ChatSession,
  ChatMessage as DBChatMessage
} from '../lib/supabase';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
  attachmentType?: string;
}

interface ChatbotPageProps {
  user: UserType;
  onBack: () => void;
  initialContext: 'upload' | 'medicine-search' | 'question';
  sessionId?: string;
  initialExtractedText?: string;
}

const ChatbotPage: React.FC<ChatbotPageProps> = ({ user, onBack, initialContext, sessionId, initialExtractedText = '' }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(sessionId || null);
  const [extractedText, setExtractedText] = useState<string>(initialExtractedText);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const [currentSessionTitle, setCurrentSessionTitle] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize chat session and load messages
  useEffect(() => {
    const initializeChat = async () => {
      // Verify user is authenticated with Supabase
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        console.error('User not authenticated with Supabase');
        return;
      }

      // Load user's chat sessions
      await loadChatSessions();
      
      if (sessionId) {
        // Load existing session
        setCurrentSessionId(sessionId);
        await loadChatMessages(sessionId);
        const sessions = await getChatSessions();
        const currentSession = sessions.find(s => s.id === sessionId);
        if (currentSession) {
          setCurrentSessionTitle(currentSession.title);
        }
      } else {
        // Create new session
        await createNewChatSession();
      }
      
      // Focus input after component mounts
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      
      // If we have initial extracted text, send it automatically
      if (initialExtractedText && !sessionId) {
        // Wait a bit for the session to be created, then send the message
        setTimeout(() => {
          handleSendMessage();
        }, 1000);
      }
    };

    initializeChat();

  const loadChatSessions = async () => {
    const sessions = await getChatSessions();
    setChatSessions(sessions);
  };

  const createNewChatSession = async () => {
    const session = await createChatSession({
      context: initialContext,
      title: getContextTitle()
    });

    if (session) {
      setCurrentSessionId(session.id);
      setCurrentSessionTitle(session.title);
      await loadChatSessions(); // Refresh sessions list
      
      // Add welcome message
      const welcomeMessage = getWelcomeMessage();
      const botMessage = await insertChatMessage({
        session_id: session.id,
        type: 'bot',
        content: welcomeMessage
      });

      if (botMessage) {
        setMessages([{
          id: botMessage.id,
          type: 'bot',
          content: botMessage.content,
          timestamp: new Date(botMessage.created_at)
        }]);
      }
    } else {
      // Fallback to local messages if Supabase is not configured
      const welcomeMessage = getWelcomeMessage();
      setCurrentSessionTitle(getContextTitle());
      setMessages([{
        id: Date.now().toString(),
        type: 'bot',
        content: welcomeMessage,
        timestamp: new Date()
      }]);
    }
  };

  const loadChatMessages = async (sessionId: string) => {
    const chatMessages = await getChatMessages(sessionId);
    const formattedMessages: Message[] = chatMessages.map(msg => ({
      id: msg.id,
      type: msg.type,
      content: msg.content,
      timestamp: new Date(msg.created_at),
      attachmentType: msg.attachment_type || undefined
    }));
    setMessages(formattedMessages);
  };

  const handleNewChat = async () => {
    setMessages([]);
    setCurrentSessionId(null);
    setCurrentSessionTitle('');
    setExtractedText('');
    setInputMessage('');
    setShowSidebar(false);
    await createNewChatSession();
  };

  const handleLoadSession = async (session: ChatSession) => {
    setCurrentSessionId(session.id);
    setCurrentSessionTitle(session.title);
    setExtractedText('');
    setInputMessage('');
    setShowSidebar(false);
    await loadChatMessages(session.id);
  };

  const handleDeleteSession = async (sessionId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    const success = await deleteChatSession(sessionId);
    if (success) {
      // Remove from local state
      setChatSessions(prev => prev.filter(s => s.id !== sessionId));
      
      // If we deleted the current session, create a new one
      if (currentSessionId === sessionId) {
        await handleNewChat();
      }
    } else {
      console.error('Failed to delete chat session');
    }
  };

  const formatSessionDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

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

  const simulateLLMResponse = async (userMessage: string, attachmentType?: string): Promise<string> => {
    try {
      const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL;
      
      if (!webhookUrl) {
        throw new Error('N8N webhook URL not configured. Please set VITE_N8N_WEBHOOK_URL in your .env file.');
      }
      
      console.log('🚀 Sending request to webhook:', webhookUrl);
      
      const payload = {
        message: userMessage,
        attachment: attachmentType || 'text',
        sessionid: currentSessionId || 'unknown'
      };
      
      console.log('📤 Request payload:', payload);
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'MediLens-Chatbot/1.0',
        },
        body: JSON.stringify(payload)
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
      
      // Extract and format the result field from JSON response
      return formatJsonResponse(data);
      
    } catch (error) {
      console.error('💥 Error calling n8n webhook:', error);
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.error('🌐 Network error detected - check webhook URL and connectivity');
        throw new Error('Network error: Unable to connect to the n8n webhook. Please verify the webhook URL is correct and accessible.');
      }
      
      throw new Error(`AI service error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
    }
  };

  const formatJsonResponse = (data: any): string => {
    console.log('🎨 Formatting JSON response:', data);
    
    // Extract the result field from the response
    const result = data.result || data.data || data.output || data.response || data;
    
    if (!result) {
      return 'No result data found in the response.';
    }
    
    // If result is a string, return it directly
    if (typeof result === 'string') {
      return result;
    }
    
    // If result is an object, format it nicely
    if (typeof result === 'object') {
      return formatObjectToText(result);
    }
    
    // For other types, convert to string
    return String(result);
  };

  const formatObjectToText = (obj: any): string => {
    let formatted = '';
    
    // Handle arrays
    if (Array.isArray(obj)) {
      obj.forEach((item, index) => {
        formatted += `${index + 1}. ${typeof item === 'object' ? formatObjectToText(item) : item}\n`;
      });
      return formatted.trim();
    }
    
    // Handle objects
    Object.entries(obj).forEach(([key, value]) => {
      const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
      
      if (typeof value === 'object' && value !== null) {
        formatted += `**${formattedKey}:**\n${formatObjectToText(value)}\n\n`;
      } else if (Array.isArray(value)) {
        formatted += `**${formattedKey}:**\n`;
        value.forEach((item, index) => {
          formatted += `  ${index + 1}. ${item}\n`;
        });
        formatted += '\n';
      } else {
        formatted += `**${formattedKey}:** ${value}\n`;
      }
    });
    
    return formatted.trim();
  };
  const handleSendMessage = async () => {
    const messageToSend = extractedText || inputMessage.trim();
    if (!messageToSend || isLoading) return;

    const attachmentType = extractedText ? 'image' : 'text';

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: messageToSend,
      timestamp: new Date(),
      attachmentType
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
    setExtractedText('');
    setIsLoading(true);

    // Save user message to database
    if (currentSessionId) {
      await insertChatMessage({
        session_id: currentSessionId,
        type: 'user',
        content: messageToSend,
        attachment_type: attachmentType
      });
    }

    try {
      const response = await simulateLLMResponse(messageToSend, attachmentType);
      
      setMessages(prev => prev.map(msg => 
        msg.id === loadingMessage.id 
          ? { ...msg, content: response, isLoading: false }
          : msg
      ));

      // Save bot response to database
      if (currentSessionId) {
        await insertChatMessage({
          session_id: currentSessionId,
          type: 'bot',
          content: response
        });
      }
    } catch (error) {
      const errorMessage = 'I apologize, but I encountered an error processing your request. Please try again or contact support if the issue persists.';
      
      setMessages(prev => prev.map(msg => 
        msg.id === loadingMessage.id 
          ? { 
              ...msg, 
              content: errorMessage,
              isLoading: false 
            }
          : msg
      ));

      // Save error response to database
      if (currentSessionId) {
        await insertChatMessage({
          session_id: currentSessionId,
          type: 'bot',
          content: errorMessage
        });
      }
    }

    setIsLoading(false);
  };

  const handleFileUpload = (text: string) => {
    setExtractedText(text);
    setInputMessage(''); // Clear input field when file is uploaded
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="chatbot-page min-h-screen bg-gradient-to-br from-[var(--bg-dark)] to-[var(--bg-secondary)] flex">
      {/* Sidebar Overlay */}
      {showSidebar && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed lg:relative left-0 top-0 h-full w-80 bg-[var(--glass-bg)] backdrop-blur-[30px] border-r border-[var(--glass-border)] z-50 transform transition-transform duration-300 ${
        showSidebar ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 lg:flex-shrink-0`}>
        <div className="p-4 border-b border-[var(--glass-border)]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[var(--text-primary)] font-['Orbitron'] font-semibold text-lg">
              Chat Sessions
            </h2>
            <button
              onClick={() => setShowSidebar(false)}
              className="lg:hidden p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <button
            onClick={handleNewChat}
            className="w-full p-3 bg-gradient-to-r from-[var(--primary-cyan)] to-[var(--primary-purple)] text-white rounded-xl font-medium transition-all duration-200 hover:shadow-[0_4px_12px_rgba(0,212,170,0.3)] flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {chatSessions.length === 0 ? (
            <div className="text-center text-[var(--text-muted)] py-8">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No chat sessions yet</p>
              <p className="text-xs mt-1">Start a new conversation</p>
            </div>
          ) : (
            <div className="space-y-2">
              {chatSessions.map((session) => (
                <div
                  key={session.id}
                  onClick={() => handleLoadSession(session)}
                  className={`p-3 rounded-xl cursor-pointer transition-all duration-200 group relative ${
                    currentSessionId === session.id
                      ? 'bg-gradient-to-r from-[var(--primary-cyan)] to-[var(--primary-purple)] text-white'
                      : 'bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm truncate mb-1">
                        {session.title}
                      </h3>
                      <div className="flex items-center gap-2 text-xs opacity-70">
                        <Clock className="w-3 h-3" />
                        <span>{formatSessionDate(session.updated_at)}</span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleDeleteSession(session.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[rgba(255,255,255,0.1)] rounded transition-all duration-200"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <div className="header bg-[var(--glass-bg)] backdrop-blur-[30px] border-b border-[var(--glass-border)] p-4 sticky top-0 z-30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowSidebar(true)}
                className="lg:hidden p-2 bg-[rgba(255,255,255,0.1)] border border-[var(--glass-border)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.15)] transition-all duration-200"
              >
                <Menu className="w-5 h-5" />
              </button>
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
                  {currentSessionTitle || getContextTitle()}
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
        <div className="chat-container flex-1 flex flex-col p-4 max-w-4xl mx-auto w-full">
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
                  value={extractedText || inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={extractedText ? 'Text extracted from file - press Enter to send' : `Ask about ${getContextTitle().toLowerCase()}...`}
                  className="w-full p-3 bg-[rgba(255,255,255,0.08)] border border-[var(--glass-border)] rounded-xl text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--primary-cyan)] focus:shadow-[0_0_0_3px_rgba(0,212,170,0.15)] resize-none"
                  disabled={isLoading}
                  readOnly={!!extractedText}
                />
              </div>
              <button
                onClick={handleSendMessage}
                disabled={(!inputMessage.trim() && !extractedText) || isLoading}
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
              Press Enter to send • Upload files for OCR text extraction • This AI provides educational information only
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatbotPage;