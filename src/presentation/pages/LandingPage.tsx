import { Sparkles, FileText, Settings } from 'lucide-react';
import './LandingPage.css';

interface LandingPageProps {
  onStartBuilding: () => void;
}

export default function LandingPage({ onStartBuilding }: LandingPageProps) {
  return (
    <div className="landing-page">
      <div className="landing-content">
        {/* Logo/Icon */}
        <div className="landing-icon">
          <Sparkles size={48} strokeWidth={2} />
        </div>

        {/* Hero Section */}
        <div className="landing-hero">
          <h1 className="landing-title">AI PRD Builder</h1>
          <p className="landing-subtitle">
            Transform your product ideas into comprehensive PRDs with AI-powered
            generation. Built for Business Analysts and Product Teams.
          </p>
        </div>

        {/* CTA Button */}
        <button onClick={onStartBuilding} className="landing-cta">
          <svg
            className="cta-icon"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
          </svg>
          Start Building PRD
        </button>

        {/* Feature Cards */}
        <div className="landing-features">
          {/* Card 1 */}
          <div className="feature-card">
            <div className="feature-icon purple">
              <Sparkles size={32} />
            </div>
            <h3 className="feature-title">AI-Powered Generation</h3>
            <p className="feature-description">
              Leverage Swift and Apple Intelligence to automatically generate comprehensive PRD sections with intelligent content suggestions.
            </p>
          </div>

          {/* Card 2 */}
          <div className="feature-card">
            <div className="feature-icon green">
              <FileText size={32} />
            </div>
            <h3 className="feature-title">Real-time Preview</h3>
            <p className="feature-description">
              Watch your PRD come to life with live preview sections are generated. See exactly how your document will look.
            </p>
          </div>

          {/* Card 3 */}
          <div className="feature-card">
            <div className="feature-icon blue">
              <Settings size={32} />
            </div>
            <h3 className="feature-title">Swift Integration</h3>
            <p className="feature-description">
              Seamlessly connects with ai-prd-builder and ai-prd-builder-vapor-server for powerful backend processing.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="landing-footer">
        <p>Powered by Swift • Apple Intelligence • Foundation Models</p>
      </div>
    </div>
  );
}