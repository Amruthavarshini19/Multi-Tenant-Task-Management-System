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
    const refresh = params.get('refresh');

    if (token) {
      // Store tokens
      localStorage.setItem('accessToken', token);
      if (refresh) localStorage.setItem('refreshToken', refresh);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Decode JWT payload
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(window.atob(base64));

        // The JWT payload has {userId, orgId, orgName, role}
        // but the rest of the app expects {id, email, orgId, orgName, role}
        // Fetch the full user profile to get the email field too
        axios.get('http://localhost:8080/api/users/me')
          .then(({ data }) => {
            // Normalize into the same shape as email/password login
            const normalizedUser = {
              id: payload.userId,
              email: data.email,
              role: payload.role,
              orgId: payload.orgId,
              orgName: payload.orgName,
            };
            setUser(normalizedUser);
            navigate('/dashboard', { replace: true });
          })
          .catch(() => {
            // Fallback: use payload alone if /me fails (email will be missing in sidebar)
            const normalizedUser = {
              id: payload.userId,
              role: payload.role,
              orgId: payload.orgId,
              orgName: payload.orgName,
            };
            setUser(normalizedUser);
            navigate('/dashboard', { replace: true });
          });
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
