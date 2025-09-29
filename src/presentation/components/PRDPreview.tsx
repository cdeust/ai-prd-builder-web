import { FileText, Download, FileDown, Loader2, CheckCircle } from 'lucide-react';
import type { PRDDocument } from '../../domain/entities/PRDDocument.ts';
import ReactMarkdown from 'react-markdown';
import './PRDPreview.css';

interface PRDPreviewProps {
  prd: PRDDocument | null;
  isGenerating?: boolean;
  progress?: number;
  currentSection?: string;
}

export function PRDPreview({ prd, isGenerating = false, progress = 0, currentSection }: PRDPreviewProps) {
  // Log only essential info
  if (prd) {
    console.log('[PRDPreview] Displaying PRD with', prd.sections.length, 'sections');
  } else {
    console.log('[PRDPreview] No PRD yet, isGenerating:', isGenerating);
  }

  if (!prd && !isGenerating) {
    return (
      <div className="prd-empty-state">
        <div className="empty-state-content">
          <div className="empty-state-icon">
            <FileText size={48} strokeWidth={1.5} />
          </div>
          <h3>No PRD Yet</h3>
          <p>
            Your PRD will appear here in real-time as the AI generates it. Start the conversation to begin!
          </p>
        </div>
      </div>
    );
  }

  // Show loading state while generating and no content yet
  if (isGenerating && !prd) {
    return (
      <div className="prd-empty-state">
        <div className="empty-state-content generating">
          <div className="empty-state-icon spinning">
            <Loader2 size={48} strokeWidth={1.5} />
          </div>
          <h3>Starting Generation...</h3>
          <p>Analyzing your requirements and preparing the PRD structure</p>
        </div>
      </div>
    );
  }

  return (
    <div className="prd-preview">
      <div className="prd-header">
        <div className="prd-title-container">
          <h1>{prd.title}</h1>
          {isGenerating ? (
            <span className="draft-badge">DRAFT</span>
          ) : (
            <span className="final-badge">FINAL VERSION</span>
          )}
        </div>
        <div className="prd-meta">
          <span>Version {prd.version}</span>
          <span>•</span>
          <span>Updated {prd.updatedAt.toLocaleDateString()}</span>
          {isGenerating && (
            <>
              <span>•</span>
              <span className="generating-badge">Live Updating...</span>
            </>
          )}
        </div>
      </div>

      <div className="prd-content">
        <div className="prd-sections-container">
          <div className="prd-sections">
            {prd.sections && prd.sections.length > 0 ? (
              prd.sections
                .sort((a, b) => a.order - b.order)
                .map((section, index) => (
                  <section
                    key={section.id || `section-${index}`}
                    className={`prd-section ${index === prd.sections.length - 1 && isGenerating ? 'latest animating' : ''}`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="section-header">
                      <div className="section-indicator">
                        {index === prd.sections.length - 1 && isGenerating ? (
                          <Loader2 size={16} className="spinning" />
                        ) : (
                          <CheckCircle size={16} />
                        )}
                      </div>
                      <h2>{section.title}</h2>
                    </div>
                    <div className="section-content">
                      <ReactMarkdown>{section.content || '*Content being generated...*'}</ReactMarkdown>
                    </div>
                  </section>
                ))
            ) : isGenerating ? (
              <div className="prd-section latest animating">
                <div className="section-header">
                  <div className="section-indicator">
                    <Loader2 size={16} className="spinning" />
                  </div>
                  <h2>Preparing sections...</h2>
                </div>
                <div className="section-content">
                  <p><em>Content will appear here as it's generated...</em></p>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="prd-footer">
        <button
          onClick={() => {
            const blob = new Blob([JSON.stringify(prd, null, 2)], {
              type: 'application/json',
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${prd.title.replace(/\s+/g, '-')}.json`;
            a.click();
            URL.revokeObjectURL(url);
          }}
          className="export-button primary"
        >
          <Download size={18} className="button-icon" />
          Download JSON
        </button>
        <button
          onClick={() => {
            let markdown = `# ${prd.title}\n\n`;
            markdown += `**Version:** ${prd.version}\n`;
            markdown += `**Last Updated:** ${prd.updatedAt.toLocaleDateString()}\n\n`;
            markdown += '---\n\n';

            // Include Professional Analysis if present
            if (prd.professionalAnalysis) {
              const analysis = prd.professionalAnalysis;
              markdown += `## Professional Analysis\n\n`;

              if (analysis.hasCriticalIssues) {
                markdown += `⚠️ **Critical Issues Detected**\n\n`;
                analysis.blockingIssues?.forEach((issue: string) => {
                  markdown += `- ${issue}\n`;
                });
                markdown += `\n`;
              }

              if (analysis.complexityScore) {
                markdown += `**Complexity Score:** ${analysis.complexityScore} points\n`;
              }

              markdown += `**Architectural Conflicts:** ${analysis.conflictCount || 0}\n`;
              markdown += `**Technical Challenges:** ${analysis.challengeCount || 0}\n\n`;

              if (analysis.executiveSummary) {
                markdown += `### Executive Summary\n\n${analysis.executiveSummary}\n\n`;
              }

              if (analysis.conflicts && analysis.conflicts.length > 0) {
                markdown += `### Architectural Conflicts\n\n`;
                analysis.conflicts.forEach((conflict: any) => {
                  markdown += `#### ${conflict.requirement1} vs ${conflict.requirement2}\n`;
                  markdown += `- **Severity:** ${conflict.severity}\n`;
                  markdown += `- **Reason:** ${conflict.conflictReason}\n`;
                  markdown += `- **Resolution:** ${conflict.resolution}\n\n`;
                });
              }

              if (analysis.challenges && analysis.challenges.length > 0) {
                markdown += `### Technical Challenges\n\n`;
                analysis.challenges.forEach((challenge: any) => {
                  markdown += `#### ${challenge.title}\n`;
                  markdown += `- **Priority:** ${challenge.priority}\n`;
                  markdown += `- **Category:** ${challenge.category}\n`;
                  markdown += `- **Description:** ${challenge.description}\n`;
                  if (challenge.mitigation) {
                    markdown += `- **Mitigation:** ${challenge.mitigation}\n`;
                  }
                  markdown += `\n`;
                });
              }

              markdown += '---\n\n';
            }

            prd.sections
              .sort((a, b) => a.order - b.order)
              .forEach(section => {
                markdown += `## ${section.title}\n\n${section.content}\n\n`;
              });

            const blob = new Blob([markdown], { type: 'text/markdown' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${prd.title.replace(/\s+/g, '-')}.md`;
            a.click();
            URL.revokeObjectURL(url);
          }}
          className="export-button secondary"
        >
          <FileDown size={18} className="button-icon" />
          Download Markdown
        </button>
      </div>
    </div>
  );
}