import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Logo({ centered = false }: { centered?: boolean }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: centered ? 'center' : 'flex-start',
        marginBottom: centered ? '30px' : '0',
        gap: '16px',
        cursor: 'pointer',
        userSelect: 'none'
      }}
    >
      {/* Ícone: Wallet Asset Hub Animado */}
      <div style={{
        position: 'relative',
        width: '54px',
        height: '42px',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        overflow: 'visible'
      }}>
        
        <AnimatePresence>
          {/* Moeda BTC */}
          <motion.div 
            initial={{ y: 0, opacity: 1, rotate: -15 }}
            animate={{ 
              y: isHovered ? 15 : 0, 
              opacity: isHovered ? 0 : 1,
              rotate: -15 
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            style={{
              position: 'absolute',
              top: '-8px',
              left: '8px',
              width: '22px',
              height: '22px',
              backgroundColor: '#800020',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '12px',
              fontWeight: 'bold',
              boxShadow: '0 2px 8px rgba(128,0,32,0.3)',
              zIndex: 1
            }}
          >
            ₿
          </motion.div>

          {/* Moeda USD */}
          <motion.div 
            initial={{ y: 0, opacity: 1, rotate: 10 }}
            animate={{ 
              y: isHovered ? 12 : 0, 
              opacity: isHovered ? 0 : 1,
              rotate: 10 
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 25, delay: 0.05 }}
            style={{
              position: 'absolute',
              top: '-2px',
              right: '6px',
              width: '18px',
              height: '18px',
              backgroundColor: '#f8f9fa',
              border: '1.5px solid #800020',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#800020',
              fontSize: '11px',
              fontWeight: 'bold',
              boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
              zIndex: 1
            }}
          >
            $
          </motion.div>
        </AnimatePresence>

        {/* Corpo da Carteira */}
        <motion.div 
          animate={{ scale: isHovered ? 1.05 : 1 }}
          style={{
            width: '100%',
            height: '32px',
            backgroundColor: '#800020',
            borderRadius: '6px 6px 4px 4px',
            position: 'relative',
            zIndex: 2,
            boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
          }}
        >
          <div style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            width: '14px',
            height: '16px',
            backgroundColor: 'rgba(255,255,255,0.1)',
            borderRadius: '3px',
            borderLeft: '2px solid rgba(255,255,255,0.2)'
          }}></div>
        </motion.div>
      </div>

      {/* Texto Crypto Wallet */}
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1' }}>
        <h1 style={{
          margin: 0,
          fontSize: '1.8rem',
          fontWeight: '900',
          color: '#1a1a1a',
          fontFamily: 'sans-serif',
          letterSpacing: '-1.5px'
        }}>
          Crypto<span style={{ color: '#800020' }}>.</span>
        </h1>
        <span style={{
          fontSize: '0.9rem',
          fontWeight: '700',
          color: '#800020',
          textTransform: 'uppercase',
          letterSpacing: '6px',
          marginTop: '6px',
          opacity: 0.8
        }}>
          Wallet
        </span>
      </div>
    </div>
  );
}