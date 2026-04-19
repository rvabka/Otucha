import { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import Icon from './Icon';
import ScreenCelebration from './ScreenCelebration';
import { claimSmileReward } from '../api/smile';
import { useAuth } from '../context/AuthContext';

const SMILE_THRESHOLD = 0.45;
const REQUIRED_SECONDS = 3;

const MOTIVATIONS = [
  'Uśmiech to najkrótsza droga do siebie 🌸',
  'Twój mózg właśnie wytwarza endorfiny ✨',
  'Jeden uśmiech — tysiąc mikro-zmian w ciele 💛',
  'Uśmiechaj się, nawet jeśli nikt nie patrzy 🌤️',
  'Ciało uczy głowę — uśmiech to sygnał „jest okej" 🌿',
  'Nawet drobny uśmiech liczy się podwójnie ⭐',
];

export default function SmileDetector({ onClose }) {
  const videoRef = useRef(null);
  const landmarkerRef = useRef(null);
  const rafRef = useRef(null);
  const smileStartRef = useRef(null);

  const { refresh } = useAuth();

  const [progress, setProgress] = useState(0);
  const [smileScore, setSmileScore] = useState(0);
  const [ready, setReady] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(null);
  const [reward, setReward] = useState(null);
  const [motivationIdx, setMotivationIdx] = useState(0);

  // Rotate motivations during scan
  useEffect(() => {
    if (done || !ready) return;
    const id = setInterval(() => {
      setMotivationIdx((i) => (i + 1) % MOTIVATIONS.length);
    }, 2600);
    return () => clearInterval(id);
  }, [done, ready]);

  // Init MediaPipe + webcam
  useEffect(() => {
    let cancelled = false;
    async function init() {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm',
        );
        const landmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
          },
          runningMode: 'VIDEO',
          numFaces: 1,
          outputFaceBlendshapes: true,
        });
        if (cancelled) return;
        landmarkerRef.current = landmarker;

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 480, height: 480, facingMode: 'user' },
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        videoRef.current.srcObject = stream;
        videoRef.current.onloadeddata = () => setReady(true);
        await videoRef.current.play();
      } catch (err) {
        if (!cancelled) setError(err.message || 'Nie udało się włączyć kamery');
      }
    }
    init();
    return () => {
      cancelled = true;
      if (landmarkerRef.current) landmarkerRef.current.close();
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
      }
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const claimReward = useCallback(async () => {
    try {
      const res = await claimSmileReward();
      setReward(res);
      refresh?.();
    } catch (err) {
      setReward({ exp_gained: 10 });
    }
  }, [refresh]);

  // Detection loop
  const detect = useCallback(() => {
    if (done) return;
    const video = videoRef.current;
    const landmarker = landmarkerRef.current;
    if (!video || !landmarker || video.readyState < 2) {
      rafRef.current = requestAnimationFrame(detect);
      return;
    }
    const result = landmarker.detectForVideo(video, performance.now());
    const blendshapes = result.faceBlendshapes?.[0]?.categories;

    let score = 0;
    if (blendshapes) {
      const L = blendshapes.find((b) => b.categoryName === 'mouthSmileLeft');
      const R = blendshapes.find((b) => b.categoryName === 'mouthSmileRight');
      score = ((L?.score || 0) + (R?.score || 0)) / 2;
    }
    setSmileScore(score);
    const smiling = score >= SMILE_THRESHOLD;

    const now = Date.now();
    if (smiling) {
      if (!smileStartRef.current) smileStartRef.current = now;
      const elapsed = (now - smileStartRef.current) / 1000;
      const p = Math.min(elapsed / REQUIRED_SECONDS, 1);
      setProgress(p);
      if (p >= 1) {
        setDone(true);
        setProgress(1);
        if (videoRef.current?.srcObject) {
          videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
        }
        claimReward();
        return;
      }
    } else {
      smileStartRef.current = null;
      setProgress((prev) => Math.max(prev - 0.02, 0));
    }
    rafRef.current = requestAnimationFrame(detect);
  }, [done, claimReward]);

  useEffect(() => {
    if (ready && !done) rafRef.current = requestAnimationFrame(detect);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [ready, done, detect]);

  const pct = Math.round(progress * 100);
  const circumference = 2 * Math.PI * 118;
  const offset = circumference * (1 - progress);
  const faceDetected = smileScore > 0.02;

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center font-body">
      {/* Dim backdrop + aura */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 30% 20%, rgba(196,140,255,0.45) 0%, transparent 55%),' +
            'radial-gradient(circle at 70% 80%, rgba(255,143,163,0.4) 0%, transparent 55%),' +
            'radial-gradient(circle at 50% 50%, rgba(124,109,245,0.3) 0%, rgba(12,8,32,0.85) 70%)',
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
        }}
      />

      <AuraParticles />

      {/* Close */}
      <button
        onClick={onClose}
        className="absolute right-6 top-6 grid h-11 w-11 place-items-center rounded-2xl bg-white/20 text-white backdrop-blur-md transition hover:scale-105 hover:bg-white/30"
        aria-label="Zamknij"
      >
        ✕
      </button>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 mx-4 flex w-full max-w-md flex-col items-center rounded-[2.5rem] p-8 text-center"
        style={{
          background: 'rgba(255,255,255,0.14)',
          backdropFilter: 'blur(22px)',
          WebkitBackdropFilter: 'blur(22px)',
          border: '1px solid rgba(255,255,255,0.32)',
          boxShadow:
            '0 40px 80px -30px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.4)',
        }}
      >
        <AnimatePresence mode="wait">
          {!done ? (
            <motion.div
              key="scanning"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex w-full flex-col items-center"
            >
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="mb-1 text-4xl"
              >
                😊
              </motion.div>
              <h2 className="font-display text-2xl font-semibold text-white">
                Uśmiechnij się
              </h2>
              <p className="mt-1 text-sm text-white/80">
                Utrzymaj uśmiech przez 3 sekundy
              </p>

              {/* Portrait with rotating halo + ring */}
              <div className="relative mt-7 grid place-items-center">
                {/* Rotating conic halo */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                  className="absolute h-[280px] w-[280px] rounded-full"
                  style={{
                    background:
                      'conic-gradient(from 0deg, #7c6df5, #c48cff, #ff8fa3, #f5c76a, #7dd3b8, #7c6df5)',
                    filter: 'blur(22px)',
                    opacity: faceDetected ? 0.65 : 0.35,
                  }}
                />

                {/* Pulsing outer ring when smiling */}
                {progress > 0 && (
                  <motion.div
                    animate={{ scale: [1, 1.08, 1], opacity: [0.4, 0.8, 0.4] }}
                    transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute h-[270px] w-[270px] rounded-full"
                    style={{
                      boxShadow:
                        '0 0 60px 8px rgba(125,211,184,0.7), inset 0 0 40px rgba(125,211,184,0.4)',
                    }}
                  />
                )}

                {/* Video circle */}
                <div
                  className="relative h-[240px] w-[240px] overflow-hidden rounded-full"
                  style={{
                    border: '3px solid rgba(255,255,255,0.7)',
                    boxShadow: '0 20px 60px -10px rgba(0,0,0,0.5)',
                  }}
                >
                  <video
                    ref={videoRef}
                    muted
                    playsInline
                    className="h-full w-full object-cover"
                    style={{ transform: 'scaleX(-1)' }}
                  />
                  {!ready && !error && (
                    <div className="absolute inset-0 grid place-items-center bg-black/50 text-xs font-semibold text-white/80">
                      Ładuję kamerę…
                    </div>
                  )}
                </div>

                {/* Progress ring SVG on top */}
                <svg
                  className="pointer-events-none absolute h-[264px] w-[264px]"
                  viewBox="0 0 260 260"
                >
                  <circle
                    cx="130"
                    cy="130"
                    r="118"
                    fill="none"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="6"
                  />
                  <defs>
                    <linearGradient id="smileGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#7dd3b8" />
                      <stop offset="50%" stopColor="#c48cff" />
                      <stop offset="100%" stopColor="#ff8fa3" />
                    </linearGradient>
                  </defs>
                  <motion.circle
                    cx="130"
                    cy="130"
                    r="118"
                    fill="none"
                    stroke="url(#smileGrad)"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    transform="rotate(-90 130 130)"
                    style={{
                      filter: 'drop-shadow(0 0 10px rgba(196,140,255,0.8))',
                      transition: 'stroke-dashoffset 0.15s ease',
                    }}
                  />
                </svg>

                {/* Percent badge */}
                <div
                  className="absolute -bottom-2 rounded-full px-4 py-1 font-display text-sm font-bold tabular-nums text-white"
                  style={{
                    background:
                      'linear-gradient(135deg, #7c6df5 0%, #c48cff 55%, #ff8fa3 100%)',
                    boxShadow: '0 10px 30px -10px rgba(124,109,245,0.9)',
                  }}
                >
                  {pct}%
                </div>
              </div>

              {/* Smile strength meter */}
              <div className="mt-8 flex w-full max-w-[260px] items-center gap-2">
                <span className="text-xs text-white/70">🙂</span>
                <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-white/15">
                  <motion.div
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{
                      background:
                        'linear-gradient(90deg, #7dd3b8 0%, #c48cff 50%, #ff8fa3 100%)',
                      width: `${Math.min(smileScore * 130, 100)}%`,
                      boxShadow: '0 0 12px rgba(196,140,255,0.6)',
                    }}
                    transition={{ type: 'spring', stiffness: 120, damping: 18 }}
                  />
                </div>
                <span className="text-xs text-white/70">😄</span>
              </div>

              {/* Rotating motivation */}
              <div className="mt-5 h-10 w-full">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={motivationIdx}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.4 }}
                    className="text-sm text-white/90"
                  >
                    {MOTIVATIONS[motivationIdx]}
                  </motion.p>
                </AnimatePresence>
              </div>

              {error && (
                <p className="mt-4 rounded-2xl bg-rpg-hp/25 px-4 py-2 text-xs text-white">
                  {error}
                </p>
              )}
            </motion.div>
          ) : (
            <SuccessView reward={reward} onClose={onClose} key="done" />
          )}
        </AnimatePresence>
      </motion.div>

      {done && reward && <ScreenCelebration exp={reward.exp_gained || 10} />}
    </div>,
    document.body,
  );
}

