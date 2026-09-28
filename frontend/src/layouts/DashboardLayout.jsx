import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { NAV_ITEMS_CUSTOMER, NAV_ITEMS_ADMIN } from '../data/constants';
import { getInitials } from '../utils/helpers';
import Store from '../data/store';
import './DashboardLayout.css';

export default function DashboardLayout({ children, isAdmin: propIsAdmin }) {
  const { user, logout, isAdmin: authIsAdmin } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const isAdmin = propIsAdmin !== undefined ? propIsAdmin : authIsAdmin;
  const navItems = isAdmin ? NAV_ITEMS_ADMIN : NAV_ITEMS_CUSTOMER;
  const location = useLocation();
  const [notifications, setNotifications] = useState([]);

  // Ambil notifikasi dari server: saat pindah halaman, saat dropdown dibuka, dan tiap 30 detik
  useEffect(() => {
    if (!user) return undefined;
    let active = true;
    const load = () => Store.getNotifications()
      .then(n => { if (active) setNotifications(n); })
      .catch(() => {});
    load();
    const timer = setInterval(load, 30000);
    return () => { active = false; clearInterval(timer); };
  }, [user?.id, showNotif, location.pathname]);
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleNotifClick = (notif) => {
    Store.markNotificationRead(notif.id).catch(() => {});
    setNotifications(prev => prev.map(n => (n.id === notif.id ? { ...n, read: true } : n)));
    setShowNotif(false);
  };

  return (
    <div className={`dashboard-layout ${sidebarOpen ? '' : 'sidebar-collapsed'}`}>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo" onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img src="/logo.png" alt="TitipIn Logo" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
            {sidebarOpen && <span className="logo-text">TitipIn</span>}
          </div>
          <button
            className="sidebar-toggle desktop-only"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
              {sidebarOpen ? 'chevron_left' : 'chevron_right'}
            </span>
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(item => (
            <NavLink
              key={item.id}
              to={item.path}
              end={item.path === '/admin' || item.path === '/dashboard'}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
              onClick={() => setMobileOpen(false)}
            >
              <span className="sidebar-link-icon material-symbols-outlined">{item.icon}</span>
              {sidebarOpen && <span className="sidebar-link-label">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-link logout-btn" onClick={handleLogout}>
            <span className="sidebar-link-icon material-symbols-outlined">logout</span>
            {sidebarOpen && <span className="sidebar-link-label">Keluar</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="dashboard-main">
        {/* Top Navbar */}
        <header className="dashboard-navbar">
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <span className="material-symbols-outlined">menu</span>
          </button>

          <div className="navbar-spacer" />

          {/* Notifications */}
          <div className="navbar-notif-wrapper">
            <button
              className="navbar-icon-btn"
              onClick={() => { setShowNotif(!showNotif); setShowUserMenu(false); }}
            >
              <span className="material-symbols-outlined">notifications</span>
              {unreadCount > 0 && (
                <span className="notif-badge">{unreadCount}</span>
              )}
            </button>

            {showNotif && (
              <div className="dropdown-menu notif-dropdown">
                <div className="dropdown-header">
                  <h4>Notifikasi</h4>
                  {unreadCount > 0 && (
                    <span className="badge badge-awaiting">{unreadCount} baru</span>
                  )}
                </div>
                {notifications.length === 0 ? (
                  <div className="dropdown-empty">Tidak ada notifikasi</div>
                ) : (
                  <div className="dropdown-list">
                    {notifications.slice(0, 5).map(n => (
                      <div
                        key={n.id}
                        className={`dropdown-item ${n.read ? '' : 'unread'}`}
                        onClick={() => handleNotifClick(n)}
                      >
                        <div className="dropdown-item-icon">
                          {n.type === 'warning' ? (
                            <span className="material-symbols-outlined" style={{ color: 'var(--warning)', fontSize: '18px' }}>warning</span>
                          ) : n.type === 'error' ? (
                            <span className="material-symbols-outlined" style={{ color: 'var(--error)', fontSize: '18px' }}>error</span>
                          ) : (
                            <span className="material-symbols-outlined" style={{ color: 'var(--info)', fontSize: '18px' }}>info</span>
                          )}
                        </div>
                        <div className="dropdown-item-body">
                          <div className="dropdown-item-title">{n.title}</div>
                          <div className="dropdown-item-desc">{n.message}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="navbar-user-wrapper">
            <button
              className="navbar-user-btn"
              onClick={() => { setShowUserMenu(!showUserMenu); setShowNotif(false); }}
            >
              <div className="user-avatar-sm">
                {getInitials(user?.name)}
              </div>
              {user && (
                <div className="user-info-brief">
                  <span className="user-name-brief">{user.name}</span>
                  <span className="user-role-brief">{isAdmin ? 'Admin' : 'Customer'}</span>
                </div>
              )}
            </button>

            {showUserMenu && (
              <div className="dropdown-menu user-dropdown">
                <div className="dropdown-user-header">
                  <div className="user-avatar-md">{getInitials(user?.name)}</div>
                  <div>
                    <div className="dropdown-user-name">{user?.name}</div>
                    <div className="dropdown-user-email">{user?.email}</div>
                  </div>
                </div>
                <div className="dropdown-divider" />
                <button className="dropdown-action" onClick={() => { navigate('/profile'); setShowUserMenu(false); }}>
                  <span className="material-symbols-outlined" style={{ marginRight: '8px', fontSize: '18px' }}>person</span> Profil Saya
                </button>
                <button className="dropdown-action" onClick={() => { navigate('/orders'); setShowUserMenu(false); }}>
                  <span className="material-symbols-outlined" style={{ marginRight: '8px', fontSize: '18px' }}>package_2</span> Pesanan Saya
                </button>
                <div className="dropdown-divider" />
                <button className="dropdown-action danger" onClick={handleLogout}>
                  <span className="material-symbols-outlined" style={{ marginRight: '8px', fontSize: '18px', color: 'var(--error)' }}>logout</span> Keluar
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="dashboard-content" onClick={() => { setShowNotif(false); setShowUserMenu(false); }}>
          {children}
        </main>
      </div>
    </div>
  );
}

