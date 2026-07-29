import React, { useEffect, useRef } from 'react';

export default function GoogleLoginButton({ onCredential }) {
  const buttonRef = useRef(null);

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.warn('VITE_GOOGLE_CLIENT_ID is not set - Google login button will not render.');
      return;
    }

    let cancelled = false;

    const init = () => {
      if (cancelled || !window.google || !buttonRef.current) return;

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => onCredential(response.credential),
      });

      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: 'outline',
        size: 'large',
        width: 320,
        text: 'continue_with',
      });
    };

    if (window.google) {
      init();
    } else {
      const script = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      script?.addEventListener('load', init);
      return () => script?.removeEventListener('load', init);
    }

    return () => {
      cancelled = true;
    };
  }, [onCredential]);

  return <div ref={buttonRef} className="flex justify-center" />;
}