import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import GlassPanel from './GlassPanel';
import { getJournal, createJournalEntry, deleteJournalEntry, updateJournalEntry } from '../api/auth';
import { playSound } from '../lib/sound';

const MOODS = [
  { id: 'happy', emoji: '😊', label: 'Radosny' },
  { id: 'neutral', emoji: '😐', label: 'Neutralny' },
  { id: 'sad', emoji: '😢', label: 'Smutny' },
  { id: 'anxious', emoji: '😰', label: 'Zaniepokojony' },
  { id: 'angry', emoji: '😤', label: 'Zły' },
  { id: 'calm', emoji: '😌', label: 'Spokojny' },
];

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('pl-PL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function JournalModal({ onClose, onChanged }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editMood, setEditMood] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getJournal()
      .then((data) => { if (!cancelled) setEntries(data); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setSaving(true);
    try {
      const entry = await createJournalEntry({
        title: title.trim(),
        content: content.trim(),
        mood,
      });
      setEntries((prev) => [entry, ...prev]);
      await onChanged?.();
      playSound('chime');
      setTitle('');
      setContent('');
      setMood(null);
      setShowForm(false);
    } catch (err) {
      setError(err.detail || err.message);
    } finally {
      setSaving(false);
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative z-[201] w-full max-w-2xl max-h-[85vh] overflow-hidden rounded-[2rem] bg-white/90 backdrop-blur-xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/50 px-6 py-4">
          <div>
            <h2 className="font-display text-xl font-bold text-ink-900">Dziennik</h2>
            <p className="text-xs text-ink-500">Zapisuj swoje myśli i emocje</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowForm(!showForm)}
              className="rounded-full bg-rpg-quest px-4 py-1.5 text-xs font-semibold text-white shadow-glow transition-transform hover:-translate-y-0.5"
            >
              {showForm ? 'Anuluj' : '+ Nowy wpis'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="grid h-8 w-8 place-items-center rounded-full bg-white/50 text-ink-500 transition hover:bg-white/80"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(85vh-64px)] p-6 no-scrollbar">
          {error && (
            <div className="mb-4 rounded-2xl bg-rpg-hp/15 px-4 py-3 text-sm text-rpg-hp">
              {error}
            </div>
          )}

          {/* Form */}
          {showForm && (
            <div className="mb-6 animate-fadeUp">
              <form onSubmit={handleSubmit}>
                <input
                  type="text"
                  placeholder="Tytuł wpisu..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-transparent text-lg font-semibold text-ink-900 placeholder:text-ink-300 focus:outline-none"
                />

                <div className="mt-3 flex flex-wrap gap-2">
                  {MOODS.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        setMood(mood === m.id ? null : m.id);
                        playSound('pop');
                      }}
                      className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                        mood === m.id
                          ? 'bg-rpg-quest text-white shadow-glow'
                          : 'bg-white/60 text-ink-500 ring-1 ring-white/70 hover:bg-white/80'
                      }`}
                    >
                      <span>{m.emoji}</span>
                      {m.label}
                    </button>
                  ))}
                </div>

                <textarea
                  placeholder="Jak minął Ci dzień? Co czujesz? O czym myślisz..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={5}
                  className="mt-3 w-full resize-none rounded-2xl bg-white/50 p-4 text-sm text-ink-900 placeholder:text-ink-300 ring-1 ring-white/60 focus:outline-none focus:ring-2 focus:ring-rpg-quest/50"
                />

                <div className="mt-3 flex justify-end">
                  <button
                    type="submit"
                    disabled={saving || !title.trim() || !content.trim()}
                    className="rounded-full bg-rpg-quest px-6 py-2 text-sm font-semibold text-white shadow-glow transition-transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-50"
                  >
                    {saving ? 'Zapisywanie...' : 'Zapisz wpis'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Entries */}
          {loading ? (
            <p className="text-center text-sm text-ink-500">Wczytuję...</p>
          ) : entries.length === 0 && !showForm ? (
            <div className="py-12 text-center">
              <p className="text-4xl mb-3">📓</p>
              <p className="font-display text-lg font-semibold text-ink-900">
                Twój dziennik jest pusty
              </p>
              <p className="mt-1 text-sm text-ink-500">
                Kliknij "Nowy wpis" żeby zacząć pisać
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {entries.map((entry) => {
                const isExpanded = expandedId === entry.id;
                const isEditing = editingId === entry.id;
                const moodData = MOODS.find((m) => m.id === entry.mood);

                if (isEditing) {
                  return (
                    <div key={entry.id} className="rounded-2xl bg-white/80 p-5 ring-2 ring-rpg-quest/40 animate-fadeUp">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full bg-transparent text-lg font-semibold text-ink-900 placeholder:text-ink-300 focus:outline-none"
                      />

                      <div className="mt-3 flex flex-wrap gap-2">
                        {MOODS.map((m) => (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => setEditMood(editMood === m.id ? null : m.id)}
                            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                              editMood === m.id
                                ? 'bg-rpg-quest text-white shadow-glow'
                                : 'bg-white/60 text-ink-500 ring-1 ring-white/70 hover:bg-white/80'
                            }`}
                          >
                            <span>{m.emoji}</span>
                            {m.label}
                          </button>
                        ))}
                      </div>

                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        rows={5}
                  className="mt-3 w-full resize-none rounded-2xl bg-white/60 p-4 text-sm text-ink-900 placeholder:text-ink-300 ring-2 ring-ink-300/40 focus:outline-none focus:ring-2 focus:ring-rpg-quest/60 shadow-inner"
                        placeholder="Jak minął Ci dzień?"
                      />

                      <div className="mt-3 flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="rounded-full bg-white/60 px-5 py-2 text-sm font-semibold text-ink-500 ring-1 ring-white/70 transition hover:bg-white/80"
                        >
                          Anuluj
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            if (!editTitle.trim() || !editContent.trim()) return;
                            try {
                              const updated = await updateJournalEntry(entry.id, {
                                title: editTitle.trim(),
                                content: editContent.trim(),
                                mood: editMood,
                              });
                              setEntries((prev) => prev.map((x) => x.id === entry.id ? updated : x));
                              await onChanged?.();
                              setEditingId(null);
                            } catch (err) {
                              setError(err.detail || err.message);
                            }
                          }}
                          className="rounded-full bg-rpg-quest px-6 py-2 text-sm font-semibold text-white shadow-glow transition-transform hover:-translate-y-0.5 active:scale-95"
                        >
                          Zapisz zmiany
                        </button>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={entry.id}
                    className="rounded-2xl bg-white/50 p-4 ring-1 ring-white/60 transition-all hover:bg-white/70"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="min-w-0 flex-1 cursor-pointer"
                        onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                      >
                        <div className="flex items-center gap-2">
                          {moodData && <span className="text-lg">{moodData.emoji}</span>}
                          <h3 className="font-display text-sm font-semibold text-ink-900">
                            {entry.title}
                          </h3>
                        </div>
                        <p className="mt-0.5 text-xs text-ink-500">
                          {formatDate(entry.created_at)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingId(entry.id);
                            setEditTitle(entry.title);
                            setEditContent(entry.content);
                            setEditMood(entry.mood);
                          }}
                          className="grid h-7 w-7 place-items-center rounded-full bg-white/40 text-ink-400 transition hover:bg-rpg-quest/15 hover:text-rpg-quest text-sm"
                        >
                          ✏️
                        </button>
                        <button
                          type="button"
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (!confirm('Usunąć wpis?')) return;
                            try {
                              await deleteJournalEntry(entry.id);
                              setEntries((prev) => prev.filter((x) => x.id !== entry.id));
                              await onChanged?.();
                            } catch (err) {
                              setError(err.detail || err.message);
                            }
                          }}
                          className="grid h-7 w-7 place-items-center rounded-full bg-white/40 text-rpg-hp/60 transition hover:bg-rpg-hp/15 hover:text-rpg-hp text-sm"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="mt-3 border-t border-white/50 pt-3 cursor-pointer" onClick={() => setExpandedId(null)}>
                        <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink-700">
                          {entry.content}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
