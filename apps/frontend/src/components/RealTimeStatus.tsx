import { useWebSocket } from '../hooks/useWebSocket';

export function RealTimeStatus() {
  const { isConnected, lastMessage } = useWebSocket();

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      padding: '1rem 1.5rem',
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      zIndex: 1000,
      minWidth: '220px',
      border: '1px solid #e2e8f0'
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.75rem', 
        marginBottom: '0.5rem' 
      }}>
        <span style={{
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          backgroundColor: isConnected ? '#48bb78' : '#e53e3e',
          boxShadow: isConnected ? '0 0 8px #48bb78' : 'none',
          transition: 'all 0.3s ease'
        }} />
        <span style={{ 
          fontSize: '0.95rem', 
          fontWeight: 600,
          color: isConnected ? '#22543d' : '#c53030'
        }}>
          {isConnected ? '🟢 Live Connected' : '🔴 Disconnected'}
        </span>
      </div>
      
      {lastMessage && (
        <div style={{ 
          fontSize: '0.8rem', 
          color: '#718096',
          borderTop: '1px solid #e2e8f0',
          paddingTop: '0.5rem',
          marginTop: '0.5rem'
        }}>
          <div>Last: <strong>{lastMessage.type}</strong></div>
          {lastMessage.timestamp && (
            <div style={{ fontSize: '0.75rem', marginTop: '2px' }}>
              {new Date(lastMessage.timestamp).toLocaleTimeString()}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
