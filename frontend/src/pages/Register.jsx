import { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { isValidEmail, isValidPhone } from '../utils/helpers';
import './Auth.css';

const STEPS = [
  { num: 1, label: 'Akun' },
  { num: 2, label: 'Profil' },
  { num: 3, label: 'Konfirmasi' },
];

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const toast = useToast();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    city: '',
    province: '',
    postalCode: '',
  });

  const [errors, setErrors] = useState({});

  const triggerShake = useCallback(() => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // ---- Step Validations ----
  const validateStep1 = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Nama lengkap wajib diisi';
    if (!form.email.trim()) {
      errs.email = 'Email wajib diisi';
    } else if (!isValidEmail(form.email)) {
      errs.email = 'Format email tidak valid';
    }
    if (!form.password) {
      errs.password = 'Password wajib diisi';
    } else if (form.password.length < 6) {
      errs.password = 'Password minimal 6 karakter';
    }
    if (!form.confirmPassword) {
      errs.confirmPassword = 'Konfirmasi password wajib diisi';
    } else if (form.confirmPassword !== form.password) {
      errs.confirmPassword = 'Password tidak cocok';
    }
    return errs;
  };

  const validateStep2 = () => {
    const errs = {};
    if (!form.phone.trim()) {
      errs.phone = 'No. handphone wajib diisi';
    } else if (!isValidPhone(form.phone)) {
      errs.phone = 'Format nomor tidak valid (contoh: 08123456789)';
    }
    if (!form.address.trim()) errs.address = 'Alamat wajib diisi';
    if (!form.city.trim()) errs.city = 'Kota wajib diisi';
    if (!form.province.trim()) errs.province = 'Provinsi wajib diisi';
    if (!form.postalCode.trim()) {
      errs.postalCode = 'Kode pos wajib diisi';
    } else if (!/^\d{5}$/.test(form.postalCode)) {
      errs.postalCode = 'Kode pos harus 5 digit';
    }
    return errs;
  };

  const handleNext = () => {
    let errs = {};
    if (step === 1) errs = validateStep1();
    if (step === 2) errs = validateStep2();

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      triggerShake();
      return;
    }

    setErrors({});
    setStep((s) => Math.min(s + 1, 3));
  };

  const handleBack = () => {
    setErrors({});
    setStep((s) => Math.max(s - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!agreed) {
      toast.warning('Perhatian', 'Anda harus menyetujui syarat & ketentuan');
      triggerShake();
      return;
    }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));

    const result = register({
      name: form.name,
      email: form.email,
      password: form.password,
      phone: form.phone,
      address: form.address,
      city: form.city,
      province: form.province,
      postalCode: form.postalCode,
    });

    setLoading(false);

    if (!result.success) {
      toast.error('Registrasi Gagal', result.error);
      if (result.error.toLowerCase().includes('email')) {
        setStep(1);
        setErrors({ email: result.error });
      }
      triggerShake();
      return;
    }

    toast.success('Registrasi Berhasil!', 'Selamat datang di TitipIn');
    navigate('/dashboard', { replace: true });
  };

  // ---- Step Line Status ----
  const getLineStatus = (afterStep) => {
    if (step > afterStep) return 'filled';
    if (step === afterStep) return 'filling';
    return '';
  };

  // ---- Render Steps ----
  const renderStep1 = () => (
    <div className="auth-step-panel" key="step1">
      {/* Nama */}
      <div className="auth-field">
        <div className="auth-field-inner">
          <input
            type="text"
            name="name"
            id="reg-name"
            className={`auth-input ${errors.name ? 'has-error' : ''} ${form.name ? 'filled' : ''}`}
            placeholder="Nama"
            value={form.name}
            onChange={handleChange}
            autoComplete="name"
          />
          <label htmlFor="reg-name" className="auth-label">Nama Lengkap</label>
          <span className="auth-field-icon">👤</span>
        </div>
        {errors.name && <div className="auth-field-error">⚠ {errors.name}</div>}
      </div>

      {/* Email */}
      <div className="auth-field">
        <div className="auth-field-inner">
          <input
            type="email"
            name="email"
            id="reg-email"
            className={`auth-input ${errors.email ? 'has-error' : ''} ${form.email ? 'filled' : ''}`}
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            autoComplete="email"
          />
          <label htmlFor="reg-email" className="auth-label">Alamat Email</label>
          <span className="auth-field-icon">✉</span>
        </div>
        {errors.email && <div className="auth-field-error">⚠ {errors.email}</div>}
      </div>

      {/* Password */}
      <div className="auth-field">
        <div className="auth-field-inner">
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            id="reg-password"
            className={`auth-input ${errors.password ? 'has-error' : ''} ${form.password ? 'filled' : ''}`}
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            autoComplete="new-password"
            style={{ paddingRight: '48px' }}
          />
          <label htmlFor="reg-password" className="auth-label">Password</label>
          <button
            type="button"
            className="auth-toggle-pw"
            onClick={() => setShowPassword((v) => !v)}
            tabIndex={-1}
          >
            {showPassword ? '🙈' : '👁'}
          </button>
        </div>
        {errors.password && <div className="auth-field-error">⚠ {errors.password}</div>}
      </div>

      {/* Konfirmasi Password */}
      <div className="auth-field">
        <div className="auth-field-inner">
          <input
            type={showConfirm ? 'text' : 'password'}
            name="confirmPassword"
            id="reg-confirm"
            className={`auth-input ${errors.confirmPassword ? 'has-error' : ''} ${form.confirmPassword ? 'filled' : ''}`}
            placeholder="Konfirmasi"
            value={form.confirmPassword}
            onChange={handleChange}
            autoComplete="new-password"
            style={{ paddingRight: '48px' }}
          />
          <label htmlFor="reg-confirm" className="auth-label">Konfirmasi Password</label>
          <button
            type="button"
            className="auth-toggle-pw"
            onClick={() => setShowConfirm((v) => !v)}
            tabIndex={-1}
          >
            {showConfirm ? '🙈' : '👁'}
          </button>
        </div>
        {errors.confirmPassword && (
          <div className="auth-field-error">⚠ {errors.confirmPassword}</div>
        )}
      </div>

      {/* Next */}
      <button type="button" className="auth-submit" onClick={handleNext}>
        Selanjutnya →
      </button>
    </div>
  );

  const renderStep2 = () => (
    <div className="auth-step-panel" key="step2">
      {/* Phone */}
      <div className="auth-field">
        <div className="auth-field-inner">
          <input
            type="tel"
            name="phone"
            id="reg-phone"
            className={`auth-input ${errors.phone ? 'has-error' : ''} ${form.phone ? 'filled' : ''}`}
            placeholder="Phone"
            value={form.phone}
            onChange={handleChange}
            autoComplete="tel"
          />
          <label htmlFor="reg-phone" className="auth-label">No. Handphone</label>
          <span className="auth-field-icon">📱</span>
        </div>
        {errors.phone && <div className="auth-field-error">⚠ {errors.phone}</div>}
      </div>

      {/* Alamat */}
      <div className="auth-field">
        <div className="auth-field-inner">
          <input
            type="text"
            name="address"
            id="reg-address"
            className={`auth-input ${errors.address ? 'has-error' : ''} ${form.address ? 'filled' : ''}`}
            placeholder="Alamat"
            value={form.address}
            onChange={handleChange}
            autoComplete="street-address"
          />
          <label htmlFor="reg-address" className="auth-label">Alamat Lengkap</label>
          <span className="auth-field-icon">📍</span>
        </div>
        {errors.address && <div className="auth-field-error">⚠ {errors.address}</div>}
      </div>

      {/* Kota + Provinsi row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div className="auth-field">
          <div className="auth-field-inner">
            <input
              type="text"
              name="city"
              id="reg-city"
              className={`auth-input ${errors.city ? 'has-error' : ''} ${form.city ? 'filled' : ''}`}
              placeholder="Kota"
              value={form.city}
              onChange={handleChange}
              autoComplete="address-level2"
            />
            <label htmlFor="reg-city" className="auth-label">Kota</label>
          </div>
          {errors.city && <div className="auth-field-error">⚠ {errors.city}</div>}
        </div>
        <div className="auth-field">
          <div className="auth-field-inner">
            <input
              type="text"
              name="province"
              id="reg-province"
              className={`auth-input ${errors.province ? 'has-error' : ''} ${form.province ? 'filled' : ''}`}
              placeholder="Provinsi"
              value={form.province}
              onChange={handleChange}
              autoComplete="address-level1"
            />
            <label htmlFor="reg-province" className="auth-label">Provinsi</label>
          </div>
          {errors.province && <div className="auth-field-error">⚠ {errors.province}</div>}
        </div>
      </div>

      {/* Kode Pos */}
      <div className="auth-field">
        <div className="auth-field-inner">
          <input
            type="text"
            name="postalCode"
            id="reg-postal"
            className={`auth-input ${errors.postalCode ? 'has-error' : ''} ${form.postalCode ? 'filled' : ''}`}
            placeholder="Kode Pos"
            value={form.postalCode}
            onChange={handleChange}
            autoComplete="postal-code"
            maxLength={5}
          />
          <label htmlFor="reg-postal" className="auth-label">Kode Pos</label>
          <span className="auth-field-icon">📮</span>
        </div>
        {errors.postalCode && <div className="auth-field-error">⚠ {errors.postalCode}</div>}
      </div>

      {/* Nav */}
      <div className="auth-nav-buttons">
        <button type="button" className="auth-btn-back" onClick={handleBack}>
          ← Kembali
        </button>
        <button type="button" className="auth-submit" onClick={handleNext} style={{ flex: 1 }}>
          Selanjutnya →
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="auth-step-panel" key="step3">
      <div className="auth-review">
        {/* Data Akun */}
        <div className="auth-review-section">
          <h4>Data Akun</h4>
          <div className="auth-review-row">
            <span className="auth-review-label">Nama Lengkap</span>
            <span className="auth-review-value">{form.name}</span>
          </div>
          <div className="auth-review-row">
            <span className="auth-review-label">Email</span>
            <span className="auth-review-value">{form.email}</span>
          </div>
          <div className="auth-review-row">
            <span className="auth-review-label">Password</span>
            <span className="auth-review-value">{'•'.repeat(form.password.length)}</span>
          </div>
        </div>

        {/* Data Profil */}
        <div className="auth-review-section">
          <h4>Data Profil & Alamat</h4>
          <div className="auth-review-row">
            <span className="auth-review-label">No. Handphone</span>
            <span className="auth-review-value">{form.phone}</span>
          </div>
          <div className="auth-review-row">
            <span className="auth-review-label">Alamat</span>
            <span className="auth-review-value">{form.address}</span>
          </div>
          <div className="auth-review-row">
            <span className="auth-review-label">Kota</span>
            <span className="auth-review-value">{form.city}</span>
          </div>
          <div className="auth-review-row">
            <span className="auth-review-label">Provinsi</span>
            <span className="auth-review-value">{form.province}</span>
          </div>
          <div className="auth-review-row">
            <span className="auth-review-label">Kode Pos</span>
            <span className="auth-review-value">{form.postalCode}</span>
          </div>
        </div>
      </div>

      {/* Agree */}
      <div style={{ marginBottom: 'var(--space-6, 1.5rem)' }}>
        <label className="auth-checkbox">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
          />
          Saya setuju dengan syarat & ketentuan yang berlaku
        </label>
      </div>

      {/* Nav */}
      <div className="auth-nav-buttons">
        <button type="button" className="auth-btn-back" onClick={handleBack}>
          ← Kembali
        </button>
        <button
          type="submit"
          className="auth-submit"
          disabled={loading || !agreed}
          style={{ flex: 1 }}
        >
          {loading ? (
            <>
              <span className="auth-spinner" />
              Mendaftarkan...
            </>
          ) : (
            '🚀 Daftar Sekarang'
          )}
        </button>
      </div>
    </div>
  );

  return (
    <div className="auth-page">
      {/* ---- Form Side ---- */}
      <div className="auth-form-side">
        <div className="auth-form-wrapper">
          {/* Brand */}
          <div className="auth-brand">
            <Link to="/" className="auth-brand-logo">
              <span className="auth-brand-icon">✈</span>
              TitipIn
            </Link>
            <p>Buat akun baru dan mulai berbelanja</p>
          </div>

          {/* Card */}
          <div className={`auth-card ${shake ? 'auth-shake' : ''}`}>
            <div className="auth-card-header">
              <h1>Daftar</h1>
              <p>Lengkapi data berikut untuk membuat akun baru</p>
            </div>

            {/* Step Progress */}
            <div className="auth-steps">
              {STEPS.map((s, i) => (
                <div className="auth-step-wrapper" key={s.num} style={{ display: 'flex', alignItems: 'center' }}>
                  <div
                    className={`auth-step ${
                      step === s.num ? 'active' : ''
                    } ${step > s.num ? 'completed' : ''}`}
                  >
                    <div className="auth-step-circle">
                      {step > s.num ? '✓' : s.num}
                    </div>
                    <span className="auth-step-label">{s.label}</span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`auth-step-line ${getLineStatus(s.num)}`} />
                  )}
                </div>
              ))}
            </div>

            {/* Step Content */}
            <form onSubmit={handleSubmit} noValidate>
              <div className="auth-step-content">
                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}
              </div>
            </form>

            {/* Footer */}
            <div className="auth-footer" style={{ marginTop: '24px' }}>
              <p>
                Sudah punya akun?{' '}
                <Link to="/login">Masuk</Link>
              </p>
              <Link to="/" className="auth-back-link">
                ← Kembali ke beranda
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ---- Decorative Side ---- */}
      <div className="auth-deco-side">
        <div className="auth-deco-bg" />
        <div className="auth-deco-overlay" />
        <div className="auth-deco-noise" />

        {/* Floating shapes */}
        <div className="auth-shape auth-shape-1" />
        <div className="auth-shape auth-shape-2" />
        <div className="auth-shape auth-shape-3" />
        <div className="auth-shape auth-shape-4" />
        <div className="auth-shape auth-shape-5" />
        <div className="auth-shape auth-shape-6" />

        <div className="auth-deco-content">
          <h2>Bergabung Bersama Kami</h2>
          <p>
            Daftar sekarang dan nikmati pengalaman belanja internasional
            yang mudah, aman, dan transparan bersama TitipIn.
          </p>
          <div className="auth-deco-features">
            <div className="auth-deco-feature">
              <span className="auth-deco-feature-icon">✨</span>
              Proses pendaftaran cepat & mudah
            </div>
            <div className="auth-deco-feature">
              <span className="auth-deco-feature-icon">🎯</span>
              Estimasi biaya transparan
            </div>
            <div className="auth-deco-feature">
              <span className="auth-deco-feature-icon">🛡</span>
              Jaminan keamanan transaksi
            </div>
            <div className="auth-deco-feature">
              <span className="auth-deco-feature-icon">⚡</span>
              Layanan cepat & responsif
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
