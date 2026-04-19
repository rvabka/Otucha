import GlassPanel from './GlassPanel';
import AvatarImage from './AvatarImage';
import Icon from './Icon';
import { useAuth } from '../context/AuthContext';

export default function PlayerCard({ player, xp }) {
  const { logout } = useAuth();
  const pct = xp ? Math.max(0, Math.min(100, (xp.value / xp.max) * 100)) : 0;
  return (
    <GlassPanel className="relative overflow-hidden p-6 text-center">
      <span className="pointer-events-none absolute -top-16 left-1/2 h-36 w-36 -translate-x-1/2 rounded-full bg-rpg-quest/25 blur-3xl" />

      <button
        type="button"
        onClick={logout}
        className="absolute right-4 top-4 rounded-full bg-white/55 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-500 ring-1 ring-white/70 transition hover:text-ink-700"
      >
        Wyloguj
      </button>

      <div className="relative mx-auto inline-block">
        <AvatarImage avatar={player.avatar} seed={player.seed} size={96} status="online" />
        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-rpg-quest to-rpg-hp px-3 py-0.5 text-[12px] font-bold uppercase tracking-[0.22em] text-white shadow-glow">
          {player.level}
        </span>
      </div>

      <h3 className="mt-5 font-display text-2xl font-semibold text-ink-900">
        {player.name}
      </h3>
      <p className="mt-1 text-xs uppercase tracking-[0.2em] text-ink-500">
        {player.class}
      </p>

      {xp && (
        <div className="mt-5 rounded-2xl bg-white/55 p-3 ring-1 ring-white/60 text-left">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink-500">
              Do poziomu {player.level + 1}
            </span>
            <span className="font-display text-xs font-semibold text-ink-900 tabular-nums">
              {xp.value.toLocaleString('pl-PL')}
              <span className="text-ink-300">
                /{xp.max.toLocaleString('pl-PL')}
              </span>
            </span>
          </div>
          <div className="mt-2 relative h-2.5 overflow-hidden rounded-full bg-white/60 ring-1 ring-white/70">
            <div
              className="h-full rounded-full shimmer-bar"
              style={{
                width: `${pct}%`,
                backgroundImage:
                  'linear-gradient(90deg, #7c6df5 0%, #c48cff 50%, #ff8fa3 100%)',
                boxShadow: '0 0 12px rgba(124,109,245,0.6)'
              }}
            />
          </div>
        </div>
      )}
    </GlassPanel>
  );
}
