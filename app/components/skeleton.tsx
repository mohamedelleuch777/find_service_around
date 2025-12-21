'use client';

export function SkeletonLine({ width = '100%', height = '1rem', className = '' }: { width?: string; height?: string; className?: string }) {
  return (
    <div
      className={className}
      style={{
        width,
        height,
        background: 'linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 2s infinite',
        borderRadius: '0.375rem',
      }}
    />
  );
}

export function SkeletonCircle({ size = '40px', className = '' }: { size?: string; className?: string }) {
  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 2s infinite',
      }}
    />
  );
}

export function SkeletonBox({ 
  width = '100%', 
  height = '200px', 
  borderRadius = '0.75rem',
  className = '' 
}: { 
  width?: string; 
  height?: string; 
  borderRadius?: string;
  className?: string 
}) {
  return (
    <div
      className={className}
      style={{
        width,
        height,
        borderRadius,
        background: 'linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 2s infinite',
      }}
    />
  );
}

export function SkeletonCard() {
  return (
    <div
      style={{
        padding: '1.5rem',
        background: 'white',
        borderRadius: '0.75rem',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-md)',
      }}
    >
      <SkeletonLine width="70%" height="1.5rem" style={{ marginBottom: '1rem' }} />
      <SkeletonLine width="100%" height="1rem" style={{ marginBottom: '0.5rem' }} />
      <SkeletonLine width="100%" height="1rem" style={{ marginBottom: '0.5rem' }} />
      <SkeletonLine width="60%" height="1rem" />
    </div>
  );
}

export function ProfileHeaderSkeleton() {
  return (
    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', marginBottom: '2rem' }}>
      <SkeletonCircle size="120px" />
      <div style={{ flex: 1 }}>
        <SkeletonLine width="40%" height="1.75rem" style={{ marginBottom: '0.75rem' }} />
        <SkeletonLine width="60%" height="1rem" style={{ marginBottom: '0.5rem' }} />
        <SkeletonLine width="50%" height="1rem" />
      </div>
    </div>
  );
}

export function JobCardSkeleton() {
  return (
    <div
      style={{
        padding: '1.25rem',
        background: 'white',
        borderRadius: '0.75rem',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-md)',
        marginBottom: '1rem',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginBottom: '1rem' }}>
        <div style={{ flex: 1 }}>
          <SkeletonLine width="60%" height="1.25rem" style={{ marginBottom: '0.5rem' }} />
          <SkeletonLine width="80%" height="0.9rem" />
        </div>
        <SkeletonLine width="100px" height="2rem" />
      </div>
      <SkeletonLine width="100%" height="1rem" style={{ marginBottom: '0.5rem' }} />
      <SkeletonLine width="70%" height="1rem" />
    </div>
  );
}

export function FormFieldSkeleton() {
  return (
    <div style={{ marginBottom: '1.2rem' }}>
      <SkeletonLine width="30%" height="0.9rem" style={{ marginBottom: '0.5rem' }} />
      <SkeletonLine width="100%" height="2.5rem" />
    </div>
  );
}
