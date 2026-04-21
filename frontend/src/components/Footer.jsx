import { Link } from 'react-router-dom';
import { ChefHat, Camera, Send, Globe, MapPin, Phone } from 'lucide-react';

const Footer = () => (
  <footer style={{ background: '#080808', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '3rem', paddingBottom: '1.5rem', marginTop: 'auto' }}>
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
        {/* Brand */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
            <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #F0D060, #D4AF37)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ChefHat size={18} color="#0A0A0A" />
            </div>
            <span className="font-display" style={{ fontSize: '1.2rem', fontWeight: 700, color: '#F5F0E8' }}>
              <span style={{ color: '#D4AF37' }}>Gandarree</span>
            </span>
          </div>
          <p style={{ color: '#6B6560', fontSize: '0.85rem', lineHeight: 1.7, marginBottom: '1.25rem' }}>
            Welcome to Gandarree — premium dining with smart ordering and a delightful table experience.
          </p>
          <div style={{ display: 'flex', gap: '10px' }}>
            {[Camera, Send, Globe].map((Icon, i) => (
              <button key={i} style={{ width: '34px', height: '34px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#A0998A', transition: 'all 0.2s' }}>
                <Icon size={16} />
              </button>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 style={{ fontSize: '0.8rem', fontWeight: 600, color: '#F5F0E8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem' }}>Quick Links</h4>
          {[{ to: '/', label: 'Home' }, { to: '/menu', label: 'Full Menu' }, { to: '/cart', label: 'My Order' }].map((link) => (
            <Link key={link.to} to={link.to} style={{ display: 'block', color: '#6B6560', textDecoration: 'none', fontSize: '0.85rem', marginBottom: '8px', transition: 'color 0.2s' }}
              onMouseEnter={(e) => e.target.style.color = '#D4AF37'}
              onMouseLeave={(e) => e.target.style.color = '#6B6560'}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Contact */}
        <div>
          <h4 style={{ fontSize: '0.8rem', fontWeight: 600, color: '#F5F0E8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem' }}>Contact</h4>
          {[
            { Icon: MapPin, text: '32/A LC-2 Shop no 2 3 4 Dhruv shiddhi A Pradhikaran Nigdi, Sector 32 A, Ravet, Pimpri-Chinchwad, Maharashtra 412101' },
            { Icon: Phone, text: '+91 98327 19657' },
          ].map(({ Icon, text }) => (
            <div key={text} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '10px' }}>
              <Icon size={14} color="#D4AF37" style={{ marginTop: '2px', flexShrink: 0 }} />
              <span style={{ color: '#6B6560', fontSize: '0.85rem' }}>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <p style={{ color: '#3A3530', fontSize: '0.8rem' }}>
          © {new Date().getFullYear()} Gandarree. All rights reserved.
        </p>
        <p style={{ color: '#3A3530', fontSize: '0.8rem' }}>
          Made with ❤️ for the Gandarree family
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
