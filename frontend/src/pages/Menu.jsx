import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import FilterPanel from '../components/FilterPanel';
import MenuGrid from '../components/MenuGrid';
import Footer from '../components/Footer';
import { getMenuItems, getCategories } from '../services/api';
import { useDebounce } from '../hooks/useDebounce';

const Menu = () => {
  const [searchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    foodType: '',
    bestseller: searchParams.get('bestseller') === 'true',
    sortBy: '',
    minPrice: '',
    maxPrice: '',
  });

  const debouncedSearch = useDebounce(search, 400);

  // === TABLE SESSION LOGIC ===
  // Grab table number from QR URL param and persist to sessionStorage
  useEffect(() => {
    const tableFromUrl = searchParams.get('table');
    if (tableFromUrl) {
      sessionStorage.setItem('tableNumber', tableFromUrl);
    }
  }, [searchParams]);

  const tableNumber = searchParams.get('table') || sessionStorage.getItem('tableNumber');

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = { available: true, ...filters };
      if (debouncedSearch) params.search = debouncedSearch;
      if (!params.category) delete params.category;
      if (!params.foodType) delete params.foodType;
      if (!params.bestseller) delete params.bestseller;
      if (!params.sortBy) delete params.sortBy;
      if (!params.minPrice) delete params.minPrice;
      if (!params.maxPrice) delete params.maxPrice;

      const res = await getMenuItems(params);
      setItems(res.data.data);
      setTotal(res.data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, filters]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  useEffect(() => {
    getCategories().then((res) => setCategories(res.data.data)).catch(console.error);
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main style={{ flex: 1, paddingTop: '90px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '1.5rem' }}>
          {/* Header */}
          <div style={{ marginBottom: '2rem' }}>
            {/* Table badge — shown when scanning from QR */}
            {tableNumber && (
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)',
                borderRadius: '50px', padding: '6px 16px', marginBottom: '1rem',
                animation: 'fade-up 0.5s ease',
              }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2ECC71', boxShadow: '0 0 8px #2ECC71' }} />
                <span style={{ fontSize: '0.82rem', color: '#D4AF37', fontWeight: 600 }}>
                  📍 You're at Table {tableNumber}
                </span>
              </div>
            )}

            <p style={{ fontSize: '0.75rem', color: '#D4AF37', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '0.5rem' }}>Explore</p>
            <h1 className="font-display" style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 700, color: '#F5F0E8' }}>
              Our Menu
            </h1>
            {!loading && (
              <p style={{ color: '#6B6560', marginTop: '0.25rem', fontSize: '0.9rem' }}>
                {total} {total === 1 ? 'dish' : 'dishes'} available
              </p>
            )}
          </div>

          {/* Filters */}
          <FilterPanel
            filters={filters}
            setFilters={setFilters}
            categories={categories}
            search={search}
            setSearch={setSearch}
          />

          {/* Grid */}
          <MenuGrid items={items} loading={loading} />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Menu;
