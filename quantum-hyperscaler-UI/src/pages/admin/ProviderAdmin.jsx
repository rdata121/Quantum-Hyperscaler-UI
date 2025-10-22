import { useState, useEffect } from 'react';
import { useAuth } from '../../auth/AuthProvider';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'http://localhost:8000/api';

export default function ProviderAdmin() {
    const { user, idToken: getIdToken } = useAuth();
    const navigate = useNavigate();
    
    const [loading, setLoading] = useState(false);  // Start with false for instant page display
    const [activeTab, setActiveTab] = useState('users'); // 'users', 'reservations', 'add-user'
    const [userRoles, setUserRoles] = useState(null);
    const [accessChecked, setAccessChecked] = useState(false);
    
    // Data states
    const [users, setUsers] = useState([]);
    const [reservations, setReservations] = useState([]);
    const [tenants, setTenants] = useState([]);
    
    // UI states
    const [selectedReservation, setSelectedReservation] = useState(null);
    const [newUser, setNewUser] = useState({ 
        email: '', 
        password: '', 
        role: 'tenant_user', 
        tenant_id: '',
        organization_name: ''  // For creating new tenant when adding tenant_admin
    });
    
    // Check if user is provider_admin by fetching from API
    useEffect(() => {
        if (!user) return;
        
        (async () => {
            try {
                const token = await getIdToken();
                if (!token) {
                    console.error('No token available');
                    navigate('/console');
                    return;
                }
                
                const res = await fetch(`${API_BASE}/auth/me`, { 
                    headers: { Authorization: `Bearer ${token}` } 
                });
                
                console.log('Access check response:', res.status, res.ok);
                
                if (res.ok) {
                    const me = await res.json();
                    console.log('User data from API:', me);
                    setUserRoles(me.roles);
                    
                    if (!Array.isArray(me.roles) || !me.roles.includes('provider_admin')) {
                        console.log('User roles:', me.roles, 'includes provider_admin:', me.roles?.includes('provider_admin'));
                        alert('⚠️ Access Denied: Provider Admin access required');
                        navigate('/dashboard');
                    } else {
                        console.log('✅ Access granted - provider_admin role confirmed');
                    }
                } else {
                    const errorText = await res.text();
                    console.error('Access check failed:', res.status, errorText);
                    alert('⚠️ Failed to verify access. Redirecting...');
                    navigate('/dashboard');
                }
            } catch (err) {
                console.error('Access check error:', err);
                alert('⚠️ Failed to verify access. Redirecting...');
                navigate('/dashboard');
            } finally {
                setAccessChecked(true);
            }
        })();
    }, [user, navigate, getIdToken]);
    
    const idToken = async () => {
        const token = await getIdToken();
        if (!token) throw new Error('No auth token');
        return token;
    };
    
    // Fetch data helper with timeout
    const withTimeout = (url, opts = {}, ms = 30000) => {
        const ctrl = new AbortController();
        const id = setTimeout(() => ctrl.abort(), ms);
        return fetch(url, { ...opts, signal: ctrl.signal }).finally(() => clearTimeout(id));
    };
    
    useEffect(() => {
        if (!user || !accessChecked) return;
        if (!userRoles || !userRoles.includes('provider_admin')) return;
        loadData();
    }, [user, accessChecked, userRoles]);
    
    const loadData = async () => {
        try {
            const token = await idToken();
            console.log('🚀 Starting to load provider admin data...');
            
            // Local cache configuration
            const CACHE_KEYS = {
                users: 'provider_users_cache',
                reservations: 'provider_reservations_cache',
                tenants: 'provider_tenants_cache'
            };
            const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
            
            // Load from local cache first (instant display)
            const cachedUsers = localStorage.getItem(CACHE_KEYS.users);
            const cachedReservations = localStorage.getItem(CACHE_KEYS.reservations);
            const cachedTenants = localStorage.getItem(CACHE_KEYS.tenants);
            const cacheTime = localStorage.getItem(CACHE_KEYS.users + '_time');
            
            const cacheValid = cacheTime && (Date.now() - parseInt(cacheTime) < CACHE_TTL);
            
            if (cacheValid) {
                // Display cached data instantly
                if (cachedUsers) {
                    setUsers(JSON.parse(cachedUsers));
                    console.log('⚡ Users loaded instantly from local cache');
                }
                if (cachedReservations) {
                    setReservations(JSON.parse(cachedReservations));
                    console.log('⚡ Reservations loaded instantly from local cache');
                }
                if (cachedTenants) {
                    setTenants(JSON.parse(cachedTenants));
                    console.log('⚡ Tenants loaded instantly from local cache');
                }
                
                // Refresh in background (don't await)
                console.log('🔄 Refreshing data in background...');
                fetchFreshData(token, CACHE_KEYS);
                return; // Exit early - data is already displayed
            }
            
            // No valid cache - fetch fresh data
            console.log('💾 No cache found - fetching from API...');
            await fetchFreshData(token, CACHE_KEYS);
            
        } catch (err) {
            console.error('Failed to load provider admin data:', err);
        }
    };
    
    const fetchFreshData = async (token, CACHE_KEYS) => {
        const startTime = Date.now();
        try {
            const tasks = [
                withTimeout(`${API_BASE}/admin/provider/all-users`, { headers: { Authorization: `Bearer ${token}` } }),
                withTimeout(`${API_BASE}/admin/provider/all-reservations`, { headers: { Authorization: `Bearer ${token}` } }),
                withTimeout(`${API_BASE}/admin/tenants`, { headers: { Authorization: `Bearer ${token}` } }),
            ];
            
            console.log('📡 Fetching data from API (3 parallel requests)...');
            const results = await Promise.allSettled(tasks);
            
            if (results[0].status === 'fulfilled' && results[0].value.ok) {
                const usersData = await results[0].value.json();
                setUsers(usersData);
                localStorage.setItem(CACHE_KEYS.users, JSON.stringify(usersData));
                localStorage.setItem(CACHE_KEYS.users + '_time', Date.now().toString());
                console.log(`✅ Users loaded: ${usersData.length} items`);
            }
            
            if (results[1].status === 'fulfilled' && results[1].value.ok) {
                const reservationsData = await results[1].value.json();
                setReservations(reservationsData);
                localStorage.setItem(CACHE_KEYS.reservations, JSON.stringify(reservationsData));
                console.log(`✅ Reservations loaded: ${reservationsData.length} items`);
            }
            
            if (results[2].status === 'fulfilled' && results[2].value.ok) {
                const tenantsData = await results[2].value.json();
                setTenants(tenantsData);
                localStorage.setItem(CACHE_KEYS.tenants, JSON.stringify(tenantsData));
                console.log(`✅ Tenants loaded: ${tenantsData.length} items`);
            }
            
            const loadTime = ((Date.now() - startTime) / 1000).toFixed(2);
            console.log(`✅ All data loaded and cached in ${loadTime}s`);
            
        } catch (err) {
            console.error('Failed to fetch fresh data:', err);
        }
    };
    
    const handleUpdateReservationStatus = async (reservationId, newStatus) => {
        try {
            const token = await idToken();
            const res = await fetch(`${API_BASE}/admin/provider/reservations/${reservationId}/status`, {
                method: 'PATCH',
                headers: { 
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}` 
                },
                body: JSON.stringify({ status: newStatus })
            });
            
            if (res.ok) {
                // Update local state
                setReservations(reservations.map(r => 
                    r.id === reservationId ? { ...r, status: newStatus } : r
                ));
                alert(`✅ Reservation status updated to ${newStatus}`);
                setSelectedReservation(null);
            } else {
                const error = await res.json();
                alert(`❌ Failed to update status: ${error.detail || 'Unknown error'}`);
            }
        } catch (err) {
            alert(`❌ Error: ${err.message}`);
        }
    };
    
    const handleCreateUser = async () => {
        if (!newUser.email || !newUser.password) {
            alert('Email and password are required');
            return;
        }
        
        // For tenant_admin, organization name is required (will create new tenant)
        if (newUser.role === 'tenant_admin' && !newUser.organization_name) {
            alert('Organization name is required for tenant_admin');
            return;
        }
        
        // For tenant_user, tenant_id is required
        if (newUser.role === 'tenant_user' && !newUser.tenant_id) {
            alert('Tenant ID is required for tenant_user role');
            return;
        }
        
        try {
            const token = await idToken();
            const res = await fetch(`${API_BASE}/admin/provider/users`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}` 
                },
                body: JSON.stringify(newUser)
            });
            
            if (res.ok) {
                const created = await res.json();
                setUsers([created, ...users]);
                
                // If a new tenant was created, add it to tenants list
                if (created.tenant && created.tenant.id) {
                    setTenants([created.tenant, ...tenants]);
                }
                
                setNewUser({ email: '', password: '', role: 'tenant_user', tenant_id: '', organization_name: '' });
                
                const successMsg = newUser.role === 'tenant_admin' 
                    ? `✅ Tenant Admin created successfully!\n\nEmail: ${created.email}\nRole: ${created.role}\nOrganization: ${created.tenant?.name || 'N/A'}\nTenant ID: ${created.tenant_id}`
                    : `✅ User created successfully!\n\nEmail: ${created.email}\nRole: ${created.role}`;
                    
                alert(successMsg);
                setActiveTab('users');
            } else {
                const error = await res.json();
                alert(`❌ Failed to create user:\n\n${error.detail || 'Unknown error'}`);
            }
        } catch (err) {
            alert(`❌ Error: ${err.message}`);
        }
    };
    
    // Removed full-page loading spinner - data loads in background while UI is interactive
    
    // Styles
    const containerStyle = {
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%)',
        padding: '24px',
        color: '#e0e7ff'
    };
    
    const headerStyle = {
        marginBottom: 24,
        paddingBottom: 16,
        borderBottom: '2px solid rgba(0, 212, 255, 0.2)'
    };
    
    const h1Style = {
        fontSize: 32,
        fontWeight: 700,
        background: 'linear-gradient(135deg, #00d4ff, #35e5cf)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        marginBottom: 8
    };
    
    const tabsStyle = {
        display: 'flex',
        gap: 12,
        marginBottom: 24,
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        paddingBottom: 12
    };
    
    const tabStyle = (active) => ({
        padding: '10px 20px',
        background: active ? 'linear-gradient(135deg, #00d4ff, #35e5cf)' : 'rgba(255, 255, 255, 0.05)',
        color: active ? '#0a0e27' : '#9bb1b1',
        border: 'none',
        borderRadius: 8,
        cursor: 'pointer',
        fontWeight: active ? 600 : 400,
        transition: 'all 0.3s ease'
    });
    
    const cardStyle = {
        background: 'rgba(255, 255, 255, 0.03)',
        borderRadius: 12,
        padding: 24,
        marginBottom: 24,
        border: '1px solid rgba(0, 212, 255, 0.1)'
    };
    
    const h2 = {
        fontSize: 20,
        fontWeight: 600,
        marginTop: 0,
        marginBottom: 16,
        color: '#00d4ff'
    };
    
    const tableStyle = {
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: 14
    };
    
    const thStyle = {
        textAlign: 'left',
        padding: '12px 8px',
        borderBottom: '2px solid rgba(0, 212, 255, 0.2)',
        color: '#00d4ff',
        fontWeight: 600
    };
    
    const tdStyle = {
        padding: '12px 8px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
    };
    
    const badgeStyle = (status) => {
        const colors = {
            pending: { bg: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24' },
            confirmed: { bg: 'rgba(52, 211, 153, 0.15)', color: '#34d399' },
            active: { bg: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' },
            completed: { bg: 'rgba(156, 163, 175, 0.15)', color: '#9ca3af' },
            cancelled: { bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }
        };
        const style = colors[status] || colors.pending;
        return {
            display: 'inline-block',
            padding: '4px 12px',
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 500,
            background: style.bg,
            color: style.color
        };
    };
    
    const btnPrimary = {
        padding: '10px 20px',
        background: 'linear-gradient(135deg, #00d4ff, #35e5cf)',
        color: '#0a0e27',
        border: 'none',
        borderRadius: 8,
        cursor: 'pointer',
        fontWeight: 600,
        transition: 'all 0.3s ease'
    };
    
    const btnSecondary = {
        padding: '8px 16px',
        background: 'rgba(255, 255, 255, 0.05)',
        color: '#00d4ff',
        border: '1px solid rgba(0, 212, 255, 0.3)',
        borderRadius: 6,
        cursor: 'pointer',
        fontWeight: 500,
        transition: 'all 0.3s ease',
        marginRight: 8
    };
    
    const inputStyle = {
        width: '100%',
        padding: '10px 14px',
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(0, 212, 255, 0.2)',
        borderRadius: 8,
        color: '#e0e7ff',
        fontSize: 14,
        marginBottom: 12
    };
    
    const selectStyle = {
        ...inputStyle,
        cursor: 'pointer'
    };
    
    const overlay = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(10, 14, 39, 0.9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
    };
    
    const modal = {
        background: 'linear-gradient(135deg, #1a1f3a, #0a0e27)',
        borderRadius: 16,
        padding: 32,
        maxWidth: 600,
        width: '90%',
        maxHeight: '80vh',
        overflow: 'auto',
        border: '2px solid rgba(0, 212, 255, 0.2)',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
    };
    
    return (
        <div style={containerStyle}>
            <div style={headerStyle}>
                <h1 style={h1Style}>🔐 Provider Admin Dashboard</h1>
                <p style={{ color: '#9bb1b1', fontSize: 14 }}>
                    System-wide user and reservation management
                </p>
            </div>
            
            <div style={tabsStyle}>
                <button 
                    style={tabStyle(activeTab === 'users')} 
                    onClick={() => setActiveTab('users')}
                >
                    👥 All Users ({users.length})
                </button>
                <button 
                    style={tabStyle(activeTab === 'reservations')} 
                    onClick={() => setActiveTab('reservations')}
                >
                    📅 All Reservations ({reservations.length})
                </button>
                <button 
                    style={tabStyle(activeTab === 'add-user')} 
                    onClick={() => setActiveTab('add-user')}
                >
                    ➕ Create User
                </button>
            </div>
            
            {/* Users Tab */}
            {activeTab === 'users' && (
                <div style={cardStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <h2 style={{ ...h2, marginBottom: 0 }}>All System Users</h2>
                        {users.length === 0 && <span style={{ color: '#9bb1b1', fontSize: 13 }}>Loading...</span>}
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={tableStyle}>
                            <thead>
                                <tr>
                                    <th style={thStyle}>Email</th>
                                    <th style={thStyle}>Role</th>
                                    <th style={thStyle}>Tenant</th>
                                    <th style={thStyle}>Status</th>
                                    <th style={thStyle}>Created</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u.id}>
                                        <td style={tdStyle}>{u.email}</td>
                                        <td style={tdStyle}>
                                            <span style={badgeStyle(u.role === 'provider_admin' ? 'active' : 'pending')}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td style={tdStyle}>{u.tenant_name || 'N/A'}</td>
                                        <td style={tdStyle}>
                                            <span style={badgeStyle(u.status === 'active' ? 'confirmed' : 'pending')}>
                                                {u.status || 'active'}
                                            </span>
                                        </td>
                                        <td style={tdStyle}>{new Date(u.created_at).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            
            {/* Reservations Tab */}
            {activeTab === 'reservations' && (
                <div style={cardStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <h2 style={{ ...h2, marginBottom: 0 }}>All Slot Booking Requests</h2>
                        {reservations.length === 0 && <span style={{ color: '#9bb1b1', fontSize: 13 }}>Loading...</span>}
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={tableStyle}>
                            <thead>
                                <tr>
                                    <th style={thStyle}>Machine</th>
                                    <th style={thStyle}>Requester</th>
                                    <th style={thStyle}>Tenant</th>
                                    <th style={thStyle}>Start Time</th>
                                    <th style={thStyle}>Duration</th>
                                    <th style={thStyle}>Cost</th>
                                    <th style={thStyle}>Status</th>
                                    <th style={thStyle}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reservations.map(r => (
                                    <tr key={r.id} style={{ cursor: 'pointer' }}>
                                        <td style={tdStyle}>{r.machine_name}</td>
                                        <td style={tdStyle}>{r.requester_email}</td>
                                        <td style={tdStyle}>{r.tenant_name || 'N/A'}</td>
                                        <td style={tdStyle}>{new Date(r.start_time).toLocaleString()}</td>
                                        <td style={tdStyle}>{r.duration_hours}h</td>
                                        <td style={tdStyle}>${r.total_cost}</td>
                                        <td style={tdStyle}>
                                            <span style={badgeStyle(r.status)}>{r.status}</span>
                                        </td>
                                        <td style={tdStyle}>
                                            <button
                                                style={btnSecondary}
                                                onClick={() => setSelectedReservation(r)}
                                            >
                                                Manage
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            
            {/* Add User Tab */}
            {activeTab === 'add-user' && (
                <div style={cardStyle}>
                    <h2 style={h2}>Create New User</h2>
                    <div style={{ maxWidth: 500 }}>
                        <label style={{ display: 'block', marginBottom: 4, color: '#9bb1b1', fontSize: 13 }}>
                            Email *
                        </label>
                        <input
                            type="email"
                            style={inputStyle}
                            value={newUser.email}
                            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                            placeholder="user@example.com"
                        />
                        
                        <label style={{ display: 'block', marginBottom: 4, color: '#9bb1b1', fontSize: 13 }}>
                            Password *
                        </label>
                        <input
                            type="password"
                            style={inputStyle}
                            value={newUser.password}
                            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                            placeholder="Minimum 6 characters"
                        />
                        
                        <label style={{ display: 'block', marginBottom: 4, color: '#9bb1b1', fontSize: 13 }}>
                            Role *
                        </label>
                        <select
                            style={selectStyle}
                            value={newUser.role}
                            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                        >
                            <option value="tenant_user">Tenant User</option>
                            <option value="tenant_admin">Tenant Admin</option>
                            <option value="provider_admin">Provider Admin</option>
                        </select>
                        
                        {newUser.role === 'tenant_admin' && (
                            <>
                                <label style={{ display: 'block', marginBottom: 4, color: '#9bb1b1', fontSize: 13 }}>
                                    Organization Name * (will create new tenant)
                                </label>
                                <input
                                    type="text"
                                    style={inputStyle}
                                    value={newUser.organization_name}
                                    onChange={(e) => setNewUser({ ...newUser, organization_name: e.target.value })}
                                    placeholder="e.g., Acme Corporation"
                                />
                                <small style={{ color: '#9bb1b1', fontSize: 12, display: 'block', marginTop: -8, marginBottom: 12 }}>
                                    A new tenant/organization will be created for this admin
                                </small>
                            </>
                        )}
                        
                        {newUser.role === 'tenant_user' && (
                            <>
                                <label style={{ display: 'block', marginBottom: 4, color: '#9bb1b1', fontSize: 13 }}>
                                    Tenant ID * (select existing organization)
                                </label>
                                <select
                                    style={selectStyle}
                                    value={newUser.tenant_id}
                                    onChange={(e) => setNewUser({ ...newUser, tenant_id: e.target.value })}
                                >
                                    <option value="">Select Tenant</option>
                                    {tenants.map(t => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                            </>
                        )}
                        
                        <div style={{ marginTop: 24 }}>
                            <button style={btnPrimary} onClick={handleCreateUser}>
                                Create User
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Reservation Detail Modal */}
            {selectedReservation && (
                <div style={overlay} onClick={() => setSelectedReservation(null)}>
                    <div style={modal} onClick={e => e.stopPropagation()}>
                        <h3 style={{ marginTop: 0, color: '#00d4ff' }}>Manage Reservation</h3>
                        <div style={{ display: 'grid', gap: 12, marginBottom: 24 }}>
                            <div><strong>🖥️ Machine:</strong> {selectedReservation.machine_name}</div>
                            <div><strong>👤 Requester:</strong> {selectedReservation.requester_email}</div>
                            <div><strong>🏢 Tenant:</strong> {selectedReservation.tenant_name || 'N/A'}</div>
                            <div><strong>📅 Start:</strong> {new Date(selectedReservation.start_time).toLocaleString()}</div>
                            <div><strong>🏁 End:</strong> {new Date(selectedReservation.end_time).toLocaleString()}</div>
                            <div><strong>⏱️ Duration:</strong> {selectedReservation.duration_hours} hours</div>
                            <div><strong>💰 Cost:</strong> ${selectedReservation.total_cost}</div>
                            <div><strong>🎯 Priority:</strong> {selectedReservation.priority}</div>
                            <div><strong>🔬 Job Type:</strong> {selectedReservation.job_type}</div>
                            {selectedReservation.job_description && (
                                <div>
                                    <strong>📝 Description:</strong>
                                    <div style={{ marginTop: 6, padding: 10, background: 'rgba(255,255,255,0.04)', borderRadius: 8, fontSize: 14 }}>
                                        {selectedReservation.job_description}
                                    </div>
                                </div>
                            )}
                            <div>
                                <strong>Status:</strong>
                                <span style={{ ...badgeStyle(selectedReservation.status), marginLeft: 8 }}>
                                    {selectedReservation.status}
                                </span>
                            </div>
                        </div>
                        
                        <div style={{ marginBottom: 16 }}>
                            <strong>Change Status:</strong>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
                            <button
                                style={{ ...btnSecondary, background: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24', border: '1px solid rgba(251, 191, 36, 0.3)' }}
                                onClick={() => handleUpdateReservationStatus(selectedReservation.id, 'pending')}
                            >
                                ⏳ Pending
                            </button>
                            <button
                                style={{ ...btnSecondary, background: 'rgba(52, 211, 153, 0.15)', color: '#34d399', border: '1px solid rgba(52, 211, 153, 0.3)' }}
                                onClick={() => handleUpdateReservationStatus(selectedReservation.id, 'confirmed')}
                            >
                                ✅ Confirm
                            </button>
                            <button
                                style={{ ...btnSecondary, background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.3)' }}
                                onClick={() => handleUpdateReservationStatus(selectedReservation.id, 'active')}
                            >
                                🚀 Active
                            </button>
                            <button
                                style={{ ...btnSecondary, background: 'rgba(156, 163, 175, 0.15)', color: '#9ca3af', border: '1px solid rgba(156, 163, 175, 0.3)' }}
                                onClick={() => handleUpdateReservationStatus(selectedReservation.id, 'completed')}
                            >
                                ✓ Completed
                            </button>
                            <button
                                style={{ ...btnSecondary, background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)' }}
                                onClick={() => handleUpdateReservationStatus(selectedReservation.id, 'cancelled')}
                            >
                                ❌ Cancel
                            </button>
                        </div>
                        
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button style={btnSecondary} onClick={() => setSelectedReservation(null)}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
