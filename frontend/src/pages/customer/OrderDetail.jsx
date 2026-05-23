import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Store from '../../data/store';
import { ORDER_STATUSES } from '../../data/constants';
import { formatCurrency, formatDate, formatDateTime, getCountry, generateId } from '../../utils/helpers';
import './Customer.css';

export default function OrderDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [newNote, setNewNote] = useState('');
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const o = Store.getOrderById(id);
    if (!o) { setNotFound(true); return; }
    setOrder(o);
  }, [id]);

  const country = useMemo(() => order ? getCountry(order.country) : null, [order]);

  const currentStatusIdx = useMemo(() => {
    if (!order) return -1;
    const statuses = ORDER_STATUSES.filter(s => s.id !== 'cancelled');
    return statuses.findIndex(s => s.id === order.status);
  }, [order]);

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    const notes = [...(order.notes || []), {
      from: 'user',
      message: newNote.trim(),
      date: new Date().toISOString(),
    }];
    Store.updateOrder(order.id, { notes });
    setOrder(prev => ({ ...prev, notes }));
    setNewNote('');
    toast.success('Catatan Terkirim', 'Pesan Anda telah dikirim ke admin');
  };

  if (notFound) {
    return (
      <div className="animate-fade-in-up">
        <div className="empty-state-card glass-card" style={{ marginTop: 'var(--space-12)' }}>
          <span className="empty-state-icon">🔍</span>
          <h3>Pesanan Tidak Ditemukan</h3>
          <p>Pesanan dengan ID "{id}" tidak ditemukan</p>
          <button className="btn btn-primary" onClick={() => navigate('/orders')}>Kembali ke Riwayat</button>
        </div>
      </div>
    );
  }

  if (!order) {
    return <div className="page-loader"><div className="spinner lg"></div></div>;
  }

  const cost = order.finalCost || order.estimatedCost;
  const isCancelled = order.status === 'cancelled';
  const trackStatuses = ORDER_STATUSES.filter(s => s.id !== 'cancelled');

  return (
    <div className="animate-fade-in-up">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-actions">
          <div>
            <button className="btn btn-ghost" onClick={() => navigate('/orders')} style={{ marginBottom: 'var(--space-2)', padding: '4px 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_back</span> Kembali
            </button>
            <h1>Pesanan {order.id}</h1>
            <p>{country?.flag} {country?.name} · {formatDate(order.createdAt)}</p>
          </div>
          <span className={`badge ${ORDER_STATUSES.find(s => s.id === order.status)?.badgeClass}`} style={{ fontSize: 'var(--text-sm)', padding: 'var(--space-2) var(--space-4)' }}>
            {ORDER_STATUSES.find(s => s.id === order.status)?.label}
          </span>
        </div>
      </div>

      <div className="order-detail-grid">
        {/* Left Column */}
        <div className="order-detail-main">
          {/* Timeline Tracker */}
          <div className="content-card" style={{ marginBottom: 'var(--space-6)' }}>
            <div className="content-card-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-symbols-outlined" style={{ color: 'var(--primary-start)' }}>distance</span>
                Tracking Pesanan
              </h3>
            </div>
            <div className="content-card-body">
              {isCancelled ? (
                <div style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--error)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '32px', color: 'var(--error)' }}>cancel</span>
                  <strong>Pesanan Dibatalkan</strong>
                </div>
              ) : (
                <div className="tracking-timeline">
                  {trackStatuses.map((status, idx) => {
                    const historyEntry = order.statusHistory?.find(h => h.status === status.id);
                    const isCompleted = idx < currentStatusIdx;
                    const isCurrent = idx === currentStatusIdx;
                    const isFuture = idx > currentStatusIdx;

                    return (
                      <div key={status.id} className={`timeline-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''} ${isFuture ? 'future' : ''}`}>
                        <div className="timeline-dot-wrapper">
                          <div className="timeline-dot">
                            {isCompleted ? '✓' : (
                              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                                {status.id === 'pending_quote' ? 'edit_note' :
                                 status.id === 'awaiting_payment' ? 'payments' :
                                 status.id === 'purchased' ? 'shopping_cart' :
                                 status.id === 'at_warehouse' ? 'package_2' :
                                 status.id === 'customs' ? 'receipt_long' :
                                 status.id === 'shipped' ? 'local_shipping' :
                                 status.id === 'completed' ? 'check_circle' : 'info'}
                              </span>
                            )}
                          </div>
                          {idx < trackStatuses.length - 1 && <div className="timeline-line" />}
                        </div>
                        <div className="timeline-content">
                          <div className="timeline-label">{status.label}</div>
                          {historyEntry && (
                            <>
                              <div className="timeline-date">{formatDateTime(historyEntry.date)}</div>
                              {historyEntry.note && <div className="timeline-note">{historyEntry.note}</div>}
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Items */}
          <div className="content-card" style={{ marginBottom: 'var(--space-6)' }}>
            <div className="content-card-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-symbols-outlined" style={{ color: 'var(--primary-start)' }}>shopping_basket</span>
                Detail Barang ({order.items.length} item)
              </h3>
            </div>
            <div className="content-card-body">
              {order.items.map((item, idx) => (
                <div key={item.id || idx} className="detail-item-row">
                  <div className="detail-item-info">
                    <div className="detail-item-name">{item.name}</div>
                    {item.variant && <div className="detail-item-variant">Varian: {item.variant}</div>}
                    {item.url && (
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className="detail-item-link" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>open_in_new</span> Lihat Produk
                      </a>
                    )}
                    {item.notes && <div className="detail-item-notes" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span className="material-symbols-outlined" style={{ fontSize: '14px' }}>description</span> {item.notes}</div>}
                  </div>
                  <div className="detail-item-meta">
                    <div>{item.quantity}x {country?.currencySymbol}{item.priceOriginal?.toLocaleString()}</div>
                    {item.weight > 0 && <div className="detail-item-weight">{item.weight} kg</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes / Chat */}
          <div className="content-card">
            <div className="content-card-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-symbols-outlined" style={{ color: 'var(--primary-start)' }}>forum</span>
                Catatan & Pesan
              </h3>
            </div>
            <div className="content-card-body">
              {(!order.notes || order.notes.length === 0) && (
                <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)' }}>
                  Belum ada pesan. Kirim catatan untuk admin.
                </p>
              )}
              <div className="chat-messages">
                {(order.notes || []).map((note, i) => (
                  <div key={i} className={`chat-bubble ${note.from === 'user' ? 'sent' : 'received'}`}>
                    <div className="chat-bubble-sender">{note.from === 'user' ? 'Anda' : 'Admin'}</div>
                    <div className="chat-bubble-text">{note.message}</div>
                    <div className="chat-bubble-time">{formatDateTime(note.date)}</div>
                  </div>
                ))}
              </div>
              <div className="chat-input-row">
                <input
                  type="text"
                  className="form-input"
                  placeholder="Tulis pesan untuk admin..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                />
                <button className="btn btn-primary" onClick={handleAddNote}>Kirim</button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="order-detail-side">
          {/* Cost Breakdown */}
          {cost && (
            <div className="content-card" style={{ marginBottom: 'var(--space-6)' }}>
              <div className="content-card-header">
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="material-symbols-outlined" style={{ color: 'var(--primary-start)' }}>payments</span>
                  Rincian Biaya
                </h3>
              </div>
              <div className="content-card-body">
                <div className="cost-row"><span>Harga Barang</span><span>{formatCurrency(cost.itemTotal)}</span></div>
                <div className="cost-row"><span>Biaya Jasa (6%)</span><span>{formatCurrency(cost.serviceFee)}</span></div>
                <div className="cost-row"><span>Ongkir Internasional</span><span>{formatCurrency(cost.shippingIntl)}</span></div>
                {cost.shippingDomestic > 0 && (
                  <div className="cost-row"><span>Ongkir Domestik</span><span>{formatCurrency(cost.shippingDomestic)}</span></div>
                )}
                <div className="cost-divider" />
                <div className="cost-row"><span>Bea Masuk (7.5%)</span><span>{formatCurrency(cost.importDuty)}</span></div>
                <div className="cost-row"><span>PPN (11%)</span><span>{formatCurrency(cost.ppn)}</span></div>
                <div className="cost-row"><span>PPh</span><span>{formatCurrency(cost.pph)}</span></div>
                <div className="cost-divider" />
                <div className="cost-row cost-total">
                  <span>Total</span>
                  <span>{formatCurrency(cost.total)}</span>
                </div>
                {!order.finalCost && (
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 'var(--space-3)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '14px', color: 'var(--warning)' }}>warning</span>
                    Ini adalah estimasi. Biaya ongkir final akan dikonfirmasi setelah barang ditimbang di gudang.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Payment Status */}
          <div className="content-card" style={{ marginBottom: 'var(--space-6)' }}>
            <div className="content-card-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-symbols-outlined" style={{ color: 'var(--primary-start)' }}>credit_card</span>
                Status Pembayaran
              </h3>
            </div>
            <div className="content-card-body">
              <div className="payment-stage">
                <div className="payment-stage-header">
                  <span>Tahap 1 (Produk + Pajak)</span>
                  <span className={`badge ${order.paymentStage1?.status === 'paid' ? 'badge-completed' : 'badge-pending'}`}>
                    {order.paymentStage1?.status === 'paid' ? 'Lunas' : 'Belum'}
                  </span>
                </div>
                {order.paymentStage1?.amount > 0 && (
                  <div className="payment-stage-amount">{formatCurrency(order.paymentStage1.amount)}</div>
                )}
                {order.paymentStage1?.paidAt && (
                  <div className="payment-stage-date">Dibayar: {formatDateTime(order.paymentStage1.paidAt)}</div>
                )}
              </div>

              <div className="payment-stage" style={{ marginTop: 'var(--space-4)' }}>
                <div className="payment-stage-header">
                  <span>Tahap 2 (Ongkir Domestik)</span>
                  <span className={`badge ${order.paymentStage2?.status === 'paid' ? 'badge-completed' : 'badge-pending'}`}>
                    {order.paymentStage2?.status === 'paid' ? 'Lunas' : 'Belum'}
                  </span>
                </div>
                {order.paymentStage2?.amount > 0 && (
                  <div className="payment-stage-amount">{formatCurrency(order.paymentStage2.amount)}</div>
                )}
                {order.paymentStage2?.paidAt && (
                  <div className="payment-stage-date">Dibayar: {formatDateTime(order.paymentStage2.paidAt)}</div>
                )}
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          {order.shippingAddress && (
            <div className="content-card">
              <div className="content-card-header">
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="material-symbols-outlined" style={{ color: 'var(--primary-start)' }}>location_on</span>
                  Alamat Pengiriman
                </h3>
              </div>
              <div className="content-card-body">
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                  <strong style={{ color: 'var(--text-primary)' }}>{order.shippingAddress.recipient}</strong><br />
                  {order.shippingAddress.phone}<br />
                  {order.shippingAddress.address}<br />
                  {order.shippingAddress.city}, {order.shippingAddress.province} {order.shippingAddress.postalCode}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
