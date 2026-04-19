import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (token) {
      // Store token and decode user
      localStorage.setItem('accessToken', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Decode JWT payload
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(window.atob(base64));
        setUser(payload);
        navigate('/dashboard', { replace: true });
      } catch (e) {
        navigate('/auth', { replace: true });
      }
    } else {
      navigate('/auth', { replace: true });
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-muted-foreground font-medium">Signing you in with Google...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
