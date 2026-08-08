import React from 'react';

interface BrandLoaderProps {
  logoSrc?: string;
  /** Fill the viewport (route/page loads) instead of just the parent area. */
  fullscreen?: boolean;
  label?: string;
}

/**
 * Site logo held still with a thin arc tracing the ring around it.
 * Matches the admin panel's loader; colours follow the active theme.
 */
export const BrandLoader: React.FC<BrandLoaderProps> = ({
  logoSrc,
  fullscreen = false,
  label = 'Inapakia',
}) => {
  const resolvedLogo = logoSrc || `${import.meta.env.BASE_URL}Logo.png`;

  return (
    <div
      className={
        fullscreen
          ? 'fixed inset-0 z-[900] flex items-center justify-center bg-[color:var(--page-bg)]/80 backdrop-blur-sm'
          : 'flex min-h-[60vh] w-full items-center justify-center'
      }
      role="status"
      aria-live="polite"
    >
      <div className="relative grid h-[132px] w-[132px] place-items-center">
        <svg className="absolute inset-0 h-full w-full gc-brand-loader-ring" viewBox="0 0 100 100" aria-hidden="true">
          <circle cx="50" cy="50" r="46" fill="none" strokeWidth="2" className="gc-brand-loader-track" />
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="72 217"
            className="gc-brand-loader-arc"
          />
        </svg>
        <img
          src={resolvedLogo}
          alt=""
          className="h-[84px] w-[84px] object-contain gc-brand-loader-logo"
        />
      </div>
      <span className="sr-only">{label}</span>
    </div>
  );
};
