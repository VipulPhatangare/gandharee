import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { Menu as MenuIcon, Download, Printer, QrCode, Copy, Check } from 'lucide-react';
import QRCode from 'qrcode';

const TABLES = Array.from({ length: 10 }, (_, i) => i + 1);

const TableQRCard = ({ table, baseUrl }) => {
  const canvasRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const url = `${baseUrl}/menu?table=${table}`;

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, url, {
        width: 200,
        margin: 2,
        color: { dark: '#0A0A0A', light: '#F5F0E8' },
        errorCorrectionLevel: 'H',
      });
    }
  }, [url]);

  const handleDownload = () => {
    QRCode.toDataURL(url, {
      width: 600,
      margin: 3,
      color: { dark: '#0A0A0A', light: '#FFFFFF' },
      errorCorrectionLevel: 'H',
    }).then((dataUrl) => {
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `table-${table}-qr.png`;
      a.click();
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="glass-card"
      style={{
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem',
        position: 'relative',
        overflow: 'hidden',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 20px 48px rgba(212,175,55,0.15)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      {/* Table number badge */}
      <div style={{
        position: 'absolute', top: '12px', left: '12px',
        background: 'linear-gradient(135deg, #F0D060, #D4AF37)',
        color: '#0A0A0A', borderRadius: '8px', padding: '4px 10px',
        fontSize: '0.7rem', fontWeight: 800, letterSpacing: '1px',
        textTransform: 'uppercase',
      }}>
        Table {table}
      </div>

      {/* QR Canvas */}
      <div style={{
        padding: '10px', background: '#F5F0E8', borderRadius: '12px',
        marginTop: '1rem', boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
      }}>
        <canvas ref={canvasRef} style={{ display: 'block', borderRadius: '6px' }} />
      </div>

      {/* URL display */}
      <p style={{
        fontSize: '0.65rem', color: '#6B6560', textAlign: 'center',
        wordBreak: 'break-all', maxWidth: '180px', lineHeight: 1.4,
      }}>
        {url}
      </p>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
        <button
          onClick={handleCopy}
          style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            padding: '8px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(255,255,255,0.04)', color: copied ? '#2ECC71' : '#A0998A',
            cursor: 'pointer', fontSize: '0.75rem', fontWeight: 500, transition: 'all 0.2s',
          }}
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
          {copied ? 'Copied!' : 'Copy Link'}
        </button>
        <button
          onClick={handleDownload}
          style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            padding: '8px', borderRadius: '8px', border: '1px solid rgba(212,175,55,0.3)',
            background: 'rgba(212,175,55,0.08)', color: '#D4AF37',
            cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, transition: 'all 0.2s',
          }}
        >
          <Download size={13} />
          Download
        </button>
      </div>
    </div>
  );
};

const QRCodes = () => {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [baseUrl, setBaseUrl] = useState('http://localhost:5173');
  const [customUrl, setCustomUrl] = useState('');

  const handlePrintAll = () => window.print();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0A0A0A' }}>
      <AdminSidebar mobileOpen={mobileMenu} setMobileOpen={setMobileMenu} />

      <main style={{ flex: 1, overflowX: 'hidden', minWidth: 0 }}>
        {/* Mobile header */}
        <div className="admin-mobile-header" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', background: '#111' }}>
          <button onClick={() => setMobileMenu(true)} style={{ background: 'none', border: 'none', color: '#F5F0E8', cursor: 'pointer', display: 'flex' }}><MenuIcon size={22} /></button>
          <span style={{ color: '#F5F0E8', fontWeight: 600 }}>QR Code Manager</span>
        </div>

        <div style={{ padding: '2rem 1.5rem', maxWidth: '1200px' }}>
          {/* Header */}
          <div style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', padding: '12px 16px', borderRadius: '10px', marginBottom: '1.5rem' }}>
            <p style={{ color: '#818CF8', fontSize: '0.85rem', fontWeight: 600 }}>💡 Pro Tip for Google Lens / Mobile Testing</p>
            <p style={{ color: '#A0998A', fontSize: '0.8rem', marginTop: '4px' }}>
               If you want to scan these QR codes on your phone right now, change the base URL below from <strong>localhost</strong> to your computer's <strong>Local Wi-Fi IP address</strong> (e.g. http://192.168.1.5:5173).
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <p style={{ fontSize: '0.75rem', color: '#D4AF37', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '0.25rem' }}>Admin</p>
              <h1 className="font-display" style={{ fontSize: '2rem', fontWeight: 700, color: '#F5F0E8', display: 'flex', alignItems: 'center', gap: '12px' }}>
                QR Code Manager
              </h1>
              <p style={{ color: '#6B6560', marginTop: '0.5rem', fontSize: '0.9rem' }}>
                10 unique QR codes — one per table. Customers scan to open the menu with their table pre-filled.
              </p>
            </div>
            <button
              onClick={handlePrintAll}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#F5F0E8', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}
            >
              <Printer size={16} />
              Print All QR Codes
            </button>
          </div>

          {/* Custom URL input */}
          <div className="glass-card" style={{ padding: '1.25rem 1.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '240px' }}>
              <p style={{ fontSize: '0.72rem', color: '#6B6560', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>
                Restaurant URL (update for production deployment)
              </p>
              <input
                type="text"
                value={customUrl || baseUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="http://localhost:5173"
                className="input-gold"
                style={{ padding: '10px 14px' }}
              />
            </div>
            <button
              onClick={() => { if (customUrl) setBaseUrl(customUrl.replace(/\/$/, '')); }}
              className="btn-gold"
              style={{ padding: '10px 22px', alignSelf: 'flex-end' }}
            >
              Update QR Codes
            </button>
          </div>

          {/* Info banner */}
          <div style={{ background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.15)', borderRadius: '12px', padding: '1rem 1.5rem', marginBottom: '2rem', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <QrCode size={20} color="#D4AF37" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <p style={{ color: '#D4AF37', fontWeight: 600, fontSize: '0.9rem', marginBottom: '4px' }}>How it works</p>
              <p style={{ color: '#A0998A', fontSize: '0.82rem', lineHeight: 1.6 }}>
                Each QR code encodes a unique URL with the table number. When a customer scans, they're taken directly to the menu with their table auto-assigned. The table number is locked during checkout — no manual entry needed.
              </p>
            </div>
          </div>

          {/* QR Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.25rem' }}>
            {TABLES.map((t) => (
              <TableQRCard key={t} table={t} baseUrl={baseUrl} />
            ))}
          </div>
        </div>
      </main>

      <style>{`
        @media print {
          .admin-mobile-header, nav, aside { display: none !important; }
          .glass-card { break-inside: avoid; }
        }
        .admin-mobile-header { display: none !important; }
        @media (max-width: 767px) { .admin-mobile-header { display: flex !important; } }
      `}</style>
    </div>
  );
};

export default QRCodes;
