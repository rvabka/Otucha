import { useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { playSound } from '../lib/sound';

const CONFETTI_COLORS = [
  '#7c6df5', '#c48cff', '#ff8fa3', '#f5c76a',
  '#7dd3b8', '#8bb8ff', '#ffffff', '#ffd93d',
];

const SPARKLE_COLORS = ['#f5c76a', '#ff8fa3', '#c48cff', '#ffffff', '#7dd3b8'];

const LABELS = ['-1 AURA', '-', '+1 AURA', '+2 AURA', '+3 AURA'];

export default function EmojiBurst({ emoji, origin, moodIndex = 2, onDone }) {
  useEffect(() => {
    playSound(moodIndex >= 2 ? 'sparkle' : 'pop');
    const t = setTimeout(() => onDone?.(), 1900);
    return () => clearTimeout(t);
  }, [onDone, moodIndex]);

  const confetti = useMemo(
    () =>
      Array.from({ length: 42 }, (_, i) => {
        const angle = (Math.PI * 2 * i) / 42 + (Math.random() - 0.5) * 0.6;
        const dist = 90 + Math.random() * 160;
        return {
          id: i,
          dx: Math.cos(angle) * dist,
          dy: Math.sin(angle) * dist,
          rot: (Math.random() - 0.5) * 900,
          color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
          size: 6 + Math.random() * 8,
          shape: i % 3 === 0 ? 'circle' : i % 3 === 1 ? 'rect' : 'streamer',
          dur: 0.9 + Math.random() * 0.7,
          delay: Math.random() * 0.12,
        };
      }),
    []
  );

  const sparkles = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * 260,
        y: (Math.random() - 0.5) * 260,
        size: 8 + Math.random() * 14,
        color: SPARKLE_COLORS[i % SPARKLE_COLORS.length],
        delay: Math.random() * 0.35,
      })),
    []
  );

  const trail = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => ({
        id: i,
        dx: (i - 2.5) * 14,
        delay: i * 0.06,
      })),
    []
  );

  const label = LABELS[Math.max(0, Math.min(LABELS.length - 1, moodIndex))];

  return createPortal(
    <div className="pointer-events-none fixed inset-0 z-[120] overflow-hidden">
      <div
        style={{
          position: 'absolute',
          left: origin.x,
          top: origin.y,
          width: 0,
          height: 0,
        }}
      >
        {/* Soft halo */}
        <span
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: 180,
            height: 180,
            marginLeft: -90,
            marginTop: -90,
            borderRadius: '50%',
            background:
              'radial-gradient(circle, rgba(245,199,106,0.55) 0%, rgba(196,140,255,0.35) 40%, transparent 72%)',
            animation: 'glowPulse 1.3s ease-out forwards',
          }}
        />

        {/* Expanding rings */}
        <span
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: 42,
            height: 42,
            marginLeft: -21,
            marginTop: -21,
            border: '2px solid #c48cff',
            borderRadius: '50%',
            boxShadow: '0 0 18px #c48cff',
            opacity: 0,
            animation: 'ringExpand 0.9s ease-out forwards',
            '--max-scale': 6,
          }}
        />
        <span
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: 42,
            height: 42,
            marginLeft: -21,
            marginTop: -21,
            border: '2px solid #f5c76a',
            borderRadius: '50%',
            boxShadow: '0 0 18px #f5c76a',
            opacity: 0,
            animation: 'ringExpand 1.15s ease-out 0.12s forwards',
            '--max-scale': 8,
          }}
        />
        <span
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: 42,
            height: 42,
            marginLeft: -21,
            marginTop: -21,
            border: '2px solid #ff8fa3',
            borderRadius: '50%',
            boxShadow: '0 0 20px #ff8fa3',
            opacity: 0,
            animation: 'ringExpand 1.35s ease-out 0.24s forwards',
            '--max-scale': 10,
          }}
        />

        {/* Big punch emoji */}
        <span
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            fontSize: 64,
            lineHeight: 1,
            filter:
              'drop-shadow(0 12px 28px rgba(124,109,245,0.55)) drop-shadow(0 0 18px rgba(245,199,106,0.55))',
            animation: 'emojiPunch 1.3s cubic-bezier(.2,.8,.2,1) forwards',
          }}
        >
          {emoji}
        </span>

        {/* Confetti */}
        {confetti.map((c) => {
          const isStreamer = c.shape === 'streamer';
          const w = isStreamer ? 4 : c.size;
          const h = isStreamer ? 18 : c.size;
          return (
            <span
              key={c.id}
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: w,
                height: h,
                marginLeft: -w / 2,
                marginTop: -h / 2,
                background: c.color,
                borderRadius: c.shape === 'circle' ? '50%' : 2,
                boxShadow: `0 0 10px ${c.color}`,
                opacity: 0,
                animation: `confettiBurst ${c.dur}s cubic-bezier(.22,.7,.3,1) ${c.delay}s forwards`,
                '--dx': `${c.dx}px`,
                '--dy': `${c.dy}px`,
                '--rot': `${c.rot}deg`,
              }}
            />
          );
        })}

        {/* Sparkles */}
        {sparkles.map((s) => (
          <span
            key={s.id}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: s.size,
              height: s.size,
              marginLeft: s.x - s.size / 2,
              marginTop: s.y - s.size / 2,
              background: `radial-gradient(circle, ${s.color} 0%, transparent 70%)`,
              borderRadius: '50%',
              opacity: 0,
              animation: `sparklePop 0.9s ease-out ${s.delay}s forwards`,
              transform: 'scale(0)',
            }}
          />
        ))}

        {/* Floating emoji trail */}
        {trail.map((t) => (
          <span
            key={t.id}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              fontSize: 22,
              lineHeight: 1,
              opacity: 0,
              animation: `emojiFloatMini 1.6s ease-out ${0.1 + t.delay}s forwards`,
              '--dx': `${t.dx}px`,
            }}
          >
            {emoji}
          </span>
        ))}

        {/* +AURA label */}
        {label && label !== '-' && (
          <span
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              fontFamily: "'Fraunces', serif",
              fontWeight: 700,
              fontSize: 20,
              color: moodIndex >= 2 ? '#f5c76a' : '#ff8fa3',
              textShadow:
                moodIndex >= 2
                  ? '0 0 12px rgba(245,199,106,0.85), 0 0 22px rgba(245,199,106,0.5)'
                  : '0 0 12px rgba(255,143,163,0.85)',
              whiteSpace: 'nowrap',
              opacity: 0,
              animation: 'xpPop 1.5s cubic-bezier(.2,.9,.3,1) 0.08s forwards',
            }}
          >
            {label}
          </span>
        )}
      </div>
    </div>,
    document.body
  );
}
