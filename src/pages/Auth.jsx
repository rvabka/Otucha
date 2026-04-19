import { useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import BackgroundAura from '../components/BackgroundAura';
import GlassPanel from '../components/GlassPanel';
import Icon from '../components/Icon';
import AuthInput from '../components/AuthInput';
import { useAuth } from '../context/AuthContext';
import { fetchGoogleAuthUrl, API_URL } from '../api/auth';
import { playSound } from '../lib/sound';

const heroBullets = [
  { icon: 'heart', title: 'Dziennik emocji', desc: 'Zapisuj nastrój, odkrywaj wzorce i nagradzaj się za konsekwencję.' },
  { icon: 'wave', title: 'Ćwiczenia oddechu', desc: 'Prowadzone sesje 4-7-8 i „Ciche jezioro" na każdy nastrój.' },
  { icon: 'chat', title: 'Mistrz Gry', desc: 'Twój AI kompan — wysłucha, zaproponuje questa, da XP.' },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_RE = /^[a-zA-Z0-9_.-]+$/;

function validateForm(mode, form) {
  const errors = {};
  const username = form.username.trim();
  if (!username) {
    errors.username = 'Podaj nazwę użytkownika.';
  } else if (username.length < 3) {
    errors.username = 'Nazwa musi mieć co najmniej 3 znaki.';
  } else if (username.length > 32) {
    errors.username = 'Nazwa może mieć maksymalnie 32 znaki.';
  } else if (!USERNAME_RE.test(username)) {
    errors.username = 'Dozwolone są litery, cyfry oraz . _ -';
  }

  if (mode === 'register' && form.email) {
    if (!EMAIL_RE.test(form.email.trim())) {
      errors.email = 'To nie wygląda jak poprawny adres email.';
    }
  }

  if (!form.password) {
    errors.password = 'Wpisz hasło.';
  } else if (mode === 'register' && form.password.length < 6) {
    errors.password = 'Hasło musi mieć co najmniej 6 znaków.';
  }

  return errors;
}

function translateApiError(err, mode) {
  const status = err?.status;
  const raw = (err?.message || '').toString();
  const lower = raw.toLowerCase();

  if (status === 0 || lower.includes('failed to fetch') || lower.includes('networkerror')) {
    return { form: 'Brak połączenia z serwerem. Sprawdź internet i spróbuj ponownie.' };
  }

  if (mode === 'login' && (status === 401 || status === 400 || lower.includes('invalid') || lower.includes('incorrect') || lower.includes('credentials') || lower.includes('not found'))) {
    return { form: 'Nieprawidłowa nazwa użytkownika lub hasło.' };
  }

  if (lower.includes('username') && (lower.includes('exist') || lower.includes('taken') || lower.includes('already'))) {
    return { fields: { username: 'Ta nazwa użytkownika jest już zajęta.' } };
  }
  if (lower.includes('email') && (lower.includes('exist') || lower.includes('taken') || lower.includes('already'))) {
    return { fields: { email: 'Ten email jest już używany.' } };
  }
  if (lower.includes('email') && lower.includes('valid')) {
    return { fields: { email: 'To nie wygląda jak poprawny adres email.' } };
  }
  if (lower.includes('password') && (lower.includes('short') || lower.includes('length') || lower.includes('weak'))) {
    return { fields: { password: 'Hasło jest za krótkie — użyj co najmniej 6 znaków.' } };
  }
  if (lower.includes('username') && lower.includes('valid')) {
    return { fields: { username: 'Nazwa użytkownika ma niedozwolone znaki.' } };
  }

  if (status === 422) {
    return { form: 'Sprawdź wpisane dane — coś jest nie tak z formatem.' };
  }
  if (status === 429) {
    return { form: 'Za dużo prób. Odczekaj chwilę i spróbuj ponownie.' };
  }
  if (status >= 500) {
    return { form: 'Serwer ma chwilę słabości. Spróbuj ponownie za moment.' };
  }

  return { form: 'Coś poszło nie tak. Spróbuj ponownie.' };
}

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, status } = useAuth();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ username: '', password: '', email: '' });
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [busy, setBusy] = useState(false);

  if (status === 'authenticated') {
    const to = location.state?.from?.pathname || '/app';
    return <Navigate to={to} replace />;
  }

  const updateField = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (fieldErrors[key]) {
      setFieldErrors((errs) => {
        const next = { ...errs };
        delete next[key];
        return next;
      });
    }
    if (error) setError(null);
  };

  const switchMode = (next) => {
    setMode(next);
    setError(null);
    setFieldErrors({});
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const clientErrors = validateForm(mode, form);
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      return;
    }
    setFieldErrors({});

    setBusy(true);
    try {
      if (mode === 'login') {
        await login({ username: form.username.trim(), password: form.password });
      } else {
        await register({
          username: form.username.trim(),
          password: form.password,
          email: form.email ? form.email.trim() : undefined,
        });
      }
      playSound('heart');
      navigate('/app', { replace: true });
    } catch (err) {
      const translated = translateApiError(err, mode);
      if (translated.fields) setFieldErrors(translated.fields);
      if (translated.form) setError(translated.form);
    } finally {
      setBusy(false);
    }
  };

  const onGoogle = async () => {
    setError(null);
    try {
      const url = await fetchGoogleAuthUrl();
      if (typeof url === 'string' && url.startsWith('http')) {
        window.location.href = url;
      } else {
        // fallback: backend może tylko przekierowywać pod tym URL-em
        window.location.href = `${API_URL}/auth/google/login`;
      }
    } catch {
      window.location.href = `${API_URL}/auth/google/login`;
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <BackgroundAura />

      <div className="relative mx-auto flex min-h-screen w-full max-w-[1180px] items-center justify-center p-4 sm:p-6 lg:p-10">
        <div className="grid w-full gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,460px)] lg:gap-10">
          <HeroPanel />

          <GlassPanel className="p-6 sm:p-8 animate-fadeUp">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-2xl font-semibold text-ink-900">
                {mode === 'login' ? 'Wróć do gry' : 'Rozpocznij przygodę'}
              </h2>
              <span className="rounded-full bg-white/55 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-ink-500 ring-1 ring-white/70">
                Akt I
              </span>
            </div>

            <div className="mb-6 grid grid-cols-2 gap-1 rounded-2xl bg-white/45 p-1 ring-1 ring-white/60">
              <TabButton active={mode === 'login'} onClick={() => switchMode('login')}>
                Logowanie
              </TabButton>
              <TabButton active={mode === 'register'} onClick={() => switchMode('register')}>
                Rejestracja
              </TabButton>
            </div>

            <form onSubmit={onSubmit} className="space-y-4" noValidate>
              <AuthInput
                icon="user"
                label="Nazwa użytkownika"
                placeholder="np. wojownik_spokoju"
                autoComplete={mode === 'login' ? 'username' : 'new-username'}
                value={form.username}
                onChange={(v) => updateField('username', v)}
                error={fieldErrors.username}
              />
              {mode === 'register' && (
                <AuthInput
                  icon="mail"
                  type="email"
                  label="Email (opcjonalnie)"
                  placeholder="ty@przyklad.pl"
                  autoComplete="email"
                  value={form.email}
                  onChange={(v) => updateField('email', v)}
                  hint="Pomoże odzyskać konto — możesz pominąć."
                  error={fieldErrors.email}
                />
              )}
              <AuthInput
                icon="lock"
                type="password"
                label="Hasło"
                placeholder="••••••••"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                value={form.password}
                onChange={(v) => updateField('password', v)}
                togglePassword
                error={fieldErrors.password}
              />

              {error && (
                <div className="rounded-2xl bg-rpg-hp/15 px-4 py-3 text-xs font-medium text-ink-900 ring-1 ring-rpg-hp/40">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={busy}
                className="relative w-full overflow-hidden rounded-2xl px-5 py-3.5 text-sm font-semibold text-white shadow-[0_18px_40px_-18px_rgba(124,109,245,0.9)] transition hover:shadow-[0_22px_46px_-16px_rgba(124,109,245,1)] disabled:opacity-60"
                style={{
                  backgroundImage:
                    'linear-gradient(135deg, #7c6df5 0%, #c48cff 55%, #ff8fa3 100%)',
                }}
              >
                <span className="relative z-10 inline-flex items-center justify-center gap-2">
                  {busy && (
                    <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/60 border-t-white" />
                  )}
                  {mode === 'login' ? 'Wejdź do gry' : 'Załóż konto'}
                  {!busy && <Icon name="arrow" size={16} className="text-white" />}
                </span>
                <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_120%_at_0%_0%,rgba(255,255,255,0.35),transparent_55%)]" />
              </button>
            </form>

            <div className="my-5 flex items-center gap-3">
              <span className="h-px flex-1 bg-white/60" />
              <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-ink-500">
                lub
              </span>
              <span className="h-px flex-1 bg-white/60" />
            </div>

            <button
              type="button"
              onClick={onGoogle}
              className="flex w-full items-center justify-center gap-3 rounded-2xl bg-white/75 px-5 py-3 text-sm font-semibold text-ink-900 ring-1 ring-white/70 transition hover:bg-white/90 hover:shadow-[0_14px_32px_-18px_rgba(76,60,140,0.45)]"
            >
              <Icon name="google" size={18} />
              Kontynuuj z Google
            </button>

            <p className="mt-5 text-center text-xs text-ink-500">
              {mode === 'login' ? 'Nie masz konta?' : 'Masz już konto?'}{' '}
              <button
                type="button"
                onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                className="font-semibold text-rpg-quest hover:underline"
              >
                {mode === 'login' ? 'Załóż je teraz' : 'Zaloguj się'}
              </button>
            </p>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] transition ${
        active
          ? 'bg-white text-ink-900 shadow-[0_10px_24px_-14px_rgba(76,60,140,0.45)]'
          : 'text-ink-500 hover:text-ink-700'
      }`}
    >
      {children}
    </button>
  );
}

function HeroPanel() {
  return (
    <div className="relative hidden flex-col justify-between overflow-hidden rounded-[2.5rem] p-8 lg:flex">
      <div
        className="pointer-events-none absolute inset-0 opacity-90"
        style={{
          backgroundImage:
            'radial-gradient(120% 80% at 0% 0%, rgba(200,215,255,0.75) 0%, transparent 55%), radial-gradient(120% 80% at 100% 100%, rgba(245,200,225,0.8) 0%, transparent 55%), linear-gradient(135deg, rgba(255,255,255,0.58) 0%, rgba(255,255,255,0.32) 100%)',
        }}
      />
      <span className="pointer-events-none absolute -top-20 -right-10 h-64 w-64 rounded-full bg-rpg-quest/25 blur-3xl" />
      <span className="pointer-events-none absolute -bottom-16 -left-10 h-64 w-64 rounded-full bg-rpg-hp/25 blur-3xl" />

      <div className="relative">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/60 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-ink-700 ring-1 ring-white/70">
          <Icon name="sparkle" size={12} className="text-rpg-quest" />
          hackpatia · RPG
        </div>
        <h1 className="mt-5 font-display text-4xl font-semibold leading-tight text-ink-900 xl:text-5xl">
          Twoja cyfrowa wyprawa <br />
          <span className="bg-gradient-to-r from-rpg-quest via-[#c48cff] to-rpg-hp bg-clip-text text-transparent">
            po spokój
          </span>{' '}
          zaczyna się tu.
        </h1>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-700">
          Dziennik emocji, ćwiczenia oddechu i AI Mistrz Gry w jednej, ciepłej
          przestrzeni. Levelup dla głowy — bez presji, w twoim tempie.
        </p>
      </div>

      <ul className="relative mt-8 space-y-3">
        {heroBullets.map((b) => (
          <li
            key={b.title}
            className="flex gap-3 rounded-2xl bg-white/55 p-3 ring-1 ring-white/60"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-white/90 to-white/50 text-rpg-quest ring-1 ring-white/70">
              <Icon name={b.icon} size={18} />
            </span>
            <div className="min-w-0">
              <p className="font-display text-sm font-semibold text-ink-900">{b.title}</p>
              <p className="text-[12px] leading-snug text-ink-500">{b.desc}</p>
            </div>
          </li>
        ))}
      </ul>

      <div className="relative mt-8 flex items-center gap-3 text-[11px] text-ink-500">
        <span className="inline-flex h-2 w-2 rounded-full bg-rpg-sage shadow-[0_0_10px_rgba(125,211,184,0.9)]" />
        Online · Gildia Przyjaciół czeka
      </div>
    </div>
  );
}
