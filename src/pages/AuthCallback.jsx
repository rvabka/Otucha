import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import BackgroundAura from '../components/BackgroundAura';
import GlassPanel from '../components/GlassPanel';
import { useAuth } from '../context/AuthContext';
import { tokens } from '../api/client';

export default function AuthCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { exchangeGoogle, refresh } = useAuth();
  const [error, setError] = useState(null);

  useEffect(() => {
    const run = async () => {
      // Scenariusz A: backend przekierował z tokenami w hash fragment (#access_token=...&refresh_token=...)
      const hash = window.location.hash.substring(1);
      if (hash) {
        const hashParams = new URLSearchParams(hash);
        const access = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        if (access) {
          tokens.set({ access_token: access, refresh_token: refreshToken });
          await refresh();
          navigate('/app', { replace: true });
          return;
        }
      }

      // Scenariusz B: tokeny w query params (?access_token=...)
      const access = params.get('access_token');
      const refreshToken = params.get('refresh_token');
      if (access) {
        tokens.set({ access_token: access, refresh_token: refreshToken });
        await refresh();
        navigate('/app', { replace: true });
        return;
      }

      // Scenariusz C: mamy `code` z Google — wymieniamy po stronie frontu
      const code = params.get('code');
      if (code) {
        try {
          await exchangeGoogle(code);
          navigate('/app', { replace: true });
          return;
        } catch (err) {
          setError(err.message || 'Nie udało się dokończyć logowania przez Google.');
          return;
        }
      }

      const errParam = params.get('error');
      setError(errParam || 'Brakuje danych logowania w adresie zwrotnym.');
    };
    run();
  }, [params, exchangeGoogle, navigate, refresh]);

  return (
    <div className="relative grid min-h-screen place-items-center p-6">
      <BackgroundAura />
      <GlassPanel className="relative max-w-md p-8 text-center animate-fadeUp">
        {error ? (
          <>
            <h2 className="font-display text-2xl font-semibold text-ink-900">
              Coś poszło nie tak
            </h2>
            <p className="mt-3 text-sm text-ink-700">{error}</p>
            <button
              type="button"
              onClick={() => navigate('/auth', { replace: true })}
              className="mt-6 rounded-2xl bg-gradient-to-r from-rpg-quest to-rpg-hp px-5 py-2.5 text-sm font-semibold text-white shadow-[0_12px_28px_-14px_rgba(124,109,245,0.9)]"
            >
              Wróć do logowania
            </button>
          </>
        ) : (
          <>
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-white/60 border-t-rpg-quest" />
            <h2 className="mt-5 font-display text-xl font-semibold text-ink-900">
              Łączenie z Google...
            </h2>
            <p className="mt-2 text-sm text-ink-500">
              Za chwilę przeniesiemy Cię do gry.
            </p>
          </>
        )}
      </GlassPanel>
    </div>
  );
}
