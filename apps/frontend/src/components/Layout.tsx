import { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f5f5f5',
      display: 'flex',
      flexDirection: 'column',
      width: '100%'
    }}>
      <header style={{
        backgroundColor: '#1e3c72',
        color: 'white',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>🚀 DevCollab</h1>
        {isAuthenticated && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span>Welcome, {user?.name || user?.username}</span>
            <button 
              onClick={logout}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#e53e3e',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Logout
            </button>
          </div>
        )}
      </header>

      <main style={{ 
        flex: 1,
        padding: '2rem', 
        width: '100%',
        maxWidth: '1200px', 
        margin: '0 auto',
        boxSizing: 'border-box'
      }}>
        {children}
      </main>

      <footer style={{
        backgroundColor: '#2d3748',
        color: 'white',
        padding: '1rem',
        textAlign: 'center',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <p style={{ margin: 0 }}>DevCollab - Developer Team Collaboration Platform</p>
      </footer>
    </div>
  );
}
