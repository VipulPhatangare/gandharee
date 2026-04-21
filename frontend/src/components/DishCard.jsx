import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Star, Zap } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { placeOrder } from '../services/api';
import { formatPrice, getImageUrl, getFoodTypeDot } from '../utils/helpers';
import ConfirmPopup from './ConfirmPopup';
import toast from 'react-hot-toast';

const FoodTypeDot = ({ type }) => (
  <div style={{ width: '20px', height: '20px', border: `2px solid ${getFoodTypeDot(type)}`, borderRadius: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: getFoodTypeDot(type) }} />
  </div>
);

const DishCard = ({ dish, layout = 'grid' }) => {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleAddToCart = (e) => {
    e.stopPropagation();
    setConfirmOpen(true);
  };

  const confirmAddToCart = async () => {
    setConfirmOpen(false);
    const tableNumber = sessionStorage.getItem('tableNumber');

    if (tableNumber) {
      try {
        await placeOrder({
          tableNumber,
          orderedItems: [{ menuItem: dish._id, quantity: 1 }],
        });
        toast.success(`✅ Sent to kitchen for Table ${tableNumber}`,
          { style: { background: '#1A1A1A', color: '#F5F0E8', border: '1px solid rgba(212,175,55,0.3)' } }
        );
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to send order');
      }
      return;
    }

    addItem(dish);
    toast.success(`${dish.name} added to My Order! 🍽️`, { style: { background: '#1A1A1A', color: '#F5F0E8', border: '1px solid rgba(212,175,55,0.3)' } });
  };

  return (
    <>
      <div
        className="dish-card glass-card animate-fade-up"
        onClick={() => navigate(`/dish/${dish.slug}`)}
        style={{ cursor: 'pointer', overflow: 'hidden', position: 'relative', opacity: 0 }}
      >
      {/* Badges */}
      <div style={{ position: 'absolute', top: '12px', left: '12px', zIndex: 2, display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {dish.bestseller && (
          <span style={{ background: 'linear-gradient(135deg, #F0D060, #D4AF37)', color: '#0A0A0A', fontSize: '0.65rem', fontWeight: 700, padding: '3px 10px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            ⭐ Best Seller
          </span>
        )}
        {dish.arModelFile && (
          <span style={{ background: 'rgba(99,102,241,0.9)', color: '#fff', fontSize: '0.65rem', fontWeight: 700, padding: '3px 10px', borderRadius: '20px' }}>
            AR
          </span>
        )}
      </div>

      {/* Image */}
      <div className="card-image" style={{ height: '200px', position: 'relative', background: '#111' }}>
        <img
          src={getImageUrl(dish.image, dish.name)}
          alt={dish.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop&auto=format'; }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 50%)' }} />
      </div>

      {/* Content */}
      <div style={{ padding: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
            <FoodTypeDot type={dish.foodType} />
            <h3 className="font-display" style={{ fontSize: '1rem', fontWeight: 600, color: '#F5F0E8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {dish.name}
            </h3>
          </div>
        </div>

        <p style={{ fontSize: '0.8rem', color: '#6B6560', marginBottom: '12px', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {dish.shortDescription || dish.description}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span className="font-display" style={{ fontSize: '1.2rem', fontWeight: 700, color: '#D4AF37' }}>
              {formatPrice(dish.price)}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
              <Star size={11} color="#D4AF37" fill="#D4AF37" />
              <span style={{ fontSize: '0.75rem', color: '#A0998A' }}>{dish.rating?.toFixed(1)}</span>
              {dish.reviewCount > 0 && <span style={{ fontSize: '0.7rem', color: '#6B6560' }}>({dish.reviewCount})</span>}
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg, #F0D060, #D4AF37)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', flexShrink: 0 }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.15)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(212,175,55,0.5)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <ShoppingCart size={16} color="#0A0A0A" />
          </button>
        </div>

        {dish.preparationTime && (
          <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Zap size={11} color="#6B6560" />
            <span style={{ fontSize: '0.7rem', color: '#6B6560' }}>{dish.preparationTime} min</span>
          </div>
        )}
      </div>
      </div>

      <ConfirmPopup
        open={confirmOpen}
        title={sessionStorage.getItem('tableNumber') ? 'Send to kitchen' : 'Add to My Order'}
        message={sessionStorage.getItem('tableNumber')
          ? `Table ${sessionStorage.getItem('tableNumber')} is assigned. Send \"${dish.name}\" to kitchen now?`
          : `Add \"${dish.name}\" to My Order?`
        }
        confirmText={sessionStorage.getItem('tableNumber') ? 'Send Now' : 'Add'}
        cancelText="Cancel"
        onConfirm={confirmAddToCart}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
};

export default DishCard;
