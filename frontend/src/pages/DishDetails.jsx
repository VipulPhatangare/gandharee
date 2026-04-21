/* global HTMLElement */
// model-viewer is a custom web component — loaded via CDN in index.html
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ConfirmPopup from '../components/ConfirmPopup';
import { getMenuItem, placeOrder } from '../services/api';
import { useCart } from '../context/CartContext';
import { formatPrice, getImageUrl, getFoodTypeDot } from '../utils/helpers';
import { ShoppingCart, ArrowLeft, Star, Clock, Layers, X, RotateCcw, Maximize2, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';

const DishDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [dish, setDish] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAR, setShowAR] = useState(false);
  const [arLoaded, setArLoaded] = useState(false);
  const [showARIngredients, setShowARIngredients] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [confirmAddOpen, setConfirmAddOpen] = useState(false);

  useEffect(() => {
    const fetchDish = async () => {
      try {
        const res = await getMenuItem(slug);
        setDish(res.data.data);
      } catch {
        navigate('/menu');
      } finally {
        setLoading(false);
      }
    };
    fetchDish();
  }, [slug]);

  const handleAddToCart = () => {
    setConfirmAddOpen(true);
  };

  const confirmAddToCart = async () => {
    setConfirmAddOpen(false);
    const tableNumber = sessionStorage.getItem('tableNumber');

    if (tableNumber) {
      try {
        await placeOrder({
          tableNumber,
          orderedItems: [{ menuItem: dish._id, quantity }],
        });
        toast.success(`✅ Sent to kitchen for Table ${tableNumber}`,
          { style: { background: '#1A1A1A', color: '#F5F0E8', border: '1px solid rgba(212,175,55,0.3)' } }
        );
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to send order');
      }
      return;
    }

    for (let i = 0; i < quantity; i++) addItem(dish);
    toast.success(`${quantity}x ${dish.name} added to your order! 🍽️`, {
      style: { background: '#1A1A1A', color: '#F5F0E8', border: '1px solid rgba(212,175,55,0.3)' },
    });
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0A0A0A' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '1rem', animation: 'spin 2s linear infinite', display: 'inline-block' }}>🍽️</div>
        <p style={{ color: '#6B6560' }}>Loading dish...</p>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!dish) return null;

  const arSrc = dish.arModelFile
    ? (dish.arModelFile.startsWith('http') ? dish.arModelFile : `${window.location.origin}${dish.arModelFile}`)
    : null;

  const foodTypeColor = getFoodTypeDot(dish.foodType);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#0A0A0A' }}>
      <Navbar />
      <main style={{ flex: 1, paddingTop: '70px' }}>

        {/* ─── Hero ─── */}
        <div style={{ position: 'relative', height: 'clamp(260px, 42vw, 460px)', overflow: 'hidden' }}>
          <img
            src={getImageUrl(dish.image, dish.name)}
            alt={dish.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.85)' }}
            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=900&h=480&fit=crop&auto=format'; }}
          />
          {/* Gradient overlay */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #0A0A0A 0%, rgba(10,10,10,0.5) 50%, transparent 100%)' }} />

          {/* Back button */}
          <button onClick={() => navigate(-1)} style={{
            position: 'absolute', top: '1.25rem', left: '1.25rem',
            background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.12)', borderRadius: '50%',
            width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#F5F0E8',
          }}>
            <ArrowLeft size={18} />
          </button>

          {/* Badges */}
          <div style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', display: 'flex', gap: '8px' }}>
            {dish.bestseller && (
              <span style={{ background: 'linear-gradient(135deg, #F0D060, #D4AF37)', color: '#0A0A0A', fontSize: '0.68rem', fontWeight: 800, padding: '4px 12px', borderRadius: '20px', letterSpacing: '0.5px' }}>
                ⭐ BEST SELLER
              </span>
            )}
            {arSrc && (
              <button
                onClick={() => { setShowAR(true); setArLoaded(false); setShowARIngredients(false); }}
                style={{
                  background: 'linear-gradient(135deg, #6366F1, #4F46E5)',
                  border: 'none', color: '#fff', fontSize: '0.68rem', fontWeight: 800,
                  padding: '5px 13px', borderRadius: '20px', cursor: 'pointer',
                  letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '5px',
                  boxShadow: '0 4px 16px rgba(99,102,241,0.4)',
                  animation: 'pulse-ar 2s infinite',
                }}
              >
                🥽 VIEW IN AR
              </button>
            )}
          </div>
        </div>

        {/* ─── Content Card ─── */}
        <div style={{ maxWidth: '800px', margin: '-2px auto 0', padding: '0 1.25rem 3rem' }}>

          {/* Title + Price */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <div style={{ width: '20px', height: '20px', border: `2px solid ${foodTypeColor}`, borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: foodTypeColor }} />
                </div>
                <span style={{ fontSize: '0.75rem', color: '#A0998A', textTransform: 'capitalize' }}>{dish.foodType}</span>
                {dish.spiceLevel && <span style={{ fontSize: '0.75rem', color: '#A0998A' }}>· {dish.spiceLevel} spice</span>}
              </div>
              <h1 className="font-display" style={{ fontSize: 'clamp(1.6rem, 5vw, 2.4rem)', fontWeight: 700, color: '#F5F0E8', lineHeight: 1.15 }}>
                {dish.name}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={13} color="#D4AF37" fill={s <= Math.round(dish.rating || 0) ? '#D4AF37' : 'none'} />
                ))}
                <span style={{ color: '#A0998A', fontSize: '0.85rem', marginLeft: '4px' }}>{dish.rating?.toFixed(1)}</span>
                {dish.reviewCount > 0 && <span style={{ color: '#6B6560', fontSize: '0.8rem' }}>({dish.reviewCount})</span>}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p className="font-display" style={{ fontSize: '2.2rem', fontWeight: 700, color: '#D4AF37', lineHeight: 1 }}>
                {formatPrice(dish.price)}
              </p>
              <p style={{ color: '#6B6560', fontSize: '0.75rem', marginTop: '4px' }}>per serving</p>
            </div>
          </div>

          {/* Quick info pills */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            {[
              { emoji: '⏱️', label: 'Prep Time', value: `${dish.preparationTime || 15} min` },
              { emoji: '🍽️', label: 'Portion', value: dish.portionSize || 'Regular' },
              { emoji: '🌶️', label: 'Spice', value: dish.spiceLevel || 'Mild' },
            ].map(({ emoji, label, value }) => (
              <div key={label} style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '50px', padding: '7px 14px',
              }}>
                <span style={{ fontSize: '0.85rem' }}>{emoji}</span>
                <div>
                  <p style={{ fontSize: '0.6rem', color: '#6B6560', textTransform: 'uppercase', letterSpacing: '1px', lineHeight: 1 }}>{label}</p>
                  <p style={{ fontSize: '0.8rem', color: '#F5F0E8', fontWeight: 500, textTransform: 'capitalize' }}>{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Description */}
          <div style={{ marginBottom: '1.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', padding: '1.25rem', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h3 style={{ fontSize: '0.75rem', color: '#D4AF37', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '0.75rem' }}>About this dish</h3>
            <p style={{ color: '#A0998A', lineHeight: 1.8, fontSize: '0.92rem' }}>{dish.description}</p>
          </div>

          {/* Ingredients */}
          {dish.ingredients?.length > 0 && (
            <div style={{ marginBottom: '1.75rem' }}>
              <h3 style={{ fontSize: '0.75rem', color: '#D4AF37', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '0.75rem' }}>Ingredients</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {dish.ingredients.map((ing) => (
                  <span key={ing} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '50px', padding: '5px 14px', fontSize: '0.78rem', color: '#A0998A' }}>
                    {ing}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Nutrition */}
          {dish.nutrition && (
            <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '1.75rem' }}>
              <h3 style={{ fontSize: '0.75rem', color: '#D4AF37', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '1rem' }}>Nutrition per serving</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', textAlign: 'center' }}>
                {[
                  { label: 'Calories', value: dish.nutrition.calories, unit: 'kcal' },
                  { label: 'Protein', value: dish.nutrition.protein, unit: 'g' },
                  { label: 'Carbs', value: dish.nutrition.carbs, unit: 'g' },
                  { label: 'Fat', value: dish.nutrition.fat, unit: 'g' },
                ].map(({ label, value, unit }) => (
                  <div key={label}>
                    <p className="font-display" style={{ fontSize: '1.5rem', fontWeight: 700, color: '#D4AF37' }}>{value}</p>
                    <p style={{ fontSize: '0.6rem', color: '#6B6560', textTransform: 'uppercase' }}>{unit}</p>
                    <p style={{ fontSize: '0.72rem', color: '#A0998A' }}>{label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AR inline teaser card (only if model available) */}
          {arSrc && (
            <button
              onClick={() => { setShowAR(true); setArLoaded(false); setShowARIngredients(false); }}
              style={{
                display: 'flex', alignItems: 'center', gap: '1rem', width: '100%', marginBottom: '1.75rem',
                background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(79,70,229,0.06))',
                border: '1px solid rgba(99,102,241,0.3)', borderRadius: '14px',
                padding: '1rem 1.25rem', cursor: 'pointer', textAlign: 'left',
                transition: 'all 0.3s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.6)'; e.currentTarget.style.background = 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(79,70,229,0.1))'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)'; e.currentTarget.style.background = 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(79,70,229,0.06))'; }}
            >
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>
                🥽
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ color: '#818CF8', fontWeight: 700, fontSize: '0.95rem', marginBottom: '2px' }}>View {dish.name} in Augmented Reality</p>
                <p style={{ color: '#6B6560', fontSize: '0.78rem' }}>Rotate, zoom, and place the dish on your table using AR — tap the button to open the 3D viewer</p>
              </div>
              <Maximize2 size={18} color="#818CF8" style={{ flexShrink: 0 }} />
            </button>
          )}

          {/* Quantity + Add to Cart */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', position: 'sticky', bottom: '1rem' }}>
            {/* Quantity selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', overflow: 'hidden', flexShrink: 0 }}>
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{ width: '44px', height: '52px', background: 'none', border: 'none', cursor: 'pointer', color: '#A0998A', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
              <span style={{ width: '36px', textAlign: 'center', color: '#F5F0E8', fontWeight: 700, fontSize: '1rem' }}>{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} style={{ width: '44px', height: '52px', background: 'none', border: 'none', cursor: 'pointer', color: '#D4AF37', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
            </div>

            <button
              onClick={handleAddToCart}
              className="btn-gold"
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '14px 20px', fontSize: '1rem', borderRadius: '12px', minWidth: '200px' }}
            >
              <ShoppingCart size={20} />
              Order It — {formatPrice(dish.price * quantity)}
            </button>
          </div>
        </div>
      </main>

      {/* ══════════════════════════════════════════
          IMMERSIVE AR FULL-SCREEN VIEWER
      ══════════════════════════════════════════ */}
      {showAR && arSrc && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'radial-gradient(ellipse at center, #0F0F1A 0%, #06060F 100%)',
            display: 'flex', flexDirection: 'column',
            animation: 'fade-ar 0.35s ease',
          }}
        >
          {/* AR Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '1rem 1.25rem',
            background: 'linear-gradient(to bottom, rgba(6,6,15,1) 0%, transparent 100%)',
            position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.4)', borderRadius: '50px', padding: '3px 10px' }}>
                  <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#818CF8', boxShadow: '0 0 6px #818CF8' }} />
                  <span style={{ fontSize: '0.7rem', color: '#818CF8', fontWeight: 700 }}>AR MODE</span>
                </div>
              </div>
              <h2 className="font-display" style={{ fontSize: '1.2rem', fontWeight: 700, color: '#F5F0E8' }}>{dish.name}</h2>
              <p style={{ color: '#6B6560', fontSize: '0.75rem' }}>Interactive 3D Model · Drag to rotate</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => setShowARIngredients(true)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '10px',
                  background: 'rgba(212,175,55,0.16)',
                  border: '1px solid rgba(212,175,55,0.35)',
                  color: '#D4AF37',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                }}
              >
                <Layers size={15} /> Ingredients
              </button>
              <button
                onClick={() => { setShowAR(false); setShowARIngredients(false); }}
                style={{
                  width: '40px', height: '40px', borderRadius: '50%',
                  background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: '#F5F0E8',
                }}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {showARIngredients && (
            <div
              onClick={() => setShowARIngredients(false)}
              style={{
                position: 'absolute',
                inset: 0,
                zIndex: 20,
                background: 'rgba(6,6,15,0.55)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1rem',
              }}
            >
              <div
                onClick={(e) => e.stopPropagation()}
                style={{
                  width: 'min(520px, 100%)',
                  maxHeight: '70vh',
                  overflowY: 'auto',
                  borderRadius: '14px',
                  border: '1px solid rgba(212,175,55,0.25)',
                  background: 'rgba(15,15,26,0.95)',
                  padding: '1rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                  <h3 className="font-display" style={{ color: '#F5F0E8', fontSize: '1.1rem', margin: 0 }}>Ingredients</h3>
                  <button
                    onClick={() => setShowARIngredients(false)}
                    style={{
                      background: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      color: '#F5F0E8',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      padding: '6px 10px',
                      fontSize: '0.78rem',
                    }}
                  >
                    Close
                  </button>
                </div>

                {dish.ingredients?.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {dish.ingredients.map((ing) => (
                      <span
                        key={ing}
                        style={{
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '999px',
                          padding: '6px 12px',
                          fontSize: '0.8rem',
                          color: '#DAD4C7',
                        }}
                      >
                        {ing}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: '#A0998A', fontSize: '0.9rem' }}>Ingredients are not available for this dish yet.</p>
                )}
              </div>
            </div>
          )}

          {/* model-viewer — full screen */}
          <model-viewer
            src={arSrc}
            alt={`3D AR model of ${dish.name}`}
            auto-rotate
            auto-rotate-delay="500"
            rotation-per-second="20deg"
            camera-controls
            touch-action="pan-y"
            ar
            ar-modes="webxr scene-viewer quick-look"
            ar-scale="fixed"
            shadow-intensity="1.5"
            shadow-softness="1"
            environment-image="neutral"
            exposure="1.2"
            loading="eager"
            style={{ width: '100%', height: '100%', background: 'transparent' }}
            onLoad={() => setArLoaded(true)}
          >
            {/* Custom poster loading state */}
            <div slot="poster" style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              height: '100%', gap: '1.25rem', color: '#6B6560',
            }}>
              <div style={{ position: 'relative', width: '80px', height: '80px' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', border: '3px solid rgba(99,102,241,0.2)', borderTop: '3px solid #818CF8', animation: 'spin 1.2s linear infinite' }} />
                <div style={{ position: 'absolute', inset: '10px', borderRadius: '50%', border: '3px solid rgba(99,102,241,0.1)', borderBottom: '3px solid rgba(129,140,248,0.5)', animation: 'spin 1.8s linear infinite reverse' }} />
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>🍽️</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ color: '#A0998A', fontSize: '0.95rem', fontWeight: 600 }}>Loading 3D Model...</p>
                <p style={{ color: '#6B6560', fontSize: '0.75rem', marginTop: '4px' }}>This may take a few seconds</p>
              </div>
            </div>

            {/* AR launch button — shown only on AR-capable devices */}
            <button
              slot="ar-button"
              style={{
                position: 'absolute', bottom: '100px', left: '50%', transform: 'translateX(-50%)',
                background: 'linear-gradient(135deg, #6366F1, #4F46E5)',
                color: 'white', border: 'none', borderRadius: '50px',
                padding: '14px 28px', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '8px',
                boxShadow: '0 8px 32px rgba(99,102,241,0.5)',
                whiteSpace: 'nowrap',
              }}
            >
              📱 Place on Your Table (AR)
            </button>
          </model-viewer>

          {/* Bottom controls bar */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            background: 'linear-gradient(to top, rgba(6,6,15,1) 0%, transparent 100%)',
            padding: '1.25rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem',
            flexWrap: 'wrap',
          }}>
            {[
              { icon: '🖱️', text: 'Drag to Rotate' },
              { icon: '🔍', text: 'Pinch to Zoom' },
              { icon: '📱', text: '"Place on Table" for Live AR' },
            ].map((h) => (
              <div key={h.text} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#4A4860' }}>
                <span>{h.icon}</span>
                <span>{h.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <Footer />
      <ConfirmPopup
        open={confirmAddOpen}
        title={sessionStorage.getItem('tableNumber') ? 'Send to kitchen' : 'Add to My Order'}
        message={sessionStorage.getItem('tableNumber')
          ? `Table ${sessionStorage.getItem('tableNumber')} is assigned. Send ${quantity} x \"${dish.name}\" to kitchen now?`
          : `Add ${quantity} x \"${dish.name}\" to My Order?`
        }
        confirmText={sessionStorage.getItem('tableNumber') ? 'Send Now' : 'Add'}
        cancelText="Cancel"
        onConfirm={confirmAddToCart}
        onCancel={() => setConfirmAddOpen(false)}
      />
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fade-ar { from { opacity: 0; } to { opacity: 1; } }
        @keyframes pulse-ar {
          0%, 100% { box-shadow: 0 4px 16px rgba(99,102,241,0.4); }
          50% { box-shadow: 0 4px 28px rgba(99,102,241,0.7); }
        }
      `}</style>
    </div>
  );
};

export default DishDetails;
