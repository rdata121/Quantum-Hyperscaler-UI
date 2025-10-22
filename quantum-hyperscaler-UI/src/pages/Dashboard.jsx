import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Legend
} from 'recharts';
import {
  Activity, TrendingUp, Clock, Cpu, Zap, Database,
  Users, Calendar, AlertCircle, CheckCircle, Info,
  ArrowUp, ArrowDown, Minus, MoreVertical, RefreshCw,
  Shield, Cloud, Server, GitBranch, Package, Layers,
  BarChart3, Timer, Hash, Calendar as CalendarIcon
} from 'lucide-react';
import styles from '../styles/dashboard.module.css';
const API_BASE = 'http://localhost:8000';

// Mock data generators
const generateTimeSeriesData = (days = 30) => {
  const data = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      optimizations: Math.floor(Math.random() * 50) + 20,
      apiCalls: Math.floor(Math.random() * 200) + 100,
      quantumUsage: Math.floor(Math.random() * 80) + 10,
      classicalUsage: Math.floor(Math.random() * 60) + 30,
      cost: Math.floor(Math.random() * 500) + 200
    });
  }
  return data;
};

const projectData = [
  { name: 'Fleet Optimization', status: 'active', runs: 234, success: 96, lastRun: '2 hours ago' },
  { name: 'Supply Chain', status: 'active', runs: 189, success: 94, lastRun: '5 hours ago' },
  { name: 'Network Design', status: 'idle', runs: 145, success: 92, lastRun: '1 day ago' },
  { name: 'Drug Discovery', status: 'active', runs: 89, success: 88, lastRun: '30 mins ago' },
  { name: 'Risk Analysis', status: 'completed', runs: 456, success: 95, lastRun: '3 days ago' }
];

const solverUsage = [
  { name: 'Quantum', value: 35, fill: '#00d4ff' },
  { name: 'Quantum-Inspired', value: 45, fill: '#7c3aed' },
  { name: 'Classical', value: 20, fill: '#64748b' }
];

const performanceData = [
  { metric: 'Speed', quantum: 95, classical: 45, max: 100 },
  { metric: 'Accuracy', quantum: 92, classical: 78, max: 100 },
  { metric: 'Scalability', quantum: 88, classical: 65, max: 100 },
  { metric: 'Efficiency', quantum: 90, classical: 70, max: 100 },
  { metric: 'Cost-Effectiveness', quantum: 85, classical: 60, max: 100 }
];

const recentActivity = [
  { id: 1, type: 'optimization', project: 'Fleet Optimization', status: 'completed', time: '5 mins ago', duration: '0.3s' },
  { id: 2, type: 'deployment', project: 'New QUBO Model', status: 'success', time: '1 hour ago' },
  { id: 3, type: 'optimization', project: 'Supply Chain', status: 'running', time: '2 hours ago', progress: 67 },
  { id: 4, type: 'alert', message: 'High quantum utilization detected', status: 'warning', time: '3 hours ago' },
  { id: 5, type: 'optimization', project: 'Network Design', status: 'failed', time: '5 hours ago', error: 'Timeout exceeded' }
];

