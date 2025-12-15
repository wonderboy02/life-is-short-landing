'use client';

import { Toaster } from 'sonner';

export function ToasterProvider() {
  return (
    <Toaster
      position="top-center"
      closeButton
      offset="80px"
      toastOptions={{
        classNames: {
          toast: 'sonner-toast-custom',
          title: 'sonner-title-custom',
          closeButton: 'sonner-close-custom',
        },
        style: {
          fontFamily: 'var(--font-inter)',
          background: 'rgb(250 250 250)',
          border: '1px solid rgb(229 229 229)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
          borderRadius: '8px',
          padding: '12px 14px',
          paddingRight: '40px',
          paddingLeft: '14px',
          margin: '0 auto',
          maxWidth: 'calc(100vw - 32px)',
          width: 'auto',
          position: 'relative',
          left: '0',
          right: '0',
          transform: 'none',
        },
      }}
    />
  );
}
