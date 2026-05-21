import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { COUNTRIES } from '../data/constants';
import { formatCurrency, calculateEstimate, getCountry } from '../utils/helpers';
import './Landing.css';

// Custom hook for scroll reveal
function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add('visible'); obs.unobserve(el); } },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

function RevealDiv({ children, className = '', ...props }) {
  const ref = useReveal();
  return <div ref={ref} className={`reveal ${className}`} {...props}>{children}</div>;
}

const TESTIMONIALS = [
  { name: 'Budi S.', stars: 5, text: 'Pesan AirPods dari Amazon, sampai 2 minggu. Harga all-in, gak ada biaya tambahan!' },
  { name: 'Sari D.', stars: 5, text: 'Beli skincare Korea jadi gampang banget. Tinggal paste link, bayar, tunggu. Love it!' },
  { name: 'Andi W.', stars: 4, text: 'Udah 3x order dari China, semua aman. CS-nya juga fast response.' },
  { name: 'Mega P.', stars: 5, text: 'Beli sepatu Dr. Martens UK size yang susah dicari di Indo. TitipIn solusinya!' },
  { name: 'Riko T.', stars: 5, text: 'Impor barang bulk untuk bisnis jadi lebih mudah dan legal. Recommended!' },
];

const FAQS = [
  { q: 'Apa itu jasa titip beli?', a: 'Jasa titip beli adalah layanan dimana kami membelikan produk dari toko online luar negeri atas permintaan Anda. Anda cukup kirimkan link produk, kami yang belikan, dan kirim ke alamat Anda di Indonesia.' },
  { q: 'Berapa biaya jasanya?', a: 'Biaya jasa kami adalah 6% dari harga produk. Selain itu ada ongkir internasional, bea masuk (7.5%), PPN (11%), dan PPh (10-20%). Semua sudah dihitung transparan di awal.' },
  { q: 'Berapa lama pengiriman?', a: 'Estimasi pengiriman 7-25 hari kerja tergantung negara asal. China 10-18 hari, US 12-21 hari, Singapura 7-14 hari.' },
  { q: 'Bagaimana sistem pembayaran?', a: 'Kami menggunakan sistem 2 tahap. Tahap 1: bayar harga produk + pajak + fee. Tahap 2: bayar ongkir domestik setelah barang ditimbang di gudang kami.' },
  { q: 'Apakah barang dijamin aman?', a: 'Ya! Setiap barang dicek kondisinya di gudang kami sebelum dikirim. Kami juga menyediakan packing ekstra untuk barang fragile.' },
  { q: 'Bisa beli barang apa saja?', a: 'Hampir semua produk bisa dititipkan. Pengecualian untuk barang ilegal, obat-obatan tertentu, dan produk yang memerlukan izin khusus (BPOM, Kominfo).' },
];

const ADVANTAGES = [
  { icon: '💎', title: 'Harga Transparan', desc: 'Semua biaya dihitung di awal, tanpa biaya tersembunyi' },
  { icon: '🛡️', title: 'Garansi Barang', desc: 'Barang dicek di gudang sebelum dikirim ke Anda' },
  { icon: '🌍', title: 'Gudang Luar Negeri', desc: 'Gudang sendiri di 6 negara untuk pengiriman lebih cepat' },
  { icon: '💬', title: 'CS Responsif', desc: 'Tim support siap membantu via WhatsApp 24/7' },
  { icon: '🚀', title: 'Pengiriman Cepat', desc: 'Estimasi 7-25 hari kerja sampai di tangan Anda' },
  { icon: '🧾', title: 'Pengurusan Customs', desc: 'Kami urus semua dokumen bea cukai & pajak impor' },
];

