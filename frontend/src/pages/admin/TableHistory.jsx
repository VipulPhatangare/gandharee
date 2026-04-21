import { useEffect, useState } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { getTableHistory } from '../../services/api';
import { formatPrice, timeAgo } from '../../utils/helpers';
import { RefreshCw, Menu as MenuIcon, History } from 'lucide-react';

const statusColor = (status) => {
  const map = {
    received: '#3498DB',
    preparing: '#F39C12',
    ready: '#2ECC71',
    served: '#D4AF37',
    cancelled: '#E8453C',
  };
  return map[status] || '#A0998A';
};

const TableHistory = () => {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHistory = async (silent = false) => {
    if (silent) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await getTableHistory();
      setHistory(res.data.data || []);
    } catch {
      setHistory([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0A0A0A' }}>
      <AdminSidebar mobileOpen={mobileMenu} setMobileOpen={setMobileMenu} />
      <main style={{ flex: 1, overflowX: 'hidden', minWidth: 0 }}>
        <div className="admin-mobile-header" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', background: '#111' }}>
          <button onClick={() => setMobileMenu(true)} style={{ background: 'none', border: 'none', color: '#F5F0E8', cursor: 'pointer', display: 'flex' }}><MenuIcon size={22} /></button>
          <span style={{ color: '#F5F0E8', fontWeight: 600 }}>Table History</span>
        </div>

        <div style={{ padding: '2rem 1.5rem', maxWidth: '1200px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <p style={{ fontSize: '0.75rem', color: '#D4AF37', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '0.25rem' }}>Admin</p>
              <h1 className="font-display" style={{ fontSize: '2rem', fontWeight: 700, color: '#F5F0E8', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <History size={24} color="#D4AF37" /> Table History
              </h1>
            </div>
            <button
              onClick={() => fetchHistory(true)}
              disabled={refreshing}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '8px', color: '#D4AF37', cursor: 'pointer', fontSize: '0.85rem' }}
            >
              <RefreshCw size={14} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>

          {loading ? (
            <p style={{ color: '#6B6560', textAlign: 'center', padding: '3rem' }}>Loading history...</p>
          ) : history.length === 0 ? (
            <p style={{ color: '#6B6560', textAlign: 'center', padding: '3rem' }}>No history found yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {history.map((tableSection) => (
                <div key={tableSection.tableNumber} className="glass-card" style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                    <h3 className="font-display" style={{ color: '#F5F0E8', fontSize: '1.1rem', margin: 0 }}>Table {tableSection.tableNumber}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                      <span style={{ color: '#A0998A', fontSize: '0.8rem' }}>{tableSection.totalOrders} orders</span>
                      <span style={{ color: '#D4AF37', fontSize: '0.9rem', fontWeight: 700 }}>{formatPrice(tableSection.totalRevenue)}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {tableSection.orders.map((order) => (
                      <div key={order._id} style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
                          <div>
                            <p style={{ color: '#F5F0E8', fontWeight: 700, fontSize: '0.86rem', margin: 0 }}>{order.orderNumber}</p>
                            <p style={{ color: '#6B6560', fontSize: '0.74rem', margin: '2px 0 0 0' }}>{timeAgo(order.createdAt)} · Payment: {order.paymentStatus}</p>
                          </div>
                          <span style={{ border: `1px solid ${statusColor(order.orderStatus)}`, color: statusColor(order.orderStatus), borderRadius: '999px', padding: '2px 10px', fontSize: '0.7rem', fontWeight: 700, textTransform: 'capitalize', height: 'fit-content' }}>
                            {order.orderStatus}
                          </span>
                        </div>

                        {order.orderedItems.map((item, idx) => (
                          <div key={`${order._id}-${idx}`} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#A0998A' }}>
                            <span>{item.quantity} × {item.name}</span>
                            <span style={{ color: '#D4AF37' }}>{formatPrice(item.quantity * item.price)}</span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .admin-mobile-header { display: none !important; }
        @media (max-width: 767px) { .admin-mobile-header { display: flex !important; } }
      `}</style>
    </div>
  );
};

export default TableHistory;
