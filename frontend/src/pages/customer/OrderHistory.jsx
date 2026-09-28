import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Store from '../../data/store';
import { ORDER_STATUSES } from '../../data/constants';
import { formatCurrency, formatDate, getCountry, truncate } from '../../utils/helpers';
import './Customer.css';

const FILTER_TABS = [
  { id: 'all', label: 'Semua' },
  { id: 'waiting', label: 'Menunggu' },
  { id: 'processing', label: 'Diproses' },
  { id: 'shipping', label: 'Dikirim' },
  { id: 'done', label: 'Selesai' },
];

const filterMap = {
  all: () => true,
  waiting: (o) => ['pending_quote', 'awaiting_payment'].includes(o.status),
  processing: (o) => ['purchased', 'at_warehouse', 'customs'].includes(o.status),
  shipping: (o) => o.status === 'shipped',
  done: (o) => ['completed', 'cancelled'].includes(o.status),
};

export default function OrderHistory() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (user) {
      Store.getOrdersByUserId(user.id).then(setOrders).catch(() => {});
    }
  }, [user]);

  const filtered = useMemo(() => {
    let result = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    result = result.filter(filterMap[activeTab]);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(o =>
        o.id.toLowerCase().includes(q) ||
        o.items.some(it => it.name.toLowerCase().includes(q))
      );
    }
    return result;
  }, [orders, activeTab, search]);

  const getStatus = (statusId) => ORDER_STATUSES.find(s => s.id === statusId);

  const tabCounts = useMemo(() => {
    const counts = {};
    FILTER_TABS.forEach(t => {
      counts[t.id] = orders.filter(filterMap[t.id]).length;
    });
    return counts;
  }, [orders]);

  return (
    <div className="animate-fade-in-up">
      <div className="page-header">
        <div className="page-header-actions">
          <div>
            <h1>Riwayat Pesanan</h1>
            <p>{orders.length} total pesanan</p>
          </div>
          <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => navigate('/order/create')}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span> Buat Pesanan Baru
          </button>
        </div>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 'var(--space-5)' }}>
        <input
          type="text"
          className="form-input"
          placeholder="Cari pesanan (ID atau nama produk)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: 400 }}
        />
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom: 'var(--space-6)' }}>
        {FILTER_TABS.map(tab => (
          <button
            key={tab.id}
            className={`tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label} ({tabCounts[tab.id]})
          </button>
        ))}
      </div>

      {/* Order List */}
      {filtered.length === 0 ? (
        <div className="empty-state-card glass-card">
          <span className="empty-state-icon material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--text-tertiary)' }}>inbox</span>
          <h3>Tidak ada pesanan</h3>
          <p>{search ? 'Tidak ditemukan pesanan yang cocok' : 'Belum ada pesanan pada kategori ini'}</p>
          {!search && activeTab === 'all' && (
            <button className="btn btn-primary" onClick={() => navigate('/order/create')}>
              Buat Pesanan Pertama
            </button>
          )}
        </div>
      ) : (
        <div className="order-list">
          {filtered.map(order => {
            const country = getCountry(order.country);
            const status = getStatus(order.status);
            const firstItem = order.items?.[0];
            const total = order.finalCost?.total || order.estimatedCost?.total || 0;

            return (
              <div
                key={order.id}
                className="order-list-card glass-card"
                onClick={() => navigate(`/order/${order.id}`)}
              >
                <div className="order-list-top">
                  <div className="order-list-id">{order.id}</div>
                  <span className={`badge ${status?.badgeClass}`}>
                    {status?.icon} {status?.label}
                  </span>
                </div>

                <div className="order-list-body">
                  <div className="order-list-info">
                    <div className="order-list-country">
                      <span>{country?.flag}</span> {country?.name}
                    </div>
                    <div className="order-list-product">
                      {truncate(firstItem?.name || 'Produk', 40)}
                      {order.items.length > 1 && (
                        <span className="order-list-more">+{order.items.length - 1} item lainnya</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="order-list-bottom">
                  <div className="order-list-date">{formatDate(order.createdAt)}</div>
                  <div className="order-list-total">{formatCurrency(total)}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
