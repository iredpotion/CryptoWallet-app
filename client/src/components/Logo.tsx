import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Logo({ centered = false }: { centered?: boolean }) {
  const [isHovered, setIsHovered] = useState(false);
  
  // Cores atualizadas para o novo tema minimalista elegante
  const primaryColor = '#1e3a8a'; // Azul escuro principal (combina com os botões)
  const primaryDark = '#172554';  // Azul ainda mais escuro para o fundo da carteira (profundidade)
  const textMain = '#0f172a';     // Grafite escuro para o texto principal

  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: centered ? 'center' : 'flex-start',
        marginBottom: centered ? '30px' : '0', gap: '16px', cursor: 'pointer', userSelect: 'none'
      }}
    >
      <div style={{ position: 'relative', width: '54px', height: '42px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', overflow: 'visible' }}>
        
        {/* Sensores de Conexão */}
        {[0, 90, 180, 270].map((deg, index) => (
          <motion.div key={`sensor-${deg}-${index}`} animate={{ opacity: isHovered ? 1 : 0.4, scale: isHovered ? 1.2 : 1 }}
            style={{
              position: 'absolute', width: '6px', height: '6px', backgroundColor: primaryColor, borderRadius: '50%',
              top: '50%', left: '50%', marginTop: '-3px', marginLeft: '-3px', transform: `rotate(${deg}deg) translateY(-28px)`
            }}
          />
        ))}

        <AnimatePresence>
          <motion.div key="coin-btc"
            initial={{ y: 0, opacity: 1, rotate: -15 }} animate={{ y: isHovered ? 15 : 0, opacity: isHovered ? 0 : 1, rotate: -15 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            style={{
              position: 'absolute', top: '-8px', left: '8px', width: '22px', height: '22px',
              backgroundColor: '#f59e0b', /* Laranja/Dourado do Bitcoin para dar destaque no tema clean */
              borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: '12px', fontWeight: 'bold', boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)', zIndex: 1
            }}
          >₿</motion.div>

          <motion.div key="coin-usd"
            initial={{ y: 0, opacity: 1, rotate: 10 }} animate={{ y: isHovered ? 12 : 0, opacity: isHovered ? 0 : 1, rotate: 10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25, delay: 0.05 }}
            style={{
              position: 'absolute', top: '-2px', right: '6px', width: '18px', height: '18px',
              backgroundColor: '#ffffff', border: `1.5px solid ${primaryDark}`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: primaryDark, fontSize: '11px', fontWeight: 'bold', boxShadow: '0 2px 6px rgba(0,0,0,0.05)', zIndex: 1
            }}
          >$</motion.div>
        </AnimatePresence>

        <motion.div animate={{ scale: isHovered ? 1.05 : 1 }}
          style={{
            width: '100%', height: '32px', backgroundColor: primaryDark, borderRadius: '6px 6px 4px 4px', position: 'relative', zIndex: 2, boxShadow: '0 4px 10px rgba(30, 58, 138, 0.15)'
          }}
        >
          <div style={{ position: 'absolute', top: '8px', right: '8px', width: '14px', height: '16px', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: '3px', borderLeft: '2px solid rgba(255,255,255,0.25)' }}></div>
        </motion.div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1' }}>
        <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '900', color: textMain, fontFamily: 'sans-serif', letterSpacing: '-1.5px' }}>
          Crypto<span style={{ color: primaryColor }}>.</span>
        </h1>
        <span style={{ fontSize: '0.9rem', fontWeight: '700', color: primaryColor, textTransform: 'uppercase', letterSpacing: '6px', marginTop: '6px', opacity: 0.9 }}>
          Wallet
        </span>
      </div>
    </div>
  );
}