import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';
import { createPaymentOrder, getOrdersByTable, placeOrder, verifyPayment } from '../services/api';
import { formatPrice, getImageUrl, timeAgo } from '../utils/helpers';
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, ChefHat, CreditCard, Banknote } from 'lucide-react';
import toast from 'react-hot-toast';

const Cart = () => {
  const navigate = useNavigate();
  const { items, totalPrice, totalItems, updateQuantity, removeItem, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [tableOrders, setTableOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState('');
  const [paying, setPaying] = useState(false);

  const tableNumber = sessionStorage.getItem('tableNumber');

  const getOrderStatusColor = (status) => {
    const map = {
      received: '#3498DB',
      preparing: '#F39C12',
      ready: '#2ECC71',
      served: '#D4AF37',
      cancelled: '#E8453C',
    };
    return map[status] || '#A0998A';
  };

  const getPaymentStatusColor = (status) => {
    const map = {
      pending: '#F39C12',
      paid: '#2ECC71',
      failed: '#E8453C',
    };
    return map[status] || '#A0998A';
  };

  const fetchTableOrders = async () => {
    if (!tableNumber) {
      setTableOrders([]);
      return;
    }

    setOrdersLoading(true);
    setOrdersError('');
    try {
      const res = await getOrdersByTable(tableNumber);
      setTableOrders(res.data.data || []);
    } catch (err) {
      setOrdersError(err.response?.data?.message || 'Could not load your previous orders');
      setTableOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    fetchTableOrders();
  }, [tableNumber]);

  const pendingTableOrders = tableOrders.filter((o) => o.paymentStatus === 'pending' && o.orderStatus !== 'cancelled');
  const pendingTableAmount = pendingTableOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const handleOnlinePayment = async () => {
    if (!tableNumber) {
      toast.error('Scan a table QR code first!');
      return;
    }
    if (pendingTableAmount <= 0) {
      toast.success('No pending payment for this table.');
      return;
    }

    try {
      setPaying(true);
      const res = await createPaymentOrder({ tableNumber });

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_SNocHRSvY5UOAj',
        amount: res.data.data.amount,
        currency: res.data.data.currency,
        name: 'Gandarree',
        description: `Payment for Table ${tableNumber}`,
        order_id: res.data.data.id,
        handler: async function (response) {
          try {
            await verifyPayment({
              tableNumber,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            toast.success('🎉 Payment Successful!');
            fetchTableOrders();
          } catch {
            toast.error('Payment verification failed');
          }
        },
        theme: { color: '#D4AF37' },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function () {
        toast.error('Payment Failed or Cancelled');
      });
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not initiate payment');
    } finally {
      setPaying(false);
    }
  };

  const handleCashPayment = () => {
    toast.success('Please pay cash at counter/waiter. Admin will mark payment collected.', { duration: 5000 });
  };

  const handleSubmitOrder = async () => {
    if (!tableNumber) {
      toast.error('Scan a table QR code first!');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        tableNumber: tableNumber,
        orderedItems: items.map((i) => ({ menuItem: i._id, quantity: i.quantity })),
      };

      const res = await placeOrder(orderData);
      toast.success('🎉 Order sent to kitchen!');
      fetchTableOrders();
      // Navigate to the Table Bill page
      navigate(`/track/${res.data.data.orderId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main style={{ flex: 1, paddingTop: '90px', paddingBottom: '4rem' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem' }}>
          <div className="my-order-header" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
            <button onClick={() => navigate(-1)} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#F5F0E8' }}>
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="font-display" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.2rem)', fontWeight: 700, color: '#F5F0E8' }}>My Order</h1>
              {totalItems > 0 && <p style={{ color: '#6B6560', fontSize: '0.9rem' }}>{totalItems} {totalItems === 1 ? 'item' : 'items'} ready to send</p>}
            </div>
            
            {tableNumber && (
              <div className="my-order-table-badge" style={{ marginLeft: 'auto', background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '12px', padding: '8px 16px' }}>
                <span style={{ fontSize: '0.85rem', color: '#D4AF37', fontWeight: 600 }}>📍 Table {tableNumber}</span>
              </div>
            )}
          </div>

          {items.length === 0 ? (
            tableOrders.length === 0 && !ordersLoading ? (
              <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🍽️</div>
                <h2 className="font-display" style={{ fontSize: '1.5rem', color: '#F5F0E8', marginBottom: '0.75rem' }}>You haven't added anything</h2>
                <p style={{ color: '#6B6560', marginBottom: '2rem' }}>Browse our menu and pick delicious items</p>
                <button onClick={() => navigate('/menu')} className="btn-gold">Browse Menu</button>
              </div>
            ) : null
          ) : (
            <div className="my-order-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', gap: '2rem', alignItems: 'start', marginBottom: '2rem' }}>
              {/* Items list */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                  <button onClick={clearCart} style={{ background: 'none', border: 'none', color: '#E8453C', cursor: 'pointer', fontSize: '0.85rem', textDecoration: 'underline' }}>
                    Clear all
                  </button>
                </div>
                {items.map((item) => (
                  <div
                    key={item._id}
                    className="glass-card my-order-item-card"
                    style={{ display: 'flex', gap: '1rem', padding: '1.25rem', marginBottom: '1rem', alignItems: 'center' }}
                  >
                    <div style={{ width: '80px', height: '80px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0 }}>
                      <img
                        src={getImageUrl(item.image, item.name)}
                        alt={item.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=100&fit=crop&auto=format'; }}
                      />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#F5F0E8', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.name}
                      </h3>
                      <p style={{ color: '#D4AF37', fontWeight: 700 }}>{formatPrice(item.price)}</p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <button onClick={() => updateQuantity(item._id, item.quantity - 1)} style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'rgba(255,255,255,0.08)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F5F0E8' }}>
                          <Minus size={14} />
                        </button>
                        <span style={{ fontWeight: 700, color: '#F5F0E8', minWidth: '24px', textAlign: 'center' }}>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item._id, item.quantity + 1)} style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D4AF37' }}>
                          <Plus size={14} />
                        </button>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ color: '#A0998A', fontSize: '0.9rem' }}>{formatPrice(item.price * item.quantity)}</span>
                        <button onClick={() => removeItem(item._id)} style={{ background: 'rgba(232,69,60,0.1)', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer', color: '#E8453C', display: 'flex' }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="glass-card my-order-summary" style={{ padding: '1.5rem', minWidth: '260px', position: 'sticky', top: '100px' }}>
                <h3 className="font-display" style={{ fontSize: '1.1rem', fontWeight: 600, color: '#F5F0E8', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShoppingBag size={18} color="#D4AF37" />
                  Order Summary
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#A0998A', fontSize: '0.9rem' }}>Subtotal</span>
                    <span style={{ color: '#F5F0E8' }}>{formatPrice(totalPrice)}</span>
                  </div>
                  <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#F5F0E8', fontWeight: 700 }}>Total</span>
                    <span className="font-display" style={{ color: '#D4AF37', fontWeight: 700, fontSize: '1.2rem' }}>{formatPrice(totalPrice)}</span>
                  </div>
                </div>

                {!tableNumber && (
                   <div style={{ background: 'rgba(232,69,60,0.1)', border: '1px solid rgba(232,69,60,0.3)', padding: '10px', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.8rem', color: '#E8453C' }}>
                     You must scan a Table QR code before sending an order.
                   </div>
                )}

                <button 
                  onClick={handleSubmitOrder} 
                  disabled={loading || !tableNumber}
                  className="btn-gold" 
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px', borderRadius: '12px', fontSize: '0.95rem', opacity: (loading || !tableNumber) ? 0.6 : 1 }}
                >
                  {loading ? 'Sending...' : (
                    <>
                      <ChefHat size={18} /> Send to Kitchen
                    </>
                  )}
                </button>
                <div style={{ marginTop: '10px', background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '10px', padding: '10px 12px' }}>
                  <p style={{ color: '#D4AF37', fontSize: '0.78rem', fontWeight: 700, marginBottom: '2px' }}>Order Status: Received/Preparing (after send)</p>
                  <p style={{ color: '#A0998A', fontSize: '0.75rem' }}>Payment Status: Pending (pay after lunch/dinner)</p>
                </div>
                <button onClick={() => navigate('/menu')} style={{ width: '100%', marginTop: '10px', background: 'none', border: 'none', color: '#6B6560', cursor: 'pointer', fontSize: '0.85rem', textDecoration: 'underline' }}>
                  Add more items
                </button>
              </div>
            </div>
          )}

          {/* Already ordered list for this table */}
          {tableNumber && (
            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <h3 className="font-display" style={{ fontSize: '1.1rem', color: '#F5F0E8', margin: 0 }}>Already Ordered (Table {tableNumber})</h3>
                <button
                  onClick={fetchTableOrders}
                  style={{ background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.3)', color: '#D4AF37', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
                >
                  Refresh
                </button>
              </div>

              {ordersLoading ? (
                <p style={{ color: '#A0998A', fontSize: '0.9rem' }}>Loading your orders...</p>
              ) : ordersError ? (
                <p style={{ color: '#E8453C', fontSize: '0.9rem' }}>{ordersError}</p>
              ) : tableOrders.length === 0 ? (
                <p style={{ color: '#A0998A', fontSize: '0.9rem' }}>No orders sent yet from this table.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {tableOrders.map((order) => (
                    <div key={order._id} style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', padding: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap', marginBottom: '8px' }}>
                        <div>
                          <p style={{ color: '#F5F0E8', fontWeight: 700, fontSize: '0.95rem', margin: 0 }}>{order.orderNumber}</p>
                          <p style={{ color: '#6B6560', fontSize: '0.75rem', margin: '2px 0 0 0' }}>Placed {timeAgo(order.createdAt)}</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{ background: 'rgba(255,255,255,0.06)', border: `1px solid ${getOrderStatusColor(order.orderStatus)}`, color: getOrderStatusColor(order.orderStatus), borderRadius: '999px', padding: '3px 10px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'capitalize' }}>
                            {order.orderStatus}
                          </span>
                          <span style={{ background: 'rgba(255,255,255,0.06)', border: `1px solid ${getPaymentStatusColor(order.paymentStatus)}`, color: getPaymentStatusColor(order.paymentStatus), borderRadius: '999px', padding: '3px 10px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'capitalize' }}>
                            Payment: {order.paymentStatus}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {order.orderedItems.map((orderedItem, idx) => (
                          <div key={`${order._id}-${idx}`} style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
                            <span style={{ color: '#A0998A', fontSize: '0.85rem' }}>{orderedItem.quantity} × {orderedItem.name}</span>
                            <span style={{ color: '#D4AF37', fontSize: '0.85rem', fontWeight: 600 }}>{formatPrice(orderedItem.quantity * orderedItem.price)}</span>
                          </div>
                        ))}
                      </div>

                      <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#F5F0E8', fontSize: '0.85rem', fontWeight: 600 }}>Order Total</span>
                        <span style={{ color: '#D4AF37', fontSize: '0.9rem', fontWeight: 700 }}>{formatPrice(order.totalAmount)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {pendingTableAmount > 0 && (
                <div style={{ marginTop: '1rem', background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '12px', padding: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.9rem' }}>
                    <span style={{ color: '#F5F0E8', fontWeight: 600, fontSize: '0.9rem' }}>Pending Table Bill</span>
                    <span className="font-display" style={{ color: '#D4AF37', fontWeight: 700, fontSize: '1.1rem' }}>{formatPrice(pendingTableAmount)}</span>
                  </div>

                  <div className="my-order-payment-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <button
                      onClick={handleOnlinePayment}
                      disabled={paying}
                      style={{ background: 'linear-gradient(135deg, #F0D060, #D4AF37)', color: '#0A0A0A', border: 'none', borderRadius: '10px', padding: '12px 10px', fontWeight: 700, cursor: paying ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                    >
                      <CreditCard size={16} /> {paying ? 'Loading...' : 'Pay Online (UPI)'}
                    </button>
                    <button
                      onClick={handleCashPayment}
                      style={{ background: 'rgba(255,255,255,0.05)', color: '#F5F0E8', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', padding: '12px 10px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                    >
                      <Banknote size={16} color="#2ECC71" /> Pay by Cash
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <style>{`
        @media (max-width: 900px) {
          .my-order-grid {
            grid-template-columns: minmax(0, 1fr) !important;
          }
          .my-order-summary {
            min-width: 0 !important;
            position: static !important;
            top: auto !important;
          }
        }

        @media (max-width: 640px) {
          .my-order-header {
            align-items: flex-start !important;
            flex-wrap: wrap !important;
            gap: 0.75rem !important;
            margin-bottom: 1.4rem !important;
          }
          .my-order-table-badge {
            margin-left: 0 !important;
          }
          .my-order-item-card {
            padding: 0.95rem !important;
            gap: 0.75rem !important;
          }
          .my-order-payment-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
      <Footer />
    </div>
  );
};

export default Cart;
