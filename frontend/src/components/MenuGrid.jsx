import DishCard from './DishCard';
import LoadingSkeleton from './LoadingSkeleton';

const MenuGrid = ({ items, loading }) => {
  if (loading) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {Array(6).fill(0).map((_, i) => <LoadingSkeleton key={i} />)}
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🍽️</div>
        <h3 className="font-display" style={{ fontSize: '1.5rem', color: '#F5F0E8', marginBottom: '0.5rem' }}>No dishes found</h3>
        <p style={{ color: '#6B6560' }}>Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div
      className="stagger-children"
      style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}
    >
      {items.map((dish) => <DishCard key={dish._id} dish={dish} />)}
    </div>
  );
};

export default MenuGrid;
