import { useMemo, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

const CONFETTI_COLORS = [
  '#7c6df5', '#c48cff', '#ff8fa3', '#f5c76a',
  '#7dd3b8', '#8bb8ff', '#ffffff', '#ff6b6b',
  '#ffd93d', '#6bcb77', '#4d96ff', '#ff8c00',
];

const LASER_COLORS = ['#ff0040', '#00ff80', '#00d4ff', '#ff00ff', '#f5c76a'];

function ConfettiPiece({ p }) {
  return (
    <span
      style={{
        position: 'absolute',
        left: `${p.left}vw`,
        top: '-10vh',
        width: `${p.w}px`,
        height: `${p.h}px`,
        background: p.shape === 'star' ? 'transparent' : p.color,
        borderRadius: p.shape === 'circle' ? '50%' : p.shape === 'streamer' ? '3px' : '2px',
        boxShadow: `0 0 ${p.glow}px ${p.color}60`,
        opacity: 0,
        zIndex: 101,
        animation: `confettiFall ${p.duration}s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${p.delay}s forwards`,
        '--sway': `${p.sway}vw`,
        '--rot': `${p.rot}deg`,
      }}
    >
      {p.shape === 'star' && (
        <svg viewBox="0 0 24 24" width="100%" height="100%">
          <path fill={p.color} d="M12 2l2.6 7.1 7.4.3-5.9 4.6 2.1 7.2-6.2-4.2-6.2 4.2 2.1-7.2L2 9.4l7.4-.3z" />
        </svg>
      )}
    </span>
  );
}

function Laser({ angle, color, delay }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        width: '200vh',
        height: '2px',
        background: `linear-gradient(90deg, transparent 0%, ${color}30 15%, ${color} 45%, ${color} 55%, ${color}30 85%, transparent 100%)`,
        boxShadow: `0 0 12px ${color}80, 0 0 30px ${color}40`,
        transformOrigin: '0 0',
        transform: `rotate(${angle}deg)`,
        opacity: 0,
        zIndex: 100,
        animation: `laserFade 3s ease-in-out ${delay}s forwards`,
      }}
    />
  );
}

function Sparkle({ x, y, size, color, delay }) {
  return (
    <span
      style={{
        position: 'absolute',
        left: `${x}vw`,
        top: `${y}vh`,
        width: `${size}px`,
        height: `${size}px`,
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        borderRadius: '50%',
        opacity: 0,
        zIndex: 103,
        animation: `sparklePop 0.8s ease-out ${delay}s forwards`,
        transform: 'scale(0)',
      }}
    />
  );
}

function Ring({ delay, color, maxScale }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        width: '80px',
        height: '80px',
        marginLeft: '-40px',
        marginTop: '-40px',
        border: `2px solid ${color}`,
        borderRadius: '50%',
        boxShadow: `0 0 15px ${color}60, inset 0 0 15px ${color}20`,
        opacity: 0,
        zIndex: 102,
        animation: `ringExpand 2s ease-out ${delay}s forwards`,
        '--max-scale': maxScale,
      }}
    />
  );
}

