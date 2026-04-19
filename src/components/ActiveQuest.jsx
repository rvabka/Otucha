import GlassPanel from './GlassPanel';
import ProgressRing from './ProgressRing';
import GameMasterSprite from './GameMasterSprite';
import Icon from './Icon';

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

export default function ActiveQuest({ quest, onOpen }) {
  if (!quest) return null;

  const title = quest.title;
  const description =
    quest.description_short || quest.description || quest.description_long || '';
  const tags = [
    quest.category,
    quest.estimated_time ? `${quest.estimated_time} min` : null,
    quest.icon,
  ].filter(Boolean);
  const xpReward = quest.exp_reward || 0;
  const gmMessage =
    quest.tricky_tip || 'Kliknij aby rozwinąć quest i posłuchać wskazówki.';
  const estimated = quest.estimated_time || 0;

  return (
    <GlassPanel
      variant="quest"
      className="relative overflow-hidden p-6 sm:p-7"
    >
      <span className="pointer-events-none absolute -top-16 -right-16 h-52 w-52 rounded-full bg-rpg-quest/30 blur-3xl" />
      <span className="pointer-events-none absolute -bottom-14 -left-10 h-44 w-44 rounded-full bg-rpg-hp/30 blur-3xl" />

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-rpg-quest/15 text-rpg-quest">
            <Icon name="sparkle" size={14} />
          </span>
          <span className="text-[11px] font-bold uppercase tracking-[0.28em] text-rpg-quest">
            Aktywny quest
          </span>
        </div>
        <span className="rounded-full bg-rpg-sage/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-rpg-sage">
          {quest.category || 'personal'}
        </span>
      </div>

      <div className="mt-5 grid gap-6 sm:grid-cols-[1fr_auto] sm:items-center">
        <div>
          <p className="font-display text-xs font-semibold uppercase tracking-[0.22em] text-ink-500">
            Zadanie
          </p>
          <h2 className="mt-1 font-display text-3xl font-semibold leading-tight text-ink-900 text-balance sm:text-[32px]">
            {title}
          </h2>
          {description && (
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-ink-700">
              {description}
            </p>
          )}

          {tags.length > 0 && (
            <div className="mt-5 flex flex-wrap items-center gap-2">
              {tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-white/70 px-3 py-1 text-[11px] font-semibold tracking-wide text-ink-700 ring-1 ring-white/70"
                >
                  {t}
                </span>
              ))}
            </div>
          )}

          <div className="mt-5 flex flex-wrap gap-2">
            <StatDeltaPill label="Grind" value={quest.grind_delta || 0} />
            <StatDeltaPill label="Rizz" value={quest.rizz_delta || 0} />
            <StatDeltaPill label="Aura" value={quest.aura_delta || 0} />
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onOpen?.(quest)}
              className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-rpg-quest to-[#a489ff] px-5 py-3 text-sm font-semibold text-white shadow-glow transition-transform duration-300 hover:-translate-y-0.5"
            >
              {quest.completed ? 'Zobacz quest' : 'Wejdź w quest'}
              <Icon
                name="arrow"
                size={16}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </button>
            <button
              type="button"
              onClick={() => onOpen?.(quest)}
              className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-3 text-sm font-semibold text-ink-900 ring-1 ring-white/70 backdrop-blur-md transition-all hover:bg-white/90"
            >
              <Icon name="wave" size={16} className="text-rpg-quest" />
              Posłuchaj wskazówki
            </button>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4">
          <ProgressRing
            value={quest.completed ? estimated : 0}
            max={estimated || 1}
            size={140}
            stroke={12}
            sublabel="minut"
          />
          <p className="text-xs text-ink-500">
            +{xpReward} XP po ukończeniu
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onOpen?.(quest)}
        className="mt-6 block w-full rounded-3xl border-t border-white/60 pt-5 text-left transition hover:opacity-90"
      >
        <GameMasterSprite message={gmMessage} />
      </button>
    </GlassPanel>
  );
}
