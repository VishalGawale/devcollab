import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/Layout';
import { RepositoryList } from './components/RepositoryList';
import { AuthCallback } from './pages/AuthCallback';

function Dashboard() {
  return (
    <div>
      <h2 style={{ color: '#2d3748', marginBottom: '1.5rem' }}>Dashboard</h2>
      <RepositoryList />
    </div>
  );
}

function Home() {
  const { isAuthenticated, login } = useAuth();

  const handleMockLogin = () => {
    const mockToken = 'dev-token';
    const mockUser = {
      id: '1',
      name: 'Vishal Gawale',
      username: 'VishalGawale',
      email: 'vishal@example.com',
      avatarUrl: null,
      githubId: '12345'
    };
    login(mockToken, mockUser);
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
      <h2 style={{ 
        fontSize: '2.5rem', 
        color: '#2d3748',
        margin: 0 
      }}>
        Welcome to DevCollab
      </h2>
      <p style={{ 
        fontSize: '1.2rem', 
        color: '#718096',
        maxWidth: '500px',
        lineHeight: '1.6'
      }}>
        Unified dashboard for developer team collaboration. 
        Track PRs, CI/CD status, and team availability in one place.
      </p>
      
      <div style={{ 
        display: 'flex', 
        gap: '1rem',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginTop: '1rem'
      }}>
        <button
          onClick={handleMockLogin}
          style={{
            padding: '1rem 2rem',
            backgroundColor: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1.1rem',
            fontWeight: '600',
            transition: 'all 0.2s',
            boxShadow: '0 4px 6px rgba(102, 126, 234, 0.3)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#5a67d8';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#667eea';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          🔑 Mock Login (Dev Only)
        </button>
        
        <a
          href="http://localhost:3002/auth/github"
          style={{
            padding: '1rem 2rem',
            backgroundColor: '#24292e',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '8px',
            fontSize: '1.1rem',
            fontWeight: '600',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s',
            boxShadow: '0 4px 6px rgba(36, 41, 46, 0.3)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#1b1f23';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#24292e';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <svg height="20" width="20" viewBox="0 0 16 16" fill="white">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
          </svg>
          Login with GitHub
        </a>
      </div>
      
      <div style={{
        marginTop: '2rem',
        padding: '1.5rem',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        maxWidth: '600px'
      }}>
        <h3 style={{ margin: '0 0 1rem 0', color: '#2d3748' }}>✨ Features</h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          textAlign: 'left'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#4a5568' }}>
            <span>📊</span> PR Status Tracking
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#4a5568' }}>
            <span>🚀</span> CI/CD Pipeline View
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#4a5568' }}>
            <span>👥</span> Team Availability
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#4a5568' }}>
            <span>📈</span> Sprint Progress
          </div>
        </div>
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
            <Route 
              path="/dashboard" 
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } 
            />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;
