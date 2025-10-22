// Sidebar.jsx - Improved Version
import React, { useState, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  ChevronRight, Menu, Pin, GripVertical, X, Plus,
  Zap, Network, Calendar, Package, Route, Hash, Layers,
  DollarSign, Shield, BarChart3, Brain
} from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import styles from '../styles/sidebar.module.css';

const API_BASE = 'http://localhost:8000';

// Organized route structure
const MENU_STRUCTURE = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    icon: BarChart3,
    items: [
      { id: 'overview', path: '/dashboard', label: 'Overview', icon: BarChart3 }
    ]
  },
  {
    id: 'optimization',
    title: 'Optimization Suite',
    icon: Zap,
    items: [
      { id: 'fleet', path: '/optimization/fleet-capacity', label: 'Fleet Planning (CVRP)' },
      { id: 'resource', path: '/optimization/resource-allocation', label: 'Resource Allocation' },
      { id: 'route', path: '/optimization/route-optimization', label: 'Route Optimization (TSP)' },
      { id: 'network', path: '/optimization/network-partitioning', label: 'Network Partitioning' },
      { id: 'packing', path: '/optimization/packing-scheduling', label: 'Packing & Scheduling' },
      { id: 'energy', path: '/optimization/energy-optimization', label: 'Energy Trading' }
    ]
  },
  {
    id: 'ml',
    title: 'Machine Learning',
    icon: Brain,
    items: [
      { id: 'ml-overview', path: '/ml', label: 'ML Dashboard' },
      { id: 'models', path: '/ml/models', label: 'Models' },
      { id: 'training', path: '/ml/training', label: 'Training Jobs' }
    ]
  },
  {
    id: 'graph',
    title: 'Graph Intelligence',
    icon: Network,
    items: [
      { id: 'graph-overview', path: '/graph', label: 'Graph Analysis' },
      { id: 'networks', path: '/graph/networks', label: 'Network Problems' }
    ]
  },
  {
    id: 'cost',
    title: 'Cost Management',
    icon: DollarSign,
    items: [
      { id: 'cost-overview', path: '/cost', label: 'Cost Overview' },
      { id: 'budgets', path: '/cost/budgets', label: 'Budgets' },
      { id: 'reports', path: '/cost/reports', label: 'Reports' }
    ]
  },
  {
    id: 'iam',
    title: 'IAM & Security',
    icon: Shield,
    items: [
      { id: 'iam-overview', path: '/iam', label: 'IAM Dashboard' },
      { id: 'users', path: '/iam/users', label: 'Users' },
      { id: 'roles', path: '/iam/roles', label: 'Roles' }
    ]
  }
];

const STORAGE_KEYS = {
  collapsed: 'sidebar_collapsed',
  width: 'sidebar_width',
  expanded: 'sidebar_expanded_sections',
  order: 'sidebar_section_order'
};

