import { useEffect, useLayoutEffect, useRef, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Icon from './Icon';

const PRIMARY_GRADIENT =
  'linear-gradient(135deg, #7c6df5 0%, #c48cff 55%, #ff8fa3 100%)';

const SPRING = { type: 'spring', stiffness: 260, damping: 28 };

const STEPS = [
  {
    target: 'stats',
    icon: 'star',
    accent: '#7c6df5',
    title: 'Twój panel wojownika',
    body: 'Poziom, seria dni i trzy klucze rozwoju: Grind, Rizz i Aura. Każda aktywność je podbija.',
    expand: { top: 28 },
  },
  {
    target: 'quest',
    icon: 'map',
    accent: '#ff8fa3',
    title: 'Aktywny Quest',
    body: 'AI Mistrz Gry pisze questy szyte na miarę Twoich rozmów. Ukończ go, żeby zdobyć XP.',
    optional: true,
    expand: { bottom: 4 },
  },
  {
    target: 'agents',
    icon: 'chat',
    accent: '#c48cff',
    title: 'Trzech Przewodników',
    body: 'Babeczka, Blondi i Ziutek — każdy mówi własnym głosem. Kliknij, by porozmawiać.',
  },
  {
    target: 'smile',
    icon: 'heart',
    accent: '#7dd3b8',
    title: 'Ćwiczenia radości',
    body: '30 sekund uśmiechu i oddechu. Najszybszy dopaminowy reset w ciągu dnia.',
  },
  {
    target: 'tasks',
    icon: 'check',
    accent: '#f5c76a',
    title: 'Dzienne zadania',
    body: 'Proste kroki, które budują nawyk. Odhaczanie = XP plus podbicie statystyk.',
  },
  {
    target: 'journal',
    icon: 'journal',
    accent: '#8bb8ff',
    title: 'Dziennik emocji',
    body: 'Oddechy, rozmowy i ukończone questy trafiają tu automatycznie. Bez pisania esejów.',
  },
  {
    target: 'sidebar',
    icon: 'map',
    accent: '#7c6df5',
    title: 'Szybka nawigacja',
    body: 'Stąd przeskoczysz do Chatu, Mapy, Profilu i Sklepu jednym kliknięciem.',
    optional: true,
  },
  {
    target: 'player',
    icon: 'profile',
    accent: '#ff8fa3',
    title: 'Twój profil',
    body: 'Avatar, poziom i najważniejsze skróty — Twoja wizytówka w Auravii.',
    optional: true,
  },
];

const PAD = 12;
const TOOLTIP_W = 340;
const TOOLTIP_GAP = 20;

const TOP_RESERVE = 64;
const BOTTOM_RESERVE = 200;
const VIEWPORT_EDGE = 8;

function useTargetRect(targetId, stepIndex) {
  const [rect, setRect] = useState(null);

  useEffect(() => {
    if (!targetId) return;
    const el = document.querySelector(`[data-tour="${targetId}"]`);
    if (!el) {
      setRect(null);
      return;
    }

    let rafId = null;

    const measure = () => {
      const r = el.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) {
        setRect(null);
        return;
      }

      const vh = window.innerHeight;
      const maxH = Math.max(160, vh - TOP_RESERVE - BOTTOM_RESERVE);

      let y = r.y;
      let h = r.height;

      if (h > maxH) h = maxH;
      if (y + h > vh - VIEWPORT_EDGE) {
        h = Math.max(80, vh - VIEWPORT_EDGE - y);
      }
      if (y < VIEWPORT_EDGE) {
        h = Math.max(80, h + y - VIEWPORT_EDGE);
        y = VIEWPORT_EDGE;
      }

      setRect({ x: r.x, y, w: r.width, h });
    };

    const schedule = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(measure);
    };

    el.style.scrollMarginTop = `${TOP_RESERVE}px`;
    el.style.scrollMarginBottom = `${BOTTOM_RESERVE}px`;

    const vh0 = window.innerHeight;
    const maxH0 = Math.max(160, vh0 - TOP_RESERVE - BOTTOM_RESERVE);
    const tall = el.getBoundingClientRect().height > maxH0;
    el.scrollIntoView({
      behavior: 'smooth',
      block: tall ? 'start' : 'nearest',
    });

    schedule();

    const ro = new ResizeObserver(schedule);
    ro.observe(el);
    const mo = new MutationObserver(schedule);
    mo.observe(el, { childList: true, subtree: true, characterData: true });

    const start = Date.now();
    const aliveInterval = setInterval(() => {
      schedule();
      if (Date.now() - start > 1600) clearInterval(aliveInterval);
    }, 60);

    window.addEventListener('resize', schedule);
    window.addEventListener('scroll', schedule, true);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      clearInterval(aliveInterval);
      ro.disconnect();
      mo.disconnect();
      window.removeEventListener('resize', schedule);
      window.removeEventListener('scroll', schedule, true);
    };
  }, [targetId, stepIndex]);

  return rect;
}

const TOOLTIP_H_EST = 260;
const VIEWPORT_MARGIN = 16;

