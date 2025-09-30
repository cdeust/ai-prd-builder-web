import type { ProfessionalAnalysis, ArchitecturalConflict, TechnicalChallenge } from '../../domain/entities/PRDDocument';

interface ProfessionalAnalysisViewProps {
  analysis: ProfessionalAnalysis;
}

export function ProfessionalAnalysisView({ analysis }: ProfessionalAnalysisViewProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#d32f2f';
      case 'high': return '#f57c00';
      case 'medium': return '#fbc02d';
      case 'low': return '#388e3c';
      default: return '#666';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return '🔴';
      case 'high': return '🟡';
      case 'medium': return '🟢';
      case 'low': return '⚪';
      default: return '⚪';
    }
  };

  return (
    <div style={{
      backgroundColor: analysis.hasCriticalIssues ? '#fff3cd' : '#e8f5e9',
      border: `1px solid ${analysis.hasCriticalIssues ? '#ffc107' : '#4caf50'}`,
      borderRadius: '8px',
      padding: '20px',
      marginBottom: '24px',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '16px',
      }}>
        <h2 style={{
          color: analysis.hasCriticalIssues ? '#856404' : '#2e7d32',
          margin: 0,
          flex: 1,
        }}>
          {analysis.hasCriticalIssues ? '⚠️ Professional Analysis - Critical Issues' : '✅ Professional Analysis'}
        </h2>
        {analysis.complexityScore && (
          <div style={{
            backgroundColor: 'white',
            padding: '8px 16px',
            borderRadius: '4px',
            border: '1px solid #ddd',
          }}>
            <strong>Complexity:</strong> {analysis.complexityScore} points
            {analysis.complexityScore > 13 && <span style={{ color: '#d32f2f' }}> (needs breakdown)</span>}
          </div>
        )}
      </div>

      {/* Executive Summary */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '4px',
        padding: '12px',
        marginBottom: '16px',
      }}>
        <h4 style={{ marginTop: 0, marginBottom: '8px' }}>Executive Summary</h4>
        <div style={{
          whiteSpace: 'pre-wrap',
          lineHeight: '1.6',
          color: '#333',
        }}>
          {analysis.executiveSummary}
        </div>
      </div>

      {/* Statistics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '12px',
        marginBottom: '16px',
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '12px',
          borderRadius: '4px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#d32f2f' }}>
            {analysis.conflictCount}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>Architectural Conflicts</div>
        </div>
        <div style={{
          backgroundColor: 'white',
          padding: '12px',
          borderRadius: '4px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f57c00' }}>
            {analysis.challengeCount}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>Technical Challenges</div>
        </div>
        {analysis.complexityScore && (
          <div style={{
            backgroundColor: 'white',
            padding: '12px',
            borderRadius: '4px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1976d2' }}>
              {analysis.complexityScore}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>Story Points</div>
          </div>
        )}
      </div>

      {/* Blocking Issues */}
      {analysis.blockingIssues.length > 0 && (
        <div style={{
          backgroundColor: '#ffebee',
          borderRadius: '4px',
          padding: '12px',
          marginBottom: '16px',
        }}>
          <h4 style={{ marginTop: 0, marginBottom: '8px', color: '#c62828' }}>
            🚨 Blocking Issues
          </h4>
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            {analysis.blockingIssues.map((issue, index) => (
              <li key={index} style={{ color: '#c62828', marginBottom: '4px' }}>
                {issue}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Architectural Conflicts */}
      {analysis.conflicts.length > 0 && (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '4px',
          padding: '12px',
          marginBottom: '16px',
        }}>
          <h4 style={{ marginTop: 0, marginBottom: '12px' }}>⚡ Architectural Conflicts</h4>
          {analysis.conflicts.map((conflict: ArchitecturalConflict, index) => (
            <div key={index} style={{
              borderLeft: `4px solid ${getSeverityColor(conflict.severity)}`,
              paddingLeft: '12px',
              marginBottom: '12px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                <span>{getSeverityIcon(conflict.severity)}</span>
                <strong style={{ marginLeft: '8px' }}>
                  {conflict.requirement1} vs {conflict.requirement2}
                </strong>
              </div>
              <div style={{ color: '#666', marginBottom: '4px' }}>
                <strong>Reason:</strong> {conflict.conflictReason}
              </div>
              <div style={{ color: '#333' }}>
                <strong>Resolution:</strong> {conflict.resolution}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Technical Challenges */}
      {analysis.challenges.length > 0 && (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '4px',
          padding: '12px',
        }}>
          <h4 style={{ marginTop: 0, marginBottom: '12px' }}>🚨 Technical Challenges</h4>
          {analysis.challenges.map((challenge: TechnicalChallenge, index) => (
            <div key={index} style={{
              borderLeft: `4px solid ${getSeverityColor(challenge.priority)}`,
              paddingLeft: '12px',
              marginBottom: '12px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                <span>{getSeverityIcon(challenge.priority)}</span>
                <strong style={{ marginLeft: '8px' }}>{challenge.title}</strong>
                <span style={{
                  backgroundColor: '#e3f2fd',
                  color: '#1976d2',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  marginLeft: '8px',
                }}>
                  {challenge.category}
                </span>
              </div>
              <div style={{ color: '#666', marginBottom: '4px' }}>
                {challenge.description}
              </div>
              {challenge.mitigation && (
                <div style={{ color: '#388e3c' }}>
                  <strong>Mitigation:</strong> {challenge.mitigation}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}