import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login as loginApi } from '../services/api';
import { ChefHat, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
  const navigate = useNavigate();
  const { loginUser, isAdmin } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  if (isAdmin) { navigate('/admin'); return null; }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { toast.error('Please fill all fields'); return; }
    setLoading(true);
    try {
      const res = await loginApi(form);
      loginUser(res.data.user, res.data.token);
      toast.success(`Welcome back, ${res.data.user.name}! 👋`, { style: { background: '#1A1A1A', color: '#F5F0E8', border: '1px solid rgba(212,175,55,0.3)' } });
      navigate('/admin');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(ellipse at center, rgba(212,175,55,0.06) 0%, #0A0A0A 60%)', padding: '2rem' }}>
      <div className="glass-card animate-fade-up" style={{ width: '100%', maxWidth: '420px', padding: '2.5rem 2rem' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: '56px', height: '56px', background: 'linear-gradient(135deg, #F0D060, #D4AF37)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <ChefHat size={28} color="#0A0A0A" />
          </div>
          <h1 className="font-display" style={{ fontSize: '1.75rem', fontWeight: 700, color: '#F5F0E8', marginBottom: '0.25rem' }}>Admin Login</h1>
          <p style={{ color: '#6B6560', fontSize: '0.85rem' }}>Sign in to manage your restaurant</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: '#A0998A', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>Email</label>
            <input
              type="email"
              placeholder="admin@arhotel.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="input-gold"
              autoComplete="email"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: '#A0998A', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="input-gold"
                style={{ paddingRight: '46px' }}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#6B6560', display: 'flex' }}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div style={{ marginTop: '0.5rem' }}>
            <button
              type="submit"
              className="btn-gold"
              disabled={loading}
              style={{ width: '100%', padding: '14px', fontSize: '1rem', borderRadius: '12px', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? '⏳ Signing in...' : 'Sign In'}
            </button>
          </div>
        </form>

        {/* Demo credentials hint */}
        <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.15)', borderRadius: '10px', textAlign: 'center' }}>
          <p style={{ fontSize: '0.75rem', color: '#6B6560', marginBottom: '6px' }}>Demo Credentials</p>
          <p style={{ fontSize: '0.8rem', color: '#A0998A' }}>admin@arhotel.com / admin123</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
