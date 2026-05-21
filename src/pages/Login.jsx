import { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { isValidEmail } from '../utils/helpers';
import './Auth.css';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const toast = useToast();

  const [form, setForm] = useState({ email: '', password: '' });
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

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

  const validate = () => {
    const errs = {};
    if (!form.email.trim()) {
      errs.email = 'Email wajib diisi';
    } else if (!isValidEmail(form.email)) {
      errs.email = 'Format email tidak valid';
    }
    if (!form.password) {
      errs.password = 'Password wajib diisi';
    } else if (form.password.length < 3) {
      errs.password = 'Password minimal 3 karakter';
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      triggerShake();
      return;
    }

    setLoading(true);
    // Simulate a short delay for UX
    await new Promise((r) => setTimeout(r, 600));

    const result = login(form.email, form.password);
    setLoading(false);

    if (!result.success) {
      toast.error('Login Gagal', result.error);
      setErrors({ email: ' ', password: result.error });
      triggerShake();
      return;
    }

    toast.success('Selamat Datang!', `Halo, ${result.user.name}`);

    if (result.user.role === 'admin') {
      navigate('/admin', { replace: true });
    } else {
      navigate('/dashboard', { replace: true });
    }
  };

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
            <p>Jasa titip beli luar negeri terpercaya</p>
          </div>

          {/* Card */}
          <div className={`auth-card ${shake ? 'auth-shake' : ''}`}>
            <div className="auth-card-header">
              <h1>Masuk</h1>
              <p>Silakan masuk ke akun Anda untuk melanjutkan</p>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              {/* Email */}
              <div className="auth-field">
                <div className="auth-field-inner">
                  <input
                    type="email"
                    name="email"
                    id="login-email"
                    className={`auth-input ${errors.email ? 'has-error' : ''} ${form.email ? 'filled' : ''}`}
                    placeholder="Email"
                    value={form.email}
                    onChange={handleChange}
                    autoComplete="email"
                  />
                  <label htmlFor="login-email" className="auth-label">
                    Alamat Email
                  </label>
                  <span className="auth-field-icon">✉</span>
                </div>
                {errors.email && errors.email.trim() && (
                  <div className="auth-field-error">⚠ {errors.email}</div>
                )}
              </div>

              {/* Password */}
              <div className="auth-field">
                <div className="auth-field-inner">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    id="login-password"
                    className={`auth-input ${errors.password ? 'has-error' : ''} ${form.password ? 'filled' : ''}`}
                    placeholder="Password"
                    value={form.password}
                    onChange={handleChange}
                    autoComplete="current-password"
                    style={{ paddingRight: '48px' }}
                  />
                  <label htmlFor="login-password" className="auth-label">
                    Password
                  </label>
                  <button
                    type="button"
                    className="auth-toggle-pw"
                    onClick={() => setShowPassword((v) => !v)}
                    tabIndex={-1}
                    aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                  >
                    {showPassword ? '🙈' : '👁'}
                  </button>
                </div>
                {errors.password && errors.password.trim() && (
                  <div className="auth-field-error">⚠ {errors.password}</div>
                )}
              </div>

              {/* Remember + Forgot */}
              <div className="auth-checkbox-row">
                <label className="auth-checkbox">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                  />
                  Ingat Saya
                </label>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="auth-submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="auth-spinner" />
                    Memproses...
                  </>
                ) : (
                  'Masuk'
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="auth-footer">
              <p>
                Belum punya akun?{' '}
                <Link to="/register">Daftar sekarang</Link>
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
          <h2>Belanja dari Seluruh Dunia</h2>
          <p>
            Nikmati kemudahan berbelanja dari luar negeri dengan layanan
            jasa titip premium kami. Aman, terpercaya, dan transparan.
          </p>
          <div className="auth-deco-features">
            <div className="auth-deco-feature">
              <span className="auth-deco-feature-icon">🌍</span>
              Belanja dari 10+ negara
            </div>
            <div className="auth-deco-feature">
              <span className="auth-deco-feature-icon">🔒</span>
              Transaksi aman & terproteksi
            </div>
            <div className="auth-deco-feature">
              <span className="auth-deco-feature-icon">📦</span>
              Tracking real-time pengiriman
            </div>
            <div className="auth-deco-feature">
              <span className="auth-deco-feature-icon">💎</span>
              Layanan premium terpercaya
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
