const LoadingSkeleton = () => (
  <div className="glass-card" style={{ overflow: 'hidden' }}>
    <div className="skeleton" style={{ height: '200px', borderRadius: '0' }} />
    <div style={{ padding: '1rem' }}>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', alignItems: 'center' }}>
        <div className="skeleton" style={{ width: '20px', height: '20px', borderRadius: '4px' }} />
        <div className="skeleton" style={{ height: '18px', flex: 1, borderRadius: '6px' }} />
      </div>
      <div className="skeleton" style={{ height: '13px', borderRadius: '4px', marginBottom: '6px' }} />
      <div className="skeleton" style={{ height: '13px', borderRadius: '4px', width: '70%', marginBottom: '16px' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="skeleton" style={{ width: '80px', height: '22px', borderRadius: '6px' }} />
        <div className="skeleton" style={{ width: '38px', height: '38px', borderRadius: '50%' }} />
      </div>
    </div>
  </div>
);

export const TableSkeleton = ({ rows = 5 }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
    {Array(rows).fill(0).map((_, i) => (
      <div key={i} style={{ display: 'flex', gap: '16px', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
        <div className="skeleton" style={{ width: '48px', height: '48px', borderRadius: '8px', flexShrink: 0 }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', justifyContent: 'center' }}>
          <div className="skeleton" style={{ height: '14px', borderRadius: '4px', width: '60%' }} />
          <div className="skeleton" style={{ height: '12px', borderRadius: '4px', width: '40%' }} />
        </div>
        <div className="skeleton" style={{ width: '80px', height: '28px', borderRadius: '6px', alignSelf: 'center' }} />
      </div>
    ))}
  </div>
);

export default LoadingSkeleton;
