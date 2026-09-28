import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Store from '../../data/store';
import { formatDate, getInitials, generateId } from '../../utils/helpers';
import './Customer.css';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const toast = useToast();

  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    npwp: user?.npwp || '',
  });

  const [pwForm, setPwForm] = useState({ old: '', new: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);

  // Address state
  const [showAddrForm, setShowAddrForm] = useState(false);
  const [editAddrId, setEditAddrId] = useState(null);
  const [addrForm, setAddrForm] = useState({ label: '', recipient: '', phone: '', address: '', city: '', province: '', postalCode: '' });

  const handleProfileSave = async () => {
    if (!form.name.trim()) { toast.error('Error', 'Nama tidak boleh kosong'); return; }
    try {
      await updateProfile({ name: form.name, phone: form.phone, npwp: form.npwp });
      toast.success('Berhasil', 'Profil berhasil diperbarui');
    } catch (e) { toast.error('Error', e.message); }
  };

  const handlePasswordChange = async () => {
    if (!pwForm.old) { toast.error('Error', 'Password lama wajib diisi'); return; }
    if (pwForm.new.length < 6) { toast.error('Error', 'Password baru minimal 6 karakter'); return; }
    if (pwForm.new !== pwForm.confirm) { toast.error('Error', 'Konfirmasi password tidak cocok'); return; }
    try {
      await updateProfile({ password: pwForm.new, currentPassword: pwForm.old });
    } catch (e) { toast.error('Error', e.message); return; }
    setPwForm({ old: '', new: '', confirm: '' });
    setShowPw(false);
    toast.success('Berhasil', 'Password berhasil diubah');
  };

  const resetAddrForm = () => {
    setAddrForm({ label: '', recipient: user?.name || '', phone: user?.phone || '', address: '', city: '', province: '', postalCode: '' });
    setEditAddrId(null);
    setShowAddrForm(false);
  };

  const handleAddrSave = async () => {
    if (!addrForm.label || !addrForm.recipient || !addrForm.address || !addrForm.city) {
      toast.error('Error', 'Lengkapi semua field alamat'); return;
    }
    let addresses = [...(user.addresses || [])];
    if (editAddrId) {
      addresses = addresses.map(a => a.id === editAddrId ? { ...a, ...addrForm } : a);
      toast.success('Berhasil', 'Alamat diperbarui');
    } else {
      const isFirst = addresses.length === 0;
      addresses.push({ id: 'addr' + generateId(), ...addrForm, isDefault: isFirst });
      toast.success('Berhasil', 'Alamat baru ditambahkan');
    }
    try { await updateProfile({ addresses }); } catch (e) { toast.error('Error', e.message); return; }
    resetAddrForm();
  };

  const handleAddrEdit = (addr) => {
    setAddrForm({ label: addr.label, recipient: addr.recipient, phone: addr.phone, address: addr.address, city: addr.city, province: addr.province, postalCode: addr.postalCode });
    setEditAddrId(addr.id);
    setShowAddrForm(true);
  };

  const handleAddrDelete = async (addrId) => {
    const addresses = (user.addresses || []).filter(a => a.id !== addrId);
    if (addresses.length > 0 && !addresses.some(a => a.isDefault)) addresses[0].isDefault = true;
    try { await updateProfile({ addresses }); toast.success('Berhasil', 'Alamat dihapus'); } catch (e) { toast.error('Error', e.message); }
  };

  const handleSetDefault = async (addrId) => {
    const addresses = (user.addresses || []).map(a => ({ ...a, isDefault: a.id === addrId }));
    try { await updateProfile({ addresses }); toast.success('Berhasil', 'Alamat utama diperbarui'); } catch (e) { toast.error('Error', e.message); }
  };

  return (
    <div className="animate-fade-in-up">
      <div className="page-header"><h1>Profil Saya</h1><p>Kelola informasi dan alamat pengiriman Anda</p></div>

      <div className="profile-layout">
        {/* Profile Card */}
        <div className="profile-sidebar">
          <div className="profile-avatar-card glass-card">
            <div className="profile-avatar-big">{getInitials(user?.name)}</div>
            <h3>{user?.name}</h3>
            <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)' }}>{user?.email}</p>
            <span className="badge badge-awaiting" style={{ marginTop: 'var(--space-2)' }}>Customer</span>
            <div style={{ marginTop: 'var(--space-4)', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
              Member sejak {formatDate(user?.createdAt)}
            </div>
          </div>
        </div>

        <div className="profile-main">
          {/* Edit Profile */}
          <div className="content-card" style={{ marginBottom: 'var(--space-6)' }}>
            <div className="content-card-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-symbols-outlined" style={{ color: 'var(--primary-start)' }}>person</span>
                Informasi Profil
              </h3>
            </div>
            <div className="content-card-body">
              <div className="form-group">
                <label className="form-label">Nama Lengkap</label>
                <input type="text" className="form-input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input type="email" className="form-input" value={user?.email || ''} disabled style={{ opacity: 0.5 }} />
                <p className="form-hint">Email tidak dapat diubah</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                <div className="form-group">
                  <label className="form-label">No. Handphone</label>
                  <input type="tel" className="form-input" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">NPWP</label>
                  <input type="text" className="form-input" placeholder="XX.XXX.XXX.X-XXX.XXX" value={form.npwp} onChange={e => setForm(p => ({ ...p, npwp: e.target.value }))} />
                </div>
              </div>
              <button className="btn btn-primary" onClick={handleProfileSave}>Simpan Perubahan</button>
            </div>
          </div>

          {/* Addresses */}
          <div className="content-card" style={{ marginBottom: 'var(--space-6)' }}>
            <div className="content-card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-symbols-outlined" style={{ color: 'var(--primary-start)' }}>location_on</span>
                Alamat Tersimpan
              </h3>
              <button className="btn btn-sm btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '4px' }} onClick={() => { resetAddrForm(); setShowAddrForm(true); }}>
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span> Tambah
              </button>
            </div>
            <div className="content-card-body">
              {(user?.addresses || []).length === 0 && !showAddrForm && (
                <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)' }}>Belum ada alamat tersimpan</p>
              )}
              {(user?.addresses || []).map(addr => (
                <div key={addr.id} className="address-card glass-card">
                  <div className="address-card-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                      <strong>{addr.label}</strong>
                      {addr.isDefault && <span className="badge badge-completed">Utama</span>}
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                      {!addr.isDefault && (
                        <button className="btn btn-sm btn-ghost" onClick={() => handleSetDefault(addr.id)}>Set Utama</button>
                      )}
                      <button className="btn btn-sm btn-ghost" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px' }} onClick={() => handleAddrEdit(addr)}>
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span>
                      </button>
                      <button className="btn btn-sm btn-ghost" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px' }} onClick={() => handleAddrDelete(addr.id)}>
                        <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--error)' }}>delete</span>
                      </button>
                    </div>
                  </div>
                  <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                    {addr.recipient} · {addr.phone}<br />
                    {addr.address}, {addr.city}, {addr.province} {addr.postalCode}
                  </div>
                </div>
              ))}

              {showAddrForm && (
                <div className="address-form glass-card" style={{ marginTop: 'var(--space-4)', padding: 'var(--space-5)' }}>
                  <h4 style={{ marginBottom: 'var(--space-4)' }}>{editAddrId ? 'Edit Alamat' : 'Tambah Alamat Baru'}</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                    <div className="form-group"><label className="form-label">Label</label><input className="form-input" placeholder="Rumah/Kantor" value={addrForm.label} onChange={e => setAddrForm(p => ({ ...p, label: e.target.value }))} /></div>
                    <div className="form-group"><label className="form-label">Penerima</label><input className="form-input" value={addrForm.recipient} onChange={e => setAddrForm(p => ({ ...p, recipient: e.target.value }))} /></div>
                  </div>
                  <div className="form-group"><label className="form-label">No. HP</label><input className="form-input" value={addrForm.phone} onChange={e => setAddrForm(p => ({ ...p, phone: e.target.value }))} /></div>
                  <div className="form-group"><label className="form-label">Alamat</label><input className="form-input" value={addrForm.address} onChange={e => setAddrForm(p => ({ ...p, address: e.target.value }))} /></div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-3)' }}>
                    <div className="form-group"><label className="form-label">Kota</label><input className="form-input" value={addrForm.city} onChange={e => setAddrForm(p => ({ ...p, city: e.target.value }))} /></div>
                    <div className="form-group"><label className="form-label">Provinsi</label><input className="form-input" value={addrForm.province} onChange={e => setAddrForm(p => ({ ...p, province: e.target.value }))} /></div>
                    <div className="form-group"><label className="form-label">Kode Pos</label><input className="form-input" value={addrForm.postalCode} onChange={e => setAddrForm(p => ({ ...p, postalCode: e.target.value }))} /></div>
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                    <button className="btn btn-primary" onClick={handleAddrSave}>{editAddrId ? 'Simpan' : 'Tambah'}</button>
                    <button className="btn btn-ghost" onClick={resetAddrForm}>Batal</button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Password */}
          <div className="content-card">
            <div className="content-card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-symbols-outlined" style={{ color: 'var(--primary-start)' }}>lock</span>
                Ubah Password
              </h3>
              <button className="btn btn-sm btn-ghost" onClick={() => setShowPw(!showPw)}>
                {showPw ? 'Tutup' : 'Ubah'}
              </button>
            </div>
            {showPw && (
              <div className="content-card-body">
                <div className="form-group"><label className="form-label">Password Lama</label><input type="password" className="form-input" value={pwForm.old} onChange={e => setPwForm(p => ({ ...p, old: e.target.value }))} /></div>
                <div className="form-group"><label className="form-label">Password Baru</label><input type="password" className="form-input" value={pwForm.new} onChange={e => setPwForm(p => ({ ...p, new: e.target.value }))} /></div>
                <div className="form-group"><label className="form-label">Konfirmasi Password Baru</label><input type="password" className="form-input" value={pwForm.confirm} onChange={e => setPwForm(p => ({ ...p, confirm: e.target.value }))} /></div>
                <button className="btn btn-primary" onClick={handlePasswordChange}>Ubah Password</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
