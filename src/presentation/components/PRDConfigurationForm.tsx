import { useState, type FormEvent } from 'react';
import { Upload, Settings, Send, X } from 'lucide-react';
import { PRDPreview } from './PRDPreview.tsx';
import { ProviderSelector } from './ProviderSelector.tsx';
import { CodebaseSelector } from './CodebaseSelector.tsx';
import { useChatConversation } from '../hooks/useChatConversation.ts';
import { useSystemStatus } from '../hooks/useSystemStatus.ts';
import { DIContainer } from '../../shared/DIContainer.ts';
import './PRDConfigurationForm.css';

interface PRDConfigurationFormProps {
  onGenerate?: (data: { title: string; description: string; priority: string; provider: string }) => void;
  onBack?: () => void;
}

export function PRDConfigurationForm({ onGenerate, onBack }: PRDConfigurationFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [provider, setProvider] = useState('');
  const [codebaseId, setCodebaseId] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [includeUserStories, setIncludeUserStories] = useState(true);
  const [includeTechnicalSpecs, setIncludeTechnicalSpecs] = useState(true);
  const [includeTimeline, setIncludeTimeline] = useState(false);
  const [clarificationAnswers, setClarificationAnswers] = useState<string>('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<{ [key: string]: string }>({});
  const [isUploadingMockups, setIsUploadingMockups] = useState(false);
  const [mockupUploadProgress, setMockupUploadProgress] = useState(0);
  const [_currentRequestId, setCurrentRequestId] = useState<string | null>(null);

  const {
    isGenerating,
    currentPRD,
    pendingClarification,
    generationProgress,
    currentSection,
    sendMessage,
    answerClarification,
  } = useChatConversation();

  const container = DIContainer.getInstance();
  const uploadMockupUseCase = container.uploadMockupUseCase;
  const prdRepository = container.prdRepository;
  const systemStatus = useSystemStatus();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    // Filter for images and PDFs
    const validFiles = files.filter(file =>
      file.type.startsWith('image/') || file.type === 'application/pdf'
    );

    setUploadedFiles(prev => [...prev, ...validFiles]);

    // Generate previews for images
    validFiles.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreviews(prev => ({
            ...prev,
            [file.name]: reader.result as string
          }));
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeFile = (fileName: string) => {
    setUploadedFiles(prev => prev.filter(f => f.name !== fileName));
    setFilePreviews(prev => {
      const newPreviews = { ...prev };
      delete newPreviews[fileName];
      return newPreviews;
    });
  };

  const handleClarificationSubmit = () => {
    if (clarificationAnswers.trim()) {
      answerClarification(clarificationAnswers);
      setClarificationAnswers('');
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      return;
    }

    try {
      // Step 1: Create PRD request first using Request-First workflow
      console.log('📝 Creating PRD request...');
      const prdRequest = await prdRepository.createRequest({
        title,
        description,
        priority: priority.toLowerCase(),
        preferredProvider: provider || undefined,
      });

      const requestId = prdRequest.id;
      setCurrentRequestId(requestId);
      console.log(`✅ PRD request created with ID: ${requestId}`);

      // Step 2: Link codebase if selected
      if (codebaseId) {
        try {
          const linkCodebaseUseCase = container.linkCodebaseToPRDUseCase;
          await linkCodebaseUseCase.execute({
            codebaseId: codebaseId,
            prdId: requestId
          });
          console.log(`🔗 Linked codebase ${codebaseId} to PRD ${requestId}`);
        } catch (error) {
          console.error('❌ Failed to link codebase:', error);
          // Continue anyway - not critical
        }
      }

      // Step 3: Upload mockups if any (now with valid request ID)
      if (uploadedFiles.length > 0) {
        setIsUploadingMockups(true);
        setMockupUploadProgress(0);

        try {
          const totalFiles = uploadedFiles.length;
          let uploadedCount = 0;
          const uploadedIds: string[] = [];

          console.log(`📸 Uploading ${totalFiles} mockup(s)...`);
          for (const file of uploadedFiles) {
            const upload = await uploadMockupUseCase.execute(requestId, file);
            uploadedIds.push(upload.id);
            uploadedCount++;
            setMockupUploadProgress(Math.round((uploadedCount / totalFiles) * 100)); // 100% for uploads
          }

          console.log(`✅ Mockups uploaded, analyzing with Apple Intelligence...`);

          // Poll for analysis completion
          const mockupRepository = container.getMockupRepository();
          const pollInterval = setInterval(async () => {
            try {
              let allAnalyzed = true;
              let analyzedCount = 0;

              for (const uploadId of uploadedIds) {
                const { upload } = await mockupRepository.getMockupWithUrl(uploadId);
                if (upload.isProcessed) {
                  analyzedCount++;
                } else {
                  allAnalyzed = false;
                }
              }

              // Update progress for analysis phase (0-100%)
              const analysisProgress = Math.round((analyzedCount / uploadedIds.length) * 100);
              setMockupUploadProgress(analysisProgress);

              if (allAnalyzed) {
                clearInterval(pollInterval);
                console.log(`✅ Successfully analyzed ${analyzedCount} mockups with Apple Intelligence`);
                setIsUploadingMockups(false);
                setMockupUploadProgress(0);
              }
            } catch (error) {
              console.error('Error polling mockup status:', error);
              clearInterval(pollInterval);
              setIsUploadingMockups(false);
              setMockupUploadProgress(0);
            }
          }, 2000); // Poll every 2 seconds

          // Safety timeout after 2 minutes
          setTimeout(() => {
            clearInterval(pollInterval);
            if (isUploadingMockups) {
              console.warn('⚠️ Mockup analysis timed out, continuing anyway');
              setIsUploadingMockups(false);
              setMockupUploadProgress(0);
            }
          }, 120000);

        } catch (error) {
          console.error('❌ Failed to upload mockups:', error);
          alert('Failed to upload mockups. Please check the error and try again.');
          setIsUploadingMockups(false);
          setMockupUploadProgress(0);
          return; // Stop if mockups fail
        }
      }

      // Step 4: Build the PRD request message
      let requestMessage = `Product Title: ${title}\n\nDescription: ${description}\n\nPriority: ${priority}`;

      // Add mockup context if available
      if (uploadedFiles.length > 0) {
        requestMessage += `\n\n📸 ${uploadedFiles.length} mockup(s) uploaded for analysis`;
      }

      // Add advanced options if enabled
      const enabledOptions = [];
      if (includeUserStories) enabledOptions.push('User Stories');
      if (includeTechnicalSpecs) enabledOptions.push('Technical Specifications');
      if (includeTimeline) enabledOptions.push('Development Timeline');

      if (enabledOptions.length > 0) {
        requestMessage += `\n\nPlease include the following sections: ${enabledOptions.join(', ')}`;
      }

      // Step 5: Trigger the WebSocket-based generation with actual PRD request ID
      await sendMessage(requestMessage, requestId);

      // Notify parent if callback provided
      if (onGenerate) {
        onGenerate({ title, description, priority, provider });
      }
    } catch (error) {
      console.error('Error in form submission:', error);
    }
  };

  return (
    <div className="prd-config-container">
      {/* Header */}
      <div className="prd-config-header">
        <div className="back-button" onClick={onBack}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
        <div>
          <h1 className="prd-config-title">PRD Builder</h1>
          <p className="prd-config-subtitle">Create comprehensive Product Requirements Documents</p>
        </div>
        <div className="system-status">
          <span className="status-label">System Status:</span>
          <div className="status-badges">
            <span className={`status-badge ${systemStatus.provider.status}`}>
              {systemStatus.provider.name}
            </span>
            <span className={`status-badge ${systemStatus.server.status}`}>
              Server
            </span>
            <span className={`status-badge ${systemStatus.database.status}`}>
              Database
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="prd-config-content">
        {/* Left Panel - Form */}
        <div className="prd-config-panel">
          <div className="panel-header">
            <h2 className="panel-title">PRD Configuration</h2>
            <p className="panel-description">Configure your Product Requirements Document generation settings</p>
          </div>

          <form onSubmit={handleSubmit} className="prd-form">
            {/* Product Title */}
            <div className="form-group">
              <label className="form-label">
                Product Title <span className="required">*</span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="Enter your product name..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Product Description */}
            <div className="form-group">
              <label className="form-label">
                Product Description <span className="required">*</span>
              </label>
              <textarea
                className="form-textarea"
                placeholder="Describe your product idea, key features, and objectives..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
                required
              />
            </div>

            {/* Priority */}
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select
                className="form-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            {/* AI Provider */}
            <ProviderSelector
              value={provider}
              onChange={setProvider}
              disabled={isGenerating}
            />

            {/* Codebase Context */}
            <CodebaseSelector
              value={codebaseId}
              onChange={setCodebaseId}
              disabled={isGenerating}
            />

            {/* Mockups & References */}
            <div className="form-group">
              <label className="form-label">Mockups & References (Optional)</label>
              <input
                type="file"
                id="file-upload"
                className="file-input"
                multiple
                accept="image/*,application/pdf"
                onChange={handleFileUpload}
              />
              <label htmlFor="file-upload" className="upload-area">
                <Upload size={32} className="upload-icon" />
                <p className="upload-title">Click to upload mockups, wireframes, or design references</p>
                <p className="upload-subtitle">Supports images and PDFs (Max 10MB each)</p>
              </label>

              {/* File Previews */}
              {uploadedFiles.length > 0 && (
                <div className="file-previews">
                  {uploadedFiles.map((file) => (
                    <div key={file.name} className="file-preview-card">
                      {filePreviews[file.name] ? (
                        <div
                          className="file-thumbnail"
                          style={{ backgroundImage: `url(${filePreviews[file.name]})` }}
                        />
                      ) : (
                        <div className="file-thumbnail pdf">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                          </svg>
                        </div>
                      )}
                      <div className="file-info">
                        <p className="file-name">{file.name}</p>
                        <p className="file-size">{(file.size / 1024).toFixed(1)} KB</p>
                      </div>
                      <button
                        type="button"
                        className="file-remove"
                        onClick={() => removeFile(file.name)}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Advanced Options */}
            <div className="advanced-options">
              <button
                type="button"
                className="advanced-toggle"
                onClick={() => setShowAdvanced(!showAdvanced)}
              >
                <Settings size={16} />
                Advanced Options
                <span className="advanced-action">{showAdvanced ? 'Hide' : 'Show'}</span>
              </button>

              {showAdvanced && (
                <div className="advanced-content">
                  <h3 className="advanced-section-title">Generation Options</h3>

                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      className="checkbox-input"
                      checked={includeUserStories}
                      onChange={(e) => setIncludeUserStories(e.target.checked)}
                    />
                    <span className="checkbox-text">Include User Stories</span>
                  </label>

                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      className="checkbox-input"
                      checked={includeTechnicalSpecs}
                      onChange={(e) => setIncludeTechnicalSpecs(e.target.checked)}
                    />
                    <span className="checkbox-text">Include Technical Specifications</span>
                  </label>

                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      className="checkbox-input"
                      checked={includeTimeline}
                      onChange={(e) => setIncludeTimeline(e.target.checked)}
                    />
                    <span className="checkbox-text">Include Development Timeline</span>
                  </label>
                </div>
              )}
            </div>

            {/* Mockup Upload Progress */}
            {isUploadingMockups && (
              <div className="mockup-upload-progress">
                <p>
                  {mockupUploadProgress === 100
                    ? `Analysis complete! 100%`
                    : `Analyzing with Apple Intelligence... ${mockupUploadProgress}%`}
                </p>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${mockupUploadProgress}%` }}
                  />
                </div>
                {mockupUploadProgress < 100 && (
                  <p className="progress-detail">🍎 Apple Intelligence is analyzing UI elements, layout, and business logic...</p>
                )}
              </div>
            )}

            {/* Generate Button */}
            <button
              type="submit"
              className="generate-button"
              disabled={isGenerating || isUploadingMockups || !title.trim() || !description.trim()}
            >
              <Send size={18} />
              {isUploadingMockups
                ? 'Uploading Mockups...'
                : isGenerating
                ? 'Generating...'
                : 'Generate PRD'}
            </button>
          </form>
        </div>

        {/* Right Panel - PRD Preview */}
        <div className="prd-preview-panel">
          <PRDPreview
            prd={currentPRD}
            isGenerating={isGenerating}
            progress={generationProgress}
            currentSection={currentSection}
          />
        </div>
      </div>

      {/* Clarification Dialog */}
      {pendingClarification && pendingClarification.length > 0 && (
        <div className="clarification-overlay">
          <div className="clarification-dialog">
            <div className="clarification-header">
              <h3>Additional Information Needed</h3>
              <button
                className="close-button"
                onClick={() => {
                  // Send empty answers to continue
                  answerClarification('continue');
                }}
              >
                <X size={20} />
              </button>
            </div>
            <div className="clarification-content">
              <p className="clarification-description">
                Please answer the following questions to help generate a more accurate PRD:
              </p>
              <ol className="clarification-questions">
                {pendingClarification.map((question, index) => (
                  <li key={index}>{question}</li>
                ))}
              </ol>
              <textarea
                className="clarification-textarea"
                placeholder="Enter your answers here (one per line)..."
                value={clarificationAnswers}
                onChange={(e) => setClarificationAnswers(e.target.value)}
                rows={6}
              />
            </div>
            <div className="clarification-footer">
              <button
                className="clarification-button secondary"
                onClick={() => answerClarification('continue')}
              >
                Skip
              </button>
              <button
                className="clarification-button primary"
                onClick={handleClarificationSubmit}
                disabled={!clarificationAnswers.trim()}
              >
                Submit Answers
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}