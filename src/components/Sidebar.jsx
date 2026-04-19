import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import Icon from './Icon';
import GlassPanel from './GlassPanel';
import EmojiBurst from './EmojiBurst';

const items = [
  { to: '/app', label: 'Dziennik', icon: 'journal' },
  { to: '/chat', label: 'Chat GM', icon: 'chat' },
  { to: '/friends', label: 'Gildia', icon: 'users' },
  { to: '/profil', label: 'Profil', icon: 'profile' },
];

const MOODS = ['😔', '😕', '🙂', '😊', '✨'];

export default function Sidebar() {
  const [selectedMood, setSelectedMood] = useState(3);
  const [burst, setBurst] = useState(null);

  const handleMoodClick = (emoji, index, event) => {
    setSelectedMood(index);
    const rect = event.currentTarget.getBoundingClientRect();
    setBurst({
      id: Date.now(),
      emoji,
      moodIndex: index,
      origin: {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      },
    });
  };

  return (
    <aside className="flex h-full flex-col gap-6">
      <Link
        to="/"
        className="flex items-center gap-3 rounded-2xl px-2 pt-2 transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-rpg-quest/50"
      >
        <div className="relative grid h-11 w-11 place-items-center rounded-[1.25rem] bg-gradient-to-br from-rpg-quest to-rpg-hp text-white shadow-glow">
          <span className="font-display text-xl font-semibold italic">Ot</span>
          <span className="absolute -top-1 -right-1 h-3 w-3 animate-sparkle rounded-full bg-rpg-xp shadow-[0_0_10px_2px_rgba(245,199,106,0.8)]" />
        </div>
        <div className="leading-tight">
          <p className="font-display text-lg font-semibold tracking-tight">Otucha</p>
          <p className="-mt-1 text-xs uppercase tracking-[0.22em] text-ink-500">RPG dobrostanu</p>
        </div>
      </Link>

      <nav className="flex-1">
        <ul className="space-y-1.5">
          {items.map(({ to, label, icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === '/app'}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? 'bg-white/70 text-rpg-quest shadow-[0_8px_24px_-12px_rgba(124,109,245,0.6)]'
                      : 'text-ink-700 hover:bg-white/45 hover:text-ink-900'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={`grid h-8 w-8 place-items-center rounded-xl transition-colors ${
                        isActive
                          ? 'bg-rpg-quest/15 text-rpg-quest'
                          : 'bg-white/50 text-ink-500 group-hover:text-ink-900'
                      }`}
                    >
                      <Icon name={icon} size={16} />
                    </span>
                    <span>{label}</span>
                    {isActive && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-rpg-quest shadow-[0_0_8px_2px_rgba(124,109,245,0.6)]" />
                    )}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <GlassPanel variant="soft" className="p-5 py-2">
        <p className="font-display text-base font-medium leading-snug text-balance">
          Jak się dziś czujesz, Wojowniku?
        </p>
        <div className="mt-3 flex items-center gap-1.5">
          {MOODS.map((m, i) => {
            const isSelected = selectedMood === i;
            const isBursting = burst?.moodIndex === i;
            return (
              <button
                key={m}
                type="button"
                aria-label={`Nastrój ${i + 1}`}
                onClick={(e) => handleMoodClick(m, i, e)}
                className={`relative grid h-9 w-9 place-items-center rounded-xl text-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/70 active:scale-90 ${
                  isSelected
                    ? 'bg-white/85 shadow-[0_10px_26px_-10px_rgba(124,109,245,0.7)] ring-1 ring-white'
                    : 'bg-white/40'
                }`}
              >
                {isSelected && (
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 rounded-xl"
                    style={{
                      background:
                        'radial-gradient(circle at 50% 50%, rgba(245,199,106,0.35) 0%, rgba(196,140,255,0.25) 55%, transparent 80%)',
                      filter: 'blur(2px)',
                    }}
                  />
                )}
                <span
                  key={isBursting ? burst.id : `idle-${i}`}
                  className="relative"
                  style={
                    isBursting
                      ? {
                          display: 'inline-block',
                          animation:
                            'moodWobble 0.8s cubic-bezier(.2,.9,.3,1.3)',
                        }
                      : undefined
                  }
                >
                  {m}
                </span>
              </button>
            );
          })}
        </div>
      </GlassPanel>

      {burst && (
        <EmojiBurst
          key={burst.id}
          emoji={burst.emoji}
          origin={burst.origin}
          moodIndex={burst.moodIndex}
          onDone={() => setBurst(null)}
        />
      )}
    </aside>
  );
}
