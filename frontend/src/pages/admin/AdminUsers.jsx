import { useState, useEffect, useMemo } from 'react';
import { useToast } from '../../context/ToastContext';
import Store from '../../data/store';
import { formatCurrency, formatDate, getInitials } from '../../utils/helpers';
import './Admin.css';

export default function AdminUsers() {
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [detailUser, setDetailUser] = useState(null);

  const reload = async () => {
    try {
      const [u, o] = await Promise.all([Store.getUsers(), Store.getOrders()]);
      setUsers(u);
      setOrders(o);
    } catch (e) {
      toast.error('Gagal memuat data', e.message);
    }
  };

  useEffect(() => { reload(); }, []);

  const customers = useMemo(() => {
    let result = users.filter(u => u.role !== 'admin');
    if (filter === 'active') result = result.filter(u => u.isActive);
    if (filter === 'inactive') result = result.filter(u => !u.isActive);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(u =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.phone?.includes(q)
      );
    }
    return result;
  }, [users, search, filter]);

  const getUserStats = (userId) => {
    const userOrders = orders.filter(o => o.userId === userId);
    const totalOrders = userOrders.length;
    const totalSpent = userOrders
      .filter(o => o.status === 'completed')
      .reduce((sum, o) => sum + (o.finalCost?.total || o.estimatedCost?.total || 0), 0);
    return { totalOrders, totalSpent };
  };

  const toggleActive = async (userId) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    try {
      await Store.setUserActive(userId, !user.isActive);
      await reload();
      toast.success('Berhasil', `User ${user.isActive ? 'dinonaktifkan' : 'diaktifkan'}`);
    } catch (e) {
      toast.error('Gagal', e.message);
    }
  };

  const openDetail = (user) => {
    const userOrders = orders.filter(o => o.userId === user.id)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    setDetailUser({ ...user, orders: userOrders });
  };

  return (
    <div className="animate-fade-in-up">
      <div className="page-header">
        <div className="page-header-actions">
          <div>
            <h1>Kelola Pengguna</h1>
            <p>{customers.length} pengguna terdaftar</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="admin-filters">
        <input
          type="text" className="form-input"
          placeholder="🔍 Cari nama, email, atau telepon..."
          value={search} onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: 350 }}
        />
        <div className="tabs" style={{ display: 'inline-flex' }}>
          {[
            { id: 'all', label: 'Semua' },
            { id: 'active', label: 'Aktif' },
            { id: 'inactive', label: 'Nonaktif' },
          ].map(t => (
            <button key={t.id} className={`tab ${filter === t.id ? 'active' : ''}`} onClick={() => setFilter(t.id)}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="admin-content-card">
        <div className="admin-table-wrapper" style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Nama</th>
                <th>Email</th>
                <th>Telepon</th>
                <th>Pesanan</th>
                <th>Total Belanja</th>
                <th>Status</th>
                <th>Bergabung</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(user => {
                const stats = getUserStats(user.id);
                return (
                  <tr key={user.id}>
                    <td>
                      <div className="table-customer">
                        <div className="table-customer-avatar">{getInitials(user.name)}</div>
                        <span className="table-customer-name">{user.name}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{user.email}</td>
                    <td style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{user.phone || '-'}</td>
                    <td style={{ fontWeight: 600 }}>{stats.totalOrders}</td>
                    <td style={{ fontWeight: 600 }}>{formatCurrency(stats.totalSpent)}</td>
                    <td>
                      <span className={`badge ${user.isActive ? 'badge-completed' : 'badge-cancelled'}`}>
                        {user.isActive ? '✅ Aktif' : '❌ Nonaktif'}
                      </span>
                    </td>
                    <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                      {formatDate(user.createdAt)}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
                        <button className="btn btn-sm btn-ghost" onClick={() => openDetail(user)}>👁</button>
                        <button
                          className={`btn btn-sm ${user.isActive ? 'btn-ghost' : 'btn-success'}`}
                          onClick={() => toggleActive(user.id)}
                          style={user.isActive ? { color: 'var(--error)' } : {}}
                        >
                          {user.isActive ? '🚫' : '✅'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {customers.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-tertiary)' }}>
                    Tidak ada pengguna ditemukan
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {detailUser && (
        <>
          <div className="modal-backdrop" onClick={() => setDetailUser(null)} />
          <div className="modal-container">
            <div className="modal-content" style={{ maxWidth: 600 }}>
              <div className="modal-header">
                <h3>Detail Pengguna</h3>
                <button className="modal-close" onClick={() => setDetailUser(null)}>×</button>
              </div>

              {/* Profile Info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
                <div className="table-customer-avatar" style={{ width: 56, height: 56, fontSize: 'var(--text-lg)' }}>
                  {getInitials(detailUser.name)}
                </div>
                <div>
                  <h4>{detailUser.name}</h4>
                  <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{detailUser.email}</div>
                  <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>{detailUser.phone}</div>
                </div>
                <span className={`badge ${detailUser.isActive ? 'badge-completed' : 'badge-cancelled'}`} style={{ marginLeft: 'auto' }}>
                  {detailUser.isActive ? 'Aktif' : 'Nonaktif'}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)', marginBottom: 'var(--space-5)' }}>
                <div style={{ padding: 'var(--space-4)', background: 'var(--glass-bg)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                  <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800 }}>{getUserStats(detailUser.id).totalOrders}</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>Total Pesanan</div>
                </div>
                <div style={{ padding: 'var(--space-4)', background: 'var(--glass-bg)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                  <div style={{ fontSize: 'var(--text-lg)', fontWeight: 800 }}>{formatCurrency(getUserStats(detailUser.id).totalSpent)}</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>Total Belanja</div>
                </div>
              </div>

              {detailUser.npwp && (
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-3)' }}>
                  NPWP: <strong>{detailUser.npwp}</strong>
                </div>
              )}

              {detailUser.addresses?.length > 0 && (
                <>
                  <h4 style={{ marginBottom: 'var(--space-2)', marginTop: 'var(--space-4)' }}>Alamat</h4>
                  {detailUser.addresses.map(addr => (
                    <div key={addr.id} style={{ padding: 'var(--space-3)', background: 'var(--glass-bg)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-2)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                      <strong style={{ color: 'var(--text-primary)' }}>{addr.label}</strong>
                      {addr.isDefault && <span className="badge badge-completed" style={{ marginLeft: 'var(--space-2)', fontSize: '10px' }}>Utama</span>}
                      <br />{addr.recipient} · {addr.phone}<br />{addr.address}, {addr.city}, {addr.province} {addr.postalCode}
                    </div>
                  ))}
                </>
              )}

              {detailUser.orders?.length > 0 && (
                <>
                  <h4 style={{ marginBottom: 'var(--space-2)', marginTop: 'var(--space-4)' }}>Riwayat Pesanan</h4>
                  {detailUser.orders.slice(0, 5).map(order => (
                    <div key={order.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-3)', borderBottom: '1px solid var(--glass-border)', fontSize: 'var(--text-sm)' }}>
                      <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}>{order.id}</span>
                      <span style={{ color: 'var(--text-tertiary)' }}>{formatDate(order.createdAt)}</span>
                      <span style={{ fontWeight: 600 }}>{formatCurrency(order.finalCost?.total || order.estimatedCost?.total || 0)}</span>
                    </div>
                  ))}
                </>
              )}

              <div style={{ marginTop: 'var(--space-5)', display: 'flex', gap: 'var(--space-3)' }}>
                <button
                  className={`btn ${detailUser.isActive ? 'btn-danger' : 'btn-success'}`}
                  onClick={() => { toggleActive(detailUser.id); setDetailUser(null); }}
                >
                  {detailUser.isActive ? '🚫 Nonaktifkan User' : '✅ Aktifkan User'}
                </button>
                <button className="btn btn-ghost" onClick={() => setDetailUser(null)}>Tutup</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
