import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { clearAuthToken } from '../api';

export default function Layout() {
    const navigate = useNavigate();
    const role = localStorage.getItem('userRole');

    const handleLogout = (e) => {
        e.preventDefault();
        clearAuthToken();
        navigate('/');
    };

    return (
        <div className="dashboard-layout">
            <div className="sidebar">
                <h1 style={{ color: 'var(--neon-lavender)', marginBottom: '2rem', padding: '0 1rem', fontSize: '1.5rem', letterSpacing: '1px' }}>🏢 Smart Office</h1>
                
                <nav style={{ display: 'flex', flexDirection: 'column', height: 'calc(100% - 100px)' }}>
                    <NavLink to="/dashboard" className={({isActive}) => isActive ? 'active' : ''}>
                        📂 Dashboard
                    </NavLink>
                    {role === 'admin' && (
                        <NavLink to="/audit" className={({isActive}) => isActive ? 'active' : ''}>
                            📜 Audit Logs (History)
                        </NavLink>
                    )}
                    
                    <div style={{ marginTop: 'auto', padding: '1rem', background: 'var(--bg-glass)', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
                        <p style={{ margin: '0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Employee Access Pass</p>
                        <p style={{ margin: '0.3rem 0', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{localStorage.getItem('userEmail')}</p>
                        <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '10px', background: role === 'admin' ? '#ffd70033' : '#a0a0b033', color: role === 'admin' ? '#ffd700' : '#a0a0b0', border: '1px solid' }}>
                            {role === 'admin' ? '👑 Admin' : '👤 Member'}
                        </span>
                    </div>

                    <a href="#" onClick={handleLogout} style={{ color: '#ff4d4d', marginTop: '1rem', textDecoration: 'none', padding: '0.5rem 1rem' }}>
                        🚪 Sign Out
                    </a>
                </nav>
            </div>
            <div className="main-content">
                <Outlet />
            </div>
        </div>
    );
}
