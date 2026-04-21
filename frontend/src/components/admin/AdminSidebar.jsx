import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, UtensilsCrossed, ShoppingBag, Tag, LogOut, ChefHat, X, QrCode, LayoutGrid, History } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/admin/tables', label: 'Table Orders', icon: LayoutGrid },
  { to: '/admin/tables/history', label: 'Table History', icon: History },
  { to: '/admin/menu', label: 'Manage Menu', icon: UtensilsCrossed },
  { to: '/admin/orders', label: 'All Orders', icon: ShoppingBag },
  { to: '/admin/categories', label: 'Categories', icon: Tag },
  { to: '/admin/qr-codes', label: 'QR Codes', icon: QrCode },
];

const AdminSidebar = ({ mobileOpen, setMobileOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => { logout(); navigate('/'); };

  const isActive = (item) =>
    item.exact ? location.pathname === item.to : location.pathname.startsWith(item.to);

  const SidebarContent = () => (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '1rem' }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0.5rem 0.5rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #F0D060, #D4AF37)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <ChefHat size={18} color="#0A0A0A" />
        </div>
        <div>
          <span className="font-display" style={{ fontSize: '1rem', fontWeight: 700, color: '#F5F0E8' }}><span style={{ color: '#D4AF37' }}>Gandarree</span></span>
          <p style={{ fontSize: '0.65rem', color: '#6B6560', letterSpacing: '1px', textTransform: 'uppercase' }}>Admin Panel</p>
        </div>
        <button onClick={() => setMobileOpen?.(false)} className="sidebar-close-btn" style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#6B6560', cursor: 'pointer' }}>
          <X size={18} />
        </button>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, paddingTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {navItems.map(({ to, label, icon: Icon, exact }) => (
          <Link
            key={to}
            to={to}
            onClick={() => setMobileOpen?.(false)}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px',
              borderRadius: '10px', textDecoration: 'none', fontSize: '0.88rem', fontWeight: 500,
              transition: 'all 0.2s',
              background: isActive({ to, exact }) ? 'rgba(212,175,55,0.12)' : 'transparent',
              color: isActive({ to, exact }) ? '#D4AF37' : '#6B6560',
              borderLeft: isActive({ to, exact }) ? '2px solid #D4AF37' : '2px solid transparent',
            }}
          >
            <Icon size={17} />
            {label}
          </Link>
        ))}
      </nav>

      {/* User + Logout */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', marginBottom: '8px' }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'rgba(212,175,55,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 700, color: '#D4AF37', flexShrink: 0 }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#F5F0E8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</p>
            <p style={{ fontSize: '0.7rem', color: '#6B6560', textTransform: 'capitalize' }}>{user?.role}</p>
          </div>
        </div>
        <button onClick={handleLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', background: 'rgba(232,69,60,0.08)', border: 'none', color: '#E8453C', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 500 }}>
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside style={{ width: '240px', background: '#111111', borderRight: '1px solid rgba(255,255,255,0.06)', height: '100vh', position: 'sticky', top: 0, flexShrink: 0 }} className="admin-sidebar-desktop">
        <SidebarContent />
      </aside>

      {/* Mobile overlay sidebar */}
      {mobileOpen && (
        <>
          <div onClick={() => setMobileOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', zIndex: 45 }} />
          <aside style={{ width: '240px', background: '#111111', borderRight: '1px solid rgba(255,255,255,0.06)', height: '100vh', position: 'fixed', top: 0, left: 0, zIndex: 50 }}>
            <SidebarContent />
          </aside>
        </>
      )}

      <style>{`
        .admin-sidebar-desktop { display: none; }
        .sidebar-close-btn { display: none; }
        @media (min-width: 768px) { .admin-sidebar-desktop { display: block !important; } }
        @media (max-width: 767px) { .sidebar-close-btn { display: flex !important; } }
      `}</style>
    </>
  );
};

export default AdminSidebar;
