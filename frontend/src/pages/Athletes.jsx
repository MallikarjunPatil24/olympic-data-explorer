import React from 'react';

export default function Athletes() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-24)' }}>
      <header style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: 'var(--space-16)' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>ATHLETES</h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 'var(--space-4)' }}>
          Detailed athlete searching and physical profiles will be implemented in a subsequent sprint.
        </p>
      </header>
      <div style={{ padding: 'var(--space-48)', border: '1px dashed var(--border-subtle)', backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', textAlign: 'center', color: 'var(--text-muted)' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>ATHLETE BIO PROFILE VIEWER</h3>
      </div>
    </div>
  );
}
