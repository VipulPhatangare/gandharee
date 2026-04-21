import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import OrderTracker from '../components/OrderTracker';
import { getOrder, createPaymentOrder, verifyPayment } from '../services/api';
import { formatPrice, timeAgo } from '../utils/helpers';
import { RefreshCw, ArrowLeft, Banknote, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';

const TrackOrder = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [paying, setPaying] = useState(false);

  const fetchOrder = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await getOrder(orderId);
      setOrder(res.data.data);
      setLastUpdated(new Date());
    } catch {
      setOrder(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    const interval = setInterval(() => fetchOrder(true), 15000); // 15s refresh
    return () => clearInterval(interval);
  }, [orderId]);

  const handleOnlinePayment = async () => {
    try {
      setPaying(true);
      const res = await createPaymentOrder({ tableNumber: order.tableNumber });
      
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_SNocHRSvY5UOAj', 
        amount: res.data.data.amount,
        currency: res.data.data.currency,
        name: 'Gandarree',
        description: `Payment for Table ${order.tableNumber}`,
        order_id: res.data.data.id,
        handler: async function (response) {
          try {
            await verifyPayment({
              tableNumber: order.tableNumber,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });
            toast.success('🎉 Payment Successful!');
            fetchOrder();
          } catch (err) {
            toast.error('Payment verification failed');
          }
        },
        theme: {
          color: '#D4AF37'
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response){
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
    toast.success('Your waiter will collect the cash shortly.', {
      duration: 5000,
    });
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '1rem', animation: 'spin 2s linear infinite', display: 'inline-block' }}>🍽️</div>
        <p style={{ color: '#6B6560' }}>Loading your table tab...</p>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!order) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ fontSize: '3rem' }}>😕</div>
      <h2 className="font-display" style={{ color: '#F5F0E8' }}>Order not found</h2>
      <button onClick={() => navigate('/menu')} className="btn-gold">Go to Menu</button>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main style={{ flex: 1, paddingTop: '90px', paddingBottom: '4rem' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto', padding: '2rem 1.5rem' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
            <button onClick={() => navigate('/menu')} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#F5F0E8' }}>
              <ArrowLeft size={18} />
            </button>
            <div style={{ flex: 1 }}>
              <h1 className="font-display" style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 700, color: '#F5F0E8', display: 'flex', alignItems: 'center', gap: '10px' }}>
                Table {order.tableNumber} Tab
                {order.paymentStatus === 'paid' && (
                   <span style={{ fontSize: '0.9rem', color: '#0A0A0A', background: '#2ECC71', padding: '4px 10px', borderRadius: '8px', fontWeight: 700 }}>PAID</span>
                )}
              </h1>
              <p style={{ color: '#6B6560', fontSize: '0.85rem' }}>
                Auto-refreshes every 15s
              </p>
            </div>
            <button
              onClick={() => fetchOrder(true)}
              disabled={refreshing}
              style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '8px', padding: '8px 14px', cursor: 'pointer', color: '#D4AF37', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
            >
              <RefreshCw size={14} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>

          {/* Tracker */}
          <div className="glass-card" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '0.8rem', color: '#D4AF37', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '1.5rem' }}>Kitchen Status</h3>
            <OrderTracker order={order} />
          </div>

          {/* Items */}
          <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '0.8rem', color: '#D4AF37', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '1.25rem' }}>Order Details ({order.orderNumber})</h3>
            {order.orderedItems.map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < order.orderedItems.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                <div>
                  <p style={{ color: '#F5F0E8', fontWeight: 500, fontSize: '0.9rem' }}>{item.name}</p>
                  <p style={{ color: '#6B6560', fontSize: '0.8rem' }}>x{item.quantity} · {formatPrice(item.price)} each</p>
                </div>
                <p style={{ color: '#D4AF37', fontWeight: 600 }}>{formatPrice(item.price * item.quantity)}</p>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <span className="font-display" style={{ fontWeight: 700, color: '#F5F0E8' }}>Total</span>
              <span className="font-display" style={{ fontWeight: 700, color: '#D4AF37', fontSize: '1.1rem' }}>{formatPrice(order.totalAmount)}</span>
            </div>
          </div>

          {/* Payment Section */}
          {order.paymentStatus === 'pending' && (
             <div className="glass-card" style={{ padding: '1.5rem', background: 'rgba(212,175,55,0.03)' }}>
                <h3 style={{ fontSize: '1.1rem', color: '#F5F0E8', marginBottom: '0.5rem', fontWeight: 600 }}>Done eating?</h3>
                <p style={{ color: '#A0998A', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                  Pay your combined table bill instantly using UPI/Cards, or choose to pay with cash at your table.
                </p>

                <div className="track-payment-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <button 
                    onClick={handleOnlinePayment}
                    disabled={paying}
                    style={{ 
                      background: 'linear-gradient(135deg, #F0D060, #D4AF37)', color: '#0A0A0A', 
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                      padding: '16px', borderRadius: '12px', border: 'none', cursor: paying ? 'not-allowed' : 'pointer',
                      fontWeight: 700, transition: 'transform 0.2s'
                    }}
                  >
                     <CreditCard size={24} />
                     {paying ? 'Loading...' : 'Pay Online (UPI)'}
                  </button>

                  <button 
                    onClick={handleCashPayment}
                    style={{ 
                      background: 'rgba(255,255,255,0.05)', color: '#F5F0E8', 
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                      padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer',
                      fontWeight: 600, transition: 'background 0.2s'
                    }}
                  >
                     <Banknote size={24} color="#2ECC71" />
                     Pay with Cash
                  </button>
                </div>
             </div>
          )}

          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <button onClick={() => navigate('/menu')} className="btn-ghost" style={{ padding: '12px 28px' }}>
               Back to Menu
            </button>
          </div>
        </div>
      </main>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (max-width: 640px) {
          .track-payment-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
      <Footer />
    </div>
  );
};

export default TrackOrder;
