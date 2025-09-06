import React, { useState, useRef } from 'react';
import { X, Upload, Search, MessageSquare } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  type: 'upload' | 'search' | 'question';
  onSubmit?: (data: string) => void;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, type, onSubmit }) => {
  const [dragOver, setDragOver] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [question, setQuestion] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      console.log('Files dropped:', files);
      // Handle file upload logic here
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      console.log('Files selected:', files);
      // Handle file upload logic here
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (type === 'search' && searchQuery.trim()) {
      console.log('Search query:', searchQuery);
      setSearchQuery('');
      onClose();
    } else if (type === 'question' && question.trim() && onSubmit) {
      onSubmit(question);
      setQuestion('');
    }
  };

  const renderContent = () => {
    switch (type) {
      case 'upload':
        return (
          <>
            <div
              className={`file-upload-area border-2 border-dashed rounded-xl p-10 text-center mb-5 transition-all duration-300 cursor-pointer ${
                dragOver
                  ? 'border-[var(--primary-cyan)] bg-[rgba(0,212,170,0.1)]'
                  : 'border-[var(--glass-border)] hover:border-[var(--primary-cyan)] hover:bg-[rgba(0,212,170,0.05)]'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.dcm,.txt,.doc,.docx"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Upload className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4" />
              <h3 className="text-[var(--text-primary)] text-lg font-semibold mb-2">
                Drop files here or click to browse
              </h3>
              <p className="text-[var(--text-secondary)] text-sm">
                Supported formats: PDF, JPEG, PNG, DICOM, TXT, DOC, DOCX
              </p>
              <p className="text-[var(--text-muted)] text-xs mt-2">
                Maximum file size: 50MB per file
              </p>
            </div>
            <div className="text-center">
              <button
                onClick={onClose}
                className="feature-button p-[12px_24px] bg-gradient-to-r from-[var(--primary-cyan)] to-[var(--primary-purple)] text-white border-none rounded-[10px] font-semibold cursor-pointer transition-all duration-200 hover:transform hover:-translate-y-[2px] hover:shadow-[0_8px_20px_rgba(0,212,170,0.3)]"
              >
                Start Analysis
              </button>
            </div>
          </>
        );

      case 'search':
        return (
          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search medical literature, drug interactions, symptoms..."
                className="search-input w-full p-4 bg-[rgba(255,255,255,0.08)] border border-[var(--glass-border)] rounded-xl text-[var(--text-primary)] text-base mb-5 focus:outline-none focus:border-[var(--primary-cyan)] focus:shadow-[0_0_0_3px_rgba(0,212,170,0.15)]"
                autoFocus
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={!searchQuery.trim()}
                className="feature-button flex-1 p-[12px_24px] bg-gradient-to-r from-[var(--primary-cyan)] to-[var(--primary-purple)] text-white border-none rounded-[10px] font-semibold cursor-pointer transition-all duration-200 hover:transform hover:-translate-y-[2px] hover:shadow-[0_8px_20px_rgba(0,212,170,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Search className="w-4 h-4 mr-2 inline" />
                Search Database
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-[12px_24px] bg-[rgba(255,255,255,0.1)] border border-[var(--glass-border)] rounded-[10px] text-[var(--text-secondary)] cursor-pointer transition-all duration-200 hover:bg-[rgba(255,255,255,0.15)] hover:text-[var(--text-primary)]"
              >
                Cancel
              </button>
            </div>
          </form>
        );

      case 'question':
        return (
          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Describe the medical case, symptoms, or ask a specific question about diagnosis, treatment options, or medical procedures..."
                className="question-textarea w-full min-h-[120px] p-4 bg-[rgba(255,255,255,0.08)] border border-[var(--glass-border)] rounded-xl text-[var(--text-primary)] text-base resize-y mb-5 focus:outline-none focus:border-[var(--primary-cyan)] focus:shadow-[0_0_0_3px_rgba(0,212,170,0.15)]"
                autoFocus
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={!question.trim()}
                className="feature-button flex-1 p-[12px_24px] bg-gradient-to-r from-[var(--primary-cyan)] to-[var(--primary-purple)] text-white border-none rounded-[10px] font-semibold cursor-pointer transition-all duration-200 hover:transform hover:-translate-y-[2px] hover:shadow-[0_8px_20px_rgba(0,212,170,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <MessageSquare className="w-4 h-4 mr-2 inline" />
                Get AI Consultation
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-[12px_24px] bg-[rgba(255,255,255,0.1)] border border-[var(--glass-border)] rounded-[10px] text-[var(--text-secondary)] cursor-pointer transition-all duration-200 hover:bg-[rgba(255,255,255,0.15)] hover:text-[var(--text-primary)]"
              >
                Cancel
              </button>
            </div>
          </form>
        );

      default:
        return null;
    }
  };

  return (
    <div className="modal fixed top-0 left-0 w-full h-full bg-[rgba(0,0,0,0.8)] backdrop-blur-[5px] z-[1000] flex justify-center items-center p-5">
      <div className="modal-content bg-[var(--glass-bg)] backdrop-blur-[30px] border border-[var(--glass-border)] rounded-[20px] p-8 max-w-[500px] w-full relative">
        <div className="modal-header flex justify-between items-center mb-5">
          <h2 className="modal-title font-['Orbitron'] text-2xl font-semibold text-[var(--text-primary)]">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="close-btn bg-none border-none text-[var(--text-muted)] text-2xl cursor-pointer p-1 hover:text-[var(--text-primary)]"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        {renderContent()}
      </div>
    </div>
  );
};

export default Modal;