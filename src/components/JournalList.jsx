import { useState, useEffect, useCallback } from 'react';
import GlassPanel from './GlassPanel';
import Icon from './Icon';
import JournalModal from './JournalModal';
import { getJournal, deleteJournalEntry } from '../api/auth';

const MOOD_ICONS = {
  happy: { emoji: '😊', tone: 'text-rpg-sage', bg: 'bg-rpg-sage/15' },
  neutral: { emoji: '😐', tone: 'text-ink-500', bg: 'bg-white/40' },
  sad: { emoji: '😢', tone: 'text-rpg-mp', bg: 'bg-rpg-mp/15' },
  anxious: { emoji: '😰', tone: 'text-rpg-xp', bg: 'bg-rpg-xp/15' },
  angry: { emoji: '😤', tone: 'text-rpg-hp', bg: 'bg-rpg-hp/15' },
  calm: { emoji: '😌', tone: 'text-rpg-sage', bg: 'bg-rpg-sage/15' },
};

function formatDate(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();

  const time = d.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
  if (isToday) return `dziś · ${time}`;
  if (isYesterday) return `wczoraj · ${time}`;
  return d.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' }) + ` · ${time}`;
}

export default function JournalList() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const loadEntries = useCallback(async () => {
    const data = await getJournal();
    setEntries(data.slice(0, 5));
  }, []);

  useEffect(() => {
    let cancelled = false;
    loadEntries()
      .then(() => {
        if (!cancelled) setLoading(false);
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [loadEntries]);

  return (
    <>
    {showModal && (
      <JournalModal
        onClose={() => setShowModal(false)}
        onChanged={loadEntries}
      />
    )}
    <GlassPanel variant="default" className="p-6 sm:p-7">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-xl font-semibold text-ink-900">
            Ostatnie wpisy z dziennika
          </h3>
          <p className="text-xs text-ink-500">Kronika Twojej podróży</p>
        </div>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="rounded-2xl bg-rpg-quest px-3 py-2 text-xs font-semibold text-white shadow-glow transition-transform hover:-translate-y-0.5"
        >
          <Icon name="plus" size={14} className="inline-block" />
          <span className="ml-1.5 hidden sm:inline">Nowy wpis</span>
        </button>
      </div>

      {loading ? (
        <p className="mt-5 text-sm text-ink-500">Wczytuję...</p>
      ) : entries.length === 0 ? (
        <div className="mt-5 text-center">
          <p className="text-2xl mb-2">📓</p>
          <p className="text-sm text-ink-500">Brak wpisów w dzienniku</p>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="mt-2 rounded-full bg-rpg-quest/15 px-4 py-1.5 text-xs font-semibold text-rpg-quest"
          >
            Napisz pierwszy wpis
          </button>
        </div>
      ) : (
        <>
          <ul className="mt-5 divide-y divide-white/50">
            {entries.map((entry) => {
              const moodData = MOOD_ICONS[entry.mood] || MOOD_ICONS.neutral;
              return (
                <li
                  key={entry.id}
                  className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-x-4 py-3"
                >
                  <span className={`grid h-10 w-10 place-items-center rounded-2xl ${moodData.bg} text-lg`}>
                    {moodData.emoji}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-ink-900">{entry.title}</p>
                    <p className="truncate text-xs text-ink-500">
                      {entry.content.substring(0, 80)}{entry.content.length > 80 ? '...' : ''}
                    </p>
                  </div>
                  <span className="text-xs text-ink-500 tabular-nums">
                    {formatDate(entry.created_at)}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setShowModal(true)}
                      className="rounded-full border border-white/80 bg-white/40 px-3 py-1.5 text-xs font-semibold text-rpg-quest transition-colors hover:bg-white/80"
                    >
                      Otwórz
                    </button>
                    <button
                      type="button"
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (!confirm('Usunąć wpis?')) return;
                        try {
                          await deleteJournalEntry(entry.id);
                          await loadEntries();
                        } catch {}
                      }}
                      className="grid h-8 w-8 place-items-center rounded-full bg-white/40 text-rpg-hp/60 transition hover:bg-rpg-hp/15 hover:text-rpg-hp"
                    >
                      🗑️
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>

          {entries.length >= 5 && (
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="mt-3 w-full rounded-2xl bg-white/40 py-2 text-xs font-semibold text-ink-500 ring-1 ring-white/60 transition hover:bg-white/60"
            >
              Zobacz wszystkie wpisy
            </button>
          )}
        </>
      )}
    </GlassPanel>
    </>
  );
}
