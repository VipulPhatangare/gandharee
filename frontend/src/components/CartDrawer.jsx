import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Plus, Minus, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { getOrdersByTable, placeOrder } from '../services/api';
import { formatPrice, getImageUrl, timeAgo } from '../utils/helpers';
import toast from 'react-hot-toast';

const CartDrawer = ({ isOpen, onClose }) => {
  const { items, totalItems, totalPrice, updateQuantity, removeItem, clearCart } = useCart();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [tableOrders, setTableOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const tableNumber = sessionStorage.getItem('tableNumber');

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

  const fetchTableOrders = async () => {
    if (!tableNumber) {
      setTableOrders([]);
      return;
    }

    try {
      setOrdersLoading(true);
      const res = await getOrdersByTable(tableNumber);
      setTableOrders(res.data.data || []);
    } catch {
      setTableOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) fetchTableOrders();
  }, [isOpen, tableNumber]);

  const handleCheckout = async () => {
    if (submitting) return;

    if (tableNumber) {
      try {
        setSubmitting(true);
        const orderData = {
          tableNumber,
          orderedItems: items.map((i) => ({ menuItem: i._id, quantity: i.quantity })),
        };
        const res = await placeOrder(orderData);
        await fetchTableOrders();
        onClose();
        toast.success(`✅ Sent to kitchen for Table ${tableNumber}`);
        navigate(`/track/${res.data.data.orderId}`);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to place order');
      } finally {
        setSubmitting(false);
      }
      return;
    }

    onClose();
    navigate('/checkout');
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="overlay animate-fade-in"
          onClick={onClose}
          style={{ zIndex: 55 }}
        />
      )}

      {/* Drawer */}
      <div
        className="cart-drawer"
        style={{ 
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          visibility: isOpen ? 'visible' : 'hidden',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShoppingBag size={20} color="#D4AF37" />
            <h2 className="font-display" style={{ fontSize: '1.2rem', fontWeight: 600, color: '#F5F0E8' }}>My Order</h2>
            {totalItems > 0 && (
              <span style={{ background: 'rgba(212,175,55,0.15)', color: '#D4AF37', borderRadius: '20px', padding: '2px 10px', fontSize: '0.8rem', fontWeight: 600 }}>
                {totalItems} {totalItems === 1 ? 'item' : 'items'}
              </span>
            )}
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer', color: '#A0998A', display: 'flex' }}>
            <X size={18} />
          </button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.5rem' }}>
          {items.length === 0 ? (
            tableOrders.length > 0 ? (
              <>
                <h3 className="font-display" style={{ color: '#F5F0E8', marginBottom: '0.75rem', fontSize: '0.95rem' }}>
                  Already Ordered (Table {tableNumber})
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {tableOrders.map((order) => (
                    <div key={order._id} style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '10px', background: 'rgba(255,255,255,0.02)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                        <div>
                          <p style={{ color: '#F5F0E8', fontWeight: 700, fontSize: '0.82rem', margin: 0 }}>{order.orderNumber}</p>
                          <p style={{ color: '#6B6560', fontSize: '0.72rem', margin: '2px 0 0 0' }}>{timeAgo(order.createdAt)}</p>
                        </div>
                        <span style={{ border: `1px solid ${statusColor(order.orderStatus)}`, color: statusColor(order.orderStatus), borderRadius: '999px', padding: '2px 8px', fontSize: '0.68rem', fontWeight: 700, textTransform: 'capitalize' }}>
                          {order.orderStatus}
                        </span>
                      </div>

                      {order.orderedItems.slice(0, 3).map((it, idx) => (
                        <p key={`${order._id}-${idx}`} style={{ color: '#A0998A', fontSize: '0.78rem', margin: '2px 0' }}>
                          {it.quantity} × {it.name}
                        </p>
                      ))}
                      {order.orderedItems.length > 3 && (
                        <p style={{ color: '#6B6560', fontSize: '0.72rem', margin: '2px 0' }}>+ {order.orderedItems.length - 3} more items</p>
                      )}

                      <div style={{ marginTop: '6px', display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#6B6560', fontSize: '0.74rem' }}>Payment: {order.paymentStatus}</span>
                        <span style={{ color: '#D4AF37', fontSize: '0.8rem', fontWeight: 700 }}>{formatPrice(order.totalAmount)}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => { onClose(); navigate('/cart'); }}
                  style={{ marginTop: '12px', width: '100%', background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.25)', color: '#D4AF37', borderRadius: '10px', padding: '10px', cursor: 'pointer', fontWeight: 600 }}
                >
                  View Full My Order Details
                </button>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
                <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🛒</div>
                <h3 style={{ color: '#F5F0E8', marginBottom: '0.5rem' }}>Your order list is empty</h3>
                <p style={{ color: '#6B6560', fontSize: '0.9rem', marginBottom: '1.5rem' }}>{ordersLoading ? 'Checking your table orders...' : 'Add some delicious dishes!'}</p>
                <button onClick={() => { onClose(); navigate('/menu'); }} className="btn-gold">Browse Menu</button>
              </div>
            )
          ) : (
            <>
              {items.map((item) => (
                <div
                  key={item._id}
                  style={{ display: 'flex', gap: '12px', padding: '1rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)', alignItems: 'center' }}
                >
                  {/* Image */}
                  <div style={{ width: '64px', height: '64px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0 }}>
                    <img
                      src={getImageUrl(item.image, item.name)}
                      alt={item.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=100&fit=crop&auto=format'; }}
                    />
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#F5F0E8', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.name}
                    </h4>
                    <p style={{ fontSize: '0.85rem', color: '#D4AF37', fontWeight: 600 }}>{formatPrice(item.price)}</p>

                    {/* Qty controls */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                      <button
                        onClick={() => updateQuantity(item._id, item.quantity - 1)}
                        style={{ width: '26px', height: '26px', borderRadius: '6px', background: 'rgba(255,255,255,0.08)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F5F0E8' }}
                      >
                        <Minus size={12} />
                      </button>
                      <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#F5F0E8', minWidth: '20px', textAlign: 'center' }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                        style={{ width: '26px', height: '26px', borderRadius: '6px', background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D4AF37' }}
                      >
                        <Plus size={12} />
                      </button>
                      <span style={{ fontSize: '0.8rem', color: '#A0998A', marginLeft: 'auto' }}>
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => removeItem(item._id)}
                    style={{ background: 'rgba(232,69,60,0.1)', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer', color: '#E8453C', flexShrink: 0, display: 'flex' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}

              {/* Clear all */}
              <button
                onClick={clearCart}
                style={{ marginTop: '1rem', background: 'none', border: 'none', color: '#6B6560', cursor: 'pointer', fontSize: '0.8rem', textDecoration: 'underline' }}
              >
                Clear all items
              </button>
            </>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div style={{ padding: '1.25rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ color: '#A0998A', fontSize: '0.85rem' }}>Subtotal</span>
              <span style={{ color: '#F5F0E8', fontWeight: 600 }}>{formatPrice(totalPrice)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span style={{ color: '#6B6560', fontSize: '0.8rem' }}>Taxes & charges</span>
              <span style={{ color: '#6B6560', fontSize: '0.8rem' }}>Calculated at checkout</span>
            </div>
            <button
              onClick={handleCheckout}
              className="btn-gold"
              disabled={submitting}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px', fontSize: '1rem', borderRadius: '12px' }}
            >
              {submitting ? 'Sending...' : (tableNumber ? 'Send to Kitchen' : 'Proceed to Checkout')}
              <ArrowRight size={18} />
            </button>
            <div style={{ marginTop: '10px', background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '10px', padding: '10px 12px' }}>
              <p style={{ color: '#D4AF37', fontSize: '0.78rem', fontWeight: 700, marginBottom: '2px' }}>Order Status: Received/Preparing</p>
              <p style={{ color: '#A0998A', fontSize: '0.75rem' }}>Payment Status: Pending (pay at end)</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