function computeTooltipPlacement(rect, tooltipH = TOOLTIP_H_EST) {
  if (!rect || typeof window === 'undefined') return null;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const spaceBelow = vh - (rect.y + rect.h);
  const spaceAbove = rect.y;
  const placeBelow = spaceBelow > tooltipH + 40 || spaceBelow >= spaceAbove;

  const desiredLeft = rect.x + rect.w / 2 - TOOLTIP_W / 2;
  const left = Math.min(Math.max(desiredLeft, 16), vw - TOOLTIP_W - 16);

  const arrowLeft = rect.x + rect.w / 2 - left;
  const clampedArrow = Math.min(Math.max(arrowLeft, 28), TOOLTIP_W - 28);

  if (placeBelow) {
    let top = rect.y + rect.h + TOOLTIP_GAP;
    const maxTop = vh - VIEWPORT_MARGIN - tooltipH;
    if (top > maxTop) top = Math.max(VIEWPORT_MARGIN, maxTop);
    return { top, left, origin: 'top', arrowLeft: clampedArrow };
  }

  let top = rect.y - TOOLTIP_GAP;
  const minTop = VIEWPORT_MARGIN + tooltipH;
  if (top < minTop) top = Math.min(vh - VIEWPORT_MARGIN, minTop);
  return { top, left, origin: 'bottom', arrowLeft: clampedArrow };
}

