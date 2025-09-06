import React, { useState, useRef } from 'react';
import { X, Upload, Search, MessageSquare, Link, FileText } from 'lucide-react';
import { insertUserActivity } from '../lib/supabase';
import Tesseract from 'tesseract.js';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  type: 'upload' | 'medicine-search' | 'question';
  onSubmit?: (data: string) => void;
  userEmail?: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, type, onSubmit, userEmail }) => {
  const [dragOver, setDragOver] = useState(false);
  const [medicineQuery, setMedicineQuery] = useState('');
  const [question, setQuestion] = useState('');
  const [uploadTab, setUploadTab] = useState<'file' | 'url'>('file');
  const [urlInput, setUrlInput] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedText, setExtractedText] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
  const SUPPORTED_FILE_TYPES = [
    'application/pdf',
    'text/plain',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/bmp',
    'image/webp'
  ];

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

  const extractTextFromFile = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (file.type === 'text/plain') {
        // Handle text files
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result as string;
          resolve(text);
        };
        reader.onerror = () => reject(new Error('Failed to read text file'));
        reader.readAsText(file);
      } else if (file.type === 'application/pdf') {
        // For PDF files, we'll use a basic approach
        // Note: For full PDF support, you'd need pdf-parse or PDF.js
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const arrayBuffer = e.target?.result as ArrayBuffer;
            const text = new TextDecoder().decode(arrayBuffer);
            // Basic PDF text extraction (limited)
            const extractedText = text.replace(/[^\x20-\x7E\n]/g, ' ').trim();
            if (extractedText.length > 50) {
              resolve(`[PDF Content Extracted from: ${file.name}]\n\n${extractedText}`);
            } else {
              resolve(`[PDF file: ${file.name}]\n\nNote: This PDF may contain images or complex formatting. For better text extraction, please convert to image format or use a specialized PDF tool.`);
            }
          } catch (error) {
            reject(new Error('Failed to extract text from PDF'));
          }
        };
        reader.onerror = () => reject(new Error('Failed to read PDF file'));
        reader.readAsArrayBuffer(file);
      } else if (file.type.startsWith('image/')) {
        // Use Tesseract.js for real OCR text extraction
        Tesseract.recognize(file, 'eng', {
          logger: m => {
            if (m.status === 'recognizing text') {
              console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
            }
          }
        }).then(({ data: { text } }) => {
          if (text.trim()) {
            resolve(`[OCR Text Extracted from: ${file.name}]\n\n${text.trim()}`);
          } else {
            resolve(`[Image processed: ${file.name}]\n\nNo readable text was found in this image. The image may be too blurry, have poor contrast, or contain no text content.`);
          }
        }).catch((error) => {
          console.error('OCR Error:', error);
          reject(new Error(`Failed to extract text from image: ${error.message}`));
        });
      } else {
        reject(new Error('Unsupported file type for text extraction'));
      }
    });
  };

  const handleFileValidation = async (files: FileList) => {
    const file = files[0]; // Only handle first file for now
    
    // Check if file type is supported
    if (!SUPPORTED_FILE_TYPES.includes(file.type)) {
      setUploadError('Supported file types: PDF, TXT, JPG, PNG, GIF, BMP, WebP');
      return;
    }
    
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      setUploadError('File size must be less than 10MB');
      return;
    }
    
    setUploadError('');
    setUploadedFile(file);
    setIsProcessing(true);
    
    try {
      const extractedText = await extractTextFromFile(file);
      setExtractedText(extractedText);
      console.log('File processed successfully:', file.name);
      console.log('Extracted text:', extractedText);
    } catch (error) {
      setUploadError(`Failed to process file: ${(error as Error).message}`);
      setUploadedFile(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProcessFile = async () => {
    if (!extractedText) {
      console.error('Missing extracted text');
      return;
    }

    // If Supabase is not configured, show a different message
    if (!userEmail) {
      const successMessage = `File processed successfully! Extracted ${extractedText.length} characters from ${uploadedFile?.name}. Note: Database storage is not available - please configure Supabase to save data permanently.`;
      
      if (onSubmit) {
        onSubmit(successMessage);
      }
      
      // Reset state and close modal
      setExtractedText('');
      setUploadedFile(null);
      onClose();
      return;
    }

    setIsSaving(true);

    try {
      // Save extracted text to Supabase
      const result = await insertUserActivity({
        user_email: userEmail,
        extracted_text: extractedText,
        analysis_result: '', // Will be populated later with AI analysis
        file_name: uploadedFile?.name,
        file_type: uploadedFile?.type,
      });

      if (result) {
        console.log('Successfully saved extracted text to database:', result.id);
        
        // Show success message
        const successMessage = `File processed successfully! Extracted ${extractedText.length} characters from ${uploadedFile?.name}. Data saved to your activity history.`;
        
        if (onSubmit) {
          onSubmit(successMessage);
        }
        
        // Reset state and close modal
        setExtractedText('');
        setUploadedFile(null);
        onClose();
      } else {
        // Handle case when Supabase is not configured
        const warningMessage = `File processed successfully! Extracted ${extractedText.length} characters from ${uploadedFile?.name}. Note: Database storage is not available - please configure Supabase to save data permanently.`;
        
        if (onSubmit) {
          onSubmit(warningMessage);
        }
        
        // Reset state and close modal
        setExtractedText('');
        setUploadedFile(null);
        onClose();
      }
    } catch (error) {
      console.error('Error saving extracted text:', error);
      setUploadError('Failed to save extracted text. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleProcessFileOriginal = () => {
    if (extractedText && onSubmit) {
      onSubmit(extractedText);
      // Reset state
      setExtractedText('');
      setUploadedFile(null);
      onClose();
    }
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

  const resetUploadState = () => {
    setExtractedText('');
    setUploadedFile(null);
    setUploadError('');
    setIsProcessing(false);
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
                  resetUploadState();
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
                  resetUploadState();
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

            {/* Processing Message */}
            {isProcessing && (
              <div className="processing-message bg-[rgba(0,212,170,0.1)] border border-[rgba(0,212,170,0.3)] rounded-xl p-4 text-[var(--primary-cyan)] text-sm mb-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="w-4 h-4 border-2 border-[var(--primary-cyan)] border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing file...</span>
                </div>
                <p className="text-xs text-[var(--text-muted)]">
                  {uploadedFile?.type === 'application/pdf' && 'Extracting text from PDF... (This may take a moment)'}
                  {uploadedFile?.type === 'text/plain' && 'Reading text file...'}
                  {uploadedFile?.type.startsWith('image/') && 'Performing OCR on image... (This may take 30-60 seconds)'}
                </p>
              </div>
            )}

            {/* Extracted Text Preview */}
            {extractedText && !isProcessing && (
              <div className="extracted-text-preview bg-[rgba(0,212,170,0.1)] border border-[rgba(0,212,170,0.3)] rounded-xl p-4 mb-4">
                <h4 className="text-[var(--text-primary)] font-semibold mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[var(--primary-cyan)]" />
                  Extracted Text Preview
                </h4>
                <div className="max-h-32 overflow-y-auto bg-[rgba(255,255,255,0.05)] rounded-lg p-3 text-sm text-[var(--text-secondary)] leading-relaxed">
                  {extractedText.substring(0, 300)}
                  {extractedText.length > 300 && '...'}
                </div>
                <p className="text-xs text-[var(--text-muted)] mt-2">
                  {extractedText.length} characters extracted from {uploadedFile?.name}
                </p>
              </div>
            )}

            {/* File Upload Tab */}
            {uploadTab === 'file' && (
              <>
                {!extractedText && !isProcessing && (
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
                      accept=".pdf,.txt,.jpg,.jpeg,.png,.gif,.bmp,.webp,application/pdf,text/plain,image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <Upload className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4" />
                    <h3 className="text-[var(--text-primary)] text-lg font-semibold mb-2">
                      Drop files here or click to browse
                    </h3>
                    <p className="text-[var(--text-secondary)] text-sm mb-2">
                      Supported formats: PDF, TXT, JPG, PNG, GIF, BMP, WebP
                    </p>
                    <div className="text-xs text-[var(--text-muted)] space-y-1">
                      <p>• PDF files: Text extraction</p>
                      <p>• Text files: Direct content reading</p>
                      <p>• Images: OCR text recognition (may take 30-60 seconds)</p>
                      <p className="mt-2">Maximum file size: 10MB</p>
                    </div>
                  </div>
                )}
                
                {extractedText && !isProcessing && (
                  <div className="flex gap-3">
                    <button
                      onClick={handleProcessFile}
                      disabled={isSaving}
                      className="feature-button flex-1 p-[12px_24px] bg-gradient-to-r from-[var(--primary-cyan)] to-[var(--primary-purple)] text-white border-none rounded-[10px] font-semibold cursor-pointer transition-all duration-200 hover:transform hover:-translate-y-[2px] hover:shadow-[0_8px_20px_rgba(0,212,170,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isSaving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <FileText className="w-4 h-4" />
                          Analyze Extracted Text
                        </>
                      )}
                    </button>
                    <button
                      onClick={resetUploadState}
                      disabled={isSaving}
                      className="p-[12px_24px] bg-[rgba(255,255,255,0.1)] border border-[var(--glass-border)] rounded-[10px] text-[var(--text-secondary)] cursor-pointer transition-all duration-200 hover:bg-[rgba(255,255,255,0.15)] hover:text-[var(--text-primary)] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Upload Different File
                    </button>
                  </div>
                )}
                
                {!extractedText && !isProcessing && (
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={onClose}
                      className="p-[12px_24px] bg-[rgba(255,255,255,0.1)] border border-[var(--glass-border)] rounded-[10px] text-[var(--text-secondary)] cursor-pointer transition-all duration-200 hover:bg-[rgba(255,255,255,0.15)] hover:text-[var(--text-primary)]"
                    >
                      Cancel
                    </button>
                  </div>
                )}
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