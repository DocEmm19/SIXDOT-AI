import React, { useState, useRef } from 'react';
import { X, Upload, Search, MessageSquare, Link, FileText } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  type: 'upload' | 'medicine-search' | 'question';
  onSubmit?: (data: string) => void;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, type, onSubmit }) => {
  const [dragOver, setDragOver] = useState(false);
  const [medicineQuery, setMedicineQuery] = useState('');
  const [question, setQuestion] = useState('');
  const [uploadTab, setUploadTab] = useState<'file' | 'url'>('file');
  const [urlInput, setUrlInput] = useState('');
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

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
    setUploadError('');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileValidation(files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError('');
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileValidation(files);
    }
  };

  const handleFileValidation = (files: FileList) => {
    const file = files[0]; // Only handle first file for now
    
    // Check file type
    if (file.type !== 'application/pdf') {
      setUploadError('Only PDF files are allowed');
      return;
    }
    
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      setUploadError('File size must be less than 10MB');
      return;
    }
    
    console.log('Valid file uploaded:', file);
    // Handle valid file upload logic here
    setUploadError('');
  };

  const handleUrlSubmit = () => {
    if (!urlInput.trim()) {
      setUploadError('Please enter a valid URL');
      return;
    }
    
    // Basic URL validation
    try {
      new URL(urlInput.trim());
      console.log('URL submitted:', urlInput.trim());
      // Handle URL processing logic here
      setUploadError('');
      onClose();
    } catch (error) {
      setUploadError('Please enter a valid URL');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (type === 'medicine-search' && medicineQuery.trim()) {
      console.log('Medicine search query:', medicineQuery);
      setMedicineQuery('');
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
            {/* Upload Tabs */}
            <div className="upload-tabs grid grid-cols-2 bg-[rgba(255,255,255,0.05)] rounded-xl p-1 mb-6 relative">
              <div
                className={`upload-tab p-3 text-center rounded-lg cursor-pointer transition-all duration-300 font-medium text-sm uppercase relative z-[2] ${
                  uploadTab === 'file'
                    ? 'bg-gradient-to-r from-[var(--primary-cyan)] to-[var(--primary-purple)] text-white shadow-[0_4px_12px_rgba(0,212,170,0.3)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.08)]'
                }`}
                onClick={() => {
                  setUploadTab('file');
                  setUploadError('');
                  setUrlInput('');
                }}
              >
                <FileText className="w-4 h-4 mx-auto mb-1" />
                Upload File
              </div>
              <div
                className={`upload-tab p-3 text-center rounded-lg cursor-pointer transition-all duration-300 font-medium text-sm uppercase relative z-[2] ${
                  uploadTab === 'url'
                    ? 'bg-gradient-to-r from-[var(--primary-cyan)] to-[var(--primary-purple)] text-white shadow-[0_4px_12px_rgba(0,212,170,0.3)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.08)]'
                }`}
                onClick={() => {
                  setUploadTab('url');
                  setUploadError('');
                }}
              >
                <Link className="w-4 h-4 mx-auto mb-1" />
                From URL
              </div>
            </div>

            {/* Error Message */}
            {uploadError && (
              <div className="error-message bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)] rounded-xl p-3 text-[#ef4444] text-sm mb-4 text-center">
                {uploadError}
              </div>
            )}

            {/* File Upload Tab */}
            {uploadTab === 'file' && (
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
                    accept=".pdf,application/pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Upload className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4" />
                  <h3 className="text-[var(--text-primary)] text-lg font-semibold mb-2">
                    Drop PDF file here or click to browse
                  </h3>
                  <p className="text-[var(--text-secondary)] text-sm">
                    Only PDF files are supported
                  </p>
                  <p className="text-[var(--text-muted)] text-xs mt-2">
                    Maximum file size: 10MB
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
            )}

            {/* URL Input Tab */}
            {uploadTab === 'url' && (
              <>
                <div className="url-input-section mb-5">
                  <label className="block text-[var(--text-primary)] text-sm font-medium mb-3">
                    Enter URL to document or website
                  </label>
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://example.com/document.pdf or any valid URL"
                    className="url-input w-full p-4 bg-[rgba(255,255,255,0.08)] border border-[var(--glass-border)] rounded-xl text-[var(--text-primary)] text-base focus:outline-none focus:border-[var(--primary-cyan)] focus:shadow-[0_0_0_3px_rgba(0,212,170,0.15)]"
                  />
                  <p className="text-[var(--text-muted)] text-xs mt-2">
                    You can provide URLs to documents, websites, or any online content
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleUrlSubmit}
                    disabled={!urlInput.trim()}
                    className="feature-button flex-1 p-[12px_24px] bg-gradient-to-r from-[var(--primary-cyan)] to-[var(--primary-purple)] text-white border-none rounded-[10px] font-semibold cursor-pointer transition-all duration-200 hover:transform hover:-translate-y-[2px] hover:shadow-[0_8px_20px_rgba(0,212,170,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Link className="w-4 h-4 mr-2 inline" />
                    Process URL
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="p-[12px_24px] bg-[rgba(255,255,255,0.1)] border border-[var(--glass-border)] rounded-[10px] text-[var(--text-secondary)] cursor-pointer transition-all duration-200 hover:bg-[rgba(255,255,255,0.15)] hover:text-[var(--text-primary)]"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </>
        );

      case 'medicine-search':
        return (
          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <input
                type="text"
                value={medicineQuery}
                onChange={(e) => setMedicineQuery(e.target.value)}
                placeholder="Enter medicine name (e.g., Paracetamol, Aspirin, Metformin)..."
                className="medicine-search-input w-full p-4 bg-[rgba(255,255,255,0.08)] border border-[var(--glass-border)] rounded-xl text-[var(--text-primary)] text-base mb-5 focus:outline-none focus:border-[var(--primary-cyan)] focus:shadow-[0_0_0_3px_rgba(0,212,170,0.15)]"
                autoFocus
              />
              <p className="text-[var(--text-muted)] text-sm mb-5">
                Get comprehensive information about medicines including usage instructions, dosage, side effects, contraindications, and drug interactions from trusted medical databases.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={!medicineQuery.trim()}
                className="feature-button flex-1 p-[12px_24px] bg-gradient-to-r from-[var(--primary-cyan)] to-[var(--primary-purple)] text-white border-none rounded-[10px] font-semibold cursor-pointer transition-all duration-200 hover:transform hover:-translate-y-[2px] hover:shadow-[0_8px_20px_rgba(0,212,170,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Search className="w-4 h-4 mr-2 inline" />
                Search Medicine
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
                placeholder="Ask about medications, side effects, dosage, or any health-related questions..."
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
                Ask Question
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