import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Store from '../../data/store';
import { COUNTRIES, ORDER_STATUSES } from '../../data/constants';
import { formatCurrency, formatDate, getCountry, truncate } from '../../utils/helpers';
import './Customer.css';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (user) {
      setOrders(Store.getOrdersByUserId(user.id));
    }
  }, [user]);

  const stats = useMemo(() => {
    const total = orders.length;
    const active = orders.filter(o =>
      !['completed', 'cancelled'].includes(o.status)
    ).length;
    const completed = orders.filter(o => o.status === 'completed').length;
    const totalSpent = orders
      .filter(o => o.status === 'completed')
      .reduce((sum, o) => sum + (o.finalCost?.total || o.estimatedCost?.total || 0), 0);

    return { total, active, completed, totalSpent };
  }, [orders]);

  const recentOrders = useMemo(() => {
    return [...orders]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);
  }, [orders]);

  const getStatusBadge = (statusId) => {
    const status = ORDER_STATUSES.find(s => s.id === statusId);
    if (!status) return null;
    return (
      <span className={`badge ${status.badgeClass}`}>
        {status.icon} {status.label}
      </span>
    );
  };

  const statCards = [
    {
      icon: '📦',
      label: 'Total Pesanan',
      value: stats.total,
      bg: 'rgba(102, 126, 234, 0.15)',
      sub: 'Semua pesanan'
    },
    {
      icon: '🔄',
      label: 'Pesanan Aktif',
      value: stats.active,
      bg: 'rgba(255, 170, 0, 0.15)',
      sub: 'Sedang diproses'
    },
    {
      icon: '✅',
      label: 'Pesanan Selesai',
      value: stats.completed,
      bg: 'rgba(0, 214, 143, 0.15)',
      sub: 'Berhasil diterima'
    },
    {
      icon: '💰',
      label: 'Total Belanja',
      value: formatCurrency(stats.totalSpent),
      bg: 'rgba(246, 194, 62, 0.15)',
      sub: 'Pesanan selesai'
    },
  ];

  return (
    <div className="animate-fade-in-up">
      {/* Page Header */}
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Selamat datang, {user?.name}! 👋</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {statCards.map((card, i) => (
          <div
            key={card.label}
            className={`stat-card glass-card animate-fade-in-up delay-${i + 1}`}
          >
            <div className="stat-card-icon" style={{ background: card.bg }}>
              {card.icon}
            </div>
            <div className="stat-card-body">
              <div className="stat-card-label">{card.label}</div>
              <div className="stat-card-value">{card.value}</div>
              <div className="stat-card-sub">{card.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="content-card animate-fade-in-up delay-5">
        <div className="content-card-header">
          <h3>📋 Pesanan Terbaru</h3>
          <Link to="/orders" className="btn btn-sm btn-outline">
            Lihat Semua →
          </Link>
        </div>
        <div className="content-card-body">
          {recentOrders.length === 0 ? (
            <div className="empty-state" style={{ padding: 'var(--space-8)' }}>
              <span className="empty-state-icon">📭</span>
              <h3>Belum ada pesanan</h3>
              <p>Mulai belanja dari luar negeri sekarang!</p>
              <Link to="/order/create" className="btn btn-primary">
                Buat Pesanan Pertama
              </Link>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID Pesanan</th>
                    <th>Produk</th>
                    <th>Negara</th>
                    <th>Status</th>
                    <th>Tanggal</th>
                    <th style={{ textAlign: 'right' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map(order => {
                    const country = getCountry(order.country);
                    const firstItem = order.items?.[0];
                    return (
                      <tr
                        key={order.id}
                        onClick={() => navigate(`/order/${order.id}`)}
                        style={{ cursor: 'pointer' }}
                      >
                        <td>
                          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 'var(--text-sm)' }}>
                            {order.id}
                          </span>
                        </td>
                        <td>{truncate(firstItem?.name || 'Produk', 30)}</td>
                        <td>{country?.flag} {country?.name}</td>
                        <td>{getStatusBadge(order.status)}</td>
                        <td style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)' }}>
                          {formatDate(order.createdAt)}
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {formatCurrency(order.estimatedCost?.total || 0)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <Link to="/order/create" className="quick-action-card glass-card animate-fade-in-up delay-1">
          <div className="quick-action-icon">🛍️</div>
          <div className="quick-action-title">Buat Pesanan Baru</div>
          <div className="quick-action-desc">Pesan barang dari luar negeri</div>
        </Link>

        <Link to="/orders" className="quick-action-card glass-card animate-fade-in-up delay-2">
          <div className="quick-action-icon" style={{ background: 'linear-gradient(135deg, #00d4ff, #0095ff)' }}>📍</div>
          <div className="quick-action-title">Lacak Pesanan</div>
          <div className="quick-action-desc">Pantau status pengiriman</div>
        </Link>

        <a
          href="https://wa.me/6281234567890?text=Halo%20TitipIn,%20saya%20butuh%20bantuan"
          target="_blank"
          rel="noopener noreferrer"
          className="quick-action-card glass-card animate-fade-in-up delay-3"
        >
          <div className="quick-action-icon" style={{ background: 'linear-gradient(135deg, #00d68f, #00b377)' }}>💬</div>
          <div className="quick-action-title">Hubungi CS</div>
          <div className="quick-action-desc">Chat langsung via WhatsApp</div>
        </a>
      </div>
    </div>
  );
}
