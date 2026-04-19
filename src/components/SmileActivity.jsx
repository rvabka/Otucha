import { useState } from 'react';
import { motion } from 'framer-motion';
import GlassPanel from './GlassPanel';
import Icon from './Icon';
import SmileDetector from './SmileDetector';

export default function SmileActivity() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <GlassPanel variant="default" className="relative overflow-hidden p-6 sm:p-7">
        {/* animated gradient sheen */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full"
          animate={{ scale: [1, 1.15, 1], opacity: [0.55, 0.85, 0.55] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            background:
              'radial-gradient(circle, rgba(245,199,106,0.55) 0%, transparent 70%)',
            filter: 'blur(16px)',
          }}
        />
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -bottom-16 -left-12 h-52 w-52 rounded-full"
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          style={{
            background:
              'radial-gradient(circle, rgba(255,143,163,0.5) 0%, transparent 70%)',
            filter: 'blur(16px)',
          }}
        />

        <div className="relative flex items-center justify-between gap-5">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-rpg-quest/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-rpg-quest">
                Aktywność
              </span>
              <span className="rounded-full bg-rpg-xp/25 px-2 py-0.5 text-[10px] font-bold tabular-nums text-amber-700">
                +10 XP
              </span>
            </div>
            <h3 className="mt-2 font-display text-2xl font-semibold text-ink-900">
              Pokaż uśmiech dnia
            </h3>
            <p className="mt-1 text-sm text-ink-500">
              Uśmiechnij się do kamerki przez 3 sekundy — odpal dawkę
              endorfin i zgarnij EXP.
            </p>

            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setOpen(true)}
              className="mt-5 inline-flex items-center gap-2 rounded-2xl px-5 py-3 font-display text-sm font-semibold text-white"
              style={{
                background:
                  'linear-gradient(135deg, #7c6df5 0%, #c48cff 55%, #ff8fa3 100%)',
                boxShadow: '0 18px 40px -18px rgba(124,109,245,0.9)',
              }}
            >
              <Icon name="sparkle" size={14} />
              Rozpocznij skan
              <span>→</span>
            </motion.button>
          </div>

          {/* Animated smile emblem */}
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
            className="relative hidden h-28 w-28 shrink-0 place-items-center sm:grid"
          >
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  'conic-gradient(from 0deg, #7c6df5, #c48cff, #ff8fa3, #f5c76a, #7dd3b8, #7c6df5)',
                filter: 'blur(10px)',
                opacity: 0.7,
              }}
            />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-1 rounded-full"
              style={{
                background:
                  'conic-gradient(from 0deg, rgba(255,255,255,0.9), rgba(255,255,255,0.2), rgba(255,255,255,0.9))',
                opacity: 0.4,
              }}
            />
            <div
              className="relative grid h-24 w-24 place-items-center rounded-full text-5xl"
              style={{
                background: 'rgba(255,255,255,0.85)',
                boxShadow: 'inset 0 2px 6px rgba(255,255,255,0.9), 0 20px 40px -15px rgba(124,109,245,0.5)',
              }}
            >
              😊
            </div>
          </motion.div>
        </div>
      </GlassPanel>

      {open && <SmileDetector onClose={() => setOpen(false)} />}
    </>
  );
}
