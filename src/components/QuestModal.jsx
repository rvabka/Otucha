import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from './Icon';
import ScreenCelebration from './ScreenCelebration';
import LevelUpCelebration from './LevelUpCelebration';
import { completeQuest, fetchTTSBlob } from '../api/quests';
import { useAuth } from '../context/AuthContext';

const TTS_AGENT = 'mindbuddy';

function formatQuestError(err) {
  if (!err) return 'Nie udało się ukończyć questa.';
  if (typeof err === 'string') return err;
  if (typeof err.message === 'string' && err.message.trim()) return err.message;
  const detail = err.detail;
  if (typeof detail === 'string' && detail.trim()) return detail;
  if (Array.isArray(detail)) {
    return detail
      .map((item) => {
        if (typeof item === 'string') return item;
        if (item && typeof item.msg === 'string') return item.msg;
        return null;
      })
      .filter(Boolean)
      .join(', ');
  }
  if (detail && typeof detail === 'object') {
    if (typeof detail.detail === 'string' && detail.detail.trim()) return detail.detail;
    if (typeof detail.message === 'string' && detail.message.trim()) return detail.message;
  }
  return 'Nie udało się ukończyć questa.';
}

function StatDeltaPill({ label, value }) {
  const negative = value < 0;
  const neutral = value === 0;
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
        negative
          ? 'bg-rpg-hp/15 text-rpg-hp'
          : neutral
          ? 'bg-white/70 text-ink-500'
          : 'bg-rpg-sage/20 text-rpg-sage'
      }`}
    >
      {value > 0 ? '+' : ''}
      {value} {label}
    </span>
  );
}

export default function QuestModal({ quest, onClose, onCompleted }) {
  const { refresh } = useAuth();
  const [ttsState, setTtsState] = useState('idle');
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState(null);
  const [celebration, setCelebration] = useState(null);
  const [levelUp, setLevelUp] = useState(null);
  const audioRef = useRef(null);
  const blobUrlRef = useRef(null);
  const requestIdRef = useRef(0);

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
  };

  const playTip = async () => {
    if (!quest?.tricky_tip) return;
    const myId = ++requestIdRef.current;
    stopAudio();
    setTtsState('loading');
    try {
      const blob = await fetchTTSBlob({ text: quest.tricky_tip, agentId: TTS_AGENT });
      if (myId !== requestIdRef.current) return;
      const url = URL.createObjectURL(blob);
      blobUrlRef.current = url;
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => {
        if (myId === requestIdRef.current) setTtsState('idle');
      };
      audio.onerror = () => {
        if (myId === requestIdRef.current) setTtsState('idle');
      };
      setTtsState('playing');
      await audio.play();
    } catch (err) {
      console.warn('[QuestModal] TTS error:', err);
      if (myId === requestIdRef.current) setTtsState('idle');
    }
  };

  useEffect(() => {
    if (quest?.tricky_tip) playTip();
    return () => {
      requestIdRef.current++;
      stopAudio();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quest?.id]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleDone = async () => {
    if (!quest || quest.completed || completing) return;
    setCompleting(true);
    setError(null);
    try {
      const res = await completeQuest(quest.id);
      setCelebration({ id: quest.id, exp: res.exp_gained });
      if (res.leveled_up) {
        setTimeout(() => {
          setLevelUp({ id: `${quest.id}_lvl`, newLevel: res.new_level || res.level });
        }, 1500);
      }
      requestIdRef.current++;
      stopAudio();
      setTtsState('idle');
      refresh();
      onCompleted?.(quest.id);
      setTimeout(() => {
        onClose?.();
      }, 2200);
    } catch (err) {
      setError(formatQuestError(err));
    } finally {
      setCompleting(false);
    }
  };

  if (!quest) return null;

  const tags = [
    quest.category,
    quest.estimated_time ? `~${quest.estimated_time} min` : null,
    `+${quest.exp_reward} XP`,
  ].filter(Boolean);

  return createPortal(
    <>
      {celebration && <ScreenCelebration key={celebration.id} exp={celebration.exp} />}
      {levelUp && (
        <LevelUpCelebration
          key={levelUp.id}
          newLevel={levelUp.newLevel}
          onDone={() => setLevelUp(null)}
        />
      )}

      <AnimatePresence>
        <motion.div
          key="quest-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[150] flex items-center justify-center p-4"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-ink-900/45 backdrop-blur-md" />

          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-[151] w-full max-w-xl overflow-hidden rounded-[2.5rem] bg-white/85 shadow-[0_40px_80px_-30px_rgba(76,60,140,0.45)] backdrop-blur-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="pointer-events-none absolute -top-20 -right-16 h-56 w-56 rounded-full bg-rpg-quest/30 blur-3xl" />
            <span className="pointer-events-none absolute -bottom-16 -left-12 h-48 w-48 rounded-full bg-rpg-hp/25 blur-3xl" />

            <div className="relative max-h-[85vh] overflow-y-auto no-scrollbar p-6 sm:p-8">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/70 text-2xl ring-1 ring-white/70">
                    {quest.icon || '✨'}
                  </span>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-rpg-quest">
                      Quest
                    </p>
                    <h2 className="font-display text-2xl font-semibold leading-tight text-ink-900 sm:text-[26px]">
                      {quest.title}
                    </h2>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="grid h-9 w-9 flex-none place-items-center rounded-full bg-white/60 text-ink-500 transition hover:bg-white/90"
                  aria-label="Zamknij"
                >
                  ✕
                </button>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-white/70 px-3 py-1 text-[11px] font-semibold tracking-wide text-ink-700 ring-1 ring-white/70"
                  >
                    {t}
                  </span>
                ))}
              </div>

              <div className="mt-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-ink-500">
                  Bonus statów
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <StatDeltaPill label="Grind" value={quest.grind_delta || 0} />
                  <StatDeltaPill label="Rizz" value={quest.rizz_delta || 0} />
                  <StatDeltaPill label="Aura" value={quest.aura_delta || 0} />
                </div>
              </div>

              {(quest.description_long || quest.description) && (
                <p className="mt-5 text-sm leading-relaxed text-ink-700">
                  {quest.description_long || quest.description}
                </p>
              )}

              {quest.tricky_tip && (
                <div
                  className="relative mt-6 overflow-hidden rounded-3xl p-5 ring-1 ring-white/60"
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(124,109,245,0.14) 0%, rgba(196,140,255,0.14) 55%, rgba(255,143,163,0.14) 100%)',
                  }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="grid h-7 w-7 place-items-center rounded-lg bg-rpg-quest/15 text-rpg-quest">
                        <Icon name="sparkle" size={14} />
                      </span>
                      <span className="text-[11px] font-bold uppercase tracking-[0.28em] text-rpg-quest">
                        Tricky tip
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={playTip}
                      disabled={ttsState === 'loading'}
                      className="flex items-center gap-2 rounded-full bg-white/70 px-3 py-1.5 text-xs font-semibold text-ink-900 ring-1 ring-white/70 transition hover:bg-white/90 disabled:opacity-60"
                    >
                      <Icon name="wave" size={14} className="text-rpg-quest" />
                      {ttsState === 'loading'
                        ? 'Ładuję…'
                        : ttsState === 'playing'
                        ? 'Odtwarzam…'
                        : 'Posłuchaj'}
                    </button>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-ink-900">
                    {quest.tricky_tip}
                  </p>
                  {ttsState === 'playing' && (
                    <div className="mt-3 flex items-center gap-1">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <motion.span
                          key={i}
                          className="h-1.5 w-1.5 rounded-full bg-rpg-quest"
                          animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.4, 1] }}
                          transition={{
                            duration: 0.9,
                            repeat: Infinity,
                            delay: i * 0.1,
                            ease: 'easeInOut',
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {error && (
                <p className="mt-4 rounded-2xl bg-rpg-hp/15 px-4 py-3 text-sm text-rpg-hp">
                  {error}
                </p>
              )}

              <div className="mt-7 flex flex-wrap items-center justify-between gap-3">
                <span className="font-display text-sm font-semibold text-rpg-xp">
                  +{quest.exp_reward} XP po ukończeniu
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-full bg-white/60 px-4 py-2.5 text-sm font-semibold text-ink-700 ring-1 ring-white/70 transition hover:bg-white/90"
                  >
                    Później
                  </button>
                  <button
                    type="button"
                    onClick={handleDone}
                    disabled={completing || quest.completed}
                    className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-[0_18px_40px_-18px_rgba(124,109,245,0.9)] transition-transform hover:-translate-y-0.5 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                    style={{
                      background:
                        'linear-gradient(135deg, #7c6df5 0%, #c48cff 55%, #ff8fa3 100%)',
                    }}
                  >
                    {quest.completed ? (
                      <>
                        <Icon name="check" size={14} />
                        Ukończone
                      </>
                    ) : completing ? (
                      'Kończę…'
                    ) : (
                      <>
                        <Icon name="check" size={14} />
                        Ukończ quest
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </>,
    document.body
  );
}