export default function Landing() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [urlInput, setUrlInput] = useState('');

  // Calculator state
  const [calcCountry, setCalcCountry] = useState('CN');
  const [calcPrice, setCalcPrice] = useState('');
  const [calcWeight, setCalcWeight] = useState('');
  const [calcNpwp, setCalcNpwp] = useState(false);
  const [calcResult, setCalcResult] = useState(null);

  // Testimonial carousel
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  // FAQ
  const [openFaq, setOpenFaq] = useState(null);

  // Navbar scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Auto-rotate testimonials
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial(prev => (prev + 1) % TESTIMONIALS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Calculator
  const updateCalc = useCallback(() => {
    if (!calcPrice || !calcWeight) { setCalcResult(null); return; }
    const country = getCountry(calcCountry);
    if (!country) return;
    const result = calculateEstimate(calcCountry, parseFloat(calcPrice), country.currency, parseFloat(calcWeight), calcNpwp);
    setCalcResult(result);
  }, [calcCountry, calcPrice, calcWeight, calcNpwp]);

  useEffect(() => { updateCalc(); }, [updateCalc]);

  const selectedCountry = getCountry(calcCountry);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      navigate('/register');
    }
  };

  return (
    <div className="landing-page">
      {/* NAVBAR */}
      <nav className={`landing-nav ${scrolled ? 'scrolled' : ''}`}>
        <Link to="/" className="nav-logo">
          <div className="nav-logo-icon">🛍️</div>
          <span>TitipIn</span>
        </Link>
        <div className="nav-links">
          <a href="#cara-kerja" onClick={(e) => { e.preventDefault(); scrollTo('cara-kerja'); }}>Cara Kerja</a>
          <a href="#layanan" onClick={(e) => { e.preventDefault(); scrollTo('layanan'); }}>Layanan</a>
          <a href="#kalkulator" onClick={(e) => { e.preventDefault(); scrollTo('kalkulator'); }}>Kalkulator</a>
          <a href="#faq" onClick={(e) => { e.preventDefault(); scrollTo('faq'); }}>FAQ</a>
        </div>
        <div className="nav-actions">
          <Link to="/login" className="btn btn-ghost" style={{ color: 'var(--text-secondary)' }}>Masuk</Link>
          <Link to="/register" className="btn btn-primary">Daftar Gratis</Link>
        </div>
        <button className="nav-mobile-btn" onClick={() => navigate('/login')}>☰</button>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-glow hero-glow-1" />
        <div className="hero-glow hero-glow-2" />
        <div className="hero-glow hero-glow-3" />
        <div className="hero-content">
          <div className="hero-badge">✨ Jasa Titip Beli Terpercaya #1</div>
          <h1>Belanja dari Luar Negeri, Semudah Belanja Online</h1>
          <p className="hero-subtitle">
            Jasa titip beli terpercaya dari China, Amerika, Singapura, Korea, Inggris & Hong Kong.
            Terima beres, bayar dalam Rupiah.
          </p>

          <div className="hero-search">
            <div className="hero-search-inner">
              <input
                type="text"
                className="hero-search-input"
                placeholder="Paste link produk dari luar negeri..."
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
              />
              <button className="hero-search-btn" onClick={handleUrlSubmit}>
                Cek Harga →
              </button>
            </div>
          </div>

          <div className="hero-trust">
            <div className="trust-item">
              <span className="trust-value">10,000+</span> Pesanan
            </div>
            <div className="trust-item">
              <span className="trust-value">6</span> Negara
            </div>
            <div className="trust-item">
              ⭐ <span className="trust-value">4.9</span> Rating
            </div>
          </div>
        </div>
      </section>

      {/* COUNTRIES */}
      <section className="section" id="layanan">
        <div className="container">
          <RevealDiv className="section-header">
            <h2>Belanja dari 6 Negara</h2>
            <p>Kami memiliki gudang sendiri di setiap negara untuk memastikan pengiriman cepat dan aman</p>
          </RevealDiv>
          <div className="countries-grid">
            {COUNTRIES.map((c, i) => (
              <RevealDiv key={c.id} className="country-card" style={{ '--card-color': c.color, animationDelay: `${i * 0.1}s` }}>
                <div className="country-flag">{c.flag}</div>
                <h3>{c.name}</h3>
                <div className="country-currency">{c.currency} ({c.currencySymbol})</div>
                <div className="country-stores">
                  {c.stores.map(s => <span key={s}>{s}</span>)}
                </div>
                <div className="country-meta">
                  <span>📦 {c.deliveryDays} hari</span>
                  <span>💰 {formatCurrency(c.shippingPerKg)}/kg</span>
                </div>
              </RevealDiv>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section" id="cara-kerja" style={{ background: 'var(--bg-secondary)' }}>
        <div className="container">
          <RevealDiv className="section-header">
            <h2>Cara Kerja</h2>
            <p>Hanya 4 langkah mudah untuk mendapatkan barang impian dari luar negeri</p>
          </RevealDiv>
          <div className="steps-container">
            {[
              { icon: '📋', title: 'Paste Link Produk', desc: 'Temukan produk di toko online luar negeri & paste linknya' },
              { icon: '💰', title: 'Dapat Harga Total', desc: 'Kami hitung harga produk + ongkir + pajak dalam Rupiah' },
              { icon: '💳', title: 'Bayar & Tunggu', desc: 'Bayar via transfer/e-wallet, kami belikan & kirim ke gudang' },
              { icon: '📦', title: 'Terima Barang', desc: 'Barang sampai di rumah Anda, aman & terjamin' },
            ].map((step, i) => (
              <RevealDiv key={i} className="step-card" style={{ animationDelay: `${i * 0.15}s` }}>
                <div className="step-icon">
                  <span className="step-number">{i + 1}</span>
                  {step.icon}
                </div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </RevealDiv>
            ))}
          </div>
        </div>
      </section>

      {/* ADVANTAGES */}
      <section className="section">
        <div className="container">
          <RevealDiv className="section-header">
            <h2>Kenapa TitipIn?</h2>
            <p>Kami memberikan layanan terbaik agar pengalaman belanja impor Anda menyenangkan</p>
          </RevealDiv>
          <div className="advantages-grid">
            {ADVANTAGES.map((adv, i) => (
              <RevealDiv key={i} className="advantage-card" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="advantage-icon">{adv.icon}</div>
                <h3>{adv.title}</h3>
                <p>{adv.desc}</p>
              </RevealDiv>
            ))}
          </div>
        </div>
      </section>

      {/* CALCULATOR */}
      <section className="section" id="kalkulator" style={{ background: 'var(--bg-secondary)' }}>
        <div className="container">
          <RevealDiv className="section-header">
            <h2>Kalkulator Estimasi Harga</h2>
            <p>Hitung estimasi total biaya belanja Anda secara transparan</p>
          </RevealDiv>
          <RevealDiv className="calc-container">
            <div className="calc-form">
              <label className="form-label" style={{ marginBottom: 'var(--space-3)' }}>Pilih Negara</label>
              <div className="calc-countries">
                {COUNTRIES.map(c => (
                  <button
                    key={c.id}
                    className={`calc-country-btn ${calcCountry === c.id ? 'active' : ''}`}
                    onClick={() => setCalcCountry(c.id)}
                  >
                    <span className="flag">{c.flag}</span>
                    {c.id}
                  </button>
                ))}
              </div>

              <div className="form-group">
                <label className="form-label">Harga Produk ({selectedCountry?.currencySymbol} {selectedCountry?.currency})</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder={`Contoh: ${selectedCountry?.currency === 'CNY' ? '199' : selectedCountry?.currency === 'KRW' ? '89000' : '49.99'}`}
                  value={calcPrice}
                  onChange={(e) => setCalcPrice(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Estimasi Berat (kg)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="Contoh: 0.5"
                  step="0.1"
                  value={calcWeight}
                  onChange={(e) => setCalcWeight(e.target.value)}
                />
              </div>

              <label className="npwp-toggle">
                <input type="checkbox" checked={calcNpwp} onChange={(e) => setCalcNpwp(e.target.checked)} />
                Punya NPWP? Hemat pajak hingga 10%
              </label>
            </div>

            <div className="calc-result">
              <h3>Estimasi Biaya</h3>
              {calcResult ? (
                <>
                  <div className="calc-row"><span className="label">Harga Produk (IDR)</span><span className="value">{formatCurrency(calcResult.itemTotal)}</span></div>
                  <div className="calc-row"><span className="label">Biaya Jasa (6%)</span><span className="value">{formatCurrency(calcResult.serviceFee)}</span></div>
                  <div className="calc-row"><span className="label">Ongkir Internasional</span><span className="value">{formatCurrency(calcResult.shippingIntl)}</span></div>
                  <div className="calc-divider" />
                  <div className="calc-row"><span className="label">Bea Masuk (7.5%)</span><span className="value">{formatCurrency(calcResult.importDuty)}</span></div>
                  <div className="calc-row"><span className="label">PPN (11%)</span><span className="value">{formatCurrency(calcResult.ppn)}</span></div>
                  <div className="calc-row"><span className="label">PPh ({calcResult.pphRate}%)</span><span className="value">{formatCurrency(calcResult.pph)}</span></div>
                  <div className="calc-divider" />
                  <div className="calc-total">
                    <span className="label">Total Estimasi</span>
                    <span className="value">{formatCurrency(calcResult.total)}</span>
                  </div>
                </>
              ) : (
                <div style={{ color: 'var(--text-tertiary)', textAlign: 'center', padding: 'var(--space-8) 0', fontSize: 'var(--text-sm)' }}>
                  Masukkan harga dan berat produk untuk melihat estimasi biaya
                </div>
              )}
            </div>
          </RevealDiv>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="section">
        <div className="container">
          <RevealDiv className="section-header">
            <h2>Apa Kata Mereka</h2>
            <p>Ribuan pelanggan puas telah menggunakan layanan TitipIn</p>
          </RevealDiv>
          <RevealDiv className="testimonials-wrapper">
            <div className="testimonials-track" style={{ transform: `translateX(-${currentTestimonial * 100}%)` }}>
              {TESTIMONIALS.map((t, i) => (
                <div key={i} className="testimonial-card">
                  <div className="testimonial-inner">
                    <div className="testimonial-avatar">{t.name.split(' ').map(w => w[0]).join('')}</div>
                    <div className="testimonial-stars">{'★'.repeat(t.stars)}{'☆'.repeat(5 - t.stars)}</div>
                    <p className="testimonial-text">"{t.text}"</p>
                    <div className="testimonial-name">{t.name}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="testimonial-dots">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  className={`testimonial-dot ${i === currentTestimonial ? 'active' : ''}`}
                  onClick={() => setCurrentTestimonial(i)}
                />
              ))}
            </div>
          </RevealDiv>
        </div>
      </section>

      {/* FAQ */}
      <section className="section" id="faq" style={{ background: 'var(--bg-secondary)' }}>
        <div className="container">
          <RevealDiv className="section-header">
            <h2>Pertanyaan Umum</h2>
            <p>Jawaban untuk pertanyaan yang sering ditanyakan</p>
          </RevealDiv>
          <div className="faq-list">
            {FAQS.map((faq, i) => (
              <RevealDiv key={i} className={`faq-item ${openFaq === i ? 'open' : ''}`} style={{ animationDelay: `${i * 0.05}s` }}>
                <button className="faq-question" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  {faq.q}
                  <span className="faq-chevron">▼</span>
                </button>
                <div className="faq-answer">
                  <div className="faq-answer-inner">{faq.a}</div>
                </div>
              </RevealDiv>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <RevealDiv className="cta-card">
          <h2>Siap Belanja dari Luar Negeri?</h2>
          <p>Daftar sekarang dan mulai belanja produk impian Anda dari seluruh dunia</p>
          <div className="cta-buttons">
            <Link to="/register" className="cta-btn-white">Daftar Gratis</Link>
            <a href="https://wa.me/6281234567890" target="_blank" rel="noopener noreferrer" className="cta-btn-outline-white">
              Hubungi Kami
            </a>
          </div>
        </RevealDiv>
      </section>

      {/* FOOTER */}
      <footer className="landing-footer">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="nav-logo">
              <div className="nav-logo-icon">🛍️</div>
              <span>TitipIn</span>
            </div>
            <p>Platform jasa titip beli terpercaya dari luar negeri. Belanja produk impian dari 6 negara dengan mudah, aman, dan transparan.</p>
          </div>
          <div className="footer-col">
            <h4>Layanan</h4>
            <ul>
              <li><a href="#layanan" onClick={(e) => { e.preventDefault(); scrollTo('layanan'); }}>Negara Layanan</a></li>
              <li><a href="#kalkulator" onClick={(e) => { e.preventDefault(); scrollTo('kalkulator'); }}>Kalkulator Harga</a></li>
              <li><a href="#cara-kerja" onClick={(e) => { e.preventDefault(); scrollTo('cara-kerja'); }}>Cara Kerja</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Bantuan</h4>
            <ul>
              <li><a href="#faq" onClick={(e) => { e.preventDefault(); scrollTo('faq'); }}>FAQ</a></li>
              <li><a href="#">Syarat & Ketentuan</a></li>
              <li><a href="#">Kebijakan Privasi</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Kontak</h4>
            <ul>
              <li><a href="https://wa.me/6281234567890" target="_blank" rel="noopener noreferrer">📱 WhatsApp</a></li>
              <li><a href="mailto:hello@titipin.com">📧 hello@titipin.com</a></li>
              <li><a href="#">📍 Jakarta, Indonesia</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          © 2026 TitipIn. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
