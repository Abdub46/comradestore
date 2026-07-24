import React, { useEffect, useState } from 'react';
import { getBanner } from '../services/bannerService';

export default function Banner() {
  const [banner, setBanner] = useState(null);
  const [dismissed, setDismissed] = useState(
    () => sessionStorage.getItem('bannerDismissed') === 'true'
  );

  useEffect(() => {
    // Fetched after initial render, not before - this never delays or
    // blocks the rest of the site from loading. If it fails or is slow,
    // the banner simply doesn't appear; nothing else is affected.
    getBanner()
      .then(setBanner)
      .catch(() => {});
  }, []);

  if (!banner || !banner.text || dismissed) return null;

  const handleClose = () => {
    setDismissed(true);
    sessionStorage.setItem('bannerDismissed', 'true');
  };

  return (
    <div
      style={{
        backgroundColor: banner.backgroundColor || '#16a34a',
        color: banner.textColor || '#ffffff',
      }}
      className="w-full px-10 py-2 text-sm text-center relative"
    >
      <span>
        {banner.text}
        {banner.linkUrl && (
          <a
            href={banner.linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 underline font-medium inline-flex items-center gap-1"
            style={{ color: banner.textColor || '#ffffff' }}
          >
            {banner.showLinkIcon && <span aria-hidden="true">🔗</span>}
            {banner.linkText || 'Learn more'}
          </a>
        )}
      </span>

      {banner.showCloseButton && (
        <button
          onClick={handleClose}
          aria-label="Dismiss banner"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-base leading-none opacity-80 hover:opacity-100"
          style={{ color: banner.textColor || '#ffffff' }}
        >
          ✕
        </button>
      )}
    </div>
  );
}
