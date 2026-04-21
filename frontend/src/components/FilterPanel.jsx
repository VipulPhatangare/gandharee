import { useState } from 'react';
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react';

const FOOD_TYPES = [
  { value: '', label: 'All' },
  { value: 'veg', label: '🟢 Veg' },
  { value: 'nonveg', label: '🔴 Non-Veg' },
  { value: 'jain', label: '🟡 Jain' },
  { value: 'vegan', label: '🟢 Vegan' },
];

const SORT_OPTIONS = [
  { value: '', label: 'Default' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'popular', label: 'Most Popular' },
];

const FilterPanel = ({ filters, setFilters, categories, search, setSearch }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const clearFilters = () => {
    setFilters({ category: '', foodType: '', bestseller: false, sortBy: '', minPrice: '', maxPrice: '' });
    setSearch('');
  };

  const hasActiveFilters = search || filters.category || filters.foodType || filters.bestseller || filters.sortBy || filters.minPrice || filters.maxPrice;

  return (
    <div style={{ marginBottom: '2rem' }}>
      {/* Search bar */}
      <div style={{ position: 'relative', marginBottom: '1rem' }}>
        <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#6B6560' }} />
        <input
          type="text"
          placeholder="Search dishes, ingredients..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-gold"
          style={{ paddingLeft: '48px', paddingRight: search ? '48px' : '16px' }}
        />
        {search && (
          <button onClick={() => setSearch('')} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#6B6560' }}>
            <X size={16} />
          </button>
        )}
      </div>

      {/* Category pills */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '12px', scrollbarWidth: 'none' }}>
        <style>{`::-webkit-scrollbar { display: none; }`}</style>
        <button
          onClick={() => setFilters({ ...filters, category: '' })}
          style={{ padding: '7px 16px', borderRadius: '50px', border: `1px solid ${!filters.category ? '#D4AF37' : 'rgba(255,255,255,0.1)'}`, background: !filters.category ? 'rgba(212,175,55,0.15)' : 'transparent', color: !filters.category ? '#D4AF37' : '#A0998A', cursor: 'pointer', whiteSpace: 'nowrap', fontSize: '0.85rem', fontWeight: 500, transition: 'all 0.2s', flexShrink: 0 }}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat._id}
            onClick={() => setFilters({ ...filters, category: filters.category === cat._id ? '' : cat._id })}
            style={{ padding: '7px 16px', borderRadius: '50px', border: `1px solid ${filters.category === cat._id ? '#D4AF37' : 'rgba(255,255,255,0.1)'}`, background: filters.category === cat._id ? 'rgba(212,175,55,0.15)' : 'transparent', color: filters.category === cat._id ? '#D4AF37' : '#A0998A', cursor: 'pointer', whiteSpace: 'nowrap', fontSize: '0.85rem', fontWeight: 500, transition: 'all 0.2s', flexShrink: 0 }}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Advanced filters toggle */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {FOOD_TYPES.map((ft) => (
            <button
              key={ft.value}
              onClick={() => setFilters({ ...filters, foodType: ft.value })}
              style={{ padding: '6px 14px', borderRadius: '50px', border: `1px solid ${filters.foodType === ft.value ? '#D4AF37' : 'rgba(255,255,255,0.08)'}`, background: filters.foodType === ft.value ? 'rgba(212,175,55,0.12)' : 'rgba(255,255,255,0.03)', color: filters.foodType === ft.value ? '#D4AF37' : '#A0998A', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500, transition: 'all 0.2s' }}
            >
              {ft.label}
            </button>
          ))}
          <button
            onClick={() => setFilters({ ...filters, bestseller: !filters.bestseller })}
            style={{ padding: '6px 14px', borderRadius: '50px', border: `1px solid ${filters.bestseller ? '#D4AF37' : 'rgba(255,255,255,0.08)'}`, background: filters.bestseller ? 'rgba(212,175,55,0.12)' : 'rgba(255,255,255,0.03)', color: filters.bestseller ? '#D4AF37' : '#A0998A', cursor: 'pointer', fontSize: '0.8rem', transition: 'all 0.2s' }}
          >
            ⭐ Best Sellers
          </button>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
          {hasActiveFilters && (
            <button onClick={clearFilters} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', borderRadius: '8px', background: 'rgba(232,69,60,0.1)', border: '1px solid rgba(232,69,60,0.3)', color: '#E8453C', cursor: 'pointer', fontSize: '0.8rem' }}>
              <X size={12} /> Clear
            </button>
          )}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#A0998A', cursor: 'pointer', fontSize: '0.8rem' }}
          >
            <SlidersHorizontal size={14} />
            More
            <ChevronDown size={12} style={{ transform: showAdvanced ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </button>
        </div>
      </div>

      {/* Advanced panel */}
      {showAdvanced && (
        <div className="glass-card animate-fade-in" style={{ marginTop: '1rem', padding: '1.25rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {/* Sort */}
          <div>
            <label style={{ fontSize: '0.75rem', color: '#6B6560', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', display: 'block' }}>Sort By</label>
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
              className="input-gold"
              style={{ padding: '10px 14px' }}
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} style={{ background: '#1A1A1A' }}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Price range */}
          <div>
            <label style={{ fontSize: '0.75rem', color: '#6B6560', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', display: 'block' }}>Min Price (₹)</label>
            <input
              type="number"
              placeholder="0"
              value={filters.minPrice}
              onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
              className="input-gold"
              style={{ padding: '10px 14px' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', color: '#6B6560', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', display: 'block' }}>Max Price (₹)</label>
            <input
              type="number"
              placeholder="1000"
              value={filters.maxPrice}
              onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
              className="input-gold"
              style={{ padding: '10px 14px' }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterPanel;
