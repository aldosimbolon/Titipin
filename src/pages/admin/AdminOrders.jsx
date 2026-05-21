import { useState, useEffect, useMemo } from 'react';
import { useToast } from '../../context/ToastContext';
import Store from '../../data/store';
import { COUNTRIES, ORDER_STATUSES } from '../../data/constants';
import { formatCurrency, formatDate, formatDateTime, timeAgo, getCountry, truncate, getInitials, generateId } from '../../utils/helpers';
import './Admin.css';

export default function AdminOrders() {
  const toast = useToast();
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [countryFilter, setCountryFilter] = useState('all');
  const [selected, setSelected] = useState(new Set());
  const [detailOrder, setDetailOrder] = useState(null);
  const [pricingOrder, setPricingOrder] = useState(null);
  const [page, setPage] = useState(1);
  const perPage = 10;

  // Pricing modal state
  const [pricingData, setPricingData] = useState({
    itemTotal: '', serviceFee: '', shippingIntl: '',
    importDuty: '', ppn: '', pph: '',
  });

  const reload = () => {
    setOrders(Store.getOrders());
    setUsers(Store.getUsers());
  };

  useEffect(() => { reload(); }, []);

  const getUserName = (userId) => users.find(u => u.id === userId)?.name || 'Unknown';

  const filtered = useMemo(() => {
    let result = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (statusFilter !== 'all') result = result.filter(o => o.status === statusFilter);
    if (countryFilter !== 'all') result = result.filter(o => o.country === countryFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(o =>
        o.id.toLowerCase().includes(q) ||
        getUserName(o.userId).toLowerCase().includes(q) ||
        o.items.some(it => it.name.toLowerCase().includes(q))
      );
    }
    return result;
  }, [orders, statusFilter, countryFilter, search, users]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const handleStatusChange = (orderId, newStatus) => {
    const statusDef = ORDER_STATUSES.find(s => s.id === newStatus);
    Store.updateOrder(orderId, {
      status: newStatus,
      statusHistory: [
        ...(Store.getOrderById(orderId)?.statusHistory || []),
        { status: newStatus, date: new Date().toISOString(), note: `Status diubah ke ${statusDef?.label}` }
      ]
    });
    reload();
    toast.success('Status Diperbarui', `Pesanan diubah ke ${statusDef?.label}`);
  };

  const handleBulkStatus = (newStatus) => {
    selected.forEach(orderId => handleStatusChange(orderId, newStatus));
    setSelected(new Set());
  };

  const toggleSelect = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === paginated.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(paginated.map(o => o.id)));
    }
  };

  const openPricing = (order) => {
    setPricingOrder(order);
    const est = order.estimatedCost || {};
    setPricingData({
      itemTotal: est.itemTotal || '',
      serviceFee: est.serviceFee || '',
      shippingIntl: est.shippingIntl || '',
      importDuty: est.importDuty || '',
      ppn: est.ppn || '',
      pph: est.pph || '',
    });
  };

  const handlePricingSave = () => {
    if (!pricingOrder) return;
    const estimatedCost = {
      itemTotal: parseInt(pricingData.itemTotal) || 0,
      serviceFee: parseInt(pricingData.serviceFee) || 0,
      shippingIntl: parseInt(pricingData.shippingIntl) || 0,
      importDuty: parseInt(pricingData.importDuty) || 0,
      ppn: parseInt(pricingData.ppn) || 0,
      pph: parseInt(pricingData.pph) || 0,
    };
    estimatedCost.total = Object.values(estimatedCost).reduce((a, b) => a + b, 0);

    Store.updateOrder(pricingOrder.id, {
      estimatedCost,
      status: 'awaiting_payment',
      paymentStage1: { amount: estimatedCost.total, status: 'unpaid', paidAt: null, method: null },
      statusHistory: [
        ...(pricingOrder.statusHistory || []),
        { status: 'awaiting_payment', date: new Date().toISOString(), note: `Harga ditetapkan: ${formatCurrency(estimatedCost.total)}` }
      ]
    });

    Store.addNotification({
      id: generateId(), userId: pricingOrder.userId, type: 'info',
      title: 'Harga Sudah Ditetapkan',
      message: `Pesanan ${pricingOrder.id} total ${formatCurrency(estimatedCost.total)}. Silakan lakukan pembayaran.`,
      read: false, createdAt: new Date().toISOString(),
    });

    setPricingOrder(null);
    reload();
    toast.success('Berhasil', 'Harga berhasil ditetapkan dan dikirim ke customer');
  };

  const handleAddAdminNote = (orderId, message) => {
    const order = Store.getOrderById(orderId);
    if (!order) return;
    const notes = [...(order.notes || []), { from: 'admin', message, date: new Date().toISOString() }];
    Store.updateOrder(orderId, { notes });
    if (detailOrder?.id === orderId) setDetailOrder({ ...order, notes });
    reload();
  };

  return (
    <div className="animate-fade-in-up">
      <div className="page-header">
        <div className="page-header-actions">
          <div><h1>Kelola Pesanan</h1><p>{orders.length} total pesanan</p></div>
        </div>
      </div>

      {/* Filters */}
      <div className="admin-filters">
        <input type="text" className="form-input" placeholder="🔍 Cari ID, customer, produk..." value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: 300 }} />
        <select className="form-input" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ maxWidth: 200 }}>
          <option value="all">Semua Status</option>
          {ORDER_STATUSES.map(s => <option key={s.id} value={s.id}>{s.icon} {s.label}</option>)}
        </select>
        <select className="form-input" value={countryFilter} onChange={e => setCountryFilter(e.target.value)} style={{ maxWidth: 180 }}>
          <option value="all">Semua Negara</option>
          {COUNTRIES.map(c => <option key={c.id} value={c.id}>{c.flag} {c.name}</option>)}
        </select>
      </div>

      {/* Bulk Actions */}
      {selected.size > 0 && (
        <div className="bulk-bar glass-card">
          <span>{selected.size} pesanan dipilih</span>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            {ORDER_STATUSES.filter(s => s.id !== 'cancelled').slice(0, 5).map(s => (
              <button key={s.id} className="btn btn-sm btn-secondary" onClick={() => handleBulkStatus(s.id)}>
                {s.icon} {s.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="admin-content-card">
        <div className="admin-table-wrapper" style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th><input type="checkbox" checked={selected.size === paginated.length && paginated.length > 0} onChange={toggleSelectAll} /></th>
                <th>ID</th>
                <th>Customer</th>
                <th>Negara</th>
                <th>Items</th>
                <th>Status</th>
                <th>Total</th>
                <th>Tanggal</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(order => {
                const country = getCountry(order.country);
                const status = ORDER_STATUSES.find(s => s.id === order.status);
                const total = order.finalCost?.total || order.estimatedCost?.total || 0;
                return (
                  <tr key={order.id}>
                    <td><input type="checkbox" checked={selected.has(order.id)} onChange={() => toggleSelect(order.id)} /></td>
                    <td><span className="table-order-id">{order.id}</span></td>
                    <td>
                      <div className="table-customer">
                        <div className="table-customer-avatar">{getInitials(getUserName(order.userId))}</div>
                        <span className="table-customer-name">{getUserName(order.userId)}</span>
                      </div>
                    </td>
                    <td>{country?.flag} {country?.id}</td>
                    <td>
                      <div className="table-items-summary">
                        <div className="item-name">{truncate(order.items[0]?.name, 24)}</div>
                        {order.items.length > 1 && <div className="item-count">+{order.items.length - 1} lainnya</div>}
                      </div>
                    </td>
                    <td>
                      <select
                        className="admin-status-select"
                        value={order.status}
                        onChange={e => handleStatusChange(order.id, e.target.value)}
                        style={{ borderColor: status?.color }}
                      >
                        {ORDER_STATUSES.map(s => (
                          <option key={s.id} value={s.id}>{s.icon} {s.label}</option>
                        ))}
                      </select>
                    </td>
                    <td style={{ fontWeight: 600 }}>{total > 0 ? formatCurrency(total) : '-'}</td>
                    <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{timeAgo(order.createdAt)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
                        <button className="btn btn-sm btn-ghost" onClick={() => setDetailOrder(order)}>👁</button>
                        {order.status === 'pending_quote' && (
                          <button className="btn btn-sm btn-primary" onClick={() => openPricing(order)}>💰</button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {paginated.length === 0 && (
                <tr><td colSpan={9} style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-tertiary)' }}>Tidak ada pesanan ditemukan</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="admin-pagination">
            <button className="btn btn-sm btn-ghost" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Halaman {page} dari {totalPages}</span>
            <button className="btn btn-sm btn-ghost" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {detailOrder && (
        <>
          <div className="modal-backdrop" onClick={() => setDetailOrder(null)} />
          <div className="modal-container">
            <div className="modal-content" style={{ maxWidth: 700 }}>
              <div className="modal-header">
                <h3>Detail Pesanan {detailOrder.id}</h3>
                <button className="modal-close" onClick={() => setDetailOrder(null)}>×</button>
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-4)', flexWrap: 'wrap' }}>
                <span className={`badge ${ORDER_STATUSES.find(s => s.id === detailOrder.status)?.badgeClass}`}>
                  {ORDER_STATUSES.find(s => s.id === detailOrder.status)?.icon} {ORDER_STATUSES.find(s => s.id === detailOrder.status)?.label}
                </span>
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>{getCountry(detailOrder.country)?.flag} {getCountry(detailOrder.country)?.name}</span>
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>👤 {getUserName(detailOrder.userId)}</span>
              </div>

              <h4 style={{ marginBottom: 'var(--space-3)' }}>Barang ({detailOrder.items.length})</h4>
              {detailOrder.items.map((item, i) => (
                <div key={i} style={{ padding: 'var(--space-3)', background: 'var(--glass-bg)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-2)', fontSize: 'var(--text-sm)' }}>
                  <strong>{item.name}</strong> {item.variant && `(${item.variant})`}<br />
                  <span style={{ color: 'var(--text-tertiary)' }}>{item.quantity}x • {item.weight}kg • {getCountry(detailOrder.country)?.currencySymbol}{item.priceOriginal}</span>
                  {item.url && <><br /><a href={item.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 'var(--text-xs)' }}>🔗 Link</a></>}
                </div>
              ))}

              {detailOrder.estimatedCost && (
                <>
                  <h4 style={{ marginTop: 'var(--space-4)', marginBottom: 'var(--space-2)' }}>Biaya</h4>
                  <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                    Total: <strong style={{ color: 'var(--text-primary)' }}>{formatCurrency(detailOrder.estimatedCost.total)}</strong>
                  </div>
                </>
              )}

              <h4 style={{ marginTop: 'var(--space-4)', marginBottom: 'var(--space-2)' }}>Timeline</h4>
              {(detailOrder.statusHistory || []).map((h, i) => (
                <div key={i} style={{ fontSize: 'var(--text-xs)', padding: 'var(--space-2) 0', borderBottom: '1px solid var(--glass-border)', color: 'var(--text-secondary)' }}>
                  {ORDER_STATUSES.find(s => s.id === h.status)?.icon} {h.note} — <span style={{ color: 'var(--text-tertiary)' }}>{formatDateTime(h.date)}</span>
                </div>
              ))}

              {detailOrder.shippingAddress && (
                <>
                  <h4 style={{ marginTop: 'var(--space-4)', marginBottom: 'var(--space-2)' }}>Alamat</h4>
                  <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                    {detailOrder.shippingAddress.recipient} · {detailOrder.shippingAddress.phone}<br />
                    {detailOrder.shippingAddress.address}, {detailOrder.shippingAddress.city}
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}

      {/* Pricing Modal */}
      {pricingOrder && (
        <>
          <div className="modal-backdrop" onClick={() => setPricingOrder(null)} />
          <div className="modal-container">
            <div className="modal-content">
              <div className="modal-header">
                <h3>💰 Set Harga — {pricingOrder.id}</h3>
                <button className="modal-close" onClick={() => setPricingOrder(null)}>×</button>
              </div>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
                Customer: {getUserName(pricingOrder.userId)} · {getCountry(pricingOrder.country)?.flag} {getCountry(pricingOrder.country)?.name}
              </p>
              {[
                ['Harga Barang (IDR)', 'itemTotal'],
                ['Biaya Jasa (IDR)', 'serviceFee'],
                ['Ongkir Internasional (IDR)', 'shippingIntl'],
                ['Bea Masuk (IDR)', 'importDuty'],
                ['PPN (IDR)', 'ppn'],
                ['PPh (IDR)', 'pph'],
              ].map(([label, key]) => (
                <div className="form-group" key={key}>
                  <label className="form-label">{label}</label>
                  <input type="number" className="form-input" value={pricingData[key]} onChange={e => setPricingData(p => ({ ...p, [key]: e.target.value }))} />
                </div>
              ))}
              <div style={{ padding: 'var(--space-4)', background: 'var(--glass-bg)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-4)', textAlign: 'center' }}>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>Total</div>
                <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, background: 'var(--primary-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  {formatCurrency(Object.values(pricingData).reduce((a, b) => a + (parseInt(b) || 0), 0))}
                </div>
              </div>
              <button className="btn btn-primary btn-lg" style={{ width: '100%' }} onClick={handlePricingSave}>
                📤 Kirim Harga ke Customer
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
