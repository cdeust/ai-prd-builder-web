interface ProgressIndicatorProps {
  progress: number;
  status: string;
}

export function ProgressIndicator({ progress, status }: ProgressIndicatorProps) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ marginBottom: '8px' }}>
        <strong>Status:</strong> {status}
      </div>
      <div style={{
        width: '100%',
        height: '24px',
        backgroundColor: '#eee',
        borderRadius: '4px',
        overflow: 'hidden',
      }}>
        <div style={{
          width: `${progress}%`,
          height: '100%',
          backgroundColor: '#4CAF50',
          transition: 'width 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '12px',
        }}>
          {progress}%
        </div>
      </div>
    </div>
  );
}