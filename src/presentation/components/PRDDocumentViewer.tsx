import { PRDDocument } from '../../domain/entities/PRDDocument.ts';
import { ProfessionalAnalysisView } from './ProfessionalAnalysisView.tsx';

interface PRDDocumentViewerProps {
  document: PRDDocument;
  onDownload: () => void;
}

export function PRDDocumentViewer({ document, onDownload }: PRDDocumentViewerProps) {
  const sections = document.sections;
  const analysis = document.professionalAnalysis;

  return (
    <div style={{
      border: '1px solid #ccc',
      borderRadius: '8px',
      padding: '24px',
      backgroundColor: '#fafafa',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
      }}>
        <h2>{document.title}</h2>
        <button
          onClick={onDownload}
          style={{
            padding: '10px 20px',
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          Download PDF
        </button>
      </div>

      <div style={{ fontSize: '14px', color: '#666', marginBottom: '16px' }}>
        Version: {document.version}
      </div>

      {/* Display Professional Analysis */}
      {analysis && (
        <ProfessionalAnalysisView analysis={analysis} />
      )}

      {sections.map((section) => (
        <div key={section.id} style={{ marginBottom: '24px' }}>
          <h3 style={{ borderBottom: '2px solid #ddd', paddingBottom: '8px' }}>
            {section.title}
          </h3>
          <div style={{
            whiteSpace: 'pre-wrap',
            lineHeight: '1.6',
            marginTop: '12px',
          }}>
            {section.content}
          </div>
        </div>
      ))}
    </div>
  );
}