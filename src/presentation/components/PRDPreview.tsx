import { FileText, Download, FileDown } from 'lucide-react';
import type { PRDDocument } from '../../domain/entities/PRDDocument.ts';
import './PRDPreview.css';

interface PRDPreviewProps {
  prd: PRDDocument | null;
}

export function PRDPreview({ prd }: PRDPreviewProps) {
  if (!prd) {
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

  return (
    <div className="prd-preview">
      <div className="prd-header">
        <h1>{prd.title}</h1>
        <div className="prd-meta">
          <span>Version {prd.version}</span>
          <span>•</span>
          <span>Updated {prd.updatedAt.toLocaleDateString()}</span>
        </div>
      </div>

      <div className="prd-content">
        <div className="prd-sections-container">
          <div className="prd-sections">
            {prd.sections
              .sort((a, b) => a.order - b.order)
              .map((section, index) => (
                <section
                  key={section.id}
                  className="prd-section"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="section-header">
                    <div className="section-indicator" />
                    <h2>{section.title}</h2>
                  </div>
                  <div className="section-content" style={{ whiteSpace: 'pre-wrap' }}>
                    {section.content}
                  </div>
                </section>
              ))}
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