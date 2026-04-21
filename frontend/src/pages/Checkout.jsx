import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';
import { placeOrder } from '../services/api';
import { formatPrice, getImageUrl } from '../utils/helpers';
import { ArrowLeft, CheckCircle, Lock, MapPin, Wallet } from 'lucide-react';
import toast from 'react-hot-toast';

const Checkout = () => {
  const navigate = useNavigate();
  const { items, totalPrice } = useCart();
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [orderNumber, setOrderNumber] = useState(null);

  // Read locked table number from session (set by QR scan)
  const lockedTable = sessionStorage.getItem('tableNumber') || '';

  const [form, setForm] = useState({
    customerName: '',
    mobile: '',
    tableNumber: lockedTable,
    specialInstructions: '',
  });
  const [errors, setErrors] = useState({});

  // Update form if sessionStorage changes
  useEffect(() => {
    if (lockedTable) setForm((f) => ({ ...f, tableNumber: lockedTable }));
  }, [lockedTable]);

  const validate = () => {
    const errs = {};
    if (form.mobile.trim() && !/^\d{10}$/.test(form.mobile)) errs.mobile = 'Enter a valid 10-digit mobile number';
    if (!form.tableNumber.trim()) errs.tableNumber = 'Table number is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    if (items.length === 0) { toast.error('My Order is empty'); return; }

    setLoading(true);
    try {
      const orderData = {
        customerName: form.customerName,
        mobile: form.mobile,
        tableNumber: form.tableNumber,
        specialInstructions: form.specialInstructions,
        orderedItems: items.map((i) => ({ menuItem: i._id, quantity: i.quantity })),
      };
      const res = await placeOrder(orderData);
      setOrderId(res.data.data.orderId);
      setOrderNumber(res.data.data.orderNumber);
      toast.success('🎉 Order placed!', {
        style: { background: '#1A1A1A', color: '#F5F0E8', border: '1px solid rgba(212,175,55,0.3)' },
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  // Success screen
  if (orderId) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#0A0A0A' }}>
        <Navbar />
        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <div className="glass-card animate-fade-up" style={{ maxWidth: '460px', width: '100%', padding: '3rem 2rem', textAlign: 'center' }}>
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%',
              background: 'rgba(46,204,113,0.12)', border: '2px solid #2ECC71',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem',
              animation: 'pop 0.4s ease',
            }}>
              <CheckCircle size={36} color="#2ECC71" />
            </div>
            <h2 className="font-display" style={{ fontSize: '2rem', fontWeight: 700, color: '#F5F0E8', marginBottom: '0.75rem' }}>
              Order Placed! 🎉
            </h2>
            <p style={{ color: '#A0998A', marginBottom: '0.5rem' }}>
              Your order <strong style={{ color: '#D4AF37' }}>{orderNumber}</strong> is confirmed.
            </p>
            {form.tableNumber && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '50px', padding: '5px 14px', marginBottom: '1.5rem' }}>
                <MapPin size={12} color="#D4AF37" />
                <span style={{ fontSize: '0.8rem', color: '#D4AF37' }}>Table {form.tableNumber}</span>
              </div>
            )}
            <p style={{ color: '#6B6560', fontSize: '0.85rem', marginBottom: '2.5rem' }}>
              Sit back and relax — we'll bring your food to the table!
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button onClick={() => navigate(`/track/${orderId}`)} className="btn-gold" style={{ padding: '14px', borderRadius: '12px', fontSize: '1rem' }}>
                📍 Track My Order
              </button>
              <button onClick={() => navigate('/menu')} className="btn-ghost" style={{ padding: '13px', borderRadius: '12px', fontSize: '1rem' }}>
                Order More
              </button>
            </div>
          </div>
        </main>
        <style>{`@keyframes pop { from { transform: scale(0.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }`}</style>
        <Footer />
      </div>
    );
  }

  if (items.length === 0) { navigate('/menu'); return null; }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main style={{ flex: 1, paddingTop: '90px', paddingBottom: '4rem' }}>
        <div style={{ maxWidth: '880px', margin: '0 auto', padding: '1.5rem' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <button onClick={() => navigate(-1)} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#F5F0E8', flexShrink: 0 }}>
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="font-display" style={{ fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', fontWeight: 700, color: '#F5F0E8' }}>Checkout</h1>
              {lockedTable && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#2ECC71', boxShadow: '0 0 6px #2ECC71' }} />
                  <p style={{ color: '#D4AF37', fontSize: '0.82rem', fontWeight: 600 }}>🪑 Table {lockedTable} — assigned from QR scan</p>
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.3fr) minmax(0, 1fr)', gap: '1.5rem', alignItems: 'start' }}>
            {/* Left: Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Your Details */}
              <div className="glass-card" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '0.78rem', color: '#D4AF37', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '1.25rem' }}>
                  Your Details
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', color: '#A0998A', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '1px' }}>Your Name (Optional)</label>
                    <input
                      type="text"
                      placeholder="Enter your name (optional)"
                      value={form.customerName}
                      onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                      className="input-gold"
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', color: '#A0998A', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '1px' }}>Mobile Number (Optional)</label>
                    <input
                      type="tel"
                      placeholder="10-digit mobile number (optional)"
                      value={form.mobile}
                      onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                      className="input-gold"
                      maxLength={10}
                      style={{ borderColor: errors.mobile ? '#E8453C' : undefined }}
                    />
                    {errors.mobile && <p style={{ color: '#E8453C', fontSize: '0.72rem', marginTop: '4px' }}>{errors.mobile}</p>}
                  </div>

                  {/* Table — locked if from QR */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', color: '#A0998A', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                      Table Number *
                      {lockedTable && <span style={{ color: '#D4AF37', marginLeft: '8px' }}>📍 Auto-assigned</span>}
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        placeholder="e.g. 3"
                        value={form.tableNumber}
                        readOnly={!!lockedTable}
                        onChange={(e) => !lockedTable && setForm({ ...form, tableNumber: e.target.value })}
                        className="input-gold"
                        style={{
                          borderColor: errors.tableNumber ? '#E8453C' : lockedTable ? 'rgba(212,175,55,0.4)' : undefined,
                          background: lockedTable ? 'rgba(212,175,55,0.04)' : undefined,
                          paddingRight: lockedTable ? '44px' : undefined,
                          color: lockedTable ? '#D4AF37' : undefined,
                          cursor: lockedTable ? 'not-allowed' : 'text',
                        }}
                      />
                      {lockedTable && (
                        <Lock size={14} color="#D4AF37" style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                      )}
                    </div>
                    {errors.tableNumber && <p style={{ color: '#E8453C', fontSize: '0.72rem', marginTop: '4px' }}>{errors.tableNumber}</p>}
                  </div>
                </div>
              </div>

              {/* Payment */}
              <div className="glass-card" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '0.78rem', color: '#D4AF37', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '1rem' }}>Payment</h3>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '12px', padding: '12px' }}>
                  <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: 'rgba(212,175,55,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Wallet size={16} color="#D4AF37" />
                  </div>
                  <div>
                    <p style={{ color: '#F5F0E8', fontSize: '0.9rem', fontWeight: 600 }}>Pay at the end of lunch/dinner</p>
                    <p style={{ color: '#A0998A', fontSize: '0.8rem', marginTop: '2px' }}>
                      Your order goes to kitchen/admin immediately. Payment remains pending and can be settled when the meal is completed.
                    </p>
                  </div>
                </div>
              </div>

              {/* Special instructions */}
              <div className="glass-card" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '0.78rem', color: '#D4AF37', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '1.25rem' }}>Special Instructions</h3>
                <textarea
                  value={form.specialInstructions}
                  onChange={(e) => setForm({ ...form, specialInstructions: e.target.value })}
                  placeholder="Allergies, spice preference, special requests..."
                  className="input-gold"
                  rows={3}
                  style={{ resize: 'none' }}
                />
              </div>

              <button
                type="submit"
                className="btn-gold"
                disabled={loading}
                style={{ width: '100%', padding: '16px', fontSize: '1.05rem', borderRadius: '12px', opacity: loading ? 0.7 : 1 }}
              >
                {loading ? '⏳ Placing Order...' : `🍽️ Place Order — ${formatPrice(totalPrice)}`}
              </button>
              <div style={{ marginTop: '10px', background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '10px', padding: '10px 12px' }}>
                <p style={{ color: '#D4AF37', fontSize: '0.78rem', fontWeight: 700, marginBottom: '2px' }}>Order Status: Received/Preparing</p>
                <p style={{ color: '#A0998A', fontSize: '0.75rem' }}>Payment Status: Pending (pay after meal)</p>
              </div>
            </form>

            {/* Right: Order Summary */}
            <div className="glass-card" style={{ padding: '1.5rem', position: 'sticky', top: '100px' }}>
              <h3 className="font-display" style={{ fontSize: '1rem', fontWeight: 600, color: '#F5F0E8', marginBottom: '1.25rem' }}>Order Summary</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '1.25rem', maxHeight: '280px', overflowY: 'auto' }}>
                {items.map((item) => (
                  <div key={item._id} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
                      <img
                        src={getImageUrl(item.image, item.name)}
                        alt={item.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=100&fit=crop&auto=format'; }}
                      />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '0.85rem', color: '#F5F0E8', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</p>
                      <p style={{ fontSize: '0.75rem', color: '#6B6560' }}>x{item.quantity}</p>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#D4AF37', fontWeight: 600, flexShrink: 0 }}>{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#A0998A', fontSize: '0.85rem' }}>Subtotal</span>
                  <span style={{ color: '#F5F0E8' }}>{formatPrice(totalPrice)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6B6560', fontSize: '0.8rem' }}>GST & Taxes</span>
                  <span style={{ color: '#6B6560', fontSize: '0.8rem' }}>Included</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <span className="font-display" style={{ color: '#F5F0E8', fontWeight: 700 }}>Total</span>
                  <span className="font-display" style={{ color: '#D4AF37', fontWeight: 700, fontSize: '1.2rem' }}>{formatPrice(totalPrice)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Checkout;