export default function Sidebar({ onWidthChange }) {
  const { user, idToken } = useAuth();
  const [userRoles, setUserRoles] = useState([]);
  
  // Core state
  const [collapsed, setCollapsed] = useState(() => 
    localStorage.getItem(STORAGE_KEYS.collapsed) === 'true'
  );
  const [width, setWidth] = useState(() => 
    parseInt(localStorage.getItem(STORAGE_KEYS.width)) || 280
  );
  const [expandedSections, setExpandedSections] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.expanded)) || ['optimization'];
    } catch {
      return ['optimization'];
    }
  });
  const [sections, setSections] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.order);
      if (saved) {
        const order = JSON.parse(saved);
        return order.map(id => MENU_STRUCTURE.find(s => s.id === id)).filter(Boolean);
      }
    } catch {}
    return MENU_STRUCTURE;
  });
  
  // Fetch user roles with local cache for instant display
  useEffect(() => {
    if (!user) return;
    
    // Try to load roles from localStorage first (instant)
    const cachedRoles = localStorage.getItem('user_roles_cache');
    const cachedEmail = localStorage.getItem('user_roles_email');
    if (cachedRoles && cachedEmail === user.email) {
      try {
        setUserRoles(JSON.parse(cachedRoles));
        console.log('⚡ User roles loaded from cache');
      } catch (e) {}
    }
    
    // Then fetch fresh roles in background
    (async () => {
      try {
        const token = await idToken();
        if (!token) return;
        const res = await fetch(`${API_BASE}/api/auth/me`, { 
          headers: { Authorization: `Bearer ${token}` } 
        });
        if (res.ok) {
          const me = await res.json();
          setUserRoles(me.roles || []);
          // Cache for next load
          localStorage.setItem('user_roles_cache', JSON.stringify(me.roles || []));
          localStorage.setItem('user_roles_email', user.email);
        }
      } catch (err) {
        console.error('Failed to fetch user roles:', err);
      }
    })();
  }, [user, idToken]);

  // Drag state
  const [draggedSection, setDraggedSection] = useState(null);
  const [dragOverSection, setDragOverSection] = useState(null);
  const [isResizing, setIsResizing] = useState(false);
  
  const sidebarRef = useRef(null);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  // Persist state changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.collapsed, collapsed);
  }, [collapsed]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.width, width);
    onWidthChange?.(collapsed ? 60 : width);
  }, [width, collapsed, onWidthChange]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.expanded, JSON.stringify(expandedSections));
  }, [expandedSections]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.order, JSON.stringify(sections.map(s => s.id)));
  }, [sections]);

  // Toggle section expansion
  const toggleSection = (sectionId) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  // Handle drag and drop for sections
  const handleDragStart = (e, section) => {
    setDraggedSection(section);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, section) => {
    e.preventDefault();
    if (draggedSection && draggedSection.id !== section.id) {
      setDragOverSection(section.id);
    }
  };

  const handleDragLeave = () => {
    setDragOverSection(null);
  };

  const handleDrop = (e, targetSection) => {
    e.preventDefault();
    if (!draggedSection || draggedSection.id === targetSection.id) return;

    const newSections = [...sections];
    const draggedIndex = newSections.findIndex(s => s.id === draggedSection.id);
    const targetIndex = newSections.findIndex(s => s.id === targetSection.id);
    
    if (draggedIndex !== -1 && targetIndex !== -1) {
      newSections.splice(draggedIndex, 1);
      newSections.splice(targetIndex, 0, draggedSection);
      setSections(newSections);
    }

    setDraggedSection(null);
    setDragOverSection(null);
  };

  const handleDragEnd = () => {
    setDraggedSection(null);
    setDragOverSection(null);
  };

  // Handle resizing
  const handleMouseDown = (e) => {
    setIsResizing(true);
    startXRef.current = e.clientX;
    startWidthRef.current = width;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      const newWidth = Math.max(200, Math.min(400, startWidthRef.current + e.clientX - startXRef.current));
      setWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  // Pin section to top
  const pinSection = (sectionId) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;
    
    const newSections = sections.filter(s => s.id !== sectionId);
    setSections([section, ...newSections]);
  };

  // Reset to defaults
  const resetOrder = () => {
    setSections(MENU_STRUCTURE);
    setExpandedSections(['optimization']);
    localStorage.removeItem(STORAGE_KEYS.order);
    localStorage.removeItem(STORAGE_KEYS.expanded);
  };

  return (
    <aside 
      ref={sidebarRef}
      className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}
      style={{ width: collapsed ? 60 : width }}
    >
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          {!collapsed && <span className={styles.logo}>Quantum Console</span>}
          <button
            className={styles.collapseBtn}
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <Menu size={18} />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className={styles.nav}>
        {sections.map((section) => {
          const Icon = section.icon;
          const isExpanded = expandedSections.includes(section.id);
          const isDragOver = dragOverSection === section.id;

          return (
            <div
              key={section.id}
              className={`${styles.section} ${isDragOver ? styles.dragOver : ''}`}
              draggable={!collapsed}
              onDragStart={(e) => handleDragStart(e, section)}
              onDragOver={(e) => handleDragOver(e, section)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, section)}
              onDragEnd={handleDragEnd}
            >
              {/* Section Header */}
              <div className={styles.sectionHeader}>
                <button
                  className={styles.sectionToggle}
                  onClick={() => toggleSection(section.id)}
                  title={collapsed ? section.title : ''}
                >
                  {Icon && <Icon size={18} className={styles.sectionIcon} />}
                  {!collapsed && (
                    <>
                      <span className={styles.sectionTitle}>{section.title}</span>
                      <ChevronRight 
                        size={16} 
                        className={`${styles.chevron} ${isExpanded ? styles.expanded : ''}`}
                      />
                    </>
                  )}
                </button>
                
                {!collapsed && (
                  <div className={styles.sectionActions}>
                    <button
                      className={styles.actionBtn}
                      onClick={() => pinSection(section.id)}
                      title="Pin to top"
                    >
                      <Pin size={14} />
                    </button>
                    <div className={styles.dragHandle} title="Drag to reorder">
                      <GripVertical size={14} />
                    </div>
                  </div>
                )}
              </div>

              {/* Section Items */}
              {!collapsed && isExpanded && (
                <div className={styles.sectionItems}>
                  {section.items.map((item) => (
                    <NavLink
                      key={item.id}
                      to={item.path}
                      className={({ isActive }) =>
                        `${styles.navItem} ${isActive ? styles.active : ''}`
                      }
                      title={item.label}
                    >
                      {item.icon && <item.icon size={16} className={styles.itemIcon} />}
                      <span className={styles.itemLabel}>{item.label}</span>
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className={styles.footer}>
          {userRoles.includes('provider_admin') && (
            <NavLink 
              to="/provider-admin" 
              className={styles.footerBtn}
              style={{ 
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: 'white',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                marginBottom: '8px',
                fontWeight: 600
              }}
            >
              🔐 Provider Admin
            </NavLink>
          )}
          {userRoles.includes('tenant_admin') && (
            <NavLink 
              to="/admin" 
              className={styles.footerBtn}
              style={{ 
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: 'white',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                marginBottom: '8px',
                fontWeight: 600
              }}
            >
              🛠️ Tenant Admin
            </NavLink>
          )}
          <button className={styles.footerBtn} onClick={resetOrder}>
            Reset Order
          </button>
        </div>
      )}

      {/* Resize Handle */}
      {!collapsed && (
        <div
          className={styles.resizeHandle}
          onMouseDown={handleMouseDown}
        />
      )}
    </aside>
  );
}