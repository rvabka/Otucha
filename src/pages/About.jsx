import { Link } from 'react-router-dom';
import BackgroundAura from '../components/BackgroundAura';
import GlassPanel from '../components/GlassPanel';

export default function About() {
  return (
    <div className="relative min-h-screen">
      <BackgroundAura />
      <div className="relative mx-auto max-w-2xl p-6 sm:p-10">
        <GlassPanel className="p-8 animate-fadeUp">
          <h1 className="font-display text-4xl font-semibold text-ink-900">
            O Cyfrowej Terapii RPG
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-ink-700">
            Bezpieczna, przytulna przestrzeń dla młodych Wojowników — ćwiczenia
            oddechowe, dziennik emocji i Mistrz Gry, który towarzyszy na każdym
            etapie przygody.
          </p>
          <Link
            to="/app"
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-rpg-quest px-5 py-3 text-sm font-semibold text-white shadow-glow"
          >
            Wróć do bazy
          </Link>
        </GlassPanel>
      </div>
    </div>
  );
}
