import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CharacterStage({
  character,
  isSpeaking,
  isListening,
}) {
  const videoRef = useRef(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (isSpeaking) {
      v.currentTime = 0;
      v.play().catch(() => {});
    } else {
      v.pause();
    }
  }, [isSpeaking, character?.agentId]);

  if (!character) return null;

  return (
    <div className="relative w-full flex-1">
      {/* Soft outer halo */}
      <motion.div
        className="pointer-events-none absolute -inset-8 rounded-[3rem]"
        animate={{
          opacity: isSpeaking ? [0.55, 0.95, 0.55] : 0.4,
          scale: isSpeaking ? [1, 1.02, 1] : 1,
        }}
        transition={{
          duration: isSpeaking ? 1.4 : 5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          background: `radial-gradient(closest-side, ${character.halo} 0%, transparent 75%)`,
          filter: 'blur(28px)',
        }}
      />

      {/* Listening pulse ring */}
      {isListening && (
        <motion.div
          className="pointer-events-none absolute -inset-2 rounded-[3rem] border-2"
          style={{ borderColor: '#ff8fa3' }}
          animate={{ opacity: [0.6, 0, 0.6], scale: [1, 1.02, 1] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeOut' }}
        />
      )}

      {/* Portrait frame */}
      <motion.div
        className="relative h-full w-full overflow-hidden rounded-[2.5rem] border border-white/70"
        style={{
          background: character.gradient,
          boxShadow: `0 40px 100px -30px ${character.halo}, inset 0 1px 0 rgba(255,255,255,0.7)`,
        }}
        animate={{
          y: isSpeaking ? [0, -2, 0] : [0, -5, 0],
        }}
        transition={{
          duration: isSpeaking ? 0.7 : 5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {/* Decorative top sheen */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-40 rounded-t-[2.5rem]"
          style={{
            background:
              'linear-gradient(180deg, rgba(255,255,255,0.45) 0%, transparent 100%)',
          }}
        />

        {/* Idle / talking media */}
        <AnimatePresence mode="wait">
          {isSpeaking ? (
            <motion.video
              key="talking"
              ref={videoRef}
              src={character.talk}
              autoPlay
              loop
              muted
              playsInline
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-0 h-full w-full object-cover"
              style={{ objectPosition: 'center top' }}
            />
          ) : (
            <motion.img
              key="idle"
              src={character.idle}
              alt={character.name}
              draggable={false}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-0 h-full w-full select-none object-cover"
              style={{ objectPosition: 'center top' }}
            />
          )}
        </AnimatePresence>

        {/* Bottom gradient for legibility */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3"
          style={{
            background:
              'linear-gradient(180deg, transparent 0%, rgba(20,15,40,0.55) 100%)',
          }}
        />

        {/* Speaking shimmer overlay (warm bloom from bottom) */}
        {isSpeaking && (
          <motion.div
            className="pointer-events-none absolute inset-0"
            animate={{
              opacity: [0.45, 0.85, 0.45],
            }}
            transition={{ duration: 0.6, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              background: `radial-gradient(60% 50% at 50% 100%, ${character.halo} 0%, transparent 70%)`,
              mixBlendMode: 'screen',
            }}
          />
        )}

        {/* Status badge */}
        <AnimatePresence>
          {(isSpeaking || isListening) && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.9 }}
              className="absolute top-4 left-1/2 -translate-x-1/2 rounded-full px-4 py-1.5 text-[11px] font-semibold tracking-wide text-white shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] backdrop-blur"
              style={{
                background: isSpeaking
                  ? 'linear-gradient(135deg, rgba(124,109,245,0.92), rgba(196,140,255,0.92))'
                  : 'linear-gradient(135deg, rgba(239,68,68,0.92), rgba(248,113,113,0.92))',
              }}
            >
              {isSpeaking ? '🔊 Mówi…' : '🎤 Słucham…'}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Name plate at bottom */}
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-6">
          <div>
            <p
              className="font-display text-4xl font-semibold text-white sm:text-5xl"
              style={{ textShadow: '0 4px 24px rgba(0,0,0,0.6)' }}
            >
              {character.name}
            </p>
            <p
              className="mt-1 text-sm text-white/90"
              style={{ textShadow: '0 2px 10px rgba(0,0,0,0.7)' }}
            >
              {character.tagline}
            </p>
          </div>

          {/* Voice waveform indicator */}
          {isSpeaking && (
            <div className="flex items-end gap-1 pb-1.5">
              {[0, 1, 2, 3, 4].map((i) => (
                <motion.span
                  key={i}
                  className="w-1 rounded-full"
                  style={{
                    background: 'rgba(255,255,255,0.95)',
                    boxShadow: `0 0 10px ${character.halo}`,
                  }}
                  animate={{ height: [6, 22, 10, 26, 8] }}
                  transition={{
                    duration: 0.9,
                    repeat: Infinity,
                    delay: i * 0.08,
                    ease: 'easeInOut',
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Floating sparkles when speaking */}
        {isSpeaking && <FloatingSparkles color={character.accent} />}
      </motion.div>
    </div>
  );
}

function FloatingSparkles({ color }) {
  const dots = Array.from({ length: 12 });
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[2.5rem]">
      {dots.map((_, i) => {
        const left = (i * 73) % 100;
        const delay = (i % 5) * 0.4;
        const dur = 2.4 + (i % 3) * 0.6;
        const size = 3 + (i % 3);
        return (
          <motion.span
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${left}%`,
              bottom: '-10px',
              width: size,
              height: size,
              background: color,
              boxShadow: `0 0 14px ${color}`,
            }}
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: [0, 1, 0], y: [0, -260] }}
            transition={{
              duration: dur,
              repeat: Infinity,
              delay,
              ease: 'easeOut',
            }}
          />
        );
      })}
    </div>
  );
}
