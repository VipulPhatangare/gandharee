import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, Menu, X, ChefHat, LogOut, Settings } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import CartDrawer from './CartDrawer';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const { totalItems } = useCart();
  const { user, isAdmin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location]);

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/menu', label: 'Menu' },
  ];

  return (
    <>
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 40,
          transition: 'all 0.3s ease',
          background: scrolled ? 'rgba(10,10,10,0.95)' : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none',
          padding: '0 1rem',
        }}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '70px' }}>
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <div style={{ width: '38px', height: '38px', background: 'linear-gradient(135deg, #F0D060, #D4AF37)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ChefHat size={20} color="#0A0A0A" />
            </div>
            <div>
              <span className="font-display" style={{ fontSize: '1.2rem', fontWeight: 700, color: '#F5F0E8', lineHeight: 1 }}>
                <span style={{ color: '#D4AF37' }}>Gandarree</span>
              </span>
              <p style={{ fontSize: '0.6rem', color: '#6B6560', letterSpacing: '1px', textTransform: 'uppercase', lineHeight: 1 }}>Restaurant</p>
            </div>
          </Link>

          {/* Desktop nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} className="hidden md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  color: location.pathname === link.to ? '#D4AF37' : '#A0998A',
                  background: location.pathname === link.to ? 'rgba(212,175,55,0.1)' : 'transparent',
                  transition: 'all 0.2s',
                }}
              >
                {link.label}
              </Link>
            ))}
            {isAdmin && (
              <Link to="/admin" style={{ padding: '8px 16px', borderRadius: '8px', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500, color: '#D4AF37', background: 'rgba(212,175,55,0.1)' }}>
                <Settings size={16} style={{ display: 'inline', marginRight: '4px' }} />
                Admin
              </Link>
            )}
          </div>

          {/* Right actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Table Badge */}
            {sessionStorage.getItem('tableNumber') && (
              <div className="nav-table-badge" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '50px', padding: '6px 12px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#2ECC71', boxShadow: '0 0 6px #2ECC71' }} />
                <span style={{ fontSize: '0.75rem', color: '#D4AF37', fontWeight: 600 }}>
                  Table {sessionStorage.getItem('tableNumber')}
                </span>
              </div>
            )}
            
            {/* Cart button */}
            <button
              onClick={() => setCartOpen(true)}
              style={{ position: 'relative', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '50%', width: '42px', height: '42px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F5F0E8', transition: 'all 0.2s' }}
            >
              <ShoppingCart size={18} />
              {totalItems > 0 && (
                <span
                  className="animate-pulse-gold"
                  style={{ position: 'absolute', top: '-4px', right: '-4px', background: 'linear-gradient(135deg, #F0D060, #D4AF37)', color: '#0A0A0A', borderRadius: '50%', width: '18px', height: '18px', fontSize: '0.65rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  {totalItems}
                </span>
              )}
            </button>

            {/* Admin/User dropdown */}
            {user && isAdmin && (
              <button onClick={() => { logout(); navigate('/'); }} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', padding: '8px 12px', color: '#A0998A', cursor: 'pointer', fontSize: '0.8rem' }}>
                <LogOut size={14} />
                <span className="hidden md:inline">Logout</span>
              </button>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              style={{ display: 'none', background: 'transparent', border: 'none', color: '#F5F0E8', cursor: 'pointer' }}
              className="mobile-menu-btn"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div style={{ background: 'rgba(17,17,17,0.98)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '1rem' }}>
            {navLinks.map((link) => (
              <Link key={link.to} to={link.to} style={{ display: 'block', padding: '12px 16px', color: location.pathname === link.to ? '#D4AF37' : '#A0998A', textDecoration: 'none', borderRadius: '8px', marginBottom: '4px', background: location.pathname === link.to ? 'rgba(212,175,55,0.1)' : 'transparent' }}>
                {link.label}
              </Link>
            ))}
            {isAdmin && (
              <Link to="/admin" style={{ display: 'block', padding: '12px 16px', color: '#D4AF37', textDecoration: 'none', borderRadius: '8px' }}>
                Admin Dashboard
              </Link>
            )}
          </div>
        )}
      </nav>

      {/* Cart Drawer */}
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />

      <style>{`
        @media (max-width: 768px) {
          .mobile-menu-btn { display: flex !important; }
          .hidden.md\\:flex { display: none !important; }
          .hidden.md\\:inline { display: none !important; }
          .nav-table-badge { display: none !important; }
        }
        @media (max-width: 460px) {
          nav .font-display { font-size: 1rem !important; }
          nav .font-display + p { display: none !important; }
        }
      `}</style>
    </>
  );
};

export default Navbar;
