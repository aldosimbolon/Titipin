import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import Store from '../../data/store';
import { ORDER_STATUSES } from '../../data/constants';
import { formatCurrency, formatDate, formatDateTime, getCountry } from '../../utils/helpers';
import './Customer.css';

export default function OrderDetail() {
  const { id } = useParams();
  const toast = useToast();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [newNote, setNewNote] = useState('');
  const [notFound, setNotFound] = useState(false);

  // States untuk Simulasi Pembayaran
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentStage, setPaymentStage] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [selectedMethod, setSelectedMethod] = useState('bca');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const PAYMENT_METHODS = [
    { id: 'bca', name: 'BCA Virtual Account', icon: '🏦' },
    { id: 'mandiri', name: 'Mandiri Virtual Account', icon: '🏦' },
    { id: 'gopay', name: 'GoPay', icon: '📱' },
    { id: 'ovo', name: 'OVO', icon: '📱' },
    { id: 'dana', name: 'DANA', icon: '📱' },
  ];

  useEffect(() => {
    const load = async () => {
      try {
        const o = await Store.getOrderById(id);
        if (!o) { setNotFound(true); return; }
        setOrder(o);
      } catch { setNotFound(true); }
    };
    load();
  }, [id]);

  const country = useMemo(() => order ? getCountry(order.country) : null, [order]);

  const currentStatusIdx = useMemo(() => {
    if (!order) return -1;
    const statuses = ORDER_STATUSES.filter(s => s.id !== 'cancelled');
    return statuses.findIndex(s => s.id === order.status);
  }, [order]);

  const handleOpenPaymentModal = (stage, amount) => {
    setPaymentStage(stage);
    setPaymentAmount(amount);
    setSelectedMethod('bca');
    setShowPaymentModal(true);
  };

  const handleProcessPayment = async () => {
    setIsProcessingPayment(true);
    try {
      // Simulasi proses gateway pembayaran, lalu verifikasi ke server
      await new Promise((r) => setTimeout(r, 1200));
      const updated = await Store.payOrder(order.id, { stage: paymentStage, method: selectedMethod });
      setOrder(updated);
      toast.success(
        'Pembayaran Sukses!',
        `Pembayaran Tahap ${paymentStage} berhasil diverifikasi secara instan.`
      );
      setShowPaymentModal(false);
    } catch (e) {
      toast.error('Pembayaran Gagal', e.message);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    try {
      const notes = await Store.addOrderNote(order.id, newNote.trim());
      setOrder(prev => ({ ...prev, notes }));
      setNewNote('');
      toast.success('Catatan Terkirim', 'Pesan Anda telah dikirim ke admin');
    } catch (e) {
      toast.error('Gagal', e.message);
    }
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
                {order.paymentStage1?.status !== 'paid' && order.status === 'awaiting_payment' && (
                  <button 
                    className="btn btn-primary btn-sm" 
                    style={{ marginTop: 'var(--space-2)', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                    onClick={() => handleOpenPaymentModal(1, order.paymentStage1.amount)}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>payments</span>
                    Bayar Tahap 1
                  </button>
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
                {order.paymentStage1?.status === 'paid' && order.paymentStage2?.status !== 'paid' && (order.paymentStage2?.amount || 0) > 0 && (
                  <button 
                    className="btn btn-primary btn-sm" 
                    style={{ marginTop: 'var(--space-2)', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                    onClick={() => handleOpenPaymentModal(2, order.paymentStage2.amount)}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>payments</span>
                    Bayar Tahap 2
                  </button>
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

      {/* Simulated Payment Modal */}
      {showPaymentModal && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '420px', padding: 'var(--space-6)', position: 'relative', background: 'white' }}>
            <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: '700', color: 'var(--text-primary)', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--primary-start)' }}>payments</span>
              Simulasi Pembayaran Tahap {paymentStage}
            </h3>
            
            <div style={{ background: 'var(--success-bg)', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--space-4)', textAlign: 'center' }}>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Tagihan</div>
              <div style={{ fontSize: 'var(--text-2xl)', fontWeight: '800', color: 'var(--primary-start)' }}>{formatCurrency(paymentAmount)}</div>
            </div>

            <div style={{ marginBottom: 'var(--space-4)' }}>
              <label style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', fontWeight: '600', marginBottom: '8px' }}>Pilih Metode Pembayaran</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {PAYMENT_METHODS.map(method => (
                  <div 
                    key={method.id} 
                    onClick={() => setSelectedMethod(method.id)}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between', 
                      padding: '12px var(--space-4)', 
                      borderRadius: 'var(--radius-md)', 
                      border: `1.5px solid ${selectedMethod === method.id ? 'var(--primary-start)' : 'var(--glass-border)'}`,
                      background: selectedMethod === method.id ? 'var(--success-bg)' : 'white',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '20px' }}>{method.icon}</span>
                      <span style={{ fontSize: 'var(--text-sm)', fontWeight: '600', color: 'var(--text-primary)' }}>{method.name}</span>
                    </div>
                    {selectedMethod === method.id && (
                      <span className="material-symbols-outlined" style={{ color: 'var(--primary-start)', fontSize: '18px' }}>check_circle</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-6)' }}>
              <button 
                className="btn btn-ghost" 
                style={{ flex: 1 }}
                onClick={() => setShowPaymentModal(false)}
                disabled={isProcessingPayment}
              >
                Batal
              </button>
              <button 
                className="btn btn-primary" 
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                onClick={handleProcessPayment}
                disabled={isProcessingPayment}
              >
                {isProcessingPayment ? (
                  <>
                    <div className="spinner sm" style={{ borderLeftColor: 'white' }}></div>
                    Memproses...
                  </>
                ) : (
                  <>Konfirmasi</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
