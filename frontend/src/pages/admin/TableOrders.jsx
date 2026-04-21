import { useEffect, useMemo, useState } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { clearTableOrders, getAllOrders, updateOrderStatus } from '../../services/api';
import { formatPrice, timeAgo, ORDER_STATUSES } from '../../utils/helpers';
import { RefreshCw, Menu as MenuIcon, Users, Clock, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  received: '#3498DB',
  preparing: '#F39C12',
  ready: '#2ECC71',
  served: '#D4AF37',
  cancelled: '#E8453C',
};

const BASE_TABLES = Array.from({ length: 10 }, (_, i) => String(i + 1));

const normalizeTableNumber = (value) => {
  if (value === null || value === undefined) return '';
  return String(value)
    .trim()
    .replace(/^table\s*/i, '')
    .replace(/^#/, '')
    .trim();
};

const TableCard = ({ tableNumber, orders, onStatusChange, onMoreInfo, onMarkCollected, onClearTable }) => {
  const active = orders.filter((o) => !['served', 'cancelled'].includes(o.orderStatus));
  const totalAmount = active.reduce((s, o) => s + o.totalAmount, 0);

  const isEmpty = orders.length === 0;
  const allServed = orders.length > 0 && active.length === 0;

  const cardColor = isEmpty
    ? 'rgba(255,255,255,0.03)'
    : active.some((o) => o.orderStatus === 'ready')
      ? 'rgba(46,204,113,0.06)'
      : active.some((o) => o.orderStatus === 'preparing')
        ? 'rgba(243,156,18,0.06)'
        : 'rgba(52,152,219,0.06)';

  const borderColor = isEmpty
    ? 'rgba(255,255,255,0.06)'
    : active.some((o) => o.orderStatus === 'ready')
      ? 'rgba(46,204,113,0.3)'
      : active.some((o) => o.orderStatus === 'preparing')
        ? 'rgba(243,156,18,0.25)'
        : 'rgba(52,152,219,0.25)';

  return (
    <div
      style={{
        background: cardColor,
        border: `1px solid ${borderColor}`,
        borderRadius: '16px',
        padding: '1.25rem',
        transition: 'all 0.3s ease',
        minHeight: '180px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      {/* Table header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '38px', height: '38px', borderRadius: '10px',
            background: isEmpty ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #F0D060, #D4AF37)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: isEmpty ? '#3A3530' : '#0A0A0A' }}>
              T{tableNumber}
            </span>
          </div>
          <div>
            <p style={{ color: '#F5F0E8', fontWeight: 700, fontSize: '0.95rem' }}>Table {tableNumber}</p>
            {!isEmpty && (
              <p style={{ color: '#6B6560', fontSize: '0.72rem' }}>
                {active.length} active · {orders.length} total
              </p>
            )}
          </div>
        </div>

        {/* Status dot */}
        <div style={{
          width: '10px', height: '10px', borderRadius: '50%',
          background: isEmpty ? '#3A3530' : allServed ? '#2ECC71' : STATUS_COLORS[active[0]?.orderStatus] || '#3498DB',
          boxShadow: isEmpty ? 'none' : `0 0 8px ${allServed ? '#2ECC71' : STATUS_COLORS[active[0]?.orderStatus] || '#3498DB'}`,
        }} />
      </div>

      {/* Empty state */}
      {isEmpty && (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '6px' }}>
          <span style={{ fontSize: '1.5rem', opacity: 0.3 }}>🪑</span>
          <p style={{ color: '#3A3530', fontSize: '0.8rem' }}>Available</p>
        </div>
      )}

      {/* Active orders summary */}
      {!isEmpty && (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{
              background: 'rgba(255,255,255,0.04)',
              borderRadius: '10px',
              padding: '10px 12px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <span style={{ color: '#6B6560', fontSize: '0.78rem' }}>Active order value</span>
              <span className="font-display" style={{ color: '#D4AF37', fontWeight: 700, fontSize: '1rem' }}>
                {formatPrice(totalAmount)}
              </span>
            </div>

            <button
              onClick={() => onMoreInfo(tableNumber)}
              style={{
                width: '100%',
                marginTop: '0.25rem',
                padding: '9px',
                background: 'rgba(212,175,55,0.08)',
                border: '1px solid rgba(212,175,55,0.25)',
                color: '#D4AF37',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.82rem',
                fontWeight: 700,
              }}
            >
              More Info
            </button>

            {orders.some((o) => o.paymentStatus === 'pending' && o.orderStatus !== 'cancelled') && (
              <button
                onClick={() => onMarkCollected(tableNumber, orders)}
                style={{
                  width: '100%',
                  marginTop: '0.1rem',
                  padding: '10px',
                  background: 'rgba(46,204,113,0.1)',
                  border: '1px solid rgba(46,204,113,0.3)',
                  color: '#2ECC71',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                }}
              >
                💵 Mark Payment Collected
              </button>
            )}

            {orders.length > 0 && orders.every((o) => o.orderStatus === 'cancelled' || o.paymentStatus === 'paid') && (
              <button
                onClick={() => onClearTable(tableNumber)}
                style={{
                  width: '100%',
                  marginTop: '0.1rem',
                  padding: '10px',
                  background: 'rgba(52,152,219,0.1)',
                  border: '1px solid rgba(52,152,219,0.35)',
                  color: '#3498DB',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                }}
              >
                🧹 Clear Table
              </button>
            )}
          </div>

          {/* Footer: total */}
          <div style={{
            marginTop: 'auto', paddingTop: '10px',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <p style={{ fontSize: '0.75rem', color: '#6B6560' }}>Total revenue</p>
            <p className="font-display" style={{ color: '#D4AF37', fontWeight: 700, fontSize: '0.95rem' }}>
              {formatPrice(totalAmount)}
            </p>
          </div>
        </>
      )}
    </div>
  );
};

const TableOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [detailsTable, setDetailsTable] = useState(null);

  const fetchOrders = async (silent = false) => {
    silent ? setRefreshing(true) : setLoading(true);
    try {
      const res = await getAllOrders({ limit: 200 });
      setOrders(res.data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => {
    fetchOrders();
    const i = setInterval(() => fetchOrders(true), 15000);
    return () => clearInterval(i);
  }, []);

  const handleStatusChange = async (orderId, newStatus, currentPaymentStatus, paymentOverride) => {
    try {
      let paymentStatusUpdate = currentPaymentStatus;
      if (newStatus === 'served') paymentStatusUpdate = 'paid';
      if (paymentOverride) paymentStatusUpdate = paymentOverride;

      await updateOrderStatus(orderId, { orderStatus: newStatus, paymentStatus: paymentStatusUpdate });
      toast.success(`Status updated to ${newStatus}`);
      fetchOrders(true);
    } catch (err) { toast.error('Update failed'); }
  };

  const handleMarkCollected = async (tableNumber, tableOrders) => {
    try {
      const targets = tableOrders.filter((o) => o.paymentStatus === 'pending' && o.orderStatus !== 'cancelled');
      await Promise.all(targets.map((o) => updateOrderStatus(o._id, { orderStatus: 'served', paymentStatus: 'paid' })));
      toast.success(`Payment marked collected for Table ${tableNumber}`);
      fetchOrders(true);
    } catch {
      toast.error('Failed to mark collected');
    }
  };

  const handleClearTable = async (tableNumber) => {
    try {
      await clearTableOrders(tableNumber);
      toast.success(`Table ${tableNumber} cleared successfully`);
      if (detailsTable === tableNumber) setDetailsTable(null);
      fetchOrders(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to clear table');
    }
  };

  const liveOrders = useMemo(() => orders.filter((o) => !o.tableCleared), [orders]);

  const tableNumbers = useMemo(() => {
    const fromOrders = liveOrders
      .map((o) => normalizeTableNumber(o.tableNumber))
      .filter(Boolean);

    const unique = Array.from(new Set([...BASE_TABLES, ...fromOrders]));

    unique.sort((a, b) => {
      const aNum = Number(a);
      const bNum = Number(b);
      const aIsNum = Number.isFinite(aNum) && a !== '';
      const bIsNum = Number.isFinite(bNum) && b !== '';

      if (aIsNum && bIsNum) return aNum - bNum;
      if (aIsNum) return -1;
      if (bIsNum) return 1;
      return a.localeCompare(b);
    });

    return unique;
  }, [liveOrders]);

  const getTableOrders = (t) =>
    liveOrders
      .filter((o) => normalizeTableNumber(o.tableNumber) === normalizeTableNumber(t))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const detailsOrders = detailsTable ? getTableOrders(detailsTable) : [];

  // Stats
  const activeTables = tableNumbers.filter((t) => getTableOrders(t).some((o) => !['served', 'cancelled'].includes(o.orderStatus)));
  const pendingOrders = liveOrders.filter((o) => ['received', 'preparing'].includes(o.orderStatus));
  const readyOrders = liveOrders.filter((o) => o.orderStatus === 'ready');

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0A0A0A' }}>
      <AdminSidebar mobileOpen={mobileMenu} setMobileOpen={setMobileMenu} />
      <main style={{ flex: 1, overflowX: 'hidden', minWidth: 0 }}>
        <div className="admin-mobile-header" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', background: '#111' }}>
          <button onClick={() => setMobileMenu(true)} style={{ background: 'none', border: 'none', color: '#F5F0E8', cursor: 'pointer', display: 'flex' }}><MenuIcon size={22} /></button>
          <span style={{ color: '#F5F0E8', fontWeight: 600 }}>Table Orders</span>
        </div>

        <div style={{ padding: '2rem 1.5rem', maxWidth: '1200px' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <p style={{ fontSize: '0.75rem', color: '#D4AF37', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '0.25rem' }}>Live View</p>
              <h1 className="font-display" style={{ fontSize: '2rem', fontWeight: 700, color: '#F5F0E8' }}>Table Orders</h1>
            </div>
            <button
              onClick={() => fetchOrders(true)}
              disabled={refreshing}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '8px', color: '#D4AF37', cursor: 'pointer', fontSize: '0.85rem' }}
            >
              <RefreshCw size={14} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>

          {/* Quick stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            {[
              { icon: Users, label: 'Active Tables', value: activeTables.length, color: '212,175,55' },
              { icon: Clock, label: 'Pending', value: pendingOrders.length, color: '243,156,18' },
              { icon: CheckCircle, label: 'Ready to Serve', value: readyOrders.length, color: '46,204,113' },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `rgba(${color},0.12)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={18} color={`rgb(${color})`} />
                </div>
                <div>
                  <p style={{ fontSize: '0.7rem', color: '#6B6560', textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</p>
                  <p className="font-display" style={{ fontSize: '1.5rem', fontWeight: 700, color: '#F5F0E8', lineHeight: 1 }}>{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            {[
              { color: '#3A3530', label: 'Available' },
              { color: '#3498DB', label: 'Order Received' },
              { color: '#F39C12', label: 'Preparing' },
              { color: '#2ECC71', label: 'Ready to Serve' },
              { color: '#D4AF37', label: 'Served' },
            ].map(({ color, label }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color, boxShadow: `0 0 6px ${color}` }} />
                <span style={{ fontSize: '0.75rem', color: '#6B6560' }}>{label}</span>
              </div>
            ))}
          </div>

          {/* Table Grid */}
          {loading ? (
            <p style={{ color: '#6B6560', textAlign: 'center', padding: '3rem' }}>Loading tables...</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
              {tableNumbers.map((t) => (
                <TableCard
                  key={t}
                  tableNumber={t}
                  orders={getTableOrders(t)}
                  onStatusChange={handleStatusChange}
                  onMarkCollected={handleMarkCollected}
                  onClearTable={handleClearTable}
                  onMoreInfo={(tableNum) => setDetailsTable(tableNum)}
                />
              ))}
            </div>
          )}

          {/* More Info Modal */}
          {detailsTable && (
            <div
              onClick={() => setDetailsTable(null)}
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 120,
                background: 'rgba(0,0,0,0.7)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1rem',
              }}
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className="glass-card"
                style={{
                  width: 'min(760px, 100%)',
                  maxHeight: '85vh',
                  overflowY: 'auto',
                  padding: '1.2rem',
                  borderRadius: '14px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                  <h3 className="font-display" style={{ color: '#F5F0E8', fontSize: '1.4rem' }}>Table {detailsTable} — Order Details</h3>
                  <button
                    onClick={() => setDetailsTable(null)}
                    style={{
                      background: 'rgba(255,255,255,0.08)',
                      color: '#F5F0E8',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      padding: '6px 10px',
                    }}
                  >
                    Close
                  </button>
                </div>

                {detailsOrders.length === 0 ? (
                  <p style={{ color: '#6B6560' }}>No orders found for this table.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '10px',
                      padding: '10px 12px',
                    }}>
                      <span style={{ color: '#A0998A', fontSize: '0.85rem' }}>Table Total (all orders)</span>
                      <span className="font-display" style={{ color: '#D4AF37', fontSize: '1.05rem', fontWeight: 700 }}>
                        {formatPrice(detailsOrders.reduce((sum, o) => sum + o.totalAmount, 0))}
                      </span>
                    </div>

                    {detailsOrders.map((order) => (
                      <div key={order._id} style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '0.9rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap', marginBottom: '8px', alignItems: 'center' }}>
                          <div>
                            <p style={{ color: '#D4AF37', fontWeight: 700, fontSize: '0.9rem' }}>{order.orderNumber}</p>
                            <p style={{ color: '#A0998A', fontSize: '0.76rem' }}>
                              {order.customerName?.trim() || 'Guest'} · {timeAgo(order.createdAt)}
                            </p>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                            <span
                              style={{
                                border: `1px solid ${STATUS_COLORS[order.orderStatus] || '#6B6560'}`,
                                color: STATUS_COLORS[order.orderStatus] || '#6B6560',
                                borderRadius: '20px',
                                padding: '3px 10px',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                              }}
                            >
                              {order.orderStatus}
                            </span>
                            <span style={{ color: order.paymentStatus === 'paid' ? '#2ECC71' : '#F39C12', fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase' }}>
                              Payment: {order.paymentStatus}
                            </span>
                          </div>
                        </div>

                        <div style={{ display: 'grid', gap: '6px' }}>
                          {order.orderedItems.map((item, idx) => (
                            <div key={`${order._id}-${idx}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', padding: '8px 10px' }}>
                              <div style={{ minWidth: 0 }}>
                                <span style={{ color: '#F5F0E8', fontSize: '0.86rem', display: 'block' }}>{item.name}</span>
                                <span style={{ color: '#6B6560', fontSize: '0.74rem' }}>{formatPrice(item.price)} × {item.quantity}</span>
                              </div>
                              <span style={{ color: '#D4AF37', fontWeight: 700, fontSize: '0.82rem' }}>
                                {formatPrice(item.price * item.quantity)}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: '#A0998A', fontSize: '0.8rem' }}>Order Total</span>
                          <span className="font-display" style={{ color: '#D4AF37', fontWeight: 700 }}>{formatPrice(order.totalAmount)}</span>
                        </div>

                        <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'flex-end' }}>
                          <select
                            value={order.orderStatus}
                            onChange={(e) => handleStatusChange(order._id, e.target.value, order.paymentStatus)}
                            style={{
                              padding: '6px 10px',
                              borderRadius: '8px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              border: `1px solid ${STATUS_COLORS[order.orderStatus] || '#6B6560'}`,
                              background: 'rgba(0,0,0,0.4)',
                              color: STATUS_COLORS[order.orderStatus] || '#F5F0E8',
                              cursor: 'pointer',
                            }}
                          >
                            {ORDER_STATUSES.map((s) => (
                              <option key={s.key} value={s.key} style={{ background: '#1A1A1A', color: '#F5F0E8' }}>
                                {s.label}
                              </option>
                            ))}
                            <option value="cancelled" style={{ background: '#1A1A1A', color: '#F5F0E8' }}>Cancelled</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
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

export default TableOrders;
