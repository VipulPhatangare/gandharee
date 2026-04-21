import { useEffect, useState } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { getAllOrders, updateOrderStatus } from '../../services/api';
import { formatPrice, timeAgo, ORDER_STATUSES } from '../../utils/helpers';
import { RefreshCw, Menu } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_COLORS = { received: '#3498DB', preparing: '#F39C12', ready: '#2ECC71', served: '#D4AF37', cancelled: '#E8453C' };
const STATUS_OPTS = [...ORDER_STATUSES.map((s) => ({ value: s.key, label: s.label })), { value: 'cancelled', label: 'Cancelled' }];

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [mobileMenu, setMobileMenu] = useState(false);

  const fetchOrders = async (silent = false) => {
    if (silent) setRefreshing(true);
    else setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const res = await getAllOrders(params);
      setOrders(res.data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { fetchOrders(); }, [statusFilter]);

  useEffect(() => {
    const i = setInterval(() => fetchOrders(true), 20000);
    return () => clearInterval(i);
  }, [statusFilter]);

  const handleStatusChange = async (orderId, orderStatus) => {
    try {
      await updateOrderStatus(orderId, { orderStatus });
      toast.success(`Order status updated to ${orderStatus}`);
      fetchOrders(true);
    } catch { toast.error('Update failed'); }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0A0A0A' }}>
      <AdminSidebar mobileOpen={mobileMenu} setMobileOpen={setMobileMenu} />
      <main style={{ flex: 1, overflowX: 'hidden', minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', background: '#111' }} className="admin-mobile-header">
          <button onClick={() => setMobileMenu(true)} style={{ background: 'none', border: 'none', color: '#F5F0E8', cursor: 'pointer', display: 'flex' }}><Menu size={22} /></button>
          <span style={{ color: '#F5F0E8', fontWeight: 600 }}>Manage Orders</span>
        </div>

        <div style={{ padding: '2rem 1.5rem', maxWidth: '1200px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <p style={{ fontSize: '0.75rem', color: '#D4AF37', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '0.25rem' }}>Admin</p>
              <h1 className="font-display" style={{ fontSize: '2rem', fontWeight: 700, color: '#F5F0E8' }}>Manage Orders</h1>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              {/* Status filter */}
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-gold" style={{ padding: '8px 14px', width: 'auto' }}>
                <option value="" style={{ background: '#1A1A1A' }}>All Status</option>
                {STATUS_OPTS.map((s) => <option key={s.value} value={s.value} style={{ background: '#1A1A1A' }}>{s.label}</option>)}
              </select>
              <button onClick={() => fetchOrders(true)} disabled={refreshing} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '8px', color: '#D4AF37', cursor: 'pointer', fontSize: '0.85rem' }}>
                <RefreshCw size={14} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>

          {loading ? (
            <p style={{ color: '#6B6560', textAlign: 'center', padding: '3rem' }}>Loading orders...</p>
          ) : orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
              <p style={{ color: '#6B6560' }}>No orders {statusFilter ? `with status "${statusFilter}"` : 'yet'}</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {orders.map((order) => (
                <div key={order._id} className="glass-card" style={{ overflow: 'hidden' }}>
                  {/* Order row */}
                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '1rem 1.25rem', cursor: 'pointer', flexWrap: 'wrap' }}
                    onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                  >
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '2px' }}>
                        <span style={{ fontWeight: 700, color: '#D4AF37', fontSize: '0.95rem' }}>{order.orderNumber}</span>
                        <span style={{ color: '#A0998A', fontSize: '0.85rem' }}>Table #{order.tableNumber}</span>
                        <span style={{ color: '#6B6560', fontSize: '0.8rem' }}>{timeAgo(order.createdAt)}</span>
                      </div>
                      <p style={{ color: '#F5F0E8', fontSize: '0.9rem' }}>
                        {order.customerName?.trim() || 'Guest'}
                        {order.mobile?.trim() ? ` · ${order.mobile}` : ''}
                      </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                      <span style={{ fontWeight: 700, color: '#F5F0E8' }}>{formatPrice(order.totalAmount)}</span>
                      {/* Status selector */}
                      <select
                        value={order.orderStatus}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        style={{ padding: '6px 12px', borderRadius: '8px', border: `1px solid ${STATUS_COLORS[order.orderStatus]}`, background: `rgba(0,0,0,0.4)`, color: STATUS_COLORS[order.orderStatus], fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', outline: 'none' }}
                      >
                        {STATUS_OPTS.map((s) => <option key={s.value} value={s.value} style={{ background: '#1A1A1A', color: '#F5F0E8' }}>{s.label}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Expanded items */}
                  {expandedOrder === order._id && (
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '1rem 1.25rem', background: 'rgba(255,255,255,0.02)' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px' }}>
                        {order.orderedItems.map((item, i) => (
                          <div key={i} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '8px', padding: '10px 12px' }}>
                            <p style={{ color: '#F5F0E8', fontSize: '0.85rem', fontWeight: 500 }}>{item.name}</p>
                            <p style={{ color: '#A0998A', fontSize: '0.75rem' }}>x{item.quantity} · {formatPrice(item.price)}</p>
                          </div>
                        ))}
                      </div>
                      {order.specialInstructions && (
                        <p style={{ marginTop: '10px', color: '#A0998A', fontSize: '0.8rem', fontStyle: 'italic' }}>
                          📝 {order.specialInstructions}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <style>{`
        .admin-mobile-header { display: none; }
        @media (max-width: 767px) { .admin-mobile-header { display: flex; } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default ManageOrders;
