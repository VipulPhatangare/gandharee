import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import DishCard from '../components/DishCard';
import Footer from '../components/Footer';
import { getMenuItems, getCategories } from '../services/api';
import { ArrowRight, Star } from 'lucide-react';

const Home = () => {
  const [featured, setFeatured] = useState([]);
  const [popular, setPopular] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [featuredRes, popularRes, catRes] = await Promise.all([
          getMenuItems({ featured: true, limit: 6 }),
          getMenuItems({ bestseller: true, limit: 6 }),
          getCategories(),
        ]);
        setFeatured(featuredRes.data.data);
        setPopular(popularRes.data.data);
        setCategories(catRes.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <HeroSection />

      {/* Categories Section */}
      <section style={{ padding: '5rem 1.5rem', background: '#0D0D0D' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <p style={{ fontSize: '0.75rem', color: '#D4AF37', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '0.75rem' }}>Explore</p>
            <h2 className="font-display" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 700, color: '#F5F0E8' }}>Our Categories</h2>
          </div>
          <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem', justifyContent: categories.length <= 4 ? 'center' : 'flex-start' }}>
            {categories.map((cat) => (
              <button
                key={cat._id}
                onClick={() => navigate(`/menu?category=${cat._id}`)}
                style={{ flexShrink: 0, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1.5rem 2rem', cursor: 'pointer', transition: 'all 0.3s', textAlign: 'center', minWidth: '120px' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#D4AF37'; e.currentTarget.style.background = 'rgba(212,175,55,0.08)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
              >
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                  {cat.name === 'Starters' ? '🥗' : cat.name === 'Main Course' ? '🍛' : cat.name === 'Pizza' ? '🍕' : cat.name === 'Burgers' ? '🍔' : cat.name === 'Desserts' ? '🍰' : cat.name === 'Drinks' ? '🥤' : cat.name === 'Breads' ? '🥖' : '🍽️'}
                </div>
                <p style={{ color: '#F5F0E8', fontWeight: 600, fontSize: '0.9rem' }}>{cat.name}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Dishes */}
      {featured.length > 0 && (
        <section style={{ padding: '5rem 1.5rem' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <p style={{ fontSize: '0.75rem', color: '#D4AF37', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '0.5rem' }}>Chef's Selection</p>
                <h2 className="font-display" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 700, color: '#F5F0E8' }}>Featured Dishes</h2>
              </div>
              <button onClick={() => navigate('/menu')} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#D4AF37', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 }}>
                View All <ArrowRight size={16} />
              </button>
            </div>
            <div className="stagger-children" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {featured.map((dish) => <DishCard key={dish._id} dish={dish} />)}
            </div>
          </div>
        </section>
      )}

      {/* Why Us section */}
      <section style={{ padding: '5rem 1.5rem', background: '#0D0D0D' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 className="font-display" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 700, color: '#F5F0E8' }}>
              Why <span style={{ color: '#D4AF37' }}>Gandarree?</span>
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
            {[
              { icon: '📱', title: 'QR Scan Access', desc: 'Scan from your table and instantly browse the full menu on your phone' },
              { icon: '🥽', title: 'AR Dish Preview', desc: 'View 3D previews of dishes before ordering — see it before you eat it' },
              { icon: '⚡', title: 'Instant Ordering', desc: 'Add to My Order and checkout in seconds — no app downloads needed' },
              { icon: '🔴', title: 'Live Order Tracking', desc: 'Track your order status in real-time from received to served' },
            ].map((item) => (
              <div key={item.title} className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{item.icon}</div>
                <h3 className="font-display" style={{ fontSize: '1.1rem', fontWeight: 600, color: '#F5F0E8', marginBottom: '0.75rem' }}>{item.title}</h3>
                <p style={{ color: '#6B6560', fontSize: '0.85rem', lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular dishes */}
      {popular.length > 0 && (
        <section style={{ padding: '5rem 1.5rem' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <p style={{ fontSize: '0.75rem', color: '#D4AF37', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '0.5rem' }}>Customer Favorites</p>
                <h2 className="font-display" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 700, color: '#F5F0E8' }}>
                  Best Sellers <Star size={22} color="#D4AF37" fill="#D4AF37" style={{ display: 'inline' }} />
                </h2>
              </div>
              <button onClick={() => navigate('/menu?bestseller=true')} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#D4AF37', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 }}>
                View All <ArrowRight size={16} />
              </button>
            </div>
            <div className="stagger-children" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {popular.map((dish) => <DishCard key={dish._id} dish={dish} />)}
            </div>
          </div>
        </section>
      )}

      {/* CTA Banner */}
      <section style={{ padding: '4rem 1.5rem', background: 'linear-gradient(135deg, rgba(212,175,55,0.08) 0%, rgba(212,175,55,0.02) 100%)', borderTop: '1px solid rgba(212,175,55,0.1)', borderBottom: '1px solid rgba(212,175,55,0.1)' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
          <h2 className="font-display" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 700, color: '#F5F0E8', marginBottom: '1rem' }}>
            Ready to Order?
          </h2>
          <p style={{ color: '#A0998A', marginBottom: '2rem', fontSize: '1rem' }}>Browse our full menu and place your order right from your table</p>
          <button onClick={() => navigate('/menu')} className="btn-gold" style={{ fontSize: '1.1rem', padding: '16px 40px' }}>
            Explore Full Menu
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
