import Icon from './Icon';

const presets = {
  hp: {
    label: 'HP',
    icon: 'heart',
    from: '#ff8fa3',
    to: '#ff6f91',
    text: 'text-rpg-hp',
    glow: 'shadow-softpink',
  },
  mp: {
    label: 'MP',
    icon: 'star',
    from: '#a8c3ff',
    to: '#7ca3ff',
    text: 'text-rpg-mp',
    glow: 'shadow-[0_0_30px_-8px_rgba(139,184,255,0.7)]',
  },
  xp: {
    label: 'XP',
    icon: 'crystal',
    from: '#ffd98a',
    to: '#f5b751',
    text: 'text-rpg-xp',
    glow: 'shadow-[0_0_30px_-8px_rgba(245,199,106,0.8)]',
  },
  grind: {
    label: 'Grind',
    icon: 'flame',
    from: '#ffb27a',
    to: '#ff7a59',
    text: 'text-[#ff7a59]',
    glow: 'shadow-[0_0_30px_-8px_rgba(255,122,89,0.75)]',
  },
  rizz: {
    label: 'Rizz',
    icon: 'sparkle',
    from: '#c48cff',
    to: '#7c6df5',
    text: 'text-rpg-quest',
    glow: 'shadow-[0_0_30px_-8px_rgba(124,109,245,0.75)]',
  },
  aura: {
    label: 'Aura',
    icon: 'leaf',
    from: '#9eefd0',
    to: '#5fc7a4',
    text: 'text-rpg-sage',
    glow: 'shadow-[0_0_30px_-8px_rgba(125,211,184,0.8)]',
  },
};

export default function StatBar({ kind, value, max, hint }) {
  const p = presets[kind];
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="flex items-center gap-3">
      <div
        className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/60 ${p.text} ${p.glow}`}
      >
        <Icon name={p.icon} size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="mb-1 flex items-baseline justify-between gap-2">
          <span className="text-[11px] font-bold uppercase tracking-[0.24em] text-ink-500">
            {p.label}
          </span>
          <span className="font-display text-sm font-semibold text-ink-900 tabular-nums">
            {value}
            <span className="text-ink-300">/{max}</span>
          </span>
        </div>
        <div className="relative h-2.5 overflow-hidden rounded-full bg-white/50 ring-1 ring-white/60">
          <div
            className="h-full rounded-full shimmer-bar"
            style={{
              width: `${pct}%`,
              backgroundImage: `linear-gradient(90deg, ${p.from} 0%, ${p.to} 50%, ${p.from} 100%)`,
              boxShadow: `0 0 12px ${p.from}`,
            }}
          />
        </div>
        {hint && <p className="mt-1 text-[11px] text-ink-500">{hint}</p>}
      </div>
    </div>
  );
}
