import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Store from '../../data/store';
import { COUNTRIES, ORDER_STATUSES } from '../../data/constants';
import { formatCurrency, formatDate, timeAgo, getCountry, truncate, getInitials } from '../../utils/helpers';
import './Admin.css';

// SVG Bar Chart — orders per day for last 7 days
function BarChart({ data }) {
  const maxVal = Math.max(...data.map(d => d.count), 1);
  const barWidth = 36;
  const gap = 14;
  const chartHeight = 160;
  const chartWidth = data.length * (barWidth + gap) - gap;
  const paddingBottom = 28;
  const paddingTop = 10;
  const drawHeight = chartHeight - paddingBottom - paddingTop;

  return (
    <svg
      viewBox={`0 0 ${chartWidth + 20} ${chartHeight + 10}`}
      style={{ width: '100%', height: 'auto', maxHeight: 220, overflow: 'visible' }}
    >
      <defs>
        <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#667eea" />
          <stop offset="100%" stopColor="#764ba2" />
        </linearGradient>
        <linearGradient id="barGradHover" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7b91f0" />
          <stop offset="100%" stopColor="#9a6dd0" />
        </linearGradient>
      </defs>
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((frac, i) => {
        const y = paddingTop + drawHeight * (1 - frac);
        return (
          <line
            key={i}
            x1={0} y1={y}
            x2={chartWidth + 20} y2={y}
            stroke="rgba(255,255,255,0.05)"
            strokeDasharray="4 4"
          />
        );
      })}
      {data.map((d, i) => {
        const barH = maxVal > 0 ? (d.count / maxVal) * drawHeight : 0;
        const x = 10 + i * (barWidth + gap);
        const y = paddingTop + drawHeight - barH;
        return (
          <g key={i}>
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={Math.max(barH, 2)}
              rx={6}
              fill="url(#barGrad)"
              opacity={0.9}
              style={{ transition: 'all 0.3s ease' }}
            >
              <animate attributeName="height" from="0" to={Math.max(barH, 2)} dur="0.6s" fill="freeze" />
              <animate attributeName="y" from={paddingTop + drawHeight} to={y} dur="0.6s" fill="freeze" />
            </rect>
            {/* Glow effect */}
            {d.count > 0 && (
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(barH, 2)}
                rx={6}
                fill="url(#barGrad)"
                opacity={0.15}
                filter="blur(8px)"
              />
            )}
            {/* Count label */}
            <text
              x={x + barWidth / 2}
              y={y - 6}
              textAnchor="middle"
              fill="#a0a3bd"
              fontSize="11"
              fontWeight="600"
              fontFamily="Inter, sans-serif"
            >
              {d.count}
            </text>
            {/* Day label */}
            <text
              x={x + barWidth / 2}
              y={chartHeight}
              textAnchor="middle"
              fill="#6b6f8d"
              fontSize="11"
              fontFamily="Inter, sans-serif"
            >
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// SVG Donut Chart — order distribution by country
function DonutChart({ data }) {
  const total = data.reduce((s, d) => s + d.count, 0);
  if (total === 0) {
    return (
      <div className="admin-empty" style={{ padding: 'var(--space-8)' }}>
        <div className="empty-icon">📊</div>
        <div className="empty-text">Belum ada data pesanan</div>
      </div>
    );
  }

  const size = 160;
  const cx = size / 2;
  const cy = size / 2;
  const outerR = 68;
  const innerR = 42;
  let currentAngle = -90;

  const arcs = data.filter(d => d.count > 0).map(d => {
    const angle = (d.count / total) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1o = cx + outerR * Math.cos(startRad);
    const y1o = cy + outerR * Math.sin(startRad);
    const x2o = cx + outerR * Math.cos(endRad);
    const y2o = cy + outerR * Math.sin(endRad);
    const x1i = cx + innerR * Math.cos(endRad);
    const y1i = cy + innerR * Math.sin(endRad);
    const x2i = cx + innerR * Math.cos(startRad);
    const y2i = cy + innerR * Math.sin(startRad);

    const largeArc = angle > 180 ? 1 : 0;

    const path = [
      `M ${x1o} ${y1o}`,
      `A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2o} ${y2o}`,
      `L ${x1i} ${y1i}`,
      `A ${innerR} ${innerR} 0 ${largeArc} 0 ${x2i} ${y2i}`,
      'Z'
    ].join(' ');

    return { ...d, path };
  });

  return (
    <div className="donut-chart-wrapper">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {arcs.map((arc, i) => (
          <path
            key={i}
            d={arc.path}
            fill={arc.color}
            opacity={0.85}
            stroke="rgba(10, 14, 39, 0.5)"
            strokeWidth="2"
            style={{ transition: 'opacity 0.2s' }}
            onMouseEnter={e => { e.target.style.opacity = '1'; e.target.style.filter = 'brightness(1.2)'; }}
            onMouseLeave={e => { e.target.style.opacity = '0.85'; e.target.style.filter = 'none'; }}
          >
            <title>{arc.name}: {arc.count} pesanan ({Math.round((arc.count / total) * 100)}%)</title>
          </path>
        ))}
        {/* Center text */}
        <text x={cx} y={cy - 6} textAnchor="middle" fill="#f0f0f5" fontSize="22" fontWeight="800" fontFamily="Plus Jakarta Sans, sans-serif">
          {total}
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle" fill="#6b6f8d" fontSize="10" fontFamily="Inter, sans-serif">
          Total
        </text>
      </svg>
      <div className="donut-legend">
        {data.filter(d => d.count > 0).map((d, i) => (
          <div className="donut-legend-item" key={i}>
            <span className="donut-legend-color" style={{ background: d.color }} />
            <span>{d.flag} {d.name}</span>
            <span className="donut-legend-count">{d.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    setOrders(Store.getOrders());
    setUsers(Store.getUsers());
  }, []);

  // Stats calculations
  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const ordersToday = orders.filter(o => {
      const d = new Date(o.createdAt);
      d.setHours(0, 0, 0, 0);
      return d.getTime() === today.getTime();
    }).length;

    const needAction = orders.filter(o =>
      o.status === 'pending_quote' || o.status === 'awaiting_payment'
    ).length;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const revenueThisMonth = orders
      .filter(o => o.status === 'completed' && new Date(o.updatedAt) >= startOfMonth)
      .reduce((sum, o) => {
        const cost = o.finalCost || o.estimatedCost;
        return sum + (cost?.total || 0);
      }, 0);

    const totalUsers = users.filter(u => u.role !== 'admin').length;

    return { ordersToday, needAction, revenueThisMonth, totalUsers };
  }, [orders, users]);

  // Bar chart data — last 7 days
  const barData = useMemo(() => {
    const days = [];
    const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const count = orders.filter(o => {
        const od = new Date(o.createdAt);
        od.setHours(0, 0, 0, 0);
        return od.getTime() === d.getTime();
      }).length;
      days.push({
        label: dayNames[d.getDay()],
        count,
        date: d,
      });
    }
    return days;
  }, [orders]);

  // Donut chart data — orders by country
  const donutData = useMemo(() => {
    return COUNTRIES.map(c => {
      const count = orders.filter(o => o.country === c.id).length;
      return {
        name: c.name,
        flag: c.flag,
        count,
        color: c.color,
      };
    });
  }, [orders]);

  // Pending orders
  const pendingOrders = useMemo(() => {
    return orders.filter(o => o.status === 'pending_quote');
  }, [orders]);

  // Recent activity — all statusHistory entries sorted by date
  const recentActivity = useMemo(() => {
    const allEvents = [];
    orders.forEach(order => {
      if (order.statusHistory) {
        order.statusHistory.forEach(sh => {
          const statusDef = ORDER_STATUSES.find(s => s.id === sh.status);
          allEvents.push({
            orderId: order.id,
            status: sh.status,
            statusLabel: statusDef?.label || sh.status,
            statusIcon: statusDef?.icon || '📋',
            statusColor: statusDef?.color || 'var(--text-tertiary)',
            note: sh.note,
            date: sh.date,
          });
        });
      }
    });
    allEvents.sort((a, b) => new Date(b.date) - new Date(a.date));
    return allEvents.slice(0, 8);
  }, [orders]);

  const getUserName = (userId) => {
    const user = users.find(u => u.id === userId);
    return user?.name || 'Unknown';
  };

  return (
    <div className="animate-fade-in-up">
      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p className="header-subtitle">Selamat datang kembali! Berikut ringkasan toko Anda.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card animate-fade-in-up delay-1">
          <div className="stat-icon">📦</div>
          <div className="stat-value">{stats.ordersToday}</div>
          <div className="stat-label">Pesanan Hari Ini</div>
        </div>
        <div className="admin-stat-card animate-fade-in-up delay-2">
          <div className="stat-icon">⏳</div>
          <div className="stat-value">{stats.needAction}</div>
          <div className="stat-label">Perlu Tindakan</div>
        </div>
        <div className="admin-stat-card animate-fade-in-up delay-3">
          <div className="stat-icon">💰</div>
          <div className="stat-value">{formatCurrency(stats.revenueThisMonth)}</div>
          <div className="stat-label">Revenue Bulan Ini</div>
        </div>
        <div className="admin-stat-card animate-fade-in-up delay-4">
          <div className="stat-icon">👥</div>
          <div className="stat-value">{stats.totalUsers}</div>
          <div className="stat-label">Total Pengguna</div>
        </div>
      </div>

      {/* SVG Charts */}
      <div className="admin-charts-grid animate-fade-in-up delay-3">
        <div className="admin-content-card">
          <div className="admin-content-card-header">
            <h3>📊 Pesanan 7 Hari Terakhir</h3>
          </div>
          <div className="chart-container">
            <BarChart data={barData} />
          </div>
        </div>
        <div className="admin-content-card">
          <div className="admin-content-card-header">
            <h3>🌍 Distribusi Negara</h3>
          </div>
          <div className="chart-container">
            <DonutChart data={donutData} />
          </div>
        </div>
      </div>

      {/* Bottom 2-col */}
      <div className="admin-two-col">
        {/* Pending Orders */}
        <div className="admin-content-card animate-fade-in-up delay-4">
          <div className="admin-content-card-header">
            <h3>📝 Pesanan Perlu Tindakan</h3>
            {pendingOrders.length > 0 && (
              <span className="badge badge-pending">{pendingOrders.length}</span>
            )}
          </div>
          <div className="admin-content-card-body no-padding">
            {pendingOrders.length === 0 ? (
              <div className="admin-empty">
                <div className="empty-icon">✅</div>
                <div className="empty-text">Semua pesanan sudah diproses!</div>
              </div>
            ) : (
              <div className="admin-table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Customer</th>
                      <th>Item</th>
                      <th>Tanggal</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingOrders.map(order => (
                      <tr key={order.id}>
                        <td>
                          <span className="table-order-id">{order.id}</span>
                        </td>
                        <td>
                          <div className="table-customer">
                            <div className="table-customer-avatar">
                              {getInitials(getUserName(order.userId))}
                            </div>
                            <span className="table-customer-name">{getUserName(order.userId)}</span>
                          </div>
                        </td>
                        <td>
                          <div className="table-items-summary">
                            <div className="item-name">{truncate(order.items[0]?.name, 28)}</div>
                            {order.items.length > 1 && (
                              <div className="item-count">+{order.items.length - 1} item lainnya</div>
                            )}
                          </div>
                        </td>
                        <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                          {timeAgo(order.createdAt)}
                        </td>
                        <td>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => navigate('/admin/orders')}
                          >
                            Proses
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="admin-content-card animate-fade-in-up delay-5">
          <div className="admin-content-card-header">
            <h3>🕐 Aktivitas Terbaru</h3>
          </div>
          <div className="admin-content-card-body no-padding">
            {recentActivity.length === 0 ? (
              <div className="admin-empty">
                <div className="empty-icon">📋</div>
                <div className="empty-text">Belum ada aktivitas</div>
              </div>
            ) : (
              <div className="admin-timeline">
                {recentActivity.map((event, i) => (
                  <div className="admin-timeline-item" key={i}>
                    <div
                      className="admin-timeline-dot"
                      style={{ borderColor: event.statusColor }}
                    />
                    <div className="admin-timeline-body">
                      <div className="timeline-desc">
                        <strong>{event.orderId}</strong> — {event.statusIcon} {event.statusLabel}
                        {event.note && <span style={{ color: 'var(--text-tertiary)' }}> · {truncate(event.note, 40)}</span>}
                      </div>
                      <div className="timeline-time">{timeAgo(event.date)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
