import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Store from '../../data/store';
import { COUNTRIES } from '../../data/constants';
import { formatCurrency, generateOrderId, generateId, calculateEstimate, toIDR } from '../../utils/helpers';
import './Customer.css';

const emptyItem = () => ({
  id: generateId(),
  name: '',
  url: '',
  variant: '',
  quantity: 1,
  priceOriginal: '',
  weight: '',
  notes: '',
});

export default function OrderCreate() {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [selectedCountry, setSelectedCountry] = useState('');
  const [items, setItems] = useState([emptyItem()]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [useNpwp, setUseNpwp] = useState(false);
  const [npwpValue, setNpwpValue] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Pre-fill NPWP from profile
  useEffect(() => {
    if (user?.npwp) {
      setNpwpValue(user.npwp);
    }
    // Auto-select default address
    if (user?.addresses?.length) {
      const defaultAddr = user.addresses.find(a => a.isDefault) || user.addresses[0];
      setSelectedAddressId(defaultAddr.id);
    }
  }, [user]);

  const country = useMemo(() => COUNTRIES.find(c => c.id === selectedCountry), [selectedCountry]);

  const updateItem = useCallback((itemId, field, value) => {
    setItems(prev => prev.map(item =>
      item.id === itemId ? { ...item, [field]: value } : item
    ));
  }, []);

  const addItem = useCallback(() => {
    setItems(prev => [...prev, emptyItem()]);
  }, []);

  const removeItem = useCallback((itemId) => {
    setItems(prev => {
      if (prev.length <= 1) return prev;
      return prev.filter(item => item.id !== itemId);
    });
  }, []);

  // Calculate estimates
  const estimation = useMemo(() => {
    if (!selectedCountry || !country) return null;

    let totalItemIDR = 0;
    let totalWeight = 0;
    let hasValidItem = false;

    items.forEach(item => {
      const price = parseFloat(item.priceOriginal) || 0;
      const qty = parseInt(item.quantity) || 1;
      const wt = parseFloat(item.weight) || 0;
      if (price > 0) {
        hasValidItem = true;
        totalItemIDR += toIDR(price * qty, country.currency);
        totalWeight += wt * qty;
      }
    });

    if (!hasValidItem) return null;

    const est = calculateEstimate(selectedCountry, 0, country.currency, totalWeight, useNpwp);
    if (!est) return null;

    // Override itemTotal with our calculated total
    est.itemTotal = totalItemIDR;
    est.serviceFee = Math.round(totalItemIDR * 0.06);
    est.importDuty = Math.round(totalItemIDR * 0.075);
    est.ppn = Math.round(totalItemIDR * 0.11);
    const pphRate = useNpwp ? 0.10 : 0.20;
    est.pph = Math.round(totalItemIDR * pphRate);
    est.pphRate = pphRate * 100;
    est.total = totalItemIDR + est.serviceFee + est.shippingIntl + est.importDuty + est.ppn + est.pph;

    return est;
  }, [selectedCountry, country, items, useNpwp]);

  const handleSubmit = () => {
    // Validation
    if (!selectedCountry) {
      toast.error('Pilih Negara', 'Silakan pilih negara asal barang');
      return;
    }

    const validItems = items.filter(item => item.name && parseFloat(item.priceOriginal) > 0);
    if (validItems.length === 0) {
      toast.error('Item Kosong', 'Tambahkan minimal 1 item dengan nama dan harga');
      return;
    }

    if (!selectedAddressId) {
      toast.error('Alamat Kosong', 'Silakan pilih alamat pengiriman');
      return;
    }

    setSubmitting(true);

    const selectedAddr = user.addresses.find(a => a.id === selectedAddressId);
    const orderId = generateOrderId();

    const orderItems = validItems.map(item => ({
      id: generateId(),
      name: item.name,
      url: item.url,
      variant: item.variant,
      quantity: parseInt(item.quantity) || 1,
      priceOriginal: parseFloat(item.priceOriginal) || 0,
      currency: country.currency,
      weight: parseFloat(item.weight) || 0,
      notes: item.notes,
    }));

    const order = {
      id: orderId,
      userId: user.id,
      country: selectedCountry,
      status: 'pending_quote',
      items: orderItems,
      shippingAddress: selectedAddr,
      npwp: useNpwp ? npwpValue : '',
      estimatedCost: estimation ? { ...estimation } : null,
      finalCost: null,
      paymentStage1: { amount: 0, status: 'unpaid', paidAt: null, method: null },
      paymentStage2: { amount: 0, status: 'unpaid', paidAt: null, method: null },
      statusHistory: [
        { status: 'pending_quote', date: new Date().toISOString(), note: 'Pesanan dibuat oleh pelanggan' }
      ],
      notes: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    Store.addOrder(order);
    Store.addNotification({
      id: generateId(),
      userId: user.id,
      type: 'info',
      title: 'Pesanan Dibuat',
      message: `Pesanan ${orderId} berhasil dibuat. Menunggu konfirmasi harga.`,
      read: false,
      createdAt: new Date().toISOString(),
    });

    toast.success('Pesanan Berhasil!', `Pesanan ${orderId} telah dikirim`);
    navigate(`/order/${orderId}`);
  };

  return (
    <div className="animate-fade-in-up">
      <div className="page-header">
        <h1>Buat Pesanan Baru</h1>
        <p>Isi detail barang yang ingin Anda titip beli dari luar negeri</p>
      </div>

      <div className="order-create-layout">
        {/* Main Form */}
        <div className="order-form-main">
          {/* Country Selector */}
          <div className="form-section-title">
            <span>🌍</span> Pilih Negara Asal
          </div>
          <div className="country-selector">
            {COUNTRIES.map(c => (
              <div
                key={c.id}
                className={`country-card glass-card ${selectedCountry === c.id ? 'selected' : ''}`}
                onClick={() => setSelectedCountry(c.id)}
              >
                <span className="country-flag">{c.flag}</span>
                <div className="country-name">{c.name}</div>
                <div className="country-currency">{c.currency} ({c.currencySymbol})</div>
              </div>
            ))}
          </div>

          {/* Items */}
          <div className="form-section-title">
            <span>🛒</span> Detail Barang
          </div>
          {items.map((item, idx) => (
            <div key={item.id} className="item-card glass-card">
              <div className="item-card-header">
                <h4>Item #{idx + 1}</h4>
                {items.length > 1 && (
                  <button
                    className="item-card-remove"
                    onClick={() => removeItem(item.id)}
                    title="Hapus item"
                  >
                    🗑️
                  </button>
                )}
              </div>
              <div className="item-fields">
                <div className="form-group full-width">
                  <label className="form-label">URL Produk</label>
                  <input
                    type="url"
                    className="form-input"
                    placeholder="https://www.example.com/product"
                    value={item.url}
                    onChange={e => updateItem(item.id, 'url', e.target.value)}
                  />
                </div>
                <div className="form-group full-width">
                  <label className="form-label">Nama Produk *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Nama barang yang ingin dibeli"
                    value={item.name}
                    onChange={e => updateItem(item.id, 'name', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Varian (Warna/Ukuran)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Contoh: Hitam, XL"
                    value={item.variant}
                    onChange={e => updateItem(item.id, 'variant', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Jumlah *</label>
                  <input
                    type="number"
                    className="form-input"
                    min="1"
                    value={item.quantity}
                    onChange={e => updateItem(item.id, 'quantity', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">
                    Harga ({country?.currencySymbol || 'mata uang asing'}) *
                  </label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="0"
                    min="0"
                    step="0.01"
                    value={item.priceOriginal}
                    onChange={e => updateItem(item.id, 'priceOriginal', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Berat (kg)</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="0.5"
                    min="0"
                    step="0.1"
                    value={item.weight}
                    onChange={e => updateItem(item.id, 'weight', e.target.value)}
                  />
                </div>
                <div className="form-group full-width">
                  <label className="form-label">Catatan</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Catatan tambahan untuk item ini"
                    value={item.notes}
                    onChange={e => updateItem(item.id, 'notes', e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}

          <button className="add-item-btn" onClick={addItem}>
            ➕ Tambah Item Lain
          </button>

          {/* Shipping Address */}
          <div className="form-section-title">
            <span>📍</span> Alamat Pengiriman
          </div>
          {user?.addresses?.length > 0 ? (
            <div style={{ marginBottom: 'var(--space-6)' }}>
              {user.addresses.map(addr => (
                <div
                  key={addr.id}
                  className={`address-select-card glass-card ${selectedAddressId === addr.id ? 'selected' : ''}`}
                  onClick={() => setSelectedAddressId(addr.id)}
                >
                  <div className="address-label-row">
                    <span className="address-label-tag">📍 {addr.label}</span>
                    {addr.isDefault && <span className="address-default-badge">Utama</span>}
                  </div>
                  <div className="address-detail-text">
                    {addr.recipient} • {addr.phone}<br />
                    {addr.address}, {addr.city}, {addr.province} {addr.postalCode}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-card" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-6)', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-3)' }}>
                Belum ada alamat tersimpan
              </p>
              <button className="btn btn-outline btn-sm" onClick={() => navigate('/profile')}>
                Tambah Alamat di Profil
              </button>
            </div>
          )}

          {/* NPWP Section */}
          <div className="form-section-title">
            <span>🏛️</span> NPWP (Opsional)
          </div>
          <div className="npwp-toggle" onClick={() => setUseNpwp(!useNpwp)}>
            <div className={`npwp-toggle-switch ${useNpwp ? 'active' : ''}`} />
            <span className="npwp-toggle-text">
              Gunakan NPWP untuk diskon pajak (PPh {useNpwp ? '10%' : '20%'} → {useNpwp ? '10%' : 'aktifkan untuk 10%'})
            </span>
          </div>
          {useNpwp && (
            <div className="form-group animate-fade-in-up">
              <label className="form-label">Nomor NPWP</label>
              <input
                type="text"
                className="form-input"
                placeholder="XX.XXX.XXX.X-XXX.XXX"
                value={npwpValue}
                onChange={e => setNpwpValue(e.target.value)}
              />
              <p className="form-hint">NPWP akan digunakan untuk menghitung PPh impor dengan tarif lebih rendah</p>
            </div>
          )}

          {/* Mobile Submit */}
          <div className="estimation-panel" style={{ display: 'none' }}>
            {/* This space intentionally left for layout on mobile (handled by estimation panel below) */}
          </div>
        </div>

        {/* Estimation Panel */}
        <div className="estimation-panel">
          <div className="estimation-card">
            <div className="estimation-header">
              <h3>💰 Estimasi Biaya</h3>
              <p>Perkiraan total biaya pesanan Anda</p>
            </div>
            <div className="estimation-body">
              {estimation ? (
                <>
                  <div className="estimation-row">
                    <span className="estimation-row-label">Subtotal Barang</span>
                    <span className="estimation-row-value">{formatCurrency(estimation.itemTotal)}</span>
                  </div>
                  <div className="estimation-row">
                    <span className="estimation-row-label">Service Fee (6%)</span>
                    <span className="estimation-row-value">{formatCurrency(estimation.serviceFee)}</span>
                  </div>
                  <div className="estimation-row">
                    <span className="estimation-row-label">Ongkir Internasional</span>
                    <span className="estimation-row-value">{formatCurrency(estimation.shippingIntl)}</span>
                  </div>
                  <hr className="estimation-divider" />
                  <div className="estimation-row">
                    <span className="estimation-row-label">Bea Masuk (7.5%)</span>
                    <span className="estimation-row-value">{formatCurrency(estimation.importDuty)}</span>
                  </div>
                  <div className="estimation-row">
                    <span className="estimation-row-label">PPN (11%)</span>
                    <span className="estimation-row-value">{formatCurrency(estimation.ppn)}</span>
                  </div>
                  <div className="estimation-row">
                    <span className="estimation-row-label">PPh ({estimation.pphRate}%)</span>
                    <span className="estimation-row-value">{formatCurrency(estimation.pph)}</span>
                  </div>
                  <hr className="estimation-divider" />
                  <div className="estimation-total">
                    <div className="estimation-row">
                      <span className="estimation-row-label">Estimasi Total</span>
                      <span className="estimation-row-value">{formatCurrency(estimation.total)}</span>
                    </div>
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: 'var(--space-8) 0', color: 'var(--text-tertiary)' }}>
                  <div style={{ fontSize: '32px', marginBottom: 'var(--space-3)' }}>🧮</div>
                  <p style={{ fontSize: 'var(--text-sm)' }}>
                    Pilih negara dan isi detail barang untuk melihat estimasi biaya
                  </p>
                </div>
              )}
            </div>
            {estimation && (
              <div className="estimation-note">
                ⚠️ Harga final ongkir akan dikonfirmasi setelah barang sampai di gudang kami. Estimasi ini bersifat perkiraan.
              </div>
            )}
            <div className="estimation-footer">
              <button
                className="btn btn-primary btn-lg"
                onClick={handleSubmit}
                disabled={submitting}
                style={{ opacity: submitting ? 0.7 : 1 }}
              >
                {submitting ? (
                  <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Mengirim...</>
                ) : (
                  <>🚀 Kirim Pesanan</>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
