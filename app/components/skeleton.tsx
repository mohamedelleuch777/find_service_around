'use client';

import './skeleton.css';

export function SkeletonLine({ width = '100%', height = '1rem', className = '' }: { width?: string; height?: string; className?: string }) {
  return (
    <div
      className={`skeleton skeleton--line ${className}`.trim()}
      style={{
        width,
        height,
      }}
    />
  );
}

export function SkeletonCircle({ size = '40px', className = '' }: { size?: string; className?: string }) {
  return (
    <div
      className={`skeleton skeleton--circle ${className}`.trim()}
      style={{
        width: size,
        height: size,
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
      className={`skeleton ${className}`.trim()}
      style={{
        width,
        height,
        borderRadius,
      }}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <SkeletonLine width="70%" height="1.5rem" style={{ marginBottom: '1rem' }} />
      <SkeletonLine width="100%" height="1rem" style={{ marginBottom: '0.5rem' }} />
      <SkeletonLine width="100%" height="1rem" style={{ marginBottom: '0.5rem' }} />
      <SkeletonLine width="60%" height="1rem" />
    </div>
  );
}

export function ProfileHeaderSkeleton() {
  return (
    <div className="skeleton-profile-header">
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
    <div className="skeleton-job-card">
      <div className="skeleton-job-card__row">
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
    <div className="skeleton-form-field">
      <SkeletonLine width="30%" height="0.9rem" style={{ marginBottom: '0.5rem' }} />
      <SkeletonLine width="100%" height="2.5rem" />
    </div>
  );
}
