import { ORDER_STATUSES, getStatusIndex } from '../utils/helpers';

const OrderTracker = ({ order }) => {
  const currentIndex = getStatusIndex(order?.orderStatus || 'received');

  if (order?.orderStatus === 'cancelled') {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', background: 'rgba(232,69,60,0.1)', borderRadius: '12px', border: '1px solid rgba(232,69,60,0.2)' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
        <h3 style={{ color: '#E8453C', fontSize: '1.2rem', fontWeight: 600 }}>Order Cancelled</h3>
        <p style={{ color: '#A0998A', marginTop: '0.5rem' }}>Please contact the staff for assistance.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '0.5rem 0' }}>
      {ORDER_STATUSES.map((step, index) => {
        const isDone = index < currentIndex;
        const isActive = index === currentIndex;
        const isFuture = index > currentIndex;

        return (
          <div key={step.key} style={{ display: 'flex', gap: '1rem', position: 'relative' }}>
            {/* Line */}
            {index < ORDER_STATUSES.length - 1 && (
              <div style={{ position: 'absolute', left: '19px', top: '48px', width: '2px', height: '40px', background: isDone ? '#2ECC71' : 'rgba(255,255,255,0.08)', transition: 'background 0.5s ease' }} />
            )}

            {/* Icon */}
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.1rem',
                flexShrink: 0,
                border: `2px solid ${isDone ? '#2ECC71' : isActive ? step.color : 'rgba(255,255,255,0.1)'}`,
                background: isDone ? 'rgba(46,204,113,0.12)' : isActive ? `rgba(${hexToRgb(step.color)},0.12)` : 'transparent',
                transition: 'all 0.5s ease',
              }}
            >
              {isDone ? '✓' : step.icon}
            </div>

            {/* Content */}
            <div style={{ flex: 1, paddingBottom: '2.5rem' }}>
              <h4
                style={{
                  fontSize: '0.95rem',
                  fontWeight: isActive ? 700 : 500,
                  color: isDone ? '#2ECC71' : isActive ? step.color : '#6B6560',
                  marginBottom: '2px',
                  transition: 'color 0.3s',
                }}
              >
                {step.label}
              </h4>
              {isActive && (
                <p style={{ fontSize: '0.8rem', color: '#A0998A' }}>
                  {step.key === 'received' && 'We received your order and will start preparing soon!'}
                  {step.key === 'preparing' && 'Our chefs are carefully preparing your meal...'}
                  {step.key === 'ready' && 'Your food is ready! Server will bring it to your table.'}
                  {step.key === 'served' && 'Enjoy your meal! Bon appétit! 🍽️'}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? `${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)}` : '212,175,55';
};

export default OrderTracker;