function SuccessView({ reward, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center"
    >
      <motion.div
        animate={{ rotate: [0, -8, 8, -4, 4, 0], scale: [1, 1.15, 1] }}
        transition={{ duration: 1.2, ease: 'easeInOut' }}
        className="mb-2 text-7xl"
        style={{ filter: 'drop-shadow(0 10px 30px rgba(245,199,106,0.6))' }}
      >
        🌟
      </motion.div>
      <motion.h2
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="font-display text-3xl font-semibold text-white"
      >
        Pięknie!
      </motion.h2>
      <motion.p
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.25 }}
        className="mt-2 max-w-[280px] text-sm leading-relaxed text-white/85"
      >
        Twój mózg właśnie dostał dawkę serotoniny. Nawet wymuszony uśmiech
        działa — teraz Twoje ciało wie, że wszystko jest okej.
      </motion.p>

      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
        className="mt-6 flex items-center gap-2 rounded-full px-5 py-2 font-display text-lg font-bold text-white"
        style={{
          background:
            'linear-gradient(135deg, #f5c76a 0%, #ff8fa3 50%, #c48cff 100%)',
          boxShadow: '0 18px 40px -10px rgba(245,199,106,0.8)',
        }}
      >
        +{reward?.exp_gained ?? 10} XP
      </motion.div>

      {reward?.leveled_up && (
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.55 }}
          className="mt-3 rounded-full bg-white/15 px-4 py-1 text-xs font-semibold text-white backdrop-blur-md"
        >
          Nowy poziom: {reward.new_level} 🚀
        </motion.div>
      )}

      <motion.button
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.65 }}
        onClick={onClose}
        className="mt-7 rounded-2xl px-6 py-3 font-display text-sm font-semibold text-white transition hover:scale-105"
        style={{
          background:
            'linear-gradient(135deg, #7c6df5 0%, #c48cff 55%, #ff8fa3 100%)',
          boxShadow: '0 18px 40px -18px rgba(124,109,245,0.9)',
        }}
      >
        Wracam do gry
      </motion.button>
    </motion.div>
  );
}

function AuraParticles() {
  const particles = useMemo(
    () =>
      Array.from({ length: 22 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: 2 + Math.random() * 4,
        delay: Math.random() * 4,
        duration: 10 + Math.random() * 10,
      })),
    [],
  );
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute rounded-full bg-white animate-sparkle"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: p.size,
            height: p.size,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            opacity: 0.7,
            boxShadow: '0 0 12px rgba(255,255,255,0.8)',
          }}
        />
      ))}
    </div>
  );
}