export default function LevelUpCelebration({ newLevel, onDone }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(true);
    document.body.style.animation = 'screenShake 0.5s ease-in-out';
    const timer = setTimeout(() => {
      document.body.style.animation = '';
    }, 600);
    return () => {
      document.body.style.animation = '';
      clearTimeout(timer);
    };
  }, []);

  const pieces = useMemo(() =>
    Array.from({ length: 220 }, (_, i) => {
      const shape = i % 4 === 0 ? 'star' : i % 3 === 0 ? 'circle' : i % 2 === 0 ? 'streamer' : 'rect';
      const w = shape === 'streamer' ? 4 + Math.random() * 5 : 6 + Math.random() * 12;
      const h = shape === 'streamer' ? 18 + Math.random() * 28 : w;
      return {
        id: i, shape,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        left: Math.random() * 100,
        sway: (Math.random() - 0.5) * 50,
        rot: (Math.random() - 0.5) * 1600,
        duration: 3.5 + Math.random() * 2.5,
        delay: Math.random() * 0.8,
        w, h,
        glow: 3 + Math.random() * 10,
      };
    }), []);

  const sparkles = useMemo(() =>
    Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: 10 + Math.random() * 80,
      y: 5 + Math.random() * 90,
      size: 3 + Math.random() * 10,
      color: ['#f5c76a', '#ff8fa3', '#c48cff', '#ffffff'][Math.floor(Math.random() * 4)],
      delay: Math.random() * 4,
    })), []);

  const lasers = useMemo(() =>
    Array.from({ length: 8 }, (_, i) => ({
      id: i,
      angle: (360 / 8) * i + Math.random() * 25,
      color: LASER_COLORS[i % LASER_COLORS.length],
      delay: i * 0.12,
    })), []);

  const rings = useMemo(() => [
    { delay: 0, color: '#f5c76a', maxScale: 3 },
    { delay: 0.15, color: '#ff8fa3', maxScale: 5 },
    { delay: 0.3, color: '#c48cff', maxScale: 8 },
    { delay: 0.5, color: '#7dd3b8', maxScale: 11 },
  ], []);

  const emojis = useMemo(() =>
    ['⭐', '🌟', '✨', '💫', '🎉', '🔥', '💎', '🏆', '⚔️', '🛡️'].map((e, i) => ({
      id: i, emoji: e,
      delay: 0.3 + Math.random() * 2.5,
      startX: 8 + Math.random() * 84,
    })), []);

  if (!show) return null;

  return createPortal(
    <div className="pointer-events-none fixed inset-0 z-[100] overflow-hidden">
      {/* Screen dark overlay with flash */}
      <div
        className="absolute inset-0"
        style={{
          background: 'rgba(0,0,0,0.3)',
          animation: 'darkFlash 1.5s ease-out forwards',
          zIndex: 98,
        }}
      />

      {/* Radial glow */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 45%, rgba(255,240,200,0.5) 0%, rgba(196,140,255,0.25) 30%, transparent 65%)',
          animation: 'softFlash 1.2s ease-out 0.1s forwards',
          zIndex: 99,
        }}
      />

      {/* Lasers */}
      {lasers.map(l => <Laser key={l.id} {...l} />)}

      {/* Rings */}
      {rings.map((r, i) => <Ring key={i} {...r} />)}

      {/* Confetti */}
      {pieces.map(p => <ConfettiPiece key={p.id} p={p} />)}

      {/* Sparkles */}
      {sparkles.map(s => <Sparkle key={s.id} {...s} />)}

      {/* Floating emojis */}
      {emojis.map(e => (
        <span
          key={e.id}
          style={{
            position: 'absolute',
            left: `${e.startX}vw`,
            bottom: '8vh',
            fontSize: '28px',
            opacity: 0,
            zIndex: 105,
            animation: `emojiFloat 3s ease-out ${e.delay}s forwards`,
          }}
        >
          {e.emoji}
        </span>
      ))}

      {/* Center content */}
      <div
        className="absolute text-center"
        style={{ left: '50%', top: '45%', transform: 'translate(-50%, -50%)', zIndex: 106 }}
      >
        {/* Mega glow orb */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: '350px', height: '350px',
            background: 'radial-gradient(circle, rgba(245,199,106,0.5) 0%, rgba(196,140,255,0.3) 35%, transparent 70%)',
            animation: 'glowPulse 1.5s ease-in-out 5',
            zIndex: 97,
          }}
        />

        {/* LEVEL UP text */}
        <div
          className="font-display text-2xl font-bold uppercase tracking-[0.5em] sm:text-3xl"
          style={{
            opacity: 0,
            animation: 'questFadeUp 1.5s ease-out 0.1s forwards',
            color: '#f5c76a',
            textShadow: '0 0 20px rgba(245,199,106,0.6)',
            marginBottom: '8px',
          }}
        >
          Level Up!
        </div>

        {/* Level number - mega */}
        <div
          className="font-display font-black leading-none tabular-nums"
          style={{
            fontSize: 'clamp(80px, 22vw, 180px)',
            backgroundImage: 'linear-gradient(135deg, #f5c76a 0%, #ff8fa3 35%, #c48cff 65%, #f5c76a 100%)',
            backgroundSize: '200% 200%',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
            animation: 'xpReveal 3.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards, shimmer 2.5s linear infinite',
            filter: 'drop-shadow(0 10px 40px rgba(124,109,245,0.7)) drop-shadow(0 0 80px rgba(245,199,106,0.4))',
          }}
        >
          {newLevel}
        </div>

        {/* RPG stat bonuses */}
        <div
          className="mt-4 space-y-1"
          style={{ opacity: 0, animation: 'questFadeUp 1.2s ease-out 0.8s forwards' }}
        >
          <div className="font-display text-sm font-bold text-rpg-sage">
            +10 MAX HP &nbsp; +5 DEF
          </div>
        </div>

        {/* Stars under */}
        <div
          className="mt-3 flex justify-center gap-1"
          style={{ opacity: 0, animation: 'questFadeUp 1s ease-out 1s forwards' }}
        >
          {Array.from({ length: Math.min(newLevel, 5) }, (_, i) => (
            <span
              key={i}
              className="text-2xl"
              style={{
                opacity: 0,
                animation: `starPop 0.5s ease-out ${1.1 + i * 0.1}s forwards`,
                transform: 'scale(0)',
              }}
            >
              ⭐
            </span>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
}
