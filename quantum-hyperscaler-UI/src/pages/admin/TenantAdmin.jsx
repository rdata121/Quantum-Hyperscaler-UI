import { useState, useEffect } from 'react';
import { useAuth } from '../../auth/AuthProvider';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'http://localhost:8000/api';

export default function TenantAdmin() {
    const { user, idToken: getIdToken } = useAuth();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('users'); // 'users' | 'reservations' | 'add-user'
    const [accessChecked, setAccessChecked] = useState(false);
    const [users, setUsers] = useState([]);
    const [reservations, setReservations] = useState([]);
    const [newUser, setNewUser] = useState({ email: '', password: '', role: 'tenant_user' });
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        if (!user) return;
        (async () => {
            try {
                const token = await getIdToken();
                if (!token) return navigate('/console');
                const res = await fetch(`${API_BASE}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
                if (!res.ok) return navigate('/dashboard');
                const me = await res.json();
                if (!Array.isArray(me.roles) || !me.roles.includes('tenant_admin')) {
                    alert('⚠️ Access Denied: Tenant Admin access required');
                    navigate('/dashboard');
                }
            } catch {}
            setAccessChecked(true);
        })();
    }, [user, navigate, getIdToken]);

    const idToken = async () => {
        const token = await getIdToken();
        if (!token) throw new Error('No auth token');
        return token;
    };

    const withTimeout = (url, opts = {}, ms = 15000) => {
        const ctrl = new AbortController();
        const id = setTimeout(() => ctrl.abort(), ms);
        return fetch(url, { ...opts, signal: ctrl.signal }).finally(() => clearTimeout(id));
    };

    useEffect(() => {
        if (!user || !accessChecked) return;
        loadData();
    }, [user, accessChecked]);

    const loadData = async () => {
        try {
            const token = await idToken();
            console.log('🚀 Starting to load tenant admin data...');
            
            // Local cache configuration
            const CACHE_KEYS = {
                users: 'tenant_users_cache',
                reservations: 'tenant_reservations_cache'
            };
            const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
            
            // Load from local cache first (instant display)
            const cachedUsers = localStorage.getItem(CACHE_KEYS.users);
            const cachedReservations = localStorage.getItem(CACHE_KEYS.reservations);
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
                
                // Refresh in background (don't await)
                console.log('🔄 Refreshing data in background...');
                fetchFreshData(token, CACHE_KEYS);
                return; // Exit early - data is already displayed
            }
            
            // No valid cache - fetch fresh data
            console.log('💾 No cache found - fetching from API...');
            await fetchFreshData(token, CACHE_KEYS);
            
        } catch (e) {
            console.error('Failed to load tenant data', e);
        }
    };
    
    const fetchFreshData = async (token, CACHE_KEYS) => {
        const startTime = Date.now();
        try {
            const tasks = [
                withTimeout(`${API_BASE}/tenant/users?_t=${Date.now()}`, { headers: { Authorization: `Bearer ${token}` } }),
                withTimeout(`${API_BASE}/tenant/reservations?_t=${Date.now()}`, { headers: { Authorization: `Bearer ${token}` } })
            ];
            
            console.log('📡 Fetching data from API (2 parallel requests)...');
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
            
            const loadTime = ((Date.now() - startTime) / 1000).toFixed(2);
            console.log(`✅ All data loaded and cached in ${loadTime}s`);
            
        } catch (err) {
            console.error('Failed to fetch fresh data:', err);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            const token = await idToken();
            const CACHE_KEYS = {
                users: 'tenant_users_cache',
                reservations: 'tenant_reservations_cache'
            };
            await fetchFreshData(token, CACHE_KEYS);
            alert('✅ Data refreshed successfully!');
        } catch (e) {
            alert(`❌ Refresh failed: ${e.message}`);
        } finally {
            setRefreshing(false);
        }
    };

    const handleCreateUser = async () => {
        if (!newUser.email) return alert('Email is required');
        try {
            const token = await idToken();
            const res = await fetch(`${API_BASE}/tenant/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(newUser)
            });
            if (res.ok) {
                const created = await res.json();
                setUsers([created, ...users]);
                setNewUser({ email: '', password: '', role: 'tenant_user' });
                alert('✅ User created');
                setActiveTab('users');
            } else {
                const err = await res.json();
                alert(`❌ Failed: ${err.detail || 'Unknown error'}`);
            }
        } catch (e) {
            alert(`❌ Error: ${e.message}`);
        }
    };

    const styles = {
        container: { minHeight: '100vh', background: 'linear-gradient(135deg, #0a0e27, #1a1f3a)', padding: 24, color: '#e0e7ff' },
        header: { marginBottom: 24, paddingBottom: 16, borderBottom: '2px solid rgba(0,212,255,0.2)' },
        h1: { fontSize: 28, fontWeight: 700, background: 'linear-gradient(135deg, #00d4ff, #35e5cf)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 },
        tabs: { display: 'flex', gap: 12, marginBottom: 24, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 12 },
        tab: (active) => ({ padding: '10px 20px', background: active ? 'linear-gradient(135deg, #00d4ff, #35e5cf)' : 'rgba(255,255,255,0.05)', color: active ? '#0a0e27' : '#9bb1b1', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: active ? 600 : 400 }),
        card: { background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 24, marginBottom: 24, border: '1px solid rgba(0,212,255,0.1)' },
        h2: { fontSize: 20, fontWeight: 600, marginTop: 0, marginBottom: 16, color: '#00d4ff' },
        table: { width: '100%', borderCollapse: 'collapse', fontSize: 14 },
        th: { textAlign: 'left', padding: '12px 8px', borderBottom: '2px solid rgba(0,212,255,0.2)', color: '#00d4ff', fontWeight: 600 },
        td: { padding: '12px 8px', borderBottom: '1px solid rgba(255,255,255,0.05)' },
        badge: (kind) => {
            const map = { pending: ['rgba(251,191,36,0.15)', '#fbbf24'], confirmed: ['rgba(52,211,153,0.15)', '#34d399'], active: ['rgba(59,130,246,0.15)', '#3b82f6'] };
            const [bg, color] = map[kind] || ['rgba(156,163,175,0.15)', '#9ca3af'];
            return { display: 'inline-block', padding: '4px 12px', borderRadius: 6, fontSize: 12, fontWeight: 500, background: bg, color };
        },
        btnPrimary: { padding: '10px 20px', background: 'linear-gradient(135deg, #00d4ff, #35e5cf)', color: '#0a0e27', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 },
        input: { width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 8, color: '#e0e7ff', fontSize: 14, marginBottom: 12 }
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.h1}>🏢 Tenant Admin</h1>
                <p style={{ color: '#9bb1b1', marginTop: 6 }}>Manage your organization's users and reservations</p>
            </div>

            <div style={styles.tabs}>
                <button style={styles.tab(activeTab === 'users')} onClick={() => setActiveTab('users')}>👥 Users ({users.length})</button>
                <button style={styles.tab(activeTab === 'reservations')} onClick={() => setActiveTab('reservations')}>📅 Reservations ({reservations.length})</button>
                <button style={styles.tab(activeTab === 'add-user')} onClick={() => setActiveTab('add-user')}>➕ Add User</button>
                <button 
                    style={{...styles.tab(false), marginLeft: 'auto', opacity: refreshing ? 0.6 : 1}} 
                    onClick={handleRefresh}
                    disabled={refreshing}
                >
                    {refreshing ? '🔄 Refreshing...' : '🔄 Refresh Data'}
                </button>
            </div>

            {activeTab === 'users' && (
                <div style={styles.card}>
                    <h2 style={styles.h2}>Users</h2>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>Email</th>
                                    <th style={styles.th}>Role</th>
                                    <th style={styles.th}>Status</th>
                                    <th style={styles.th}>Created</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u.id}>
                                        <td style={styles.td}>{u.email}</td>
                                        <td style={styles.td}>{u.role}</td>
                                        <td style={styles.td}><span style={styles.badge(u.status === 'active' ? 'confirmed' : 'pending')}>{u.status || 'active'}</span></td>
                                        <td style={styles.td}>{u.created_at ? new Date(u.created_at).toLocaleDateString() : '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'reservations' && (
                <div style={styles.card}>
                    <h2 style={styles.h2}>Reservations</h2>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>Machine</th>
                                    <th style={styles.th}>Requester</th>
                                    <th style={styles.th}>Start</th>
                                    <th style={styles.th}>Duration</th>
                                    <th style={styles.th}>Cost</th>
                                    <th style={styles.th}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reservations.map(r => (
                                    <tr key={r.id}>
                                        <td style={styles.td}>{r.machine_name}</td>
                                        <td style={styles.td}>{r.requester_email}</td>
                                        <td style={styles.td}>{new Date(r.start_time).toLocaleString()}</td>
                                        <td style={styles.td}>{r.duration_hours}h</td>
                                        <td style={styles.td}>${r.total_cost}</td>
                                        <td style={styles.td}><span style={styles.badge(r.status)}>{r.status}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'add-user' && (
                <div style={styles.card}>
                    <h2 style={styles.h2}>Add User</h2>
                    <div style={{ maxWidth: 480 }}>
                        <label style={{ display: 'block', marginBottom: 6, color: '#9bb1b1' }}>Email</label>
                        <input style={styles.input} value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} placeholder="user@example.com" />

                        <label style={{ display: 'block', marginBottom: 6, color: '#9bb1b1' }}>Temporary Password (optional)</label>
                        <input style={styles.input} type="password" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} placeholder="••••••" />

                        <label style={{ display: 'block', marginBottom: 6, color: '#9bb1b1' }}>Role</label>
                        <select style={styles.input} value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })}>
                            <option value="tenant_user">Tenant User</option>
                            <option value="tenant_admin">Tenant Admin</option>
                        </select>

                        <div style={{ marginTop: 12 }}>
                            <button style={styles.btnPrimary} onClick={handleCreateUser}>Create User</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}


