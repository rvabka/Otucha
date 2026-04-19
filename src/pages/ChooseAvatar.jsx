import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BackgroundAura from '../components/BackgroundAura';
import GlassPanel from '../components/GlassPanel';
import Icon from '../components/Icon';
import { avatars } from '../data/avatars';
import { useAuth } from '../context/AuthContext';

const toneBg = {
  sky: 'from-aura-sky/65 to-white/30',
  lavender: 'from-aura-lavender/65 to-white/30',
  blush: 'from-aura-blush/65 to-white/30',
  mint: 'from-aura-mint/65 to-white/30',
};

export default function ChooseAvatar() {
  const { user, updateAvatar, logout } = useAuth();
  const navigate = useNavigate();
  const [selected, setSelected] = useState(user?.avatar && user.avatar > 0 ? user.avatar : null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const onConfirm = async () => {
    if (!selected) return;
    setBusy(true);
    setError(null);
    try {
      await updateAvatar(selected);
      navigate('/app', { replace: true });
    } catch (err) {
      setError(err.message || 'Nie udało się zapisać. Spróbuj ponownie.');
    } finally {
      setBusy(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/auth', { replace: true });
  };

  const selectedAvatar = avatars.find((a) => a.id === selected);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <BackgroundAura />

      <div className="relative mx-auto flex min-h-screen w-full max-w-[960px] flex-col items-stretch justify-start p-4 pt-6 sm:p-6 sm:pt-8 lg:p-10 lg:pt-12">
        <GlassPanel className="relative overflow-hidden p-6 sm:p-8 animate-fadeUp">
          <span className="pointer-events-none absolute -top-24 -right-16 h-60 w-60 rounded-full bg-rpg-quest/25 blur-3xl" />
          <span className="pointer-events-none absolute -bottom-20 -left-16 h-60 w-60 rounded-full bg-rpg-hp/20 blur-3xl" />

          <div className="relative flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/55 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-ink-700 ring-1 ring-white/70">
                <Icon name="sparkle" size={12} className="text-rpg-quest" />
                Krok 1 z 1 · Wybierz postać
              </div>
              <h1 className="mt-3 font-display text-3xl font-semibold leading-tight text-ink-900 sm:text-4xl">
                Cześć{user?.username ? `, ${user.username}` : ''}! <br />
                Kim będziesz w tej przygodzie?
              </h1>
              <p className="mt-2 max-w-lg text-sm text-ink-700">
                Wybierz postać, która Cię reprezentuje. Zawsze możesz zmienić ją później w profilu.
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="shrink-0 rounded-full bg-white/60 px-3.5 py-1.5 text-[11px] font-semibold text-ink-500 ring-1 ring-white/70 transition hover:text-ink-700"
            >
              Wyloguj
            </button>
          </div>

          <div className="relative mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
            {avatars.map((a) => {
              const active = selected === a.id;
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setSelected(a.id)}
                  className={`group relative overflow-hidden rounded-3xl p-3 text-left transition [transform:translateZ(0)] ${
                    active
                      ? 'ring-2 ring-rpg-quest shadow-[0_20px_50px_-20px_rgba(124,109,245,0.8)]'
                      : 'ring-1 ring-white/60 hover:shadow-[0_18px_40px_-22px_rgba(76,60,140,0.45)]'
                  }`}
                >
                  <div
                    className={`pointer-events-none absolute inset-0 rounded-[inherit] bg-gradient-to-br ${
                      toneBg[a.tone] || 'from-white/60 to-white/30'
                    }`}
                  />
                  <div className="pointer-events-none absolute inset-0 rounded-[inherit] backdrop-blur-[14px]" />

                  <div className="relative">
                    <div
                      className="relative mx-auto aspect-square w-full max-w-[180px] rounded-2xl ring-1 ring-white/70 transition duration-500 group-hover:brightness-105"
                      style={{
                        backgroundImage: `url(${a.src})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center top',
                      }}
                    >
                      <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_0%_0%,rgba(255,255,255,0.35),transparent_55%)]" />
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="min-w-0">
                        <p className="font-display text-sm font-semibold text-ink-900">
                          {a.label}
                        </p>
                        <p className="text-[11px] uppercase tracking-[0.18em] text-ink-500">
                          {a.hint}
                        </p>
                      </div>
                      <span
                        className={`grid h-7 w-7 place-items-center rounded-full transition ${
                          active
                            ? 'bg-gradient-to-br from-rpg-quest to-rpg-hp text-white shadow-[0_10px_22px_-10px_rgba(124,109,245,0.9)]'
                            : 'bg-white/70 text-ink-300 ring-1 ring-white/70'
                        }`}
                      >
                        <Icon name="check" size={14} />
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {error && (
            <div className="relative mt-5 rounded-2xl bg-rpg-hp/15 px-4 py-3 text-xs font-medium text-ink-900 ring-1 ring-rpg-hp/40">
              {error}
            </div>
          )}

          <div className="relative mt-7 flex flex-col-reverse items-center justify-between gap-4 sm:flex-row">
            <p className="text-center text-[12px] text-ink-500 sm:text-left">
              {selectedAvatar ? (
                <>
                  Wybrano:{' '}
                  <span className="font-semibold text-ink-900">{selectedAvatar.label}</span>
                </>
              ) : (
                'Nie wybrano jeszcze postaci.'
              )}
            </p>

            <button
              type="button"
              onClick={onConfirm}
              disabled={!selected || busy}
              className="relative w-full overflow-hidden rounded-2xl px-6 py-3.5 text-sm font-semibold text-white shadow-[0_18px_40px_-18px_rgba(124,109,245,0.9)] transition hover:shadow-[0_22px_46px_-16px_rgba(124,109,245,1)] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              style={{
                backgroundImage:
                  'linear-gradient(135deg, #7c6df5 0%, #c48cff 55%, #ff8fa3 100%)',
              }}
            >
              <span className="relative z-10 inline-flex items-center justify-center gap-2">
                {busy && (
                  <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/60 border-t-white" />
                )}
                Rozpocznij przygodę
                {!busy && <Icon name="arrow" size={16} />}
              </span>
              <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_120%_at_0%_0%,rgba(255,255,255,0.35),transparent_55%)]" />
            </button>
          </div>
        </GlassPanel>
      </div>
    </div>
  );
}
