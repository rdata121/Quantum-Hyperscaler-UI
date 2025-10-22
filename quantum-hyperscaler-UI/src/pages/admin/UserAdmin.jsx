import React, { useEffect, useState } from 'react';
import { useAuth } from '../../auth/AuthProvider';

const API_BASE = 'http://localhost:8000/api';

export default function UserAdmin() {
  const { idToken, user } = useAuth();
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [serviceRequests, setServiceRequests] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [serviceRequestDetail, setServiceRequestDetail] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [users, setUsers] = useState([]);
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({ email: '', role: 'tenant_user', password: '' });

  useEffect(() => {
    (async () => {
      try {
        const token = await idToken();
        if (!token) { setError('Not authenticated'); setLoading(false); return; }

        // 1) fetch roles first
        const meRes = await fetch(`${API_BASE}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
        const me = meRes.ok ? await meRes.json() : {};
        const myRoles = Array.isArray(me.roles) ? me.roles : [];
        setRoles(myRoles);
        if (!myRoles.includes('tenant_admin')) { setError('403: Not authorized'); setLoading(false); return; }

        // helper: fetch with timeout - increased for BigQuery queries
        const withTimeout = (url, opts = {}, ms = 30000) => {
          const ctrl = new AbortController();
          const id = setTimeout(() => {
            console.log(`⏰ Request timeout after ${ms}ms:`, url);
            ctrl.abort();
          }, ms);
          return fetch(url, { ...opts, signal: ctrl.signal }).finally(() => clearTimeout(id));
        };

        // 2) Only fetch endpoints allowed to tenant_admin; skip provider_admin-only to avoid 403 delays
        const tasks = [
          withTimeout(`${API_BASE}/tenant/service-requests`, { headers: { Authorization: `Bearer ${token}` } }),
          withTimeout(`${API_BASE}/tenant/reservations`, { headers: { Authorization: `Bearer ${token}` } }),
          withTimeout(`${API_BASE}/tenant/users`, { headers: { Authorization: `Bearer ${token}` } }),
        ];

        const results = await Promise.allSettled(tasks);
        
        // Debug each result
        console.log('🔍 API Results:', results.map((r, i) => ({
          index: i,
          status: r.status,
          url: ['service-requests', 'reservations', 'users'][i],
          ok: r.status === 'fulfilled' ? r.value.ok : false,
          statusCode: r.status === 'fulfilled' ? r.value.status : 'error'
        })));
        
        if (results[0].status === 'fulfilled' && results[0].value.ok) setServiceRequests(await results[0].value.json());
        if (results[1].status === 'fulfilled' && results[1].value.ok) {
          const reservationsData = await results[1].value.json();
          console.log('📊 Reservations fetched:', reservationsData);
          setReservations(reservationsData);
        }
        if (results[2].status === 'fulfilled' && results[2].value.ok) {
          const usersData = await results[2].value.json();
          console.log('👥 Users fetched:', usersData);
          setUsers(usersData);
        } else if (results[2].status === 'rejected') {
          const error = results[2].reason;
          if (error.name === 'AbortError') {
            console.error('⏰ Users fetch timed out - BigQuery query took too long');
          } else {
            console.error('❌ Users fetch failed:', error);
          }
        } else if (results[2].status === 'fulfilled' && !results[2].value.ok) {
          console.error('❌ Users fetch returned error:', results[2].value.status, results[2].value.statusText);
        }

        // Optionally lazy-load heavy/forbidden data if role escalates later
        if (myRoles.includes('provider_admin')) {
          const lazy = await Promise.allSettled([
            withTimeout(`${API_BASE}/admin/audit-logs`, { headers: { Authorization: `Bearer ${token}` } }, 4000),
            withTimeout(`${API_BASE}/admin/tenants`, { headers: { Authorization: `Bearer ${token}` } }, 4000)
          ]);
          if (lazy[0].status === 'fulfilled' && lazy[0].value.ok) setAuditLogs(await lazy[0].value.json());
          if (lazy[1].status === 'fulfilled' && lazy[1].value.ok) setTenants(await lazy[1].value.json());
        }
      } catch (e) {
        // swallow abort errors; surface others
        if (String(e).toLowerCase().includes('abort')) {
          console.warn('Timed out fetching admin data');
        } else {
          setError(String(e));
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [idToken, user]);

  if (loading) return <div style={{ padding: 16 }}>Loading…</div>;
  if (error) return <div style={{ padding: 16, color: '#ef4444' }}>{error}</div>;

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ margin: 0, fontSize: 24 }}>Tenant Admin</h1>
      <p style={{ color: '#9bb1b1' }}>Roles: {roles.join(', ')}</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
        <section style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={h2}>Users</h2>
            <button onClick={() => setShowAddUser(true)} style={btn}>Add User</button>
          </div>
          <div style={{ marginBottom: 8, fontSize: 12, color: '#9bb1b1' }}>
            Total users: {users.length}
          </div>
          <List items={users} empty="No users" render={(u) => (
            <div style={{...rowStyle, gap: 8}}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{u.email}</div>
                <div style={{ color: '#9bb1b1', fontSize: 13 }}>{u.role}</div>
              </div>
              {u.email !== user?.email && (
                <button 
                  onClick={async (e) => {
                    e.stopPropagation();
                    if (!confirm(`Are you sure you want to delete user ${u.email}?`)) return;
                    try {
                      const token = await idToken();
                      const res = await fetch(`${API_BASE}/tenant/users/${u.id}`, {
                        method: 'DELETE',
                        headers: { Authorization: `Bearer ${token}` }
                      });
                      if (res.ok) {
                        setUsers(users.filter(usr => usr.id !== u.id));
                        alert(`User ${u.email} deleted successfully`);
                      } else {
                        const error = await res.json();
                        alert(`Failed to delete user: ${error.detail || 'Unknown error'}`);
                      }
                    } catch (err) {
                      alert(`Error deleting user: ${err.message}`);
                    }
                  }}
                  style={{
                    ...btnSecondary,
                    padding: '6px 10px',
                    fontSize: 13,
                    background: 'rgba(239, 68, 68, 0.15)',
                    color: '#ef4444',
                    border: '1px solid rgba(239, 68, 68, 0.3)'
                  }}
                >
                  🗑️ Remove
                </button>
              )}
            </div>
          )} />
        </section>

        <section style={cardStyle}>
          <h2 style={h2}>Slot Bookings / Reservations</h2>
          <List items={reservations} empty="No reservations yet" render={(r) => (
            <div style={{...rowStyle, cursor: 'pointer', flexDirection: 'column', alignItems: 'flex-start', gap: 4}} onClick={()=>setServiceRequestDetail(r)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                <div style={{ fontWeight: 600 }}>{r.machine_name || r.machine_id}</div>
                <div style={{ 
                  padding: '4px 8px', 
                  borderRadius: 6, 
                  fontSize: 12,
                  background: r.status === 'confirmed' ? 'rgba(52, 211, 153, 0.15)' : r.status === 'pending' ? 'rgba(251, 191, 36, 0.15)' : 'rgba(156, 163, 175, 0.15)',
                  color: r.status === 'confirmed' ? '#34d399' : r.status === 'pending' ? '#fbbf24' : '#9ca3af'
                }}>
                  {r.status || 'pending'}
                </div>
              </div>
              <div style={{ color: '#9bb1b1', fontSize: 13 }}>
                <span>👤 {r.requester_email}</span> • <span>📅 {new Date(r.start_time).toLocaleString()}</span>
              </div>
              <div style={{ color: '#9bb1b1', fontSize: 13 }}>
                ⏱️ {r.duration_hours}h • 💰 {r.total_cost}
              </div>
            </div>
          )} />
        </section>

        <section style={cardStyle}>
          <h2 style={h2}>Audit Logs</h2>
          <List items={auditLogs} empty="No logs" render={(l) => (
            <div style={rowStyle}>
              <div>{l.action || l.event}</div>
              <div style={{ color: '#9bb1b1' }}>{l.created_at || l.timestamp}</div>
            </div>
          )} />
        </section>

        <section style={cardStyle}>
          <h2 style={h2}>User Management (Tenants)</h2>
          <List items={tenants} empty="No tenants" render={(t) => (
            <div style={rowStyle}>
              <div style={{ fontWeight: 600 }}>{t.name || t.id}</div>
              <div style={{ color: '#9bb1b1' }}>{t.owner_email || t.email || ''}</div>
            </div>
          )} />
        </section>
      </div>

      {showAddUser && (
        <div style={overlay}>
          <div style={modal}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>Add User</h3>
              <button onClick={() => setShowAddUser(false)} style={btnSecondary}>✕</button>
            </div>
            <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
              <input placeholder="Email" value={newUser.email} onChange={e=>setNewUser({...newUser, email: e.target.value})} style={input} />
              <select value={newUser.role} onChange={e=>setNewUser({...newUser, role: e.target.value})} style={input}>
                <option value="tenant_user">tenant_user</option>
                <option value="tenant_admin">tenant_admin</option>
              </select>
              <input placeholder="Temp password (optional)" value={newUser.password} onChange={e=>setNewUser({...newUser, password: e.target.value})} style={input} />
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button onClick={()=>setShowAddUser(false)} style={btnSecondary}>Cancel</button>
                <button onClick={async()=>{
                  try{
                    const token = await idToken();
                    const res = await fetch(`${API_BASE}/tenant/users`,{ method:'POST', headers:{ 'Authorization':`Bearer ${token}`, 'Content-Type':'application/json' }, body: JSON.stringify(newUser) });
                    if(res.ok){
                      const created = await res.json();
                      setUsers([created, ...users]);
                      setShowAddUser(false);
                      setNewUser({ email:'', role:'tenant_user', password:'' });
                      alert(`✅ User created successfully!\n\nEmail: ${created.email}\nTemp Password: ${created.temp_password || 'set externally'}\n\nPlease share these credentials with the user.`);
                    } else {
                      const error = await res.json();
                      alert(`❌ Failed to create user:\n\n${error.detail || 'Unknown error'}`);
                    }
                  }catch(err){
                    alert(`❌ Error: ${err.message}`);
                  }
                }} style={btn}>Create</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {serviceRequestDetail && (
        <div style={overlay} onClick={()=>setServiceRequestDetail(null)}>
          <div style={modal} onClick={e=>e.stopPropagation()}>
            <h3 style={{ marginTop:0 }}>Reservation Details</h3>
            <div style={{ display:'grid', gap:10 }}>
              <div style={{ display:'flex', justifyContent:'space-between', padding:'8px 12px', background:'rgba(255,255,255,0.05)', borderRadius:8 }}>
                <span style={{ fontWeight:600 }}>Status:</span>
                <span style={{ 
                  padding: '4px 10px', 
                  borderRadius: 6, 
                  fontSize: 13,
                  background: serviceRequestDetail.status === 'confirmed' ? 'rgba(52, 211, 153, 0.15)' : serviceRequestDetail.status === 'pending' ? 'rgba(251, 191, 36, 0.15)' : 'rgba(156, 163, 175, 0.15)',
                  color: serviceRequestDetail.status === 'confirmed' ? '#34d399' : serviceRequestDetail.status === 'pending' ? '#fbbf24' : '#9ca3af'
                }}>
                  {serviceRequestDetail.status}
                </span>
              </div>
              <div><b>🖥️ Machine:</b> {serviceRequestDetail.machine_name} <span style={{color:'#9bb1b1'}}>({serviceRequestDetail.machine_type})</span></div>
              <div><b>👤 Requested By:</b> {serviceRequestDetail.requester_email} <span style={{color:'#9bb1b1'}}>({serviceRequestDetail.requester_role})</span></div>
              <div><b>📅 Start Time:</b> {new Date(serviceRequestDetail.start_time).toLocaleString()}</div>
              <div><b>🏁 End Time:</b> {new Date(serviceRequestDetail.end_time).toLocaleString()}</div>
              <div><b>⏱️ Duration:</b> {serviceRequestDetail.duration_hours} hours</div>
              <div><b>💰 Total Cost:</b> ${serviceRequestDetail.total_cost}</div>
              <div><b>🎯 Priority:</b> {serviceRequestDetail.priority}</div>
              <div><b>🔬 Job Type:</b> {serviceRequestDetail.job_type}</div>
              {serviceRequestDetail.job_description && (
                <div style={{ marginTop:4 }}>
                  <b>📝 Description:</b>
                  <div style={{ marginTop:6, padding:'10px', background:'rgba(255,255,255,0.04)', borderRadius:8, fontSize:14, color:'#9bb1b1' }}>
                    {serviceRequestDetail.job_description}
                  </div>
                </div>
              )}
              <div style={{color:'#9bb1b1', fontSize:13, marginTop:4}}><b>Created:</b> {new Date(serviceRequestDetail.created_at).toLocaleString()}</div>
            </div>
            <div style={{ display:'flex', justifyContent:'flex-end', marginTop:16 }}>
              <button onClick={()=>setServiceRequestDetail(null)} style={btn}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function List({ items, render, empty }) {
  if (!Array.isArray(items) || items.length === 0) {
    return <div style={{ padding: 8, color: '#9bb1b1' }}>{empty}</div>;
  }
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      {items.map((it, idx) => (
        <div key={it.id || idx} style={itemStyle}>
          {render(it)}
        </div>
      ))}
    </div>
  );
}

const cardStyle = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 14,
  padding: 16
};
const itemStyle = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 10,
  padding: 10
};
const rowStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const h2 = { margin: '0 0 8px 0', fontSize: 18 };
const btn = { padding: '8px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)', background: 'var(--accent-grad)', color: '#fff' };
const btnSecondary = { padding: '8px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.06)', color: 'var(--fg)' };
const input = { padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.06)', color: 'var(--fg)' };
const overlay = { position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 };
const modal = { background:'var(--bg)', color:'var(--fg)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:14, padding:16, width:'min(640px, 92vw)', maxHeight:'90vh', overflow:'auto' };


