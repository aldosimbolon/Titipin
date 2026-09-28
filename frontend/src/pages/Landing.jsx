import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { COUNTRIES } from '../data/constants';
import { formatCurrency, calculateEstimate, getCountry } from '../utils/helpers';
import './Landing.css';

function RevealDiv({ children, className = '', ...props }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          obs.unobserve(el);
        }
      },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${isVisible ? 'visible' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
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
  { icon: 'payments', title: 'Harga Transparan', desc: 'Semua biaya dihitung di awal, tanpa biaya tersembunyi' },
  { icon: 'verified_user', title: 'Garansi Barang', desc: 'Barang dicek di gudang sebelum dikirim ke Anda' },
  { icon: 'language', title: 'Gudang Luar Negeri', desc: 'Gudang sendiri di 6 negara untuk pengiriman lebih cepat' },
  { icon: 'forum', title: 'CS Responsif', desc: 'Tim support siap membantu via WhatsApp 24/7' },
  { icon: 'speed', title: 'Pengiriman Cepat', desc: 'Estimasi 7-25 hari kerja sampai di tangan Anda' },
  { icon: 'receipt_long', title: 'Pengurusan Customs', desc: 'Kami urus semua dokumen bea cukai & pajak impor' },
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
    <div className="landing-page animate-fade-in">
      {/* NAVBAR */}
      <nav className={`landing-nav ${scrolled ? 'scrolled' : ''}`}>
        <Link to="/" className="nav-logo" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img src="/logo.png" alt="TitipIn Logo" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
          <span style={{ fontSize: '24px', fontWeight: '700', color: 'var(--primary-start)' }}>TitipIn</span>
        </Link>
        <div className="nav-links">
          <a href="#cara-kerja" onClick={(e) => { e.preventDefault(); scrollTo('cara-kerja'); }}>Cara Kerja</a>
          <a href="#layanan" onClick={(e) => { e.preventDefault(); scrollTo('layanan'); }}>Layanan</a>
          <a href="#kalkulator" onClick={(e) => { e.preventDefault(); scrollTo('kalkulator'); }}>Kalkulator</a>
          <a href="#faq" onClick={(e) => { e.preventDefault(); scrollTo('faq'); }}>FAQ</a>
        </div>
        <div className="nav-actions">
          <Link to="/login" className="btn btn-ghost" style={{ color: 'var(--text-secondary)' }}>Masuk</Link>
          <Link to="/register" className="btn btn-primary" style={{ background: 'var(--primary-gradient)', color: 'white' }}>Daftar Gratis</Link>
        </div>
        <button className="nav-mobile-btn" onClick={() => navigate('/login')}>
          <span className="material-symbols-outlined">menu</span>
        </button>
      </nav>

      {/* HERO SECTION (Splitscreen Grid) */}
      <section className="hero-split-section">
        <div className="hero-split-grid">
          <div className="hero-split-left">
            <div className="hero-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: 'rgba(0, 105, 84, 0.08)', borderRadius: 'var(--radius-full)', fontWeight: '600', color: 'var(--primary-start)', fontSize: '12px', marginBottom: 'var(--space-2)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>public</span>
              <span>Layanan Pembelian Global No. 1</span>
            </div>
            <h1 style={{ fontSize: 'clamp(2.2rem, 4vw, 3.6rem)', fontWeight: '800', lineHeight: '1.15', color: 'var(--text-primary)', margin: '0 0 var(--space-4)' }}>
              Belanja Barang dari Luar Negeri <span style={{ color: 'var(--primary-start)', background: 'linear-gradient(135deg, #006954 0%, #00846a 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Jadi Lebih Mudah</span>
            </h1>
            <p className="hero-subtitle" style={{ fontSize: '16px', color: 'var(--text-secondary)', lineHeight: '1.7', margin: '0 0 var(--space-6)', maxWidth: '580px' }}>
              TitipIn membantu Anda membeli barang dari berbagai negara tanpa ribet urus cukai dan pengiriman internasional. Cukup titip link produk yang Anda inginkan, kami urus sisanya dengan transparansi penuh.
            </p>

            <div className="hero-search-container" style={{ width: '100%', maxWidth: '560px', marginBottom: 'var(--space-6)' }}>
              <div className="hero-search-box" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '6px 8px 6px 16px', backgroundColor: 'white', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-xl)', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
                <span className="material-symbols-outlined" style={{ color: 'var(--text-tertiary)' }}>link</span>
                <input
                  type="text"
                  placeholder="Paste link produk dari luar negeri..."
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
                  style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: '15px', color: 'var(--text-primary)', padding: '8px 0' }}
                />
                <button
                  onClick={handleUrlSubmit}
                  style={{ background: 'var(--primary-gradient)', color: 'white', border: 'none', padding: '10px 20px', borderRadius: 'var(--radius-lg)', fontWeight: '700', fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s' }}
                >
                  Cek Harga
                </button>
              </div>
            </div>

            <div className="hero-action-buttons" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <button
                className="btn btn-primary"
                onClick={() => navigate('/register')}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: 'var(--radius-md)', fontWeight: '700', background: 'var(--primary-gradient)', color: 'white', border: 'none', cursor: 'pointer' }}
              >
                <span>Mulai Belanja</span>
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
              <button
                className="btn btn-outline"
                onClick={() => scrollTo('layanan')}
                style={{ padding: '12px 24px', borderRadius: 'var(--radius-md)', fontWeight: '700', border: '1px solid var(--glass-border)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                Lihat Kurs &amp; Tarif
              </button>
            </div>
          </div>

          <div className="hero-split-right">
            <div className="hero-image-wrapper" style={{ position: 'relative', width: '100%', height: '480px', borderRadius: 'var(--radius-xl)', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCMH2Cl7IXYStwj7mTqj03SOTDBUsY9KJK-87ecG16hsgHWFbQ4ijjJ1GDyfylgqY2aclzmRPi96y6UHHNpbxuuwenQGiYzUH1aBZf-VbdKU0Hfx_ZTGPYmQs28VURGoByiARm_Wszx-Ru3jSkyhM4vt8_SkXO14cGLDuFtzIpoXlivW-WgLPEE3MGXDxGENwTrPZQy6-gY5cGi5al4Dt6AEwOqXEN8y_558MFY_8UOeJVg44oekyJbr0RajgyFtN3Tuw-9qsU1CkBf"
                alt="Global Logistics Supply Chain"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div className="floating-status-card" style={{ position: 'absolute', bottom: '24px', right: '24px', background: 'rgba(255, 255, 255, 0.92)', backdropFilter: 'blur(12px)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-lg)', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 8px 30px rgba(0,0,0,0.06)' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--success-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-start)' }}>
                  <span className="material-symbols-outlined fill" style={{ fontSize: '20px' }}>check_circle</span>
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '10px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status Pengiriman</span>
                  <span style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>Tiba di Jakarta</span>
                </div>
              </div>
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
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>schedule</span>
                    {c.deliveryDays} hari
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>payments</span>
                    {formatCurrency(c.shippingPerKg)}/kg
                  </span>
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
              { icon: 'link', title: 'Paste Link Produk', desc: 'Temukan produk di toko online luar negeri & paste linknya' },
              { icon: 'calculate', title: 'Dapat Harga Total', desc: 'Kami hitung harga produk + ongkir + pajak dalam Rupiah' },
              { icon: 'payments', title: 'Bayar & Tunggu', desc: 'Bayar via transfer/e-wallet, kami belikan & kirim ke gudang' },
              { icon: 'local_shipping', title: 'Terima Barang', desc: 'Barang sampai di rumah Anda, aman & terjamin' },
            ].map((step, i) => (
              <RevealDiv key={i} className="step-card" style={{ animationDelay: `${i * 0.15}s` }}>
                <div className="step-icon">
                  <span className="step-number">{i + 1}</span>
                  <span className="material-symbols-outlined" style={{ fontSize: '32px', color: 'var(--primary-start)' }}>{step.icon}</span>
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
                <div className="advantage-icon">
                  <span className="material-symbols-outlined" style={{ fontSize: '28px', color: 'var(--primary-start)' }}>{adv.icon}</span>
                </div>
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
                  <span className="faq-chevron material-symbols-outlined">expand_more</span>
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
            <a href="https://wa.me/6285361800094" target="_blank" rel="noopener noreferrer" className="cta-btn-outline-white">
              Hubungi Kami
            </a>
          </div>
        </RevealDiv>
      </section>

      {/* FOOTER */}
      <footer className="landing-footer">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="nav-logo" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-4)' }}>
              <img src="/logo.png" alt="TitipIn Logo" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
              <span style={{ fontSize: '20px', fontWeight: '700', color: 'var(--primary-start)' }}>TitipIn</span>
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
              <li><Link to="/syarat-ketentuan">Syarat & Ketentuan</Link></li>
              <li><Link to="/kebijakan-privasi">Kebijakan Privasi</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Kontak</h4>
            <ul>
              <li><a href="https://wa.me/6285361800094" target="_blank" rel="noopener noreferrer">📱 WhatsApp</a></li>
              <li><a href="mailto:aldosimbolon017@gmail.com">📧 aldosimbolon017@gmail.com</a></li>
              <li><a href="https://maps.app.goo.gl/UkGxRUYDgehRreuc6">📍 Medan, Indonesia</a></li>
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
