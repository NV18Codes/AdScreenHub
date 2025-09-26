import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { isTokenValid } from '../utils/tokenUtils';

const AuthDebug = () => {
  const { user } = useAuth();
  const token = localStorage.getItem('token');
  const tokenValid = isTokenValid();

  if (process.env.NODE_ENV !== 'development') {
    return null; // Only show in development
  }

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '300px'
    }}>
      <h4>🔍 Auth Debug</h4>
      <p><strong>User:</strong> {user ? '✅ Logged in' : '❌ Not logged in'}</p>
      <p><strong>Token:</strong> {token ? '✅ Present' : '❌ Missing'}</p>
      <p><strong>Token Valid:</strong> {tokenValid ? '✅ Valid' : '❌ Invalid'}</p>
      {user && (
        <div>
          <p><strong>User Data:</strong></p>
          <pre style={{ fontSize: '10px', margin: '5px 0' }}>
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>
      )}
      {token && (
        <div>
          <p><strong>Token (first 20 chars):</strong></p>
          <p style={{ wordBreak: 'break-all' }}>{token.substring(0, 20)}...</p>
        </div>
      )}
    </div>
  );
};

export default AuthDebug;
