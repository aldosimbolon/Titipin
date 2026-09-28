import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { LEGAL_DOCS, CONTACT } from './legalContent';
import '../Landing.css';
import './LegalPage.css';

function renderBlock(block, i) {
  switch (block.type) {
    case 'p':
      return <p key={i}>{block.text}</p>;
    case 'ul':
      return (
        <ul key={i}>
          {block.items.map((item) => <li key={item}>{item}</li>)}
        </ul>
      );
    case 'ol':
      return (
        <ol key={i}>
          {block.items.map((item) => <li key={item}>{item}</li>)}
        </ol>
      );
    case 'contact':
      return (
        <div key={i} className="legal-contact">
          <a href={`mailto:${CONTACT.email}`}>
            <span className="material-symbols-outlined">mail</span>{CONTACT.email}
          </a>
          <a href={`https://wa.me/${CONTACT.whatsapp}`} target="_blank" rel="noopener noreferrer">
            <span className="material-symbols-outlined">chat</span>WhatsApp {CONTACT.whatsappLabel}
          </a>
          <span>
            <span className="material-symbols-outlined">location_on</span>{CONTACT.location}
          </span>
        </div>
      );
    default:
      return null;
  }
}

export default function LegalPage({ type }) {
  const doc = LEGAL_DOCS[type];
  const other = LEGAL_DOCS[type === 'terms' ? 'privacy' : 'terms'];
  const [activeId, setActiveId] = useState(doc.sections[0].id);

  // Mulai dari atas & set judul tab tiap pindah halaman
  useEffect(() => {
    window.scrollTo(0, 0);
    const previousTitle = document.title;
    document.title = `${doc.title} | TitipIn`;
    setActiveId(doc.sections[0].id);
    return () => { document.title = previousTitle; };
  }, [doc]);

  // Tandai bagian yang sedang dibaca pada daftar isi
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length) setActiveId(visible[0].target.id);
      },
      { rootMargin: '-96px 0px -65% 0px' }
    );
    doc.sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [doc]);

  const goTo = (e, id) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActiveId(id);
  };

  return (
    <div className="landing-page legal-page animate-fade-in">
      {/* NAVBAR */}
      <nav className="landing-nav scrolled">
        <Link to="/" className="nav-logo" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img src="/logo.png" alt="TitipIn Logo" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
          <span style={{ fontSize: '24px', fontWeight: '700', color: 'var(--primary-start)' }}>TitipIn</span>
        </Link>
        <div className="nav-links">
          <NavLink to="/" end>Beranda</NavLink>
          {Object.values(LEGAL_DOCS).map((d) => (
            <NavLink key={d.path} to={d.path}>{d.navLabel}</NavLink>
          ))}
        </div>
        <div className="nav-actions">
          <Link to="/login" className="btn btn-ghost" style={{ color: 'var(--text-secondary)' }}>Masuk</Link>
          <Link to="/register" className="btn btn-primary" style={{ background: 'var(--primary-gradient)', color: 'white' }}>Daftar Gratis</Link>
        </div>
      </nav>

      {/* HEADER */}
      <header className="legal-hero">
        <div className="legal-hero-inner">
          <Link to="/" className="legal-back">
            <span className="material-symbols-outlined">arrow_back</span>Kembali ke Beranda
          </Link>
          <h1>{doc.title}</h1>
          <p className="legal-intro">{doc.intro}</p>
        </div>
      </header>

      {/* ISI */}
      <main className="legal-layout">
        <aside className="legal-toc" aria-label="Daftar isi">
          <h2>Daftar Isi</h2>
          <ol>
            {doc.sections.map((s, i) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className={activeId === s.id ? 'active' : ''}
                  onClick={(e) => goTo(e, s.id)}
                >
                  <span>{i + 1}.</span> {s.title}
                </a>
              </li>
            ))}
          </ol>
        </aside>

        <article className="legal-content">
          {doc.sections.map((s, i) => (
            <section key={s.id} id={s.id}>
              <h2><span>{i + 1}.</span> {s.title}</h2>
              {s.blocks.map(renderBlock)}
            </section>
          ))}

          <Link to={other.path} className="legal-next">
            <div>
              <small>Baca juga</small>
              <strong>{other.title}</strong>
            </div>
            <span className="material-symbols-outlined">arrow_forward</span>
          </Link>
        </article>
      </main>

      {/* FOOTER */}
      <footer className="landing-footer legal-footer">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="nav-logo" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-4)' }}>
              <img src="/logo.png" alt="TitipIn Logo" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
              <span style={{ fontSize: '20px', fontWeight: '700', color: 'var(--primary-start)' }}>TitipIn</span>
            </div>
            <p>Platform jasa titip beli terpercaya dari luar negeri. Belanja produk impian dari 6 negara dengan mudah, aman, dan transparan.</p>
          </div>
          <div className="footer-col">
            <h4>Bantuan</h4>
            <ul>
              {Object.values(LEGAL_DOCS).map((d) => (
                <li key={d.path}><Link to={d.path}>{d.navLabel}</Link></li>
              ))}
            </ul>
          </div>
          <div className="footer-col">
            <h4>Kontak</h4>
            <ul>
              <li><a href={`https://wa.me/${CONTACT.whatsapp}`} target="_blank" rel="noopener noreferrer">📱 WhatsApp</a></li>
              <li><a href={`mailto:${CONTACT.email}`}>📧 {CONTACT.email}</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">© 2026 TitipIn. All rights reserved.</div>
      </footer>
    </div>
  );
}