export default function Dashboard() {
  const [timeRange, setTimeRange] = useState('7d');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [timeSeriesData, setTimeSeriesData] = useState([]);
  const [userSession, setUserSession] = useState({
    lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    sessionDuration: 0,
    location: 'San Francisco, CA',
    device: 'Chrome on macOS'
  });
  const [roles, setRoles] = useState(() => {
    // Load roles from cache immediately for instant button display
    try {
      const cachedRoles = localStorage.getItem('user_roles_cache');
      if (cachedRoles) {
        const parsed = JSON.parse(cachedRoles);
        console.log('⚡ Dashboard: Roles loaded from cache on init:', parsed);
        return parsed;
      }
    } catch (e) {
      console.error('Failed to parse cached roles:', e);
    }
    return [];
  });

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem('firebase_token');
        if (!token) return;
        const res = await fetch(`${API_BASE}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) {
          const me = await res.json();
          if (Array.isArray(me.roles)) {
            setRoles(me.roles);
            // Cache for instant next load
            localStorage.setItem('user_roles_cache', JSON.stringify(me.roles));
            localStorage.setItem('user_roles_email', me.email);
          }
        }
      } catch {}
    })();
  }, []);
  
  // Firebase token state
  const { user, idToken } = useAuth();
  const [firebaseToken, setFirebaseToken] = useState('');
  const [showToken, setShowToken] = useState(false);

  useEffect(() => {
    // Generate initial data
    const days = timeRange === '24h' ? 1 : timeRange === '7d' ? 7 : 30;
    setTimeSeriesData(generateTimeSeriesData(days));

    // Update session duration
    const interval = setInterval(() => {
      setUserSession(prev => ({
        ...prev,
        sessionDuration: prev.sessionDuration + 1
      }));
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [timeRange]);

  // Function to get Firebase token
  const getToken = async () => {
    if (user) {
      const token = await idToken();
      setFirebaseToken(token);
      setShowToken(true);
      console.log('Firebase ID Token:', token);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      const days = timeRange === '24h' ? 1 : timeRange === '7d' ? 7 : 30;
      setTimeSeriesData(generateTimeSeriesData(days));
      setRefreshing(false);
    }, 1000);
  };

  const formatDuration = (minutes) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
      case 'running':
      case 'success':
      case 'completed':
        return <CheckCircle className={styles.statusIconSuccess} />;
      case 'warning':
      case 'idle':
        return <AlertCircle className={styles.statusIconWarning} />;
      case 'failed':
        return <AlertCircle className={styles.statusIconError} />;
      default:
        return <Info className={styles.statusIconInfo} />;
    }
  };

  const calculateTotals = () => {
    const totals = timeSeriesData.reduce((acc, day) => ({
      optimizations: acc.optimizations + day.optimizations,
      apiCalls: acc.apiCalls + day.apiCalls,
      cost: acc.cost + day.cost
    }), { optimizations: 0, apiCalls: 0, cost: 0 });

    return totals;
  };

  const totals = calculateTotals();

  return (
    <div className={styles.dashboard}>
      {/* Header Section */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <h1 className={styles.title}>Optimization Console</h1>
            <div className={styles.breadcrumb}>
              <span>Projects</span>
              <span className={styles.separator}>/</span>
              <span className={styles.current}>Overview</span>
            </div>
          </div>
          
          <div className={styles.headerRight}>
            <div className={styles.userInfo}>
              <div className={styles.sessionInfo}>
                <div className={styles.lastLogin}>
                  <Clock size={14} />
                  <span>Last login: {userSession.lastLogin.toLocaleString()}</span>
                </div>
                <div className={styles.sessionDuration}>
                  <Timer size={14} />
                  <span>Session: {formatDuration(userSession.sessionDuration)}</span>
                </div>
              </div>
              <div className={styles.userMeta}>
                <span className={styles.location}>{userSession.location}</span>
                <span className={styles.device}>{userSession.device}</span>
              </div>
            </div>

            <div className={styles.headerActions}>
              <Link 
                to="/reservations"
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  marginRight: '10px',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                <CalendarIcon size={14} />
                Book Quantum Machines
              </Link>

              {Array.isArray(roles) && roles.includes('provider_admin') ? (
                <Link 
                  to="/provider-admin"
                  style={{
                    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                    color: 'white',
                    border: 'none',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    marginRight: '10px',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  🔐 Provider Admin
                </Link>
              ) : Array.isArray(roles) && roles.includes('tenant_admin') ? (
                <Link 
                  to="/admin"
                  style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    marginRight: '10px',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  🛠️ Tenant Admin
                </Link>
              ) : (
                <Link 
                  to="/simple-booking"
                  style={{
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    marginRight: '10px',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  🚀 Quick Booking
                </Link>
              )}
              
              <select 
                className={styles.timeRangeSelect}
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
              >
                <option value="24h">Last 24 hours</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
              </select>
              
              <button 
                className={`${styles.refreshBtn} ${refreshing ? styles.spinning : ''}`}
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCw size={16} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Firebase Token Display */}
      {showToken && firebaseToken && (
        <div style={{
          background: '#f8f9fa',
          border: '1px solid #dee2e6',
          borderRadius: '8px',
          padding: '20px',
          margin: '20px 0',
          fontFamily: 'monospace'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#495057' }}>Firebase ID Token (for API testing):</h3>
          <textarea 
            value={firebaseToken}
            readOnly
            style={{
              width: '100%',
              height: '80px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              padding: '8px',
              fontSize: '12px',
              fontFamily: 'monospace'
            }}
          />
          <div style={{ marginTop: '10px' }}>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(firebaseToken);
                alert('Token copied to clipboard!');
              }}
              style={{
                background: '#28a745',
                color: 'white',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
                marginRight: '10px'
              }}
            >
              Copy Token
            </button>
            <button 
              onClick={() => setShowToken(false)}
              style={{
                background: '#6c757d',
                color: 'white',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Hide
            </button>
          </div>
          <div style={{ marginTop: '10px', fontSize: '12px', color: '#6c757d' }}>
            <strong>Test Commands:</strong><br/>
            <code>curl -H "Authorization: Bearer {firebaseToken.substring(0, 20)}..." http://localhost:8000/api/auth/me</code>
          </div>
        </div>
      )}

      {/* Key Metrics Cards */}
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <div className={styles.metricIcon}>
              <Zap />
            </div>
            <button className={styles.metricMenu}>
              <MoreVertical size={16} />
            </button>
          </div>
          <div className={styles.metricValue}>{totals.optimizations}</div>
          <div className={styles.metricLabel}>Total Optimizations</div>
          <div className={styles.metricChange}>
            <ArrowUp size={14} />
            <span className={styles.changePositive}>+23%</span>
            <span className={styles.changeLabel}>vs last period</span>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <div className={styles.metricIcon}>
              <Activity />
            </div>
            <button className={styles.metricMenu}>
              <MoreVertical size={16} />
            </button>
          </div>
          <div className={styles.metricValue}>{totals.apiCalls}</div>
          <div className={styles.metricLabel}>API Calls</div>
          <div className={styles.metricChange}>
            <ArrowUp size={14} />
            <span className={styles.changePositive}>+15%</span>
            <span className={styles.changeLabel}>vs last period</span>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <div className={styles.metricIcon}>
              <Cpu />
            </div>
            <button className={styles.metricMenu}>
              <MoreVertical size={16} />
            </button>
          </div>
          <div className={styles.metricValue}>89%</div>
          <div className={styles.metricLabel}>Success Rate</div>
          <div className={styles.metricChange}>
            <Minus size={14} />
            <span className={styles.changeNeutral}>0%</span>
            <span className={styles.changeLabel}>vs last period</span>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <div className={styles.metricIcon}>
              <Database />
            </div>
            <button className={styles.metricMenu}>
              <MoreVertical size={16} />
            </button>
          </div>
          <div className={styles.metricValue}>${totals.cost}</div>
          <div className={styles.metricLabel}>Total Cost</div>
          <div className={styles.metricChange}>
            <ArrowDown size={14} />
            <span className={styles.changeNegative}>-8%</span>
            <span className={styles.changeLabel}>vs last period</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className={styles.chartsGrid}>
        {/* Optimization Trends */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h3 className={styles.chartTitle}>Optimization Trends</h3>
            <div className={styles.chartLegend}>
              <span className={styles.legendItem}>
                <span className={styles.legendDot} style={{ background: '#00d4ff' }}></span>
                Quantum
              </span>
              <span className={styles.legendItem}>
                <span className={styles.legendDot} style={{ background: '#7c3aed' }}></span>
                Classical
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={timeSeriesData}>
              <defs>
                <linearGradient id="quantumGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#00d4ff" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="classicalGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
              <XAxis dataKey="date" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1a1a1a', 
                  border: '1px solid #333',
                  borderRadius: '8px'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="quantumUsage" 
                stroke="#00d4ff" 
                fillOpacity={1} 
                fill="url(#quantumGradient)" 
              />
              <Area 
                type="monotone" 
                dataKey="classicalUsage" 
                stroke="#7c3aed" 
                fillOpacity={1} 
                fill="url(#classicalGradient)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Solver Usage Distribution */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h3 className={styles.chartTitle}>Solver Usage</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={solverUsage}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {solverUsage.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1a1a1a', 
                  border: '1px solid #333',
                  borderRadius: '8px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Performance Comparison */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h3 className={styles.chartTitle}>Performance Comparison</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={performanceData}>
              <PolarGrid stroke="#333" />
              <PolarAngleAxis dataKey="metric" stroke="#666" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#666" />
              <Radar 
                name="Quantum" 
                dataKey="quantum" 
                stroke="#00d4ff" 
                fill="#00d4ff" 
                fillOpacity={0.3} 
              />
              <Radar 
                name="Classical" 
                dataKey="classical" 
                stroke="#7c3aed" 
                fill="#7c3aed" 
                fillOpacity={0.3} 
              />
              <Legend />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1a1a1a', 
                  border: '1px solid #333',
                  borderRadius: '8px'
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Cost Analysis */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h3 className={styles.chartTitle}>Cost Analysis</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={timeSeriesData.slice(-7)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
              <XAxis dataKey="date" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1a1a1a', 
                  border: '1px solid #333',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="cost" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Projects and Activity Section */}
      <div className={styles.bottomGrid}>
        {/* Active Projects */}
        <div className={styles.projectsCard}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>Active Projects</h3>
            <Link to="/projects" className={styles.viewAll}>View all →</Link>
          </div>
          
          <div className={styles.projectsList}>
            {projectData.map((project, index) => (
              <div 
                key={index} 
                className={styles.projectItem}
                onClick={() => setSelectedProject(project)}
              >
                <div className={styles.projectHeader}>
                  <div className={styles.projectName}>
                    <Package size={16} />
                    <span>{project.name}</span>
                  </div>
                  <span className={`${styles.projectStatus} ${styles[project.status]}`}>
                    {project.status}
                  </span>
                </div>
                
                <div className={styles.projectStats}>
                  <div className={styles.projectStat}>
                    <span className={styles.statLabel}>Runs</span>
                    <span className={styles.statValue}>{project.runs}</span>
                  </div>
                  <div className={styles.projectStat}>
                    <span className={styles.statLabel}>Success</span>
                    <span className={styles.statValue}>{project.success}%</span>
                  </div>
                  <div className={styles.projectStat}>
                    <span className={styles.statLabel}>Last Run</span>
                    <span className={styles.statValue}>{project.lastRun}</span>
                  </div>
                </div>
                
                <div className={styles.projectProgress}>
                  <div 
                    className={styles.progressBar}
                    style={{ width: `${project.success}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className={styles.activityCard}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>Recent Activity</h3>
            <Link to="/activity" className={styles.viewAll}>View all →</Link>
          </div>
          
          <div className={styles.activityList}>
            {recentActivity.map((activity) => (
              <div key={activity.id} className={styles.activityItem}>
                <div className={styles.activityIcon}>
                  {getStatusIcon(activity.status)}
                </div>
                
                <div className={styles.activityContent}>
                  <div className={styles.activityMain}>
                    {activity.type === 'optimization' && (
                      <>
                        <span className={styles.activityType}>Optimization</span>
                        <span className={styles.activityProject}>{activity.project}</span>
                        {activity.status === 'running' && (
                          <span className={styles.activityProgress}>{activity.progress}%</span>
                        )}
                        {activity.duration && (
                          <span className={styles.activityDuration}>{activity.duration}</span>
                        )}
                      </>
                    )}
                    {activity.type === 'deployment' && (
                      <>
                        <span className={styles.activityType}>Deployment</span>
                        <span className={styles.activityProject}>{activity.project}</span>
                      </>
                    )}
                    {activity.type === 'alert' && (
                      <span className={styles.activityMessage}>{activity.message}</span>
                    )}
                  </div>
                  
                  {activity.error && (
                    <div className={styles.activityError}>{activity.error}</div>
                  )}
                  
                  <div className={styles.activityTime}>{activity.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Status */}
        <div className={styles.statusCard}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>System Status</h3>
          </div>
          
          <div className={styles.statusList}>
            <div className={styles.statusItem}>
              <div className={styles.statusIndicator}>
                <Cloud size={16} />
                <span className={styles.statusDot + ' ' + styles.online}></span>
              </div>
              <div className={styles.statusInfo}>
                <div className={styles.statusName}>API Gateway</div>
                <div className={styles.statusMeta}>Operational • 99.9% uptime</div>
              </div>
            </div>
            
            <div className={styles.statusItem}>
              <div className={styles.statusIndicator}>
                <Server size={16} />
                <span className={styles.statusDot + ' ' + styles.online}></span>
              </div>
              <div className={styles.statusInfo}>
                <div className={styles.statusName}>Quantum Processors</div>
                <div className={styles.statusMeta}>8/10 available</div>
              </div>
            </div>
            
            <div className={styles.statusItem}>
              <div className={styles.statusIndicator}>
                <Database size={16} />
                <span className={styles.statusDot + ' ' + styles.warning}></span>
              </div>
              <div className={styles.statusInfo}>
                <div className={styles.statusName}>Storage</div>
                <div className={styles.statusMeta}>78% used • 2.3TB free</div>
              </div>
            </div>
            
            <div className={styles.statusItem}>
              <div className={styles.statusIndicator}>
                <Shield size={16} />
                <span className={styles.statusDot + ' ' + styles.online}></span>
              </div>
              <div className={styles.statusInfo}>
                <div className={styles.statusName}>Security</div>
                <div className={styles.statusMeta}>No threats detected</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}