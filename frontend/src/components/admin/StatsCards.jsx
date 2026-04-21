import { TrendingUp, ShoppingBag, DollarSign, Clock } from 'lucide-react';
import { formatPrice } from '../../utils/helpers';

const StatCard = ({ icon: Icon, label, value, color, subtext }) => (
  <div className="glass-card" style={{ padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
    <div style={{ position: 'absolute', top: '-10px', right: '-10px', width: '80px', height: '80px', borderRadius: '50%', background: `rgba(${color},0.08)` }} />
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
      <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `rgba(${color},0.15)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={20} color={`rgb(${color})`} />
      </div>
    </div>
    <div>
      <p style={{ fontSize: '0.75rem', color: '#6B6560', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>{label}</p>
      <p className="font-display" style={{ fontSize: '1.8rem', fontWeight: 700, color: '#F5F0E8', lineHeight: 1 }}>{value}</p>
      {subtext && <p style={{ fontSize: '0.75rem', color: '#A0998A', marginTop: '6px' }}>{subtext}</p>}
    </div>
  </div>
);

const StatsCards = ({ data }) => {
  const stats = [
    {
      icon: ShoppingBag,
      label: 'Total Orders',
      value: data?.totalOrders ?? '—',
      color: '212,175,55',
      subtext: `${data?.todayOrders ?? 0} today`,
    },
    {
      icon: DollarSign,
      label: 'Total Revenue',
      value: data?.totalRevenue != null ? formatPrice(data.totalRevenue) : '—',
      color: '46,204,113',
      subtext: 'From paid orders',
    },
    {
      icon: Clock,
      label: 'Pending Orders',
      value: data?.pendingOrders ?? '—',
      color: '243,156,18',
      subtext: 'Needs attention',
    },
    {
      icon: TrendingUp,
      label: 'Today\'s Orders',
      value: data?.todayOrders ?? '—',
      color: '99,102,241',
      subtext: 'Active tables',
    },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
      {stats.map((stat) => <StatCard key={stat.label} {...stat} />)}
    </div>
  );
};

export default StatsCards;
