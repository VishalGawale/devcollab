import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import type { Repository } from '../types';

export function RepositoryList() {
  const [repos, setRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    fetchRepos();
  }, []);

  const fetchRepos = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get('/repositories');
      setRepos(response.data);
    } catch (err: any) {
      console.error('Failed to fetch repos:', err);
      setError(err.response?.data?.error || 'Failed to fetch repositories');
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      await apiClient.post('/github/sync/VishalGawale');
      await fetchRepos();
      alert('✅ Repositories synced successfully!');
    } catch (err: any) {
      console.error('Sync failed:', err);
      alert('❌ Sync failed: ' + (err.response?.data?.error || 'Unknown error'));
    } finally {
      setSyncing(false);
    }
  };

  if (loading) return (
    <div style={{ padding: '2rem', textAlign: 'center', color: '#718096' }}>
      <div style={{
        width: '40px',
        height: '40px',
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #667eea',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        margin: '0 auto 1rem auto'
      }} />
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      Loading repositories...
    </div>
  );
  
  if (error) return (
    <div style={{ padding: '2rem', color: '#e53e3e', textAlign: 'center' }}>
      <p>⚠️ {error}</p>
      <button 
        onClick={fetchRepos} 
        style={{ 
          marginTop: '1rem', 
          padding: '0.75rem 1.5rem',
          backgroundColor: '#667eea',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer'
        }}
      >
        🔄 Retry
      </button>
    </div>
  );

  return (
    <div style={{ 
      backgroundColor: 'white', 
      borderRadius: '12px', 
      padding: '1.5rem', 
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)' 
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <h2 style={{ margin: 0, color: '#2d3748', fontSize: '1.5rem' }}>
          📦 Repositories ({repos.length})
        </h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={fetchRepos}
            disabled={loading}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#48bb78',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: 500
            }}
          >
            🔄 Refresh
          </button>
          <button
            onClick={handleSync}
            disabled={syncing}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: syncing ? '#a0aec0' : '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: syncing ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              fontWeight: 500
            }}
          >
            {syncing ? '⏳ Syncing...' : '📥 Sync from GitHub'}
          </button>
        </div>
      </div>
      
      {repos.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '3rem 1rem',
          color: '#718096',
          backgroundColor: '#f7fafc',
          borderRadius: '8px',
          border: '2px dashed #e2e8f0'
        }}>
          <p style={{ fontSize: '1.1rem', margin: '0 0 0.5rem 0' }}>
            No repositories found
          </p>
          <p style={{ fontSize: '0.9rem', margin: 0 }}>
            Click "Sync from GitHub" to import your repositories
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {repos.map((repo) => (
            <div 
              key={repo.id}
              style={{
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '1.25rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                transition: 'all 0.2s',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#667eea';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(102, 126, 234, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#2b6cb0' }}>
                    {repo.name}
                  </h3>
                  {repo.private && (
                    <span style={{
                      fontSize: '0.75rem',
                      padding: '0.25rem 0.5rem',
                      backgroundColor: '#feebc8',
                      color: '#c05621',
                      borderRadius: '4px',
                      fontWeight: 500
                    }}>
                      Private
                    </span>
                  )}
                </div>
                <p style={{ margin: '0 0 0.75rem 0', color: '#718096', fontSize: '0.95rem' }}>
                  {repo.description || 'No description available'}
                </p>
                <div style={{ fontSize: '0.85rem', color: '#a0aec0', display: 'flex', gap: '1rem' }}>
                  <span>🌿 {repo.defaultBranch}</span>
                  <span>📅 Updated: {new Date(repo.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <a 
                  href={`https://github.com/${repo.fullName}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: '#667eea',
                    textDecoration: 'none',
                    fontSize: '0.9rem',
                    fontWeight: 500
                  }}
                >
                  View on GitHub →
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
