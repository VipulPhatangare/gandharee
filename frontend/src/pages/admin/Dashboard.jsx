import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminSidebar from '../../components/admin/AdminSidebar';
import StatsCards from '../../components/admin/StatsCards';
import { getAnalytics, getAllOrders } from '../../services/api';
import { formatPrice, timeAgo } from '../../utils/helpers';
import { Menu, TrendingUp, ArrowRight } from 'lucide-react';

const STATUS_COLORS = { received: '#3498DB', preparing: '#F39C12', ready: '#2ECC71', served: '#D4AF37', cancelled: '#E8453C' };

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [analyticsRes, ordersRes] = await Promise.all([getAnalytics(), getAllOrders({ limit: 8 })]);
        setAnalytics(analyticsRes.data.data);
        setRecentOrders(ordersRes.data.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();
    const i = setInterval(fetchData, 30000);
    return () => clearInterval(i);
  }, []);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0A0A0A' }}>
      <AdminSidebar mobileOpen={mobileMenu} setMobileOpen={setMobileMenu} />

      <main style={{ flex: 1, overflowX: 'hidden', minWidth: 0 }}>
        {/* Mobile header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', background: '#111' }} className="admin-mobile-header">
          <button onClick={() => setMobileMenu(true)} style={{ background: 'none', border: 'none', color: '#F5F0E8', cursor: 'pointer', display: 'flex' }}><Menu size={22} /></button>
          <h1 style={{ color: '#F5F0E8', fontWeight: 600, fontSize: '1rem' }}>Dashboard</h1>
        </div>

        <div style={{ padding: '2rem 1.5rem', maxWidth: '1200px' }}>
          <div style={{ marginBottom: '2rem' }}>
            <p style={{ fontSize: '0.75rem', color: '#D4AF37', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '0.25rem' }}>Overview</p>
            <h1 className="font-display" style={{ fontSize: '2rem', fontWeight: 700, color: '#F5F0E8' }}>Dashboard</h1>
          </div>

          <StatsCards data={analytics} />

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.6fr) minmax(0,1fr)', gap: '1.5rem', marginTop: '2rem' }}>
            {/* Recent Orders */}
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '0.85rem', color: '#D4AF37', textTransform: 'uppercase', letterSpacing: '2px' }}>Recent Orders</h3>
                <Link to="/admin/orders" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#6B6560', fontSize: '0.8rem', textDecoration: 'none' }}>View all <ArrowRight size={12} /></Link>
              </div>
              {loading ? (
                <p style={{ color: '#6B6560', textAlign: 'center', padding: '2rem' }}>Loading...</p>
              ) : recentOrders.length === 0 ? (
                <p style={{ color: '#6B6560', textAlign: 'center', padding: '2rem' }}>No orders yet</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {recentOrders.map((order) => (
                    <div key={order._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', gap: '10px' }}>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontWeight: 600, color: '#F5F0E8', fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {order.orderNumber}
                        </p>
                        <p style={{ color: '#6B6560', fontSize: '0.75rem' }}>
                          Table #{order.tableNumber} · {order.customerName} · {timeAgo(order.createdAt)}
                        </p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                        <span style={{ color: '#D4AF37', fontWeight: 700, fontSize: '0.9rem' }}>{formatPrice(order.totalAmount)}</span>
                        <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 600, textTransform: 'capitalize', background: `rgba(${STATUS_COLORS[order.orderStatus]?.replace('#', '') ? '0,0,0' : '0,0,0'},0)`, color: STATUS_COLORS[order.orderStatus] || '#A0998A', border: `1px solid ${STATUS_COLORS[order.orderStatus] || '#666'}33` }}>
                          {order.orderStatus}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Top Dishes */}
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem' }}>
                <TrendingUp size={16} color="#D4AF37" />
                <h3 style={{ fontSize: '0.85rem', color: '#D4AF37', textTransform: 'uppercase', letterSpacing: '2px' }}>Top Selling</h3>
              </div>
              {loading ? (
                <p style={{ color: '#6B6560', textAlign: 'center', padding: '2rem' }}>Loading...</p>
              ) : analytics?.topDishes?.length === 0 ? (
                <p style={{ color: '#6B6560', textAlign: 'center', padding: '2rem' }}>No data</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {analytics?.topDishes?.map((dish, i) => (
                    <div key={dish._id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: i === 0 ? 'rgba(212,175,55,0.2)' : 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: i === 0 ? '#D4AF37' : '#6B6560', flexShrink: 0 }}>
                        {i + 1}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ color: '#F5F0E8', fontSize: '0.85rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{dish._id}</p>
                        <p style={{ color: '#6B6560', fontSize: '0.75rem' }}>{dish.totalSold} sold · {formatPrice(dish.revenue)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <style>{`
        .admin-mobile-header { display: none; }
        @media (max-width: 767px) { .admin-mobile-header { display: flex; } }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
