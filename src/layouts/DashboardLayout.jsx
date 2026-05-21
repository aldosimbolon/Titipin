import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { NAV_ITEMS_CUSTOMER, NAV_ITEMS_ADMIN } from '../data/constants';
import { getInitials } from '../utils/helpers';
import Store from '../data/store';
import './DashboardLayout.css';

export default function DashboardLayout({ children, isAdmin = false }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const navItems = isAdmin ? NAV_ITEMS_ADMIN : NAV_ITEMS_CUSTOMER;
  const notifications = Store.getNotifications(user?.id) || [];
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleNotifClick = (notif) => {
    Store.markNotificationRead(notif.id);
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
          <div className="sidebar-logo" onClick={() => navigate('/')}>
            <div className="logo-icon">
              <span>🛍️</span>
            </div>
            {sidebarOpen && <span className="logo-text">TitipIn</span>}
          </div>
          <button
            className="sidebar-toggle desktop-only"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? '◀' : '▶'}
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
              <span className="sidebar-link-icon">{item.icon}</span>
              {sidebarOpen && <span className="sidebar-link-label">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-link logout-btn" onClick={handleLogout}>
            <span className="sidebar-link-icon">🚪</span>
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
            ☰
          </button>

          <div className="navbar-spacer" />

          {/* Notifications */}
          <div className="navbar-notif-wrapper">
            <button
              className="navbar-icon-btn"
              onClick={() => { setShowNotif(!showNotif); setShowUserMenu(false); }}
            >
              🔔
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
                          {n.type === 'warning' ? '⚠️' : n.type === 'error' ? '❌' : 'ℹ️'}
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
                  👤 Profil Saya
                </button>
                <button className="dropdown-action" onClick={() => { navigate('/orders'); setShowUserMenu(false); }}>
                  📋 Pesanan Saya
                </button>
                <div className="dropdown-divider" />
                <button className="dropdown-action danger" onClick={handleLogout}>
                  🚪 Keluar
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
