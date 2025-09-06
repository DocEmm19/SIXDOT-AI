import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, ArrowLeft, Upload, Search, MessageSquare, Paperclip, Link, Loader } from 'lucide-react';
import MedicalLogo from './MedicalLogo';
import { User as UserType } from '../App';

interface ChatBotPageProps {
  user: UserType;
  onBack: () => void;
  initialFeature: 'upload' | 'search' | 'question';
}

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  attachments?: File[];
  url?: string;
}

const ChatBotPage: React.FC<ChatBotPageProps> = ({ user, onBack, initialFeature }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [documentUrl, setDocumentUrl] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Send initial greeting based on the feature
    const getInitialMessage = () => {
      switch (initialFeature) {
        case 'upload':
          return "Hello! I'm your medical AI assistant. I can help you analyze medical documents, prescriptions, and lab results. Please upload a PDF file or provide a document URL to get started.";
        case 'search':
          return "Hello! I'm here to help you search for medicine information. You can ask me about medications, their uses, side effects, interactions, or any other medical questions you have.";
        case 'question':
          return "Hello! I'm your medical AI assistant. Feel free to ask me any questions about medications, health conditions, symptoms, or medical research. How can I help you today?";
        default:
          return "Hello! I'm your medical AI assistant. How can I help you today?";
      }
    };

    const initialMessage: Message = {
      id: Date.now().toString(),
      type: 'bot',
      content: getInitialMessage(),
      timestamp: new Date()
    };

    setMessages([initialMessage]);
  }, [initialFeature]);

  const getFeatureTitle = () => {
    switch (initialFeature) {
      case 'upload': return 'Medical File Analysis';
      case 'search': return 'Medicine Information Search';
      case 'question': return 'Medical AI Assistant';
      default: return 'Medical AI Assistant';
    }
  };

  const getFeatureIcon = () => {
    switch (initialFeature) {
      case 'upload': return <Upload className="w-5 h-5" />;
      case 'search': return <Search className="w-5 h-5" />;
      case 'question': return <MessageSquare className="w-5 h-5" />;
      default: return <Bot className="w-5 h-5" />;
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const validFiles = Array.from(files).filter(file => {
        if (file.size > 2 * 1024 * 1024) {
          alert(`${file.name} exceeds 2MB limit`);
          return false;
        }
        if (file.type !== 'application/pdf') {
          alert(`${file.name} is not a PDF file`);
          return false;
        }
        return true;
      });
      
      setAttachedFiles(prev => [...prev, ...validFiles]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUrlSubmit = () => {
    if (documentUrl.trim()) {
      setInputMessage(`Please analyze this document: ${documentUrl}`);
      setDocumentUrl('');
      setShowUrlInput(false);
    }
  };

  const simulateLLMResponse = async (userMessage: string, files?: File[], url?: string): Promise<string> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock LLM responses based on content
    if (files && files.length > 0) {
      return `I've analyzed your uploaded document(s): ${files.map(f => f.name).join(', ')}. Based on the medical information provided, I can see this appears to be a prescription/medical document. Here are the key findings:

**Document Analysis:**
- Document type: Medical prescription/report
- Key medications identified: [Based on document content]
- Dosage instructions: [Extracted from document]
- Important warnings: [Safety information]

**Recommendations:**
- Follow the prescribed dosage exactly as indicated
- Be aware of potential side effects
- Consult your healthcare provider if you experience any adverse reactions

*Note: This analysis is for informational purposes only and should not replace professional medical advice.*`;
    }

    if (url) {
      return `I've processed the document from the provided URL. Here's my analysis:

**Document Summary:**
- Successfully accessed and analyzed the medical document
- Key information extracted and processed
- Medical terminology and instructions identified

**Key Findings:**
- [Document-specific medical information would be displayed here]
- [Medication details, dosages, and instructions]
- [Important safety warnings and contraindications]

Please note that this analysis is based on the document content and is for educational purposes only.`;
    }

    // Medicine search responses
    if (userMessage.toLowerCase().includes('aspirin') || userMessage.toLowerCase().includes('ibuprofen') || userMessage.toLowerCase().includes('medicine') || userMessage.toLowerCase().includes('medication')) {
      return `Based on your query about "${userMessage}", here's the medical information:

**Medication Overview:**
- Generic name and brand names
- Primary therapeutic uses
- Mechanism of action

**Dosage Information:**
- Standard adult dosage
- Pediatric considerations
- Administration guidelines

**Side Effects:**
- Common: Mild gastrointestinal effects
- Uncommon: Allergic reactions
- Serious: [Rare but important warnings]

**Drug Interactions:**
- May interact with blood thinners
- Caution with other NSAIDs
- Consult healthcare provider about current medications

**Important Safety Information:**
- Not recommended during pregnancy without medical supervision
- May cause stomach irritation if taken on empty stomach
- Seek immediate medical attention if severe allergic reactions occur

*Source: FDA databases and peer-reviewed medical literature*`;
    }

    // COVID-19 research response
    if (userMessage.toLowerCase().includes('covid') || userMessage.toLowerCase().includes('coronavirus')) {
      return `Here's the latest research information on COVID-19:

**Current Research Findings:**
- Ongoing studies on long-term effects
- Vaccine effectiveness and booster recommendations
- Treatment protocols and therapeutic advances

**Key Medical Insights:**
- Symptoms and progression patterns
- Risk factors and vulnerable populations
- Prevention strategies and public health measures

**Recent Developments:**
- New variant surveillance
- Updated treatment guidelines
- Breakthrough infection studies

**Clinical Recommendations:**
- Follow current CDC guidelines
- Maintain vaccination status
- Consult healthcare providers for personalized advice

*Information compiled from WHO, CDC, and peer-reviewed medical journals*`;
    }

    // General medical question response
    return `Thank you for your question: "${userMessage}"

Based on current medical knowledge and research:

**Medical Analysis:**
- Your query relates to important health considerations
- Multiple factors may influence the medical situation you're asking about
- Evidence-based information suggests several key points

**Clinical Considerations:**
- Individual medical history is important
- Consultation with healthcare providers is recommended
- Treatment approaches may vary based on specific circumstances

**Recommendations:**
- Discuss with your healthcare provider for personalized advice
- Consider your individual medical history and current medications
- Follow evidence-based medical guidelines

**Important Disclaimer:**
This information is for educational purposes only and should not replace professional medical advice, diagnosis, or treatment. Always consult qualified healthcare providers for medical decisions.

*Sources: Medical literature, clinical guidelines, and healthcare databases*`;
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() && attachedFiles.length === 0) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage || 'File uploaded for analysis',
      timestamp: new Date(),
      attachments: attachedFiles.length > 0 ? [...attachedFiles] : undefined,
      url: documentUrl || undefined
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setInputMessage('');
    setAttachedFiles([]);

    try {
      const response = await simulateLLMResponse(inputMessage, attachedFiles, documentUrl);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: 'I apologize, but I encountered an error processing your request. Please try again or contact support if the issue persists.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
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
    <div className="chatbot-page min-h-screen bg-gradient-to-br from-[var(--bg-dark)] to-[var(--bg-secondary)]">
      {/* Header */}
      <div className="header bg-[var(--glass-bg)] backdrop-blur-[30px] border-b border-[var(--glass-border)] p-[20px_40px] flex justify-between items-center sticky top-0 z-[100]">
        <div className="header-left flex items-center gap-4">
          <button
            onClick={onBack}
            className="back-btn p-2 bg-[rgba(255,255,255,0.1)] border border-[var(--glass-border)] rounded-lg text-[var(--text-secondary)] cursor-pointer transition-all duration-200 hover:bg-[rgba(255,255,255,0.15)] hover:text-[var(--text-primary)]"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <MedicalLogo size={50} />
          <div className="header-info">
            <h1 className="header-title font-['Orbitron'] text-[var(--text-primary)] text-xl font-semibold flex items-center gap-2">
              {getFeatureIcon()}
              {getFeatureTitle()}
            </h1>
            <p className="header-subtitle text-[var(--text-secondary)] text-sm">
              AI-powered medical assistance
            </p>
          </div>
        </div>
        <div className="header-right flex items-center gap-4">
          <div className="user-info text-[var(--text-secondary)] text-sm">
            {user.name}
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="chat-container max-w-4xl mx-auto p-6 h-[calc(100vh-100px)] flex flex-col">
        {/* Messages Area */}
        <div className="messages-area flex-1 overflow-y-auto mb-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`message-wrapper flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`message-bubble max-w-[80%] p-4 rounded-2xl ${
                message.type === 'user'
                  ? 'bg-gradient-to-r from-[var(--primary-cyan)] to-[var(--primary-purple)] text-white'
                  : 'bg-[var(--glass-bg)] backdrop-blur-[20px] border border-[var(--glass-border)] text-[var(--text-primary)]'
              }`}>
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
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                
                {message.attachments && message.attachments.length > 0 && (
                  <div className="attachments mb-2">
                    {message.attachments.map((file, index) => (
                      <div key={index} className="attachment-item flex items-center gap-2 text-sm opacity-90 mb-1">
                        <Paperclip className="w-3 h-3" />
                        <span>{file.name}</span>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="message-content whitespace-pre-wrap leading-relaxed">
                  {message.content}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="message-wrapper flex justify-start">
              <div className="message-bubble bg-[var(--glass-bg)] backdrop-blur-[20px] border border-[var(--glass-border)] text-[var(--text-primary)] p-4 rounded-2xl">
                <div className="message-header flex items-center gap-2 mb-2">
                  <Bot className="w-4 h-4 text-[var(--primary-cyan)]" />
                  <span className="text-sm font-medium">MediLens AI</span>
                </div>
                <div className="flex items-center gap-2">
                  <Loader className="w-4 h-4 animate-spin text-[var(--primary-cyan)]" />
                  <span className="text-sm">Analyzing your request...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="input-area bg-[var(--glass-bg)] backdrop-blur-[30px] border border-[var(--glass-border)] rounded-2xl p-4">
          {/* Attachments Display */}
          {attachedFiles.length > 0 && (
            <div className="attachments-preview mb-3 flex flex-wrap gap-2">
              {attachedFiles.map((file, index) => (
                <div key={index} className="attachment-tag bg-[rgba(0,212,170,0.1)] border border-[rgba(0,212,170,0.3)] rounded-lg px-3 py-1 flex items-center gap-2 text-sm">
                  <Paperclip className="w-3 h-3" />
                  <span>{file.name}</span>
                  <button
                    onClick={() => removeAttachment(index)}
                    className="text-red-400 hover:text-red-300 ml-1"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* URL Input */}
          {showUrlInput && (
            <div className="url-input-section mb-3 p-3 bg-[rgba(255,255,255,0.05)] rounded-lg">
              <div className="flex gap-2">
                <input
                  type="url"
                  value={documentUrl}
                  onChange={(e) => setDocumentUrl(e.target.value)}
                  placeholder="Enter document URL (PDF only)"
                  className="flex-1 p-2 bg-[rgba(255,255,255,0.08)] border border-[var(--glass-border)] rounded-lg text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--primary-cyan)]"
                />
                <button
                  onClick={handleUrlSubmit}
                  disabled={!documentUrl.trim()}
                  className="px-4 py-2 bg-[var(--primary-cyan)] text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add URL
                </button>
                <button
                  onClick={() => {
                    setShowUrlInput(false);
                    setDocumentUrl('');
                  }}
                  className="px-3 py-2 bg-[rgba(255,255,255,0.1)] text-[var(--text-secondary)] rounded-lg text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Main Input */}
          <div className="input-wrapper flex items-end gap-3">
            <div className="input-actions flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="action-btn p-2 bg-[rgba(255,255,255,0.1)] border border-[var(--glass-border)] rounded-lg text-[var(--text-secondary)] cursor-pointer transition-all duration-200 hover:bg-[rgba(255,255,255,0.15)] hover:text-[var(--text-primary)]"
                title="Upload PDF file"
              >
                <Paperclip className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowUrlInput(!showUrlInput)}
                className="action-btn p-2 bg-[rgba(255,255,255,0.1)] border border-[var(--glass-border)] rounded-lg text-[var(--text-secondary)] cursor-pointer transition-all duration-200 hover:bg-[rgba(255,255,255,0.15)] hover:text-[var(--text-primary)]"
                title="Add document URL"
              >
                <Link className="w-4 h-4" />
              </button>
            </div>
            
            <div className="message-input-wrapper flex-1 relative">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message here..."
                className="message-input w-full p-3 pr-12 bg-[rgba(255,255,255,0.08)] border border-[var(--glass-border)] rounded-xl text-[var(--text-primary)] text-sm resize-none focus:outline-none focus:border-[var(--primary-cyan)] focus:shadow-[0_0_0_3px_rgba(0,212,170,0.15)] placeholder:text-[var(--text-muted)]"
                rows={1}
                style={{ minHeight: '44px', maxHeight: '120px' }}
              />
            </div>
            
            <button
              onClick={handleSendMessage}
              disabled={(!inputMessage.trim() && attachedFiles.length === 0) || isLoading}
              className="send-btn p-3 bg-gradient-to-r from-[var(--primary-cyan)] to-[var(--primary-purple)] text-white border-none rounded-xl cursor-pointer transition-all duration-200 hover:transform hover:-translate-y-[1px] hover:shadow-[0_8px_20px_rgba(0,212,170,0.3)] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBotPage;