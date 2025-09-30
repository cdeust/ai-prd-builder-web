import { FileText, Clock, Sparkles } from 'lucide-react';
import './PRDLivePreview.css';

interface PRDSection {
  title: string;
  content: string;
  confidence: number;
  tag: string;
}

interface PRDLivePreviewProps {
  productTitle?: string;
  timestamp?: string;
  aiProvider?: string;
  overallConfidence?: number;
  sections: PRDSection[];
  isGenerating?: boolean;
}

export function PRDLivePreview({
  productTitle,
  timestamp,
  aiProvider = 'swift-ai',
  overallConfidence,
  sections,
  isGenerating = false,
}: PRDLivePreviewProps) {
  if (!productTitle && sections.length === 0) {
    return (
      <div className="prd-live-preview">
        <div className="empty-preview">
          <div className="empty-preview-icon">
            <FileText size={64} strokeWidth={1.5} />
          </div>
          <h3 className="empty-preview-title">No PRD Generated Yet</h3>
          <p className="empty-preview-description">
            Fill out the form and click "Generate PRD" to see your document preview here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="prd-live-preview">
      <div className="preview-content">
        {/* Header */}
        <div className="preview-header">
          <div className="preview-header-left">
            <FileText size={20} />
            <span className="preview-title">PRD Preview</span>
          </div>
          {overallConfidence && (
            <div className="confidence-badge">
              {overallConfidence}% Confidence
            </div>
          )}
        </div>

        {/* Meta Info */}
        <div className="preview-meta">
          <div className="meta-item">
            <Clock size={14} />
            <span>{timestamp || new Date().toLocaleString()}</span>
          </div>
          <div className="meta-item">
            <Sparkles size={14} />
            <span>{aiProvider}</span>
          </div>
        </div>

        {/* Product Title */}
        {productTitle && <h1 className="preview-product-title">{productTitle}</h1>}

        {/* Sections */}
        <div className="preview-sections">
          {sections.map((section, index) => (
            <div key={index} className="preview-section">
              <div className="section-header">
                <h2 className="section-title">{section.title}</h2>
                <span className="section-confidence">{section.confidence}%</span>
              </div>
              <p className="section-content">{section.content}</p>
              <div className="section-tag">{section.tag}</div>
            </div>
          ))}
        </div>

        {/* Generating Indicator */}
        {isGenerating && (
          <div className="generating-section">
            <div className="generating-dots">
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </div>
            <p className="generating-text">Generating next section...</p>
          </div>
        )}

        {/* Request ID (if needed) */}
        {sections.length > 0 && (
          <div className="preview-footer">
            <span className="request-id">Request ID: {generateRequestId()}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function generateRequestId(): string {
  return Array.from({ length: 32 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('').replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5');
}