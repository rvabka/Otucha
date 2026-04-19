import { useEffect, useState } from 'react';
import GlassPanel from './GlassPanel';
import Icon from './Icon';
import ScreenCelebration from './ScreenCelebration';
import LevelUpCelebration from './LevelUpCelebration';
import { getTasks, completeTask } from '../api/tasks';
import { useAuth } from '../context/AuthContext';

const CATEGORY_LABELS = {
  daily: 'Codzienne',
  weekly: 'Tygodniowe',
};

function groupByCategory(tasks) {
  const groups = {};
  for (const t of tasks) {
    const key = t.category || 'other';
    if (!groups[key]) groups[key] = [];
    groups[key].push(t);
  }
  return groups;
}

function StatImpact({ label, value }) {
  if (!value) return null;
  const positive = value > 0;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] ${
        positive ? 'bg-rpg-sage/20 text-rpg-sage' : 'bg-rpg-hp/15 text-rpg-hp'
      }`}
    >
      {positive ? '+' : ''}
      {value} {label}
    </span>
  );
}

export default function TaskList() {
  const { user, refresh, patchUser } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [completingId, setCompletingId] = useState(null);
  const [flash, setFlash] = useState(null);
  const [levelUp, setLevelUp] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getTasks();
        if (!cancelled) {
          setTasks(data);
          setStatus('ready');
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.detail || err.message);
          setStatus('error');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const onComplete = async (taskId) => {
    setCompletingId(taskId);
    try {
      const result = await completeTask(taskId);
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? { ...t, completed: true, completed_at: new Date().toISOString() }
            : t
        )
      );

      patchUser({
        exp: result.total_exp,
        level: result.level,
        streak: result.streak,
        grind: result.grind,
        rizz: result.rizz,
        aura: result.aura,
        exp_in_current_level: result.exp_in_current_level,
        exp_for_current_level: result.exp_for_current_level,
        exp_to_next: result.exp_to_next,
      });

      // Show XP celebration
      setFlash({ id: taskId, exp: result.exp_gained });

      // If leveled up, show level-up celebration after XP celebration
      if (result.leveled_up) {
        setTimeout(() => {
          setLevelUp({ id: taskId + '_lvl', newLevel: result.new_level || result.level });
        }, 1500);
      }

      refresh();

      setTimeout(() => setFlash(null), 5500);
    } catch (err) {
      setError(err.detail || err.message);
    } finally {
      setCompletingId(null);
    }
  };

  const groups = groupByCategory(tasks);
  const orderedCategories = ['daily', 'weekly', ...Object.keys(groups).filter((k) => k !== 'daily' && k !== 'weekly')];
  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <>
    {flash && <ScreenCelebration key={flash.id} exp={flash.exp} />}
    {levelUp && (
      <LevelUpCelebration
        key={levelUp.id}
        newLevel={levelUp.newLevel}
        onDone={() => setLevelUp(null)}
      />
    )}
    <GlassPanel variant="default" className="p-6 sm:p-7">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-xl font-semibold text-ink-900">
            Moje zadania
          </h3>
          <p className="text-xs text-ink-500">
            Ukończone {completedCount} z {tasks.length}
          </p>
        </div>
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-rpg-xp/20 text-rpg-xp">
          <Icon name="star" size={16} />
        </span>
      </div>

      {status === 'loading' && (
        <p className="mt-5 text-sm text-ink-500">Wczytuję zadania…</p>
      )}

      {status === 'error' && (
        <p className="mt-5 rounded-2xl bg-rpg-hp/15 px-4 py-3 text-sm text-rpg-hp">
          Nie udało się wczytać zadań: {error}
        </p>
      )}

      {status === 'ready' && tasks.length === 0 && (
        <p className="mt-5 text-sm text-ink-500">Brak zadań na dziś.</p>
      )}

      {status === 'ready' && tasks.length > 0 && (
        <div className="mt-5 space-y-6">
          {orderedCategories
            .filter((cat) => groups[cat]?.length)
            .map((cat) => (
              <section key={cat}>
                <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.22em] text-ink-500">
                  {CATEGORY_LABELS[cat] || cat}
                </p>
                <ul className="divide-y divide-white/50">
                  {groups[cat].map((task) => {
                    const isCompleting = completingId === task.id;
                    return (
                      <li
                        key={task.id}
                        className={`grid grid-cols-[auto_1fr_auto] items-center gap-x-4 py-3 transition-opacity ${
                          task.completed ? 'opacity-60' : ''
                        }`}
                      >
                        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/70 text-xl ring-1 ring-white/70">
                          {task.icon || '✨'}
                        </span>
                        <div className="min-w-0">
                          <p
                            className={`truncate font-medium text-ink-900 ${
                              task.completed ? 'line-through decoration-ink-300' : ''
                            }`}
                          >
                            {task.title}
                          </p>
                          {task.description && (
                            <p className="truncate text-xs text-ink-500">
                              {task.description}
                            </p>
                          )}
                          <div className="mt-1 flex flex-wrap gap-1.5">
                            <StatImpact label="Grind" value={task.grind_delta} />
                            <StatImpact label="Rizz" value={task.rizz_delta} />
                            <StatImpact label="Aura" value={task.aura_delta} />
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-display text-sm font-semibold tabular-nums text-rpg-xp">
                            +{task.exp_reward} XP
                          </span>
                          {task.completed ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-rpg-sage/20 px-3 py-1.5 text-xs font-semibold text-rpg-sage">
                              <Icon name="check" size={14} />
                              Gotowe
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => onComplete(task.id)}
                              disabled={isCompleting}
                              className="rounded-full bg-rpg-quest px-4 py-1.5 text-xs font-semibold text-white shadow-glow transition-transform hover:-translate-y-0.5 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {isCompleting ? '…' : 'Ukończ'}
                            </button>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
        </div>
      )}
    </GlassPanel>
    </>
  );
}
