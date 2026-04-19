import { useEffect, useRef, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Pagination, Keyboard, Mousewheel } from 'swiper/modules';
import { motion, AnimatePresence } from 'framer-motion';
import { CHARACTERS } from '../data/characters';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';

export default function CharacterSwiper({
  initialAgentId,
  onConfirm,
  onCancel,
  confirmLabel = 'Wybierz',
}) {
  const startIndex = Math.max(
    0,
    CHARACTERS.findIndex((c) => c.agentId === initialAgentId)
  );
  const [activeIndex, setActiveIndex] = useState(startIndex < 0 ? 0 : startIndex);
  const swiperRef = useRef(null);
  const active = CHARACTERS[activeIndex];

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onCancel?.();
      if (e.key === 'Enter') onConfirm?.(CHARACTERS[activeIndex]);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeIndex, onConfirm, onCancel]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex flex-col items-center justify-center px-4 py-8"
      style={{
        background:
          'radial-gradient(1200px 800px at 50% 0%, rgba(196, 140, 255, 0.45) 0%, transparent 60%), radial-gradient(900px 600px at 50% 100%, rgba(255, 143, 163, 0.35) 0%, transparent 55%), rgba(20, 18, 50, 0.55)',
        backdropFilter: 'blur(18px) saturate(140%)',
        WebkitBackdropFilter: 'blur(18px) saturate(140%)',
      }}
    >
      <button
        onClick={onCancel}
        className="absolute top-6 right-6 grid h-11 w-11 place-items-center rounded-full bg-white/30 text-white backdrop-blur-md transition hover:scale-110 hover:bg-white/50"
        aria-label="Zamknij"
      >
        ✕
      </button>

      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-2 text-center"
      >
        <p className="font-display text-3xl text-white drop-shadow-[0_4px_24px_rgba(124,109,245,0.6)] sm:text-4xl">
          Wybierz przewodnika
        </p>
        <p className="mt-1 text-sm text-white/70">
          Przesuwaj kartami, kliknij środkową aby wybrać
        </p>
      </motion.div>

      <div className="relative w-full max-w-[1100px] flex-1 max-h-[560px]">
        <Swiper
          modules={[EffectCoverflow, Pagination, Keyboard, Mousewheel]}
          effect="coverflow"
          grabCursor
          centeredSlides
          initialSlide={startIndex}
          slidesPerView="auto"
          slideToClickedSlide
          grabCursor
          touchRatio={1.4}
          threshold={4}
          coverflowEffect={{
            rotate: 38,
            stretch: 0,
            depth: 220,
            modifier: 1.1,
            slideShadows: false,
          }}
          keyboard={{ enabled: true }}
          mousewheel={{ forceToAxis: true, sensitivity: 0.8 }}
          pagination={{ clickable: true, dynamicBullets: true }}
          onSwiper={(s) => (swiperRef.current = s)}
          onSlideChange={(s) => setActiveIndex(s.activeIndex)}
          className="!overflow-visible h-full w-full"
        >
          {CHARACTERS.map((char, i) => (
            <SwiperSlide
              key={char.agentId}
              className="!flex !h-full !w-[300px] items-center justify-center sm:!w-[360px]"
            >
              <CharacterCard
                char={char}
                isActive={i === activeIndex}
                onTap={() =>
                  i === activeIndex
                    ? onConfirm?.(char)
                    : swiperRef.current?.slideTo(i)
                }
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={active.agentId}
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -10, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="mt-2 flex flex-col items-center gap-4"
        >
          <div className="text-center">
            <p
              className="font-display text-4xl font-semibold text-white"
              style={{ textShadow: `0 6px 30px ${active.halo}` }}
            >
              {active.name}
            </p>
            <p className="mt-1 text-sm text-white/80">{active.tagline}</p>
          </div>

          <button
            onClick={() => onConfirm?.(active)}
            className="group relative overflow-hidden rounded-full px-9 py-3.5 font-display text-base font-semibold text-white transition-transform hover:scale-105 active:scale-95"
            style={{
              background:
                'linear-gradient(135deg, #7c6df5 0%, #c48cff 55%, #ff8fa3 100%)',
              boxShadow:
                '0 18px 40px -18px rgba(124,109,245,0.9), inset 0 1px 0 rgba(255,255,255,0.5)',
            }}
          >
            <span className="relative z-10 flex items-center gap-2">
              {confirmLabel}
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </span>
            <span
              className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full"
            />
          </button>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

function CharacterCard({ char, isActive, onTap }) {
  return (
    <motion.div
      onClick={onTap}
      animate={{
        scale: isActive ? 1 : 0.92,
      }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="relative h-[440px] w-full cursor-pointer overflow-hidden rounded-[2.5rem] border border-white/40 text-left outline-none sm:h-[480px]"
      style={{
        background: char.gradient,
        boxShadow: isActive
          ? `0 35px 80px -20px ${char.halo}, 0 0 0 1px rgba(255,255,255,0.5) inset`
          : '0 20px 50px -25px rgba(0,0,0,0.4)',
      }}
    >
      <img
        src={char.idle}
        alt={char.name}
        draggable={false}
        className="absolute inset-0 h-full w-full select-none object-cover"
        style={{ objectPosition: 'center top', pointerEvents: 'none' }}
      />

      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(0,0,0,0) 45%, rgba(0,0,0,0.55) 100%)',
        }}
      />

      {isActive && (
        <>
          <motion.div
            className="pointer-events-none absolute inset-0 rounded-[2.5rem]"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.7, 0.4, 0.7] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              boxShadow: `inset 0 0 80px ${char.halo}`,
            }}
          />
          <Sparkles color={char.accent} />
        </>
      )}

      <div className="absolute inset-x-0 bottom-0 p-5">
        <p
          className="font-display text-3xl font-semibold text-white"
          style={{ textShadow: '0 2px 16px rgba(0,0,0,0.5)' }}
        >
          {char.name}
        </p>
        <p className="text-xs text-white/85" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}>
          {char.tagline}
        </p>
      </div>

      {isActive && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute top-4 right-4 rounded-full bg-white/85 px-3 py-1 text-[11px] font-semibold backdrop-blur"
          style={{ color: char.accent }}
        >
          ★ wybrane
        </motion.div>
      )}
    </motion.div>
  );
}

function Sparkles({ color }) {
  const dots = Array.from({ length: 14 });
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[2.5rem]">
      {dots.map((_, i) => {
        const left = (i * 73) % 100;
        const top = (i * 41) % 100;
        const delay = (i % 7) * 0.3;
        const size = 4 + (i % 4);
        return (
          <motion.span
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${left}%`,
              top: `${top}%`,
              width: size,
              height: size,
              background: color,
              boxShadow: `0 0 12px ${color}`,
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0, 1, 0], scale: [0, 1.2, 0], y: [0, -30, -60] }}
            transition={{
              duration: 3 + (i % 3),
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
