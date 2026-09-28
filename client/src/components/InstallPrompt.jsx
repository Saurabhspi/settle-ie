import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('User installed Settle.ie');
    }
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            position: 'fixed',
            bottom: '16px',
            left: '16px',
            right: '16px',
            background: '#fff',
            borderRadius: '16px',
            padding: '16px',
            boxShadow: '0 8px 32px rgba(26,61,43,0.15)',
            border: '0.5px solid #DDD8CC',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          {/* Icon */}
          <div style={{
            width: '48px', height: '48px', background: '#1A3D2B',
            borderRadius: '12px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', flexShrink: 0,
          }}>
            <span style={{ color: '#F7F3EB', fontSize: '22px', fontWeight: 700 }}>S</span>
          </div>

          {/* Text */}
          <div style={{ flex: 1 }}>
            <p style={{
              color: '#1A3D2B', fontSize: '14px', fontWeight: 500,
              margin: '0 0 2px'
            }}>
              Install Settle.ie
            </p>
            <p style={{ color: '#7A8C7E', fontSize: '12px', margin: 0 }}>
              Add to your home screen for quick access
            </p>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <button
              onClick={handleInstall}
              style={{
                background: '#1A3D2B', color: '#F7F3EB',
                border: 'none', borderRadius: '8px',
                padding: '6px 14px', fontSize: '12px',
                fontWeight: 500, cursor: 'pointer',
              }}
            >
              Install
            </button>
            <button
              onClick={handleDismiss}
              style={{
                background: 'transparent', color: '#7A8C7E',
                border: 'none', fontSize: '12px',
                cursor: 'pointer', padding: '2px',
              }}
            >
              Not now
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}