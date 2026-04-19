import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassPanel from './GlassPanel';
import AvatarImage from './AvatarImage';
import Icon from './Icon';
import { getAvatar } from '../data/avatars';
import { getFriendProfile, removeFriend } from '../api/friends';

const DANGER_GRADIENT =
  'linear-gradient(135deg, #ff8fa3 0%, #f5c76a 100%)';

const STAT_META = [
  { key: 'level', label: 'Poziom', icon: 'star', tint: 'text-rpg-xp' },
  { key: 'exp', label: 'EXP', icon: 'sparkle', tint: 'text-rpg-quest' },
  { key: 'streak', label: 'Seria', icon: 'flame', tint: 'text-rpg-hp' },
];

const VIBE_META = [
  { key: 'grind', label: 'Grind', tint: 'from-rpg-quest to-rpg-hp' },
  { key: 'rizz', label: 'Rizz', tint: 'from-rpg-hp to-rpg-xp' },
  { key: 'aura', label: 'Aura', tint: 'from-rpg-sage to-rpg-quest' },
];

export default function FriendDetailModal({ friend, onClose, onRemoved }) {
  const [details, setDetails] = useState(friend);
  const [removing, setRemoving] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!friend?.id) return;
    let cancelled = false;
    getFriendProfile(friend.id)
      .then((full) => { if (!cancelled) setDetails(full); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [friend?.id]);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const avatarMeta = getAvatar(details?.avatar);

  const handleRemove = async () => {
    if (removing) return;
    setRemoving(true);
    setError(null);
    try {
      await removeFriend(details.id);
      onRemoved?.(details.id);
      onClose();
    } catch (err) {
      setError(err.message || 'Nie udało się usunąć znajomego');
      setRemoving(false);
    }
  };

  const joinedAt = details?.created_at
    ? new Date(details.created_at).toLocaleDateString('pl-PL', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div
          className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm"
          onClick={onClose}
        />

        <motion.div
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.92, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22 }}
          className="relative w-full max-w-md"
        >
          <GlassPanel className="relative overflow-hidden p-6 sm:p-7">
            <span className="pointer-events-none absolute -top-24 -right-20 h-64 w-64 rounded-full bg-rpg-quest/30 blur-3xl" />
            <span className="pointer-events-none absolute -bottom-24 -left-16 h-60 w-60 rounded-full bg-rpg-hp/25 blur-3xl" />

            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full bg-white/60 text-ink-500 ring-1 ring-white/60 transition hover:text-ink-900"
              aria-label="Zamknij"
            >
              <Icon name="close" size={14} />
            </button>

            <div className="relative flex items-center gap-4">
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 220, damping: 16 }}
              >
                <AvatarImage
                  avatar={details?.avatar}
                  seed={details?.id || 0}
                  size={84}
                  status="online"
                />
              </motion.div>
              <div className="min-w-0">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-white/55 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-rpg-quest ring-1 ring-white/70">
                  <Icon name="sparkle" size={10} />
                  Kompan Gildii
                </div>
                <h2 className="mt-2 font-display text-3xl font-semibold leading-tight text-ink-900 truncate">
                  {details?.username}
                </h2>
                {avatarMeta && (
                  <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-ink-500">
                    {avatarMeta.label} · {avatarMeta.hint}
                  </p>
                )}
              </div>
            </div>

            <div className="relative mt-6 grid grid-cols-3 gap-2">
              {STAT_META.map((s) => (
                <motion.div
                  key={s.key}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                  className="rounded-2xl bg-white/55 p-3 text-center ring-1 ring-white/60"
                >
                  <div className={`mx-auto grid h-8 w-8 place-items-center rounded-full bg-white/70 ${s.tint}`}>
                    <Icon name={s.icon} size={14} />
                  </div>
                  <p className="mt-2 font-display text-xl font-semibold tabular-nums text-ink-900">
                    {(details?.[s.key] ?? 0).toLocaleString('pl-PL')}
                  </p>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-ink-500">{s.label}</p>
                </motion.div>
              ))}
            </div>

            <div className="relative mt-3 grid grid-cols-3 gap-2">
              {VIBE_META.map((v) => {
                const value = details?.[v.key] ?? 0;
                return (
                  <div
                    key={v.key}
                    className="rounded-2xl bg-white/55 p-3 ring-1 ring-white/60"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink-500">
                        {v.label}
                      </span>
                      <span className="font-display text-sm font-semibold text-ink-900 tabular-nums">
                        {value}
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/60 ring-1 ring-white/60">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, value * 2)}%` }}
                        transition={{ delay: 0.1, duration: 0.7, ease: 'easeOut' }}
                        className={`h-full rounded-full bg-gradient-to-r ${v.tint}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {joinedAt && (
              <p className="relative mt-5 text-center text-[11px] uppercase tracking-[0.22em] text-ink-500">
                W drużynie od {joinedAt}
              </p>
            )}

            {error && (
              <div className="relative mt-4 rounded-2xl bg-rpg-hp/15 px-4 py-3 text-xs font-medium text-ink-900 ring-1 ring-rpg-hp/40">
                {error}
              </div>
            )}

            <div className="relative mt-6 flex flex-col gap-2">
              {!confirming ? (
                <button
                  type="button"
                  onClick={() => setConfirming(true)}
                  className="w-full rounded-2xl bg-white/55 px-4 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-ink-500 ring-1 ring-white/60 transition hover:text-rpg-hp"
                >
                  Usuń z gildii
                </button>
              ) : (
                <div className="space-y-2 rounded-2xl bg-white/55 p-3 ring-1 ring-white/60">
                  <p className="text-center text-[11px] text-ink-700">
                    Na pewno? {details?.username} zniknie z Twojej gildii.
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setConfirming(false)}
                      disabled={removing}
                      className="flex-1 rounded-xl bg-white/70 px-3 py-2 text-xs font-semibold text-ink-700 ring-1 ring-white/70 hover:bg-white"
                    >
                      Anuluj
                    </button>
                    <button
                      type="button"
                      onClick={handleRemove}
                      disabled={removing}
                      className="flex-1 rounded-xl px-3 py-2 text-xs font-semibold text-white shadow-[0_14px_32px_-14px_rgba(255,143,163,0.8)] disabled:opacity-60"
                      style={{ backgroundImage: DANGER_GRADIENT }}
                    >
                      {removing ? 'Usuwam…' : 'Usuń'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </GlassPanel>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
