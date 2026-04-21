import { useNavigate } from 'react-router-dom';
import { ChevronDown, Star, Sparkles } from 'lucide-react';

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section
      style={{
        minHeight: '100vh',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #0A0A0A 0%, #1A1008 50%, #0A0A0A 100%)',
      }}
    >
      {/* Background image overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'url(https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600&auto=format&fit=crop&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.15,
        }}
      />

      {/* Gradient overlays */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center top, rgba(212,175,55,0.12) 0%, transparent 60%)' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '200px', background: 'linear-gradient(to top, #0A0A0A, transparent)' }} />


      {/* Content */}
      <div style={{ position: 'relative', textAlign: 'center', padding: '0 1.5rem', maxWidth: '800px' }}>
        {/* Badge */}
        <div className="animate-fade-up" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '50px', padding: '8px 20px', marginBottom: '2rem', animationDelay: '0.1s', opacity: 0 }}>
          <Sparkles size={14} color="#D4AF37" />
          <span style={{ fontSize: '0.8rem', color: '#D4AF37', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>AR-Powered Menu Experience</span>
          <Sparkles size={14} color="#D4AF37" />
        </div>

        {/* Heading */}
        <h1
          className="font-display animate-fade-up"
          style={{ fontSize: 'clamp(2.5rem, 7vw, 5rem)', fontWeight: 800, lineHeight: 1.1, marginBottom: '1.5rem', animationDelay: '0.2s', opacity: 0, color: '#F5F0E8' }}
        >
          Taste the Future of
          <span className="text-gold-gradient" style={{ display: 'block' }}>Fine Dining</span>
        </h1>

        {/* Subtitle */}
        <p
          className="animate-fade-up"
          style={{ fontSize: 'clamp(1rem, 2.5vw, 1.2rem)', color: '#A0998A', marginBottom: '2.5rem', lineHeight: 1.7, animationDelay: '0.3s', opacity: 0 }}
        >
          Scan. Browse. Order. Experience AR previews of every dish — <br className="hidden md:block" />
          right from your table.
        </p>

        {/* Stats */}
        <div
          className="animate-fade-up"
          style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '2.5rem', flexWrap: 'wrap', animationDelay: '0.4s', opacity: 0 }}
        >
          {[{ num: '50+', label: 'Signature Dishes' }, { num: '4.9', label: 'Average Rating', icon: true }, { num: '12', label: 'Min Prep Time' }].map((stat) => (
            <div key={stat.label} style={{ textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                {stat.icon && <Star size={16} color="#D4AF37" fill="#D4AF37" />}
                <span className="font-display" style={{ fontSize: '1.8rem', fontWeight: 700, color: '#D4AF37' }}>{stat.num}</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#6B6560', textTransform: 'uppercase', letterSpacing: '1px' }}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div className="animate-fade-up" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', animationDelay: '0.5s', opacity: 0 }}>
          <button onClick={() => navigate('/menu')} className="btn-gold" style={{ fontSize: '1rem', padding: '14px 36px' }}>
            Browse Menu
          </button>
          <button onClick={() => navigate('/menu')} className="btn-ghost" style={{ fontSize: '1rem', padding: '14px 36px' }}>
            View AR Dishes
          </button>
        </div>
      </div>

      {/* Scroll indicator */}
      <div style={{ position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: '#6B6560', animation: 'bounce 2s infinite' }}>
        <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '2px' }}>Scroll</span>
        <ChevronDown size={16} />
      </div>

      <style>{`
        @keyframes bounce { 0%, 100% { transform: translateX(-50%) translateY(0); } 50% { transform: translateX(-50%) translateY(6px); } }
      `}</style>
    </section>
  );
};

export default HeroSection;
