import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/Layout';
import { RepositoryList } from './components/RepositoryList';
import { RealTimeStatus } from './components/RealTimeStatus';
import { AuthCallback } from './pages/AuthCallback';
import apiClient from './api/client';
import type { User } from './types';

function Dashboard() {
  return (
    <div>
      <h2 style={{ color: '#2d3748', marginBottom: '1.5rem' }}>Dashboard</h2>
      <RepositoryList />
      <RealTimeStatus />
    </div>
  );
}

function Home() {
  const { isAuthenticated, login } = useAuth();

  const handleMockLogin = async () => {
    try {
      const { data } = await apiClient.post<{ token: string; user: User }>('/auth/dev-login');
      login(data.token, data.user);
    } catch (error) {
      console.error('Dev login failed:', error);
      alert('Dev login failed. Is the backend running?');
    }
  };

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      minHeight: '60vh',
      gap: '1.5rem',
      textAlign: 'center',
      padding: '2rem'
    }}>
      <h2 style={{ fontSize: '2.5rem', color: '#2d3748', margin: 0 }}>
        Welcome to DevCollab
      </h2>
      <p style={{ fontSize: '1.2rem', color: '#718096', maxWidth: '500px' }}>
        Unified dashboard for developer team collaboration. 
        Track PRs, CI/CD status, and team availability in one place.
      </p>
      
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button onClick={handleMockLogin} style={{
          padding: '1rem 2rem',
          backgroundColor: '#667eea',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '1.1rem',
          fontWeight: 600
        }}>
          🔑 Mock Login (Dev Only)
        </button>
        
        <a href="http://localhost:3002/github" style={{
          padding: '1rem 2rem',
          backgroundColor: '#24292e',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '8px',
          fontSize: '1.1rem',
          fontWeight: 600,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          🐙 Login with GitHub
        </a>
      </div>
    </div>
  );
}

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/" replace />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/dashboard" element={
              <PrivateRoute><Dashboard /></PrivateRoute>
            } />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;
