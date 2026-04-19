import StatBar from './StatBar';
import Icon from './Icon';

function LevelProgress({ level, value, max }) {
  const size = 52;
  const stroke = 5;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.max(0, Math.min(1, value / max));
  const offset = circumference * (1 - pct);
  const barPct = Math.round(pct * 100);

  return (
    <div className="flex items-center gap-3 rounded-[1.5rem] bg-white/55 px-4 py-2.5 ring-1 ring-white/60 backdrop-blur-md">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <defs>
            <linearGradient id="level-ring" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7c6df5" />
              <stop offset="55%" stopColor="#c48cff" />
              <stop offset="100%" stopColor="#ff8fa3" />
            </linearGradient>
          </defs>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.7)"
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="url(#level-ring)"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.9s cubic-bezier(.2,.8,.2,1)' }}
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center">
          <span className="font-display text-base font-semibold leading-none tabular-nums text-ink-900">
            {level}
          </span>
        </div>
      </div>
      <div className="leading-tight whitespace-nowrap">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-500">
          Poziom · {barPct}%
        </p>
        <p className="font-display text-sm font-semibold tabular-nums text-ink-900">
          {value.toLocaleString('pl-PL')}
          <span className="text-ink-300"> / {max.toLocaleString('pl-PL')}</span>
          <span className="ml-1 text-[11px] font-medium text-ink-500">XP</span>
        </p>
      </div>
    </div>
  );
}

function nextThreshold(value) {
  const v = Math.max(0, value || 0);
  return Math.max(100, Math.ceil((v + 1) / 100) * 100);
}

export default function StatsHeader({ name = 'Wojowniku', stats, streak = 6, level = 1, vibes }) {
  const grind = vibes?.grind ?? 0;
  const rizz = vibes?.rizz ?? 0;
  const aura = vibes?.aura ?? 0;
  return (
    <header className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-rpg-quest/80 whitespace-nowrap">
            Dzień {streak} · passa marzeń
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold leading-[1.05] tracking-tight text-ink-900 whitespace-nowrap sm:text-4xl">
            Cześć,{' '}
            <span className="relative inline-block italic text-rpg-quest">
              {name}!
              <svg
                className="absolute left-0 -bottom-1 w-full text-rpg-hp/70"
                viewBox="0 0 200 12"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M2 8 C 60 2, 140 2, 198 8"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-700">
            Gotów na dzisiaj? Twoja Drużyna jest online, a Mistrz Gry przygotował
            spokojną przygodę na popołudnie.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <LevelProgress level={level} value={stats.xp.value} max={stats.xp.max} />
          <div className="flex items-center gap-2 rounded-[1.5rem] bg-white/55 px-4 py-2.5 ring-1 ring-white/60 backdrop-blur-md">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-rpg-xp/20 text-rpg-xp">
              <Icon name="flame" size={16} />
            </span>
            <div className="leading-tight whitespace-nowrap">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-500">
                Seria
              </p>
              <p className="font-display text-lg font-semibold tabular-nums">
                {streak} dni
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 rounded-[2rem] bg-white/40 p-5 ring-1 ring-white/60 backdrop-blur-md sm:grid-cols-3">
        <StatBar kind="grind" value={grind} max={nextThreshold(grind)} hint="Zapał do questów" />
        <StatBar kind="rizz" value={rizz} max={nextThreshold(rizz)} hint="Moc rozmów z Drużyną" />
        <StatBar kind="aura" value={aura} max={nextThreshold(aura)} hint="Spokój i wewnętrzna energia" />
      </div>
    </header>
  );
}
