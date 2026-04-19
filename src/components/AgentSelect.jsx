import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import GlassPanel from './GlassPanel';
import Icon from './Icon';
import { getCharacter } from '../data/characters';

const API_BASE = import.meta.env.VITE_API_URL || 'https://vps-5af91b90.vps.ovh.net';

const AGENT_ORDER = ['mindfulness', 'mindbuddy', 'journal_companion'];
const sortAgents = (list) =>
  [...list].sort((a, b) => {
    const ai = AGENT_ORDER.indexOf(a.id);
    const bi = AGENT_ORDER.indexOf(b.id);
    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
  });

export default function AgentSelect() {
  const navigate = useNavigate();
  const [agents, setAgents] = useState([]);
  const [status, setStatus] = useState('loading');
  const [hoveredId, setHoveredId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`${API_BASE}/rag/agents`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) {
          setAgents(sortAgents(data));
          setStatus('ready');
        }
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });
    return () => { cancelled = true; };
  }, []);

  return (
    <GlassPanel variant="default" className="p-6 sm:p-7">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-xl font-semibold text-ink-900">
            Rozmowa z agentem
          </h3>
          <p className="text-xs text-ink-500">
            Najedź na postać, a przywita Cię ruchem — kliknij, żeby zacząć rozmowę
          </p>
        </div>
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-rpg-quest/20 text-rpg-quest">
          <Icon name="chat" size={16} />
        </span>
      </div>

      {status === 'loading' && (
        <p className="mt-5 text-sm text-ink-500">Wczytuję agentów…</p>
      )}

      {status === 'error' && (
        <p className="mt-5 rounded-2xl bg-rpg-hp/15 px-4 py-3 text-sm text-rpg-hp">
          Nie udało się wczytać agentów.
        </p>
      )}

      {status === 'ready' && (
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent) => {
            const character = getCharacter(agent.id);
            const isHovered = hoveredId === agent.id;
            return (
              <CharacterCard
                key={agent.id}
                agent={agent}
                character={character}
                isHovered={isHovered}
                onHoverStart={() => setHoveredId(agent.id)}
                onHoverEnd={() => setHoveredId((id) => (id === agent.id ? null : id))}
                onClick={() => navigate(`/chat/${agent.id}`)}
              />
            );
          })}
        </div>
      )}
    </GlassPanel>
  );
}

function CharacterCard({ agent, character, isHovered, onHoverStart, onHoverEnd, onClick }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (isHovered) {
      v.currentTime = 0;
      v.play().catch(() => {});
    } else {
      v.pause();
    }
  }, [isHovered]);

  return (
    <motion.button
      type="button"
      onClick={onClick}
      onHoverStart={onHoverStart}
      onHoverEnd={onHoverEnd}
      onFocus={onHoverStart}
      onBlur={onHoverEnd}
      whileTap={{ scale: 0.97 }}
      className="group relative flex flex-col overflow-hidden rounded-[2rem] border border-white/70 text-left"
      style={{
        background: character.gradient,
        boxShadow: `0 30px 70px -30px ${character.halo}, inset 0 1px 0 rgba(255,255,255,0.7)`,
      }}
    >
      {/* Animated halo */}
      <motion.div
        className="pointer-events-none absolute -inset-6 rounded-[3rem]"
        animate={{
          opacity: isHovered ? [0.55, 0.95, 0.55] : 0.35,
          scale: isHovered ? [1, 1.03, 1] : 1,
        }}
        transition={{
          duration: isHovered ? 1.4 : 5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          background: `radial-gradient(closest-side, ${character.halo} 0%, transparent 75%)`,
          filter: 'blur(26px)',
        }}
      />

      {/* Portrait area */}
      <div className="relative aspect-[3/4] w-full overflow-hidden">
        {/* top sheen */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-10 h-24"
          style={{
            background:
              'linear-gradient(180deg, rgba(255,255,255,0.45) 0%, transparent 100%)',
          }}
        />

        {/* idle image */}
        <motion.img
          src={character.idle}
          alt={character.name}
          draggable={false}
          animate={{ opacity: isHovered ? 0 : 1 }}
          transition={{ duration: 0.25 }}
          className="absolute inset-0 h-full w-full select-none object-cover"
          style={{ objectPosition: 'center top' }}
        />

        {/* talking video */}
        <motion.video
          ref={videoRef}
          src={character.talk}
          loop
          muted
          playsInline
          preload="metadata"
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.25 }}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: 'center top' }}
        />

        {/* bottom darken for legibility */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-1/2"
          style={{
            background:
              'linear-gradient(180deg, transparent 0%, rgba(20,15,40,0.6) 100%)',
          }}
        />

        {/* warm bloom when hovered */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              key="bloom"
              className="pointer-events-none absolute inset-0 z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.45, 0.85, 0.45] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                background: `radial-gradient(60% 50% at 50% 100%, ${character.halo} 0%, transparent 70%)`,
                mixBlendMode: 'screen',
              }}
            />
          )}
        </AnimatePresence>

        {/* Sparkles on hover */}
        {isHovered && <FloatingSparkles color={character.accent} />}

        {/* Name plate */}
        <div className="absolute inset-x-0 bottom-0 z-20 flex items-end justify-between gap-2 p-4">
          <div>
            <p
              className="font-display text-2xl font-semibold text-white"
              style={{ textShadow: '0 4px 18px rgba(0,0,0,0.6)' }}
            >
              {character.name}
            </p>
            <p
              className="mt-0.5 text-[11px] text-white/90"
              style={{ textShadow: '0 2px 10px rgba(0,0,0,0.7)' }}
            >
              {character.tagline}
            </p>
          </div>

          {/* Waveform on hover */}
          {isHovered && (
            <div className="flex items-end gap-0.5 pb-1">
              {[0, 1, 2, 3, 4].map((i) => (
                <motion.span
                  key={i}
                  className="w-0.5 rounded-full"
                  style={{
                    background: 'rgba(255,255,255,0.95)',
                    boxShadow: `0 0 8px ${character.halo}`,
                  }}
                  animate={{ height: [4, 16, 8, 20, 6] }}
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
      </div>

      {/* Footer CTA */}
      <div className="relative z-10 flex items-center justify-between gap-2 bg-white/70 px-4 py-3 backdrop-blur-md">
        <div className="min-w-0">
          <p className="truncate font-display text-sm font-semibold text-ink-900">
            {agent.name}
          </p>
          <p className="truncate text-[11px] text-ink-500">
            {agent.description}
          </p>
        </div>
        <motion.span
          className="inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold text-white"
          style={{
            background: `linear-gradient(135deg, ${character.accent} 0%, rgba(255,255,255,0.6) 200%)`,
            boxShadow: `0 10px 25px -12px ${character.halo}`,
          }}
          animate={{ x: isHovered ? [0, 3, 0] : 0 }}
          transition={{ duration: 0.8, repeat: isHovered ? Infinity : 0 }}
        >
          Porozmawiaj
          <span>→</span>
        </motion.span>
      </div>
    </motion.button>
  );
}

function FloatingSparkles({ color }) {
  const dots = Array.from({ length: 8 });
  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
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
            animate={{ opacity: [0, 1, 0], y: [0, -220] }}
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
