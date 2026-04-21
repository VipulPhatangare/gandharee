const ConfirmPopup = ({ open, title, message, confirmText = 'Confirm', cancelText = 'Cancel', onConfirm, onCancel }) => {
  if (!open) return null;

  return (
    <div
      onClick={onCancel}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.72)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="glass-card"
        style={{
          width: 'min(420px, 100%)',
          padding: '1.25rem',
          borderRadius: '14px',
        }}
      >
        <h3 className="font-display" style={{ color: '#F5F0E8', fontSize: '1.2rem', marginBottom: '0.5rem' }}>
          {title}
        </h3>
        <p style={{ color: '#A0998A', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1rem' }}>{message}</p>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button
            type="button"
            onClick={onCancel}
            className="btn-ghost"
            style={{ padding: '9px 18px' }}
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="btn-gold"
            style={{ padding: '10px 20px' }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmPopup;
