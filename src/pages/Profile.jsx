import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import BackgroundAura from '../components/BackgroundAura';
import GlassPanel from '../components/GlassPanel';
import Sidebar from '../components/Sidebar';
import MobileNav from '../components/MobileNav';
import AvatarImage from '../components/AvatarImage';
import AuthInput from '../components/AuthInput';
import Icon from '../components/Icon';
import { avatars, getAvatar } from '../data/avatars';
import { useAuth } from '../context/AuthContext';

const toneBg = {
  sky: 'from-aura-sky/65 to-white/30',
  lavender: 'from-aura-lavender/65 to-white/30',
  blush: 'from-aura-blush/65 to-white/30',
  mint: 'from-aura-mint/65 to-white/30'
};

const PRIMARY_GRADIENT =
  'linear-gradient(135deg, #7c6df5 0%, #c48cff 55%, #ff8fa3 100%)';

export default function Profile() {
  const { user, updateUsername, updateAvatar, logout } = useAuth();
  const navigate = useNavigate();

  const [username, setUsernameState] = useState(user?.username || '');
  const [usernameBusy, setUsernameBusy] = useState(false);
  const [usernameError, setUsernameError] = useState(null);
  const [usernameOk, setUsernameOk] = useState(false);

  const [selectedAvatar, setSelectedAvatar] = useState(
    user?.avatar && user.avatar > 0 ? user.avatar : null
  );
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [avatarError, setAvatarError] = useState(null);
  const [avatarOk, setAvatarOk] = useState(false);

  const currentAvatar = getAvatar(user?.avatar);

  const usernameChanged = username.trim() !== (user?.username || '');
  const usernameValid =
    username.trim().length >= 3 && username.trim().length <= 50;

  const avatarChanged =
    selectedAvatar !== null && selectedAvatar !== user?.avatar;

  const stats = useMemo(
    () => [
      {
        label: 'Poziom',
        value: user?.level ?? 1,
        icon: 'star',
        tint: 'text-rpg-xp'
      },
      {
        label: 'EXP',
        value: user?.exp ?? 0,
        icon: 'sparkle',
        tint: 'text-rpg-quest'
      },
      {
        label: 'Seria',
        value: user?.streak ?? 0,
        icon: 'flame',
        tint: 'text-rpg-hp'
      }
    ],
    [user]
  );

  const vibes = useMemo(
    () => [
      {
        label: 'Grind',
        value: user?.grind ?? 0,
        tint: 'from-rpg-quest to-rpg-hp'
      },
      { label: 'Rizz', value: user?.rizz ?? 0, tint: 'from-rpg-hp to-rpg-xp' },
      {
        label: 'Aura',
        value: user?.aura ?? 0,
        tint: 'from-rpg-sage to-rpg-quest'
      }
    ],
    [user]
  );

  const handleSaveUsername = async e => {
    e.preventDefault();
    if (!usernameChanged || !usernameValid || usernameBusy) return;
    setUsernameBusy(true);
    setUsernameError(null);
    setUsernameOk(false);
    try {
      await updateUsername(username.trim());
      setUsernameOk(true);
      setTimeout(() => setUsernameOk(false), 2400);
    } catch (err) {
      setUsernameError(err.message || 'Nie udało się zapisać nowego nicku.');
    } finally {
      setUsernameBusy(false);
    }
  };

  const handleSaveAvatar = async () => {
    if (!avatarChanged || avatarBusy) return;
    setAvatarBusy(true);
    setAvatarError(null);
    setAvatarOk(false);
    try {
      await updateAvatar(selectedAvatar);
      setAvatarOk(true);
      setTimeout(() => setAvatarOk(false), 2400);
    } catch (err) {
      setAvatarError(err.message || 'Nie udało się zmienić postaci.');
    } finally {
      setAvatarBusy(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/auth', { replace: true });
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <BackgroundAura />

      <div className="relative grid min-h-screen grid-cols-1 gap-4 p-3 sm:gap-5 sm:p-4 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-6">
        <aside className="hidden h-[calc(100vh-2rem)] min-h-0 lg:block">
          <div className="flex h-full flex-col gap-5 overflow-y-auto no-scrollbar pr-1">
            <div className="glass flex flex-col rounded-[2.5rem] p-5">
              <Sidebar />
            </div>
          </div>
        </aside>

        <main className="min-h-0 pb-28 lg:pb-6 mt-3 animate-fadeUp">
          <div className="mx-auto w-full max-w-[920px] space-y-5 sm:space-y-6">
            <GlassPanel className="relative overflow-hidden p-6 sm:p-8">
              <span className="pointer-events-none absolute -top-24 -right-16 h-60 w-60 rounded-full bg-rpg-quest/25 blur-3xl" />
              <span className="pointer-events-none absolute -bottom-20 -left-16 h-60 w-60 rounded-full bg-rpg-hp/20 blur-3xl" />

              <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 180, damping: 18 }}
                    className="relative"
                  >
                    <AvatarImage
                      avatar={user?.avatar}
                      size={84}
                      status="online"
                    />
                  </motion.div>
                  <div className="min-w-0">
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/55 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-ink-700 ring-1 ring-white/70">
                      <Icon
                        name="profile"
                        size={12}
                        className="text-rpg-quest"
                      />
                      Twój profil
                    </div>
                    <h1 className="mt-2 font-display text-3xl font-semibold leading-tight text-ink-900 sm:text-4xl">
                      {user?.username || 'Wojownik'}
                    </h1>
                    {currentAvatar && (
                      <p className="mt-1 text-xs uppercase tracking-[0.2em] text-ink-500">
                        {currentAvatar.label} · {currentAvatar.hint}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="shrink-0 self-start rounded-full bg-white/60 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-500 ring-1 ring-white/70 transition hover:text-ink-900 sm:self-auto"
                >
                  Wyloguj
                </button>
              </div>

              <div className="relative mt-7 grid grid-cols-3 gap-2 sm:gap-3">
                {stats.map(s => (
                  <div
                    key={s.label}
                    className="rounded-2xl bg-white/55 p-3 ring-1 ring-white/60 text-center"
                  >
                    <div
                      className={`mx-auto grid h-8 w-8 place-items-center rounded-full bg-white/70 ${s.tint}`}
                    >
                      <Icon name={s.icon} size={14} />
                    </div>
                    <p className="mt-2 font-display text-xl font-semibold text-ink-900 tabular-nums">
                      {s.value.toLocaleString('pl-PL')}
                    </p>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-ink-500">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>

              <div className="relative mt-3 grid grid-cols-3 gap-2 sm:gap-3">
                {vibes.map(v => (
                  <div
                    key={v.label}
                    className="relative overflow-hidden rounded-2xl bg-white/55 p-3 ring-1 ring-white/60"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink-500">
                        {v.label}
                      </span>
                      <span className="font-display text-base font-semibold text-ink-900 tabular-nums">
                        {v.value}
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/60 ring-1 ring-white/60">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${v.tint}`}
                        style={{ width: `${Math.min(100, v.value * 2)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </GlassPanel>

            <GlassPanel className="relative overflow-hidden p-6 sm:p-8">
              <span className="pointer-events-none absolute -top-16 -right-12 h-44 w-44 rounded-full bg-rpg-hp/25 blur-3xl" />
              <div className="relative">
                <div className="flex items-center gap-2">
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-rpg-quest/15 text-rpg-quest">
                    <Icon name="user" size={16} />
                  </span>
                  <h2 className="font-display text-xl font-semibold text-ink-900">
                    Zmień nick
                  </h2>
                </div>
                <p className="mt-1 text-sm text-ink-500">
                  Od 3 do 50 znaków. Musi być unikalny.
                </p>

                <form onSubmit={handleSaveUsername} className="mt-5 space-y-4">
                  <AuthInput
                    icon="user"
                    label="Nick w grze"
                    value={username}
                    onChange={v => {
                      setUsernameState(v);
                      setUsernameError(null);
                      setUsernameOk(false);
                    }}
                    placeholder="Wojownik_42"
                    autoComplete="username"
                    minLength={3}
                    error={usernameError}
                    hint={
                      !usernameChanged
                        ? 'To Twój aktualny nick.'
                        : !usernameValid
                          ? 'Nick musi mieć co najmniej 3 znaki.'
                          : 'Gotowe do zapisu.'
                    }
                  />

                  <AnimatePresence>
                    {usernameOk && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        className="flex items-center gap-2 rounded-2xl bg-rpg-sage/20 px-4 py-3 text-xs font-medium text-ink-900 ring-1 ring-rpg-sage/50"
                      >
                        <Icon
                          name="check"
                          size={14}
                          className="text-rpg-sage"
                        />
                        Nick zapisany — witaj z nową tożsamością!
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex items-center justify-end">
                    <button
                      type="submit"
                      disabled={
                        !usernameChanged || !usernameValid || usernameBusy
                      }
                      className="relative overflow-hidden rounded-2xl px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_-18px_rgba(124,109,245,0.9)] transition hover:shadow-[0_22px_46px_-16px_rgba(124,109,245,1)] disabled:cursor-not-allowed disabled:opacity-50"
                      style={{ backgroundImage: PRIMARY_GRADIENT }}
                    >
                      <span className="relative z-10 inline-flex items-center gap-2">
                        {usernameBusy && (
                          <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/60 border-t-white" />
                        )}
                        Zapisz nick
                        {!usernameBusy && <Icon name="check" size={14} />}
                      </span>
                      <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_120%_at_0%_0%,rgba(255,255,255,0.35),transparent_55%)]" />
                    </button>
                  </div>
                </form>
              </div>
            </GlassPanel>

            <GlassPanel className="relative overflow-hidden p-6 sm:p-8">
              <span className="pointer-events-none absolute -bottom-20 -left-12 h-56 w-56 rounded-full bg-rpg-quest/20 blur-3xl" />
              <div className="relative">
                <div className="flex items-center gap-2">
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-rpg-hp/15 text-rpg-hp">
                    <Icon name="sparkle" size={16} />
                  </span>
                  <h2 className="font-display text-xl font-semibold text-ink-900">
                    Zmień postać
                  </h2>
                </div>
                <p className="mt-1 text-sm text-ink-500">
                  Wybierz nowy awatar. Zmieni się wszędzie w grze.
                </p>

                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
                  {avatars.map(a => {
                    const active = selectedAvatar === a.id;
                    const isCurrent = user?.avatar === a.id;
                    return (
                      <motion.button
                        key={a.id}
                        type="button"
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => {
                          setSelectedAvatar(a.id);
                          setAvatarError(null);
                          setAvatarOk(false);
                        }}
                        className={`group relative overflow-hidden rounded-3xl p-3 text-left transition ${
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
                              backgroundPosition: 'center top'
                            }}
                          >
                            <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_0%_0%,rgba(255,255,255,0.35),transparent_55%)]" />
                            {isCurrent && (
                              <span className="absolute left-2 top-2 rounded-full bg-white/85 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.2em] text-rpg-quest ring-1 ring-white">
                                Teraz
                              </span>
                            )}
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
                      </motion.button>
                    );
                  })}
                </div>

                {avatarError && (
                  <div className="mt-5 rounded-2xl bg-rpg-hp/15 px-4 py-3 text-xs font-medium text-ink-900 ring-1 ring-rpg-hp/40">
                    {avatarError}
                  </div>
                )}

                <AnimatePresence>
                  {avatarOk && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="mt-5 flex items-center gap-2 rounded-2xl bg-rpg-sage/20 px-4 py-3 text-xs font-medium text-ink-900 ring-1 ring-rpg-sage/50"
                    >
                      <Icon name="check" size={14} className="text-rpg-sage" />
                      Nowa postać aktywowana!
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="mt-6 flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
                  <p className="text-center text-[12px] text-ink-500 sm:text-left">
                    {avatarChanged ? (
                      <>
                        Wybrano:{' '}
                        <span className="font-semibold text-ink-900">
                          {getAvatar(selectedAvatar)?.label}
                        </span>
                      </>
                    ) : (
                      'Brak zmian do zapisania.'
                    )}
                  </p>
                  <button
                    type="button"
                    onClick={handleSaveAvatar}
                    disabled={!avatarChanged || avatarBusy}
                    className="relative overflow-hidden rounded-2xl px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_-18px_rgba(124,109,245,0.9)] transition hover:shadow-[0_22px_46px_-16px_rgba(124,109,245,1)] disabled:cursor-not-allowed disabled:opacity-50"
                    style={{ backgroundImage: PRIMARY_GRADIENT }}
                  >
                    <span className="relative z-10 inline-flex items-center justify-center gap-2">
                      {avatarBusy && (
                        <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/60 border-t-white" />
                      )}
                      Zapisz postać
                      {!avatarBusy && <Icon name="arrow" size={16} />}
                    </span>
                    <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_120%_at_0%_0%,rgba(255,255,255,0.35),transparent_55%)]" />
                  </button>
                </div>
              </div>
            </GlassPanel>
          </div>
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
