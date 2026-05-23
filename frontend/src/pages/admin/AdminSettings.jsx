import { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import Store from '../../data/store';
import { COUNTRIES } from '../../data/constants';
import { formatCurrency } from '../../utils/helpers';
import './Admin.css';

export default function AdminSettings() {
  const toast = useToast();
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    setSettings(Store.getSettings());
  }, []);

  if (!settings) return <div className="page-loader"><div className="spinner lg"></div></div>;

  const update = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const updateNested = (parent, key, value) => {
    setSettings(prev => ({
      ...prev,
      [parent]: { ...prev[parent], [key]: value }
    }));
  };

  const handleSaveStore = () => {
    Store.updateSettings({
      storeName: settings.storeName,
      storeTagline: settings.storeTagline,
      whatsapp: settings.whatsapp,
      email: settings.email,
    });
    toast.success('Berhasil', 'Informasi toko berhasil disimpan');
  };

  const handleSaveRates = () => {
    Store.updateSettings({
      serviceFeePercent: parseFloat(settings.serviceFeePercent) || 6,
      importDuty: parseFloat(settings.importDuty) || 7.5,
      ppn: parseFloat(settings.ppn) || 11,
      pphWithNpwp: parseFloat(settings.pphWithNpwp) || 10,
      pphWithoutNpwp: parseFloat(settings.pphWithoutNpwp) || 20,
    });
    toast.success('Berhasil', 'Tarif layanan berhasil disimpan');
  };

  const handleSaveCurrency = () => {
    Store.updateSettings({ exchangeRates: settings.exchangeRates });
    toast.success('Berhasil', 'Kurs mata uang berhasil disimpan');
  };

  const handleSaveShipping = () => {
    Store.updateSettings({ shippingRates: settings.shippingRates });
    toast.success('Berhasil', 'Tarif ongkir berhasil disimpan');
  };

  return (
    <div className="animate-fade-in-up">
      <div className="page-header">
        <h1>Pengaturan</h1>
        <p>Kelola konfigurasi toko, tarif, dan kurs mata uang</p>
      </div>

      <div className="settings-grid">
        {/* Store Info */}
        <div className="content-card">
          <div className="content-card-header">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--primary-start)' }}>storefront</span>
              Informasi Toko
            </h3>
          </div>
          <div className="content-card-body">
            <div className="form-group">
              <label className="form-label">Nama Toko</label>
              <input type="text" className="form-input" value={settings.storeName || ''} onChange={e => update('storeName', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Tagline</label>
              <input type="text" className="form-input" value={settings.storeTagline || ''} onChange={e => update('storeTagline', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">WhatsApp (dengan kode negara)</label>
              <input type="text" className="form-input" placeholder="6281234567890" value={settings.whatsapp || ''} onChange={e => update('whatsapp', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" className="form-input" value={settings.email || ''} onChange={e => update('email', e.target.value)} />
            </div>
            <button className="btn btn-primary" onClick={handleSaveStore}>Simpan</button>
          </div>
        </div>

        {/* Service Rates */}
        <div className="content-card">
          <div className="content-card-header">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--primary-start)' }}>payments</span>
              Tarif Layanan
            </h3>
          </div>
          <div className="content-card-body">
            {[
              ['Biaya Jasa (%)', 'serviceFeePercent'],
              ['Bea Masuk (%)', 'importDuty'],
              ['PPN (%)', 'ppn'],
              ['PPh dengan NPWP (%)', 'pphWithNpwp'],
              ['PPh tanpa NPWP (%)', 'pphWithoutNpwp'],
            ].map(([label, key]) => (
              <div className="form-group" key={key}>
                <label className="form-label">{label}</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <input
                    type="number"
                    className="form-input"
                    step="0.1"
                    value={settings[key] ?? ''}
                    onChange={e => update(key, e.target.value)}
                    style={{ maxWidth: 120 }}
                  />
                  <span style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)' }}>%</span>
                </div>
              </div>
            ))}
            <button className="btn btn-primary" onClick={handleSaveRates}>Simpan</button>
          </div>
        </div>

        {/* Exchange Rates */}
        <div className="content-card">
          <div className="content-card-header">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--primary-start)' }}>currency_exchange</span>
              Kurs Mata Uang
            </h3>
          </div>
          <div className="content-card-body">
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-4)' }}>
              Nilai konversi 1 unit mata uang asing ke Rupiah (IDR)
            </p>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Mata Uang</th>
                  <th>Negara</th>
                  <th>Kurs (IDR)</th>
                </tr>
              </thead>
              <tbody>
                {COUNTRIES.map(c => (
                  <tr key={c.currency}>
                    <td>
                      <strong>{c.flag} {c.currency}</strong>
                      <span style={{ color: 'var(--text-tertiary)', marginLeft: 'var(--space-2)' }}>({c.currencySymbol})</span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>{c.name}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <span style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)' }}>Rp</span>
                        <input
                          type="number"
                          className="form-input"
                          step="0.1"
                          value={settings.exchangeRates?.[c.currency] ?? ''}
                          onChange={e => updateNested('exchangeRates', c.currency, parseFloat(e.target.value) || 0)}
                          style={{ maxWidth: 140 }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button className="btn btn-primary" onClick={handleSaveCurrency} style={{ marginTop: 'var(--space-4)' }}>Simpan Kurs</button>
          </div>
        </div>

        {/* Shipping Rates */}
        <div className="content-card">
          <div className="content-card-header">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--primary-start)' }}>local_shipping</span>
              Tarif Ongkir per Kg
            </h3>
          </div>
          <div className="content-card-body">
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-4)' }}>
              Estimasi biaya pengiriman internasional per kilogram
            </p>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Negara</th>
                  <th>Estimasi Kirim</th>
                  <th>Tarif/Kg (IDR)</th>
                </tr>
              </thead>
              <tbody>
                {COUNTRIES.map(c => (
                  <tr key={c.id}>
                    <td><strong>{c.flag} {c.name}</strong></td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>{c.deliveryDays} hari</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <span style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)' }}>Rp</span>
                        <input
                          type="number"
                          className="form-input"
                          value={settings.shippingRates?.[c.id] ?? ''}
                          onChange={e => updateNested('shippingRates', c.id, parseInt(e.target.value) || 0)}
                          style={{ maxWidth: 140 }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button className="btn btn-primary" onClick={handleSaveShipping} style={{ marginTop: 'var(--space-4)' }}>Simpan Ongkir</button>
          </div>
        </div>
      </div>
    </div>
  );
}