export default function OnboardingTour({ user, onClose }) {
  const [step, setStep] = useState(0);
  const [tooltipH, setTooltipH] = useState(TOOLTIP_H_EST);
  const tooltipRef = useRef(null);
  const current = STEPS[step];
  const rect = useTargetRect(current?.target, step);
  const expandRect = rect
    ? {
        x: rect.x - (current?.expand?.left ?? 0),
        y: rect.y - (current?.expand?.top ?? 0),
        w: rect.w + (current?.expand?.left ?? 0) + (current?.expand?.right ?? 0),
        h: rect.h + (current?.expand?.top ?? 0) + (current?.expand?.bottom ?? 0),
      }
    : null;
  const placement = computeTooltipPlacement(expandRect, tooltipH);
  const isLast = step === STEPS.length - 1;

  useLayoutEffect(() => {
    if (!tooltipRef.current) return;
    const h = tooltipRef.current.offsetHeight;
    if (h && Math.abs(h - tooltipH) > 2) setTooltipH(h);
  }, [step, placement?.top, placement?.left, tooltipH]);

  const next = useCallback(() => {
    setStep((s) => {
      if (s >= STEPS.length - 1) {
        onClose?.();
        return s;
      }
      return s + 1;
    });
  }, [onClose]);

  const prev = useCallback(() => {
    setStep((s) => Math.max(s - 1, 0));
  }, []);

  useEffect(() => {
    if (!current) return;
    if (rect === null && current.optional) {
      const t = setTimeout(() => {
        setStep((s) => (s >= STEPS.length - 1 ? s : s + 1));
      }, 350);
      return () => clearTimeout(t);
    }
  }, [rect, current, step]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'Enter') next();
      else if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [next, prev, onClose]);

  const vw = typeof window !== 'undefined' ? window.innerWidth : 1200;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800;

  const expand = current?.expand ?? {};
  const extraTop = expand.top ?? 0;
  const extraBottom = expand.bottom ?? 0;
  const extraLeft = expand.left ?? 0;
  const extraRight = expand.right ?? 0;

  const spotlightRect = rect
    ? {
        x: rect.x - PAD - extraLeft,
        y: rect.y - PAD - extraTop,
        w: rect.w + PAD * 2 + extraLeft + extraRight,
        h: rect.h + PAD * 2 + extraTop + extraBottom,
      }
    : { x: vw / 2 - 120, y: vh / 2 - 40, w: 240, h: 80 };

  const tooltipKey = current?.target ?? step;
  const nameFragment = user?.username ? `, ${user.username}` : '';

  return (
    <div className="fixed inset-0 z-[100]">
      <svg
        className="fixed inset-0 h-full w-full"
        style={{ pointerEvents: 'auto' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <mask id="hp-tour-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            <motion.rect
              initial={false}
              animate={{
                x: spotlightRect.x,
                y: spotlightRect.y,
                width: spotlightRect.w,
                height: spotlightRect.h,
              }}
              transition={SPRING}
              rx={28}
              ry={28}
              fill="black"
            />
          </mask>
          <linearGradient id="hp-tour-glow" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#7c6df5" />
            <stop offset="55%" stopColor="#c48cff" />
            <stop offset="100%" stopColor="#ff8fa3" />
          </linearGradient>
        </defs>

        <motion.rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(15, 10, 40, 0.58)"
          mask="url(#hp-tour-mask)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        />

        <motion.rect
          initial={false}
          animate={{
            x: spotlightRect.x,
            y: spotlightRect.y,
            width: spotlightRect.w,
            height: spotlightRect.h,
          }}
          transition={SPRING}
          rx={28}
          ry={28}
          fill="none"
          stroke="url(#hp-tour-glow)"
          strokeWidth="2.5"
          style={{ pointerEvents: 'none' }}
        />
        <motion.rect
          initial={false}
          animate={{
            x: spotlightRect.x - 4,
            y: spotlightRect.y - 4,
            width: spotlightRect.w + 8,
            height: spotlightRect.h + 8,
            opacity: [0.15, 0.55, 0.15],
          }}
          transition={{
            x: SPRING,
            y: SPRING,
            width: SPRING,
            height: SPRING,
            opacity: { duration: 2.2, repeat: Infinity, ease: 'easeInOut' },
          }}
          rx={32}
          ry={32}
          fill="none"
          stroke="url(#hp-tour-glow)"
          strokeWidth="6"
          style={{ pointerEvents: 'none', filter: 'blur(2px)' }}
        />
      </svg>

      <div
        className="fixed left-1/2 top-5 z-[110] flex -translate-x-1/2 items-center gap-2 rounded-full bg-white/75 px-4 py-2 ring-1 ring-white/80 backdrop-blur-md"
        style={{ pointerEvents: 'auto' }}
      >
        {STEPS.map((_, i) => (
          <motion.span
            key={i}
            className="h-1.5 rounded-full"
            animate={{
              width: i === step ? 28 : 8,
              background:
                i <= step
                  ? 'linear-gradient(90deg,#7c6df5,#ff8fa3)'
                  : 'rgba(76,60,140,0.22)',
            }}
            transition={SPRING}
          />
        ))}
        <button
          type="button"
          onClick={onClose}
          className="ml-2 rounded-full px-3 py-0.5 text-xs font-semibold text-ink-700 transition hover:bg-white/80"
        >
          Pomiń
        </button>
      </div>

      <AnimatePresence mode="wait">
        {placement && current && (
          <motion.div
            ref={tooltipRef}
            key={tooltipKey}
            className="fixed z-[110]"
            style={{
              width: TOOLTIP_W,
              left: placement.left,
              top: placement.top,
              transform:
                placement.origin === 'bottom' ? 'translateY(-100%)' : 'none',
              pointerEvents: 'auto',
            }}
            initial={{ opacity: 0, scale: 0.9, y: placement.origin === 'bottom' ? 8 : -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={SPRING}
          >
            {placement.origin === 'top' && (
              <div
                className="absolute"
                style={{ top: -8, left: placement.arrowLeft - 8 }}
              >
                <div
                  className="h-4 w-4 rotate-45 bg-white/95 ring-1 ring-white/80"
                  style={{ borderRadius: 3 }}
                />
              </div>
            )}

            <div
              className="glass relative overflow-hidden rounded-[1.75rem] p-5"
              style={{
                boxShadow:
                  '0 24px 60px -20px rgba(76,60,140,0.55), 0 0 0 1px rgba(255,255,255,0.7) inset',
              }}
            >
              <motion.div
                className="absolute -right-10 -top-10 h-32 w-32 rounded-full blur-3xl"
                style={{ background: current.accent, opacity: 0.35 }}
                animate={{ scale: [1, 1.15, 1], opacity: [0.25, 0.45, 0.25] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              />

              <div className="relative flex items-start gap-3">
                <motion.div
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-white"
                  style={{ background: current.accent }}
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ ...SPRING, delay: 0.05 }}
                >
                  <Icon name={current.icon} size={20} />
                </motion.div>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-500">
                    Krok {step + 1} / {STEPS.length}
                  </p>
                  <h3 className="mt-1 font-display text-lg font-semibold leading-tight text-ink-900">
                    {step === 0
                      ? `${current.title}${nameFragment}`
                      : current.title}
                  </h3>
                </div>
              </div>

              <p className="relative mt-3 text-sm leading-relaxed text-ink-700">
                {current.body}
              </p>

              <div className="relative mt-5 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={prev}
                  disabled={step === 0}
                  className="rounded-full bg-white/70 px-4 py-2 text-xs font-semibold text-ink-700 ring-1 ring-white/70 transition hover:bg-white/90 disabled:opacity-40"
                >
                  Wstecz
                </button>

                <motion.button
                  type="button"
                  onClick={next}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className="inline-flex items-center gap-1.5 rounded-full px-5 py-2 text-xs font-semibold text-white shadow-[0_12px_28px_-14px_rgba(124,109,245,0.9)]"
                  style={{ background: PRIMARY_GRADIENT }}
                >
                  <span>{isLast ? 'Do dzieła!' : 'Dalej'}</span>
                  <motion.span
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.1, repeat: Infinity }}
                    className="inline-flex"
                  >
                    <Icon name="arrow" size={14} />
                  </motion.span>
                </motion.button>
              </div>
            </div>

            {placement.origin === 'bottom' && (
              <div
                className="absolute"
                style={{ bottom: -8, left: placement.arrowLeft - 8 }}
              >
                <div
                  className="h-4 w-4 rotate-45 bg-white/95 ring-1 ring-white/80"
                  style={{ borderRadius: 3 }}
                />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
