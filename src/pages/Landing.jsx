import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import BackgroundAura from '../components/BackgroundAura';
import GlassPanel from '../components/GlassPanel';
import Icon from '../components/Icon';
import { useAuth } from '../context/AuthContext';
import { CHARACTERS } from '../data/characters';
import babeczkaShowcase from '../data/babeczka.mp4';
import blondiShowcase from '../data/blondii.mp4';
import ziutekShowcase from '../data/ziutek.mp4';

const PRIMARY_GRADIENT =
  'linear-gradient(135deg, #7c6df5 0%, #c48cff 55%, #ff8fa3 100%)';

const NAV_LINKS = [
  { label: 'Misja', href: '#problem' },
  { label: 'Przewodnicy', href: '#przewodnicy' },
  { label: 'Gildia', href: '#gildia' },
  { label: 'Uśmiech', href: '#usmiech' },
  { label: 'Tech', href: '#tech' },
];

const SHOWCASE = {
  mindbuddy: {
    video: babeczkaShowcase,
    badge: 'Empatyczny słuchacz',
    power: 'Tłumaczy emocje na słowa',
    desc: 'Zauważa, gdy „nie wiem" znaczy „nie umiem nazwać". Zadaje pytania, które otwierają — bez analizy „co z Tobą nie tak".',
  },
  journal_companion: {
    video: blondiShowcase,
    badge: 'Strażniczka pamięci',
    power: 'Zatrzymuje myślokarmę',
    desc: 'Z chaosu wpisów buduje mapę Twoich nastrojów. Pokazuje wzorce między dniami i podpowiada, co wczoraj pomogło.',
  },
  mindfulness: {
    video: ziutekShowcase,
    badge: 'Reset układu nerwowego',
    power: 'Trzy oddechy obniżają puls',
    desc: 'Prowadzi 4-7-8, „Ciche jezioro" i uziemienie 5-4-3-2-1. Cisza, którą czujesz w klatce piersiowej, nie tylko w głowie.',
  },
};

const PROBLEM_STATS = [
  {
    value: '1 / 4',
    label: 'młodych w PL z objawami depresji',
    note: 'Raporty UNICEF i Fundacji Dajemy Dzieciom Siłę',
  },
  {
    value: '6 mies.',
    label: 'średni czas oczekiwania na NFZ',
    note: 'Bezpłatna wizyta u psychologa dziecięcego',
  },
  {
    value: '67%',
    label: 'nie mówi dorosłym o problemach',
    note: 'Strach przed oceną i niezrozumieniem',
  },
  {
    value: '24/7',
    label: 'Otucha jest dostępna',
    note: 'Bez kolejki, bez oceniania, w telefonie',
  },
];

const TECH_TILES = [
  {
    icon: 'sparkle',
    title: 'Mistrz Gry AI',
    desc: 'Trzy autorskie agenty z osobowością. Nie chatbot „jak się czujesz?" — kompan, który pamięta Twoją historię i prowadzi quest.',
    tag: 'GPT · RAG · agenty',
  },
  {
    icon: 'wave',
    title: 'Głos jak prawdziwy',
    desc: 'ElevenLabs syntezuje trzy unikalne głosy (Rachel, Charlotte, Adam). Postać mówi do Ciebie — nie czytasz suchego tekstu.',
    tag: 'ElevenLabs TTS',
  },
  {
    icon: 'mail',
    title: 'Słyszy Cię po polsku',
    desc: 'Whisper STT zoptymalizowany pod język polski. Mówisz naturalnie — bot rozumie nawet gdy „mhm, chyba że...".',
    tag: 'Whisper · pol',
  },
  {
    icon: 'crystal',
    title: 'Gra wszędzie',
    desc: 'React + Capacitor: jeden kod, trzy platformy — web, iOS, Android. Polski design system, glass UI, Fraunces + Manrope.',
    tag: 'React · Capacitor',
  },
  {
    icon: 'leaf',
    title: 'Metoda, nie growth-hack',
    desc: 'Mechaniki oparte na CBT, ACT i mindfulness. Konsultowane z psychologami pracującymi z młodzieżą — nie „dopamine loop".',
    tag: 'CBT · ACT',
  },
  {
    icon: 'lock',
    title: 'Prywatność na pierwszym miejscu',
    desc: 'Rozmowy szyfrowane, dziennik tylko Twój. Gildia widzi to, co sam udostępnisz. Bez reklam, bez sprzedaży danych.',
    tag: 'Privacy by design',
  },
];

const GUIDE_BLURBS = {
  mindbuddy: {
    tag: 'Mistrzyni Empatii',
    description:
      'Pomaga nazwać emocje, zanim przejmą stery. Prowadzi dziennik serca i podrzuca szybkie rytuały na „ciężkie" dni.',
  },
  journal_companion: {
    tag: 'Strażniczka Opowieści',
    description:
      'Zapisze z Tobą myśli, które same nie chcą usiąść na papierze. Pokazuje wzorce, których nie widać gołym okiem.',
  },
  mindfulness: {
    tag: 'Opiekun Spokoju',
    description:
      'Prowadzi oddech 4-7-8, ćwiczenia uziemienia i „Ciche jezioro". Wyciągnie Cię z tornada myśli w trzech wdechach.',
  },
};

const FEATURES = [
  {
    icon: 'chat',
    title: 'Mistrz Gry, który słucha',
    desc: 'Rozmowa głosowa i tekstowa z AI kompanem. Wybierasz ton, postać i tempo — on towarzyszy, nigdy nie ocenia.',
    accent: 'from-rpg-quest/30 via-rpg-quest/10 to-transparent',
  },
  {
    icon: 'heart',
    title: 'Dziennik serca',
    desc: 'Zapisuj nastrój i myśli w kilka sekund. Odkrywaj wzorce, które wyjaśniają, czemu dziś jest tak, a jutro inaczej.',
    accent: 'from-rpg-hp/30 via-rpg-hp/10 to-transparent',
  },
  {
    icon: 'leaf',
    title: 'Oddechowe questy',
    desc: 'Prowadzone sesje 4-7-8, „Ciche jezioro" i uziemienie 5-4-3-2-1. Każde ukończone ćwiczenie daje XP.',
    accent: 'from-rpg-sage/35 via-rpg-sage/10 to-transparent',
  },
  {
    icon: 'star',
    title: 'Postać, która rośnie z Tobą',
    desc: 'Awatar, poziomy, seria dni, pasek HP/MP/XP. Każdy rytuał realnie wzmacnia bohatera i samopoczucie.',
    accent: 'from-rpg-xp/30 via-rpg-xp/10 to-transparent',
  },
];

const STEPS = [
  {
    n: '01',
    title: 'Stwórz swojego bohatera',
    desc: 'Wybierz awatar i imię Wojownika. W 30 sekund jesteś w grze — bez pytań, które zniechęcają.',
  },
  {
    n: '02',
    title: 'Spotkaj przewodnika',
    desc: 'Babeczka, Blondi, Ziutek — każde z innym głosem i charakterem. Wybierz kogoś, z kim dziś chcesz pogadać.',
  },
  {
    n: '03',
    title: 'Zdobywaj codzienne questy',
    desc: 'Mały rytuał dziennie — oddech, wpis, krótka rozmowa. Samopoczucie rośnie wraz z poziomem.',
  },
];

export default function Landing() {
  const navigate = useNavigate();
  const { status } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const heroRef = useRef(null);
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 600], [0, -80]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0.6]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isAuthed = status === 'authenticated';
  const ctaLabel = isAuthed ? 'Wróć do gry' : 'Rozpocznij quest';
  const primaryCta = isAuthed ? 'Wróć do gry' : 'Rozpocznij przygodę';
  const goAuth = () => navigate(isAuthed ? '/app' : '/auth');

  return (
    <div className="relative min-h-screen overflow-hidden text-ink-900">
      <BackgroundAura />

      {/* Navigation */}
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          scrolled ? 'backdrop-blur-xl' : ''
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-8">
          <div
            className={`flex w-full items-center justify-between gap-4 rounded-full px-3 py-2 transition-all duration-500 sm:px-5 ${
              scrolled ? 'glass' : 'bg-transparent'
            }`}
          >
            <Link
              to="/"
              className="flex items-center gap-2 font-display text-xl font-semibold tracking-tight"
            >
              <span
                className="grid h-9 w-9 place-items-center rounded-2xl text-white shadow-glow"
                style={{ background: PRIMARY_GRADIENT }}
              >
                <Icon name="sparkle" size={16} />
              </span>
              <span className="bg-gradient-to-r from-rpg-quest via-[#c48cff] to-rpg-hp bg-clip-text text-transparent">
                Otucha
              </span>
            </Link>

            <nav className="hidden items-center gap-1 md:flex">
              {NAV_LINKS.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  className="rounded-full px-4 py-2 text-sm font-medium text-ink-700 transition-colors hover:bg-white/60 hover:text-ink-900"
                >
                  {l.label}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              {!isAuthed && (
                <button
                  type="button"
                  onClick={goAuth}
                  className="hidden rounded-full px-4 py-2 text-sm font-medium text-ink-700 transition-colors hover:bg-white/60 sm:inline-flex"
                >
                  Zaloguj
                </button>
              )}
              <button
                type="button"
                onClick={goAuth}
                className="inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-glow transition-transform hover:-translate-y-0.5"
                style={{ background: PRIMARY_GRADIENT }}
              >
                {ctaLabel}
                <Icon name="arrow" size={14} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="relative pt-24">
        {/* HERO */}
        <section
          ref={heroRef}
          id="podroz"
          className="relative mx-auto flex min-h-[88vh] max-w-7xl flex-col items-center justify-center px-6 py-16 text-center"
        >
          <motion.div
            style={{ y: heroY, opacity: heroOpacity }}
            className="mx-auto flex w-full flex-col items-center gap-8"
          >
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/50 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-rpg-quest backdrop-blur-md"
            >
              <span className="h-1.5 w-1.5 animate-sparkle rounded-full bg-rpg-quest" />
              RPG dobrostanu
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="font-display text-5xl font-semibold leading-[1.02] tracking-tight text-ink-900 text-balance sm:text-6xl md:text-7xl lg:text-[96px]"
            >
              Twoja przygoda ku
              <br className="hidden sm:block" />
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: PRIMARY_GRADIENT,
                }}
              >
                lepszemu samopoczuciu
              </span>
              <span className="ml-2 inline-block animate-float text-rpg-xp">
                ✦
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.25 }}
              className="max-w-2xl text-lg leading-relaxed text-ink-700 md:text-xl"
            >
              Otucha to wspierająca, gamifikowana przestrzeń dla młodzieży.
              Rozwijaj postać, rozmawiaj z AI przewodnikami, buduj Gildię
              Przyjaciół i ucz się panować nad emocjami w formie, która Cię nie
              nudzi.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="flex flex-wrap items-center justify-center gap-3 pt-2"
            >
              <button
                type="button"
                onClick={goAuth}
                className="group inline-flex items-center gap-2 rounded-full px-7 py-4 text-base font-semibold text-white shadow-glow transition-transform hover:-translate-y-0.5"
                style={{ background: PRIMARY_GRADIENT }}
              >
                {primaryCta}
                <span className="transition-transform group-hover:translate-x-1">
                  <Icon name="arrow" size={16} />
                </span>
              </button>
              <a
                href="#przewodnicy"
                className="glass inline-flex items-center gap-2 rounded-full px-7 py-4 text-base font-semibold text-ink-900 transition-colors hover:bg-white/70"
              >
                <Icon name="wave" size={16} className="text-rpg-quest" />
                Poznaj przewodników
              </a>
            </motion.div>

            {/* Proof / stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.55 }}
              className="mt-10 grid w-full grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-5"
            >
              {[
                { k: '3', v: 'AI przewodników' },
                { k: '15+', v: 'questów dziennie' },
                { k: '100%', v: 'po polsku' },
                { k: '0 zł', v: 'na start' },
              ].map((s) => (
                <div
                  key={s.v}
                  className="glass rounded-3xl px-4 py-4 text-left"
                >
                  <p className="font-display text-3xl font-semibold text-rpg-quest tabular-nums">
                    {s.k}
                  </p>
                  <p className="text-xs font-medium text-ink-500">{s.v}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </section>

        {/* PROBLEM */}
        <section id="problem" className="relative px-6 py-24 sm:py-32">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto mb-14 max-w-3xl text-center">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-rpg-quest">
                Cisza, w której żyją
              </p>
              <h2 className="font-display text-4xl font-semibold leading-tight text-ink-900 text-balance sm:text-5xl md:text-6xl">
                Pokolenie samotne w pokoju pełnym
                <span
                  className="bg-clip-text text-transparent"
                  style={{ backgroundImage: PRIMARY_GRADIENT }}
                >
                  {' '}
                  powiadomień
                </span>
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-base text-ink-700 md:text-lg">
                Polska młodzież nie ma do kogo zadzwonić o 23:47, gdy myśli
                kotłują się w głowie. Otucha nie zastępuje terapeuty — daje
                pierwszą rękę, której nie trzeba się wstydzić.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {PROBLEM_STATS.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.6, delay: i * 0.08 }}
                >
                  <GlassPanel className="relative h-full overflow-hidden p-6">
                    <div
                      aria-hidden
                      className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br from-rpg-quest/30 via-rpg-hp/15 to-transparent blur-2xl"
                    />
                    <p className="relative font-display text-5xl font-semibold tabular-nums text-rpg-quest">
                      {s.value}
                    </p>
                    <p className="relative mt-3 text-sm font-semibold text-ink-900">
                      {s.label}
                    </p>
                    <p className="relative mt-1 text-xs text-ink-500">
                      {s.note}
                    </p>
                  </GlassPanel>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* GUIDES */}
        <section id="przewodnicy" className="relative px-6 py-24 sm:py-32">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto mb-14 max-w-5xl text-center">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-rpg-quest">
                Twoi przewodnicy
              </p>
              <h2 className="font-display text-4xl font-semibold leading-tight text-ink-900 sm:text-5xl md:text-6xl">
                Trzy postacie. Trzy głosy.
                <br />
                Jedno wspólne: są po Twojej stronie.
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-base text-ink-700">
                Każdy przewodnik ma własny styl, głos i zestaw ćwiczeń. Najedź,
                żeby zobaczyć ich w akcji.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {CHARACTERS.map((c, i) => (
                <GuideCard key={c.agentId} character={c} delay={i * 0.12} />
              ))}
            </div>
          </div>
        </section>

        {/* SHOWCASE — autoplay portrait clips */}
        <section id="showcase" className="relative px-6 py-24 sm:py-32">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto mb-14 max-w-3xl text-center">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-rpg-quest">
                Świat w ruchu
              </p>
              <h2 className="font-display text-4xl font-semibold leading-tight text-ink-900 text-balance sm:text-5xl md:text-6xl">
                Bohaterowie, którzy
                <span
                  className="bg-clip-text text-transparent"
                  style={{ backgroundImage: PRIMARY_GRADIENT }}
                >
                  {' '}
                  naprawdę mówią
                </span>
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-base text-ink-700 md:text-lg">
                Każda postać ma własny głos (ElevenLabs), własną mimikę i własny
                styl prowadzenia. To nie awatar z ramki — to ktoś, kto Cię
                pamięta między sesjami.
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {CHARACTERS.map((c, i) => (
                <ShowcaseTile
                  key={c.agentId}
                  character={c}
                  showcase={SHOWCASE[c.agentId]}
                  delay={i * 0.12}
                />
              ))}
            </div>

            <div className="mx-auto mt-10 max-w-2xl text-center text-sm text-ink-500">
              Wszystkie animacje zarejestrowane in-app. Mikrofon → Whisper STT →
              agent → ElevenLabs TTS → odtwarzanie z synchronizacją ust.
            </div>
          </div>
        </section>

        {/* FEATURES — bento */}
        <section id="mechanika" className="relative px-6 py-24 sm:py-32">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto mb-14 max-w-5xl text-center">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-rpg-quest">
                Mechanika rozwoju
              </p>
              <h2 className="font-display text-4xl font-semibold leading-tight text-ink-900 sm:text-5xl">
                Zaprojektowane, żeby faktycznie pomagało
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-base text-ink-700">
                Sprawdzone metody terapeutyczne (CBT, ACT, mindfulness) ukryte w
                mechanikach, które chce się odpalać codziennie.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-12">
              {/* Big quest card */}
              <GlassPanel
                variant="quest"
                className="relative overflow-hidden p-8 md:col-span-7 md:p-10"
              >
                <div className="flex items-center justify-between gap-6">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-rpg-quest/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-rpg-quest">
                      <Icon name="sparkle" size={12} />
                      Aktywny quest
                    </div>
                    <h3 className="mt-4 font-display text-3xl font-semibold text-ink-900 md:text-4xl">
                      Dziś: 3 wdechy, które zmienią popołudnie
                    </h3>
                    <p className="mt-3 max-w-md text-sm text-ink-700">
                      Każdy quest jest pisany przez Mistrza Gry na podstawie
                      Twoich rozmów — nie generyczna lista zadań, tylko misje
                      szyte pod to, o czym mówisz dziś.
                    </p>
                    <div className="mt-6 flex flex-wrap items-center gap-2">
                      <Tag label="+120 XP" kind="xp" />
                      <Tag label="HP +4" kind="hp" />
                      <Tag label="3 min" kind="mp" />
                    </div>
                  </div>
                  <div className="relative hidden h-40 w-40 shrink-0 md:block">
                    <div className="absolute inset-0 animate-float rounded-full bg-gradient-to-br from-aura-sky via-aura-lavender to-aura-blush opacity-80 blur-2xl" />
                    <div className="relative grid h-full w-full place-items-center rounded-full bg-white/70 shadow-glow">
                      <Icon
                        name="crystal"
                        size={56}
                        className="text-rpg-quest"
                      />
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-8">
                  <div className="flex justify-between text-xs font-semibold text-ink-500">
                    <span>Postęp serii</span>
                    <span className="text-rpg-quest">7 / 15 dni</span>
                  </div>
                  <div className="mt-2 h-3 overflow-hidden rounded-full bg-white/60">
                    <div
                      className="h-full rounded-full shimmer-bar"
                      style={{
                        width: '47%',
                        background:
                          'linear-gradient(90deg, #7c6df5 0%, #c48cff 50%, #ff8fa3 100%)',
                        backgroundSize: '200% 100%',
                      }}
                    />
                  </div>
                </div>
              </GlassPanel>

              {/* Guild card */}
              <GlassPanel className="p-8 md:col-span-5">
                <div className="flex items-center gap-2 text-rpg-sage">
                  <Icon name="user" size={16} />
                  <span className="text-[11px] font-semibold uppercase tracking-wider">
                    Gildia Przyjaciół
                  </span>
                </div>
                <h3 className="mt-4 font-display text-2xl font-semibold text-ink-900 md:text-3xl">
                  Nie musisz grać solo
                </h3>
                <p className="mt-3 text-sm text-ink-700">
                  Dołącz do 4-osobowej gildii. Razem robicie questy, dzielicie
                  się zwycięstwami i wspieracie w gorszych dniach — anonimowo,
                  jeśli tak wolisz.
                </p>
                <div className="mt-6 flex -space-x-3">
                  {['#ff8fa3', '#8bb8ff', '#7dd3b8', '#f5c76a'].map((c, i) => (
                    <span
                      key={c}
                      className="grid h-12 w-12 place-items-center rounded-full border-[3px] border-white font-display text-sm font-semibold text-white shadow-md"
                      style={{
                        background: `linear-gradient(135deg, ${c} 0%, rgba(255,255,255,0.5) 120%)`,
                      }}
                    >
                      {['A', 'K', 'M', 'J'][i]}
                    </span>
                  ))}
                  <span className="grid h-12 w-12 place-items-center rounded-full border-[3px] border-white bg-white text-xs font-semibold text-rpg-quest shadow-md">
                    +12
                  </span>
                </div>
              </GlassPanel>

              {/* Feature tiles */}
              {FEATURES.map((f) => (
                <GlassPanel
                  key={f.title}
                  variant="soft"
                  className="relative overflow-hidden p-7 md:col-span-3"
                >
                  <div
                    aria-hidden
                    className={`pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gradient-to-br ${f.accent} blur-2xl`}
                  />
                  <div className="relative">
                    <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/70 text-rpg-quest shadow-[0_12px_28px_-16px_rgba(124,109,245,0.7)]">
                      <Icon name={f.icon} size={18} />
                    </span>
                    <h4 className="mt-4 font-display text-lg font-semibold text-ink-900">
                      {f.title}
                    </h4>
                    <p className="mt-2 text-sm text-ink-700">{f.desc}</p>
                  </div>
                </GlassPanel>
              ))}
            </div>
          </div>
        </section>

        {/* GILDIA — friends feature */}
        <section id="gildia" className="relative px-6 py-24 sm:py-32">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto mb-14 max-w-3xl text-center">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-rpg-quest">
                Gildia Przyjaciół
              </p>
              <h2 className="font-display text-4xl font-semibold leading-tight text-ink-900 text-balance sm:text-5xl md:text-6xl">
                Nie gracie w pojedynkę —
                <span
                  className="bg-clip-text text-transparent"
                  style={{ backgroundImage: PRIMARY_GRADIENT }}
                >
                  {' '}
                  trzymacie się razem
                </span>
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-base text-ink-700 md:text-lg">
                Wspólne questy działają 2× lepiej. Zaproś kumpli, sprawdzaj ich
                progres i dopinguj, gdy komuś opadnie seria. Wszystko z szacunkiem
                do prywatności — widzisz tyle, ile sami pokażą.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-12">
              {/* Big feature card — invite flow mockup */}
              <motion.div
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.7 }}
                className="md:col-span-7"
              >
                <GlassPanel
                  variant="quest"
                  className="relative h-full overflow-hidden p-8 sm:p-10"
                >
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-aura-sky/70 blur-3xl"
                  />
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -bottom-20 -right-16 h-72 w-72 rounded-full bg-aura-blush/70 blur-3xl"
                  />
                  <div className="relative">
                    <div className="inline-flex items-center gap-2 rounded-full bg-rpg-quest/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-rpg-quest">
                      <Icon name="userPlus" size={12} />
                      Zapraszaj po nicku
                    </div>
                    <h3 className="mt-4 font-display text-3xl font-semibold leading-tight text-ink-900 sm:text-4xl">
                      Wpisz nick kompana — reszta dzieje się sama
                    </h3>
                    <p className="mt-4 max-w-xl text-sm text-ink-700">
                      Wyszukiwarka po nicku, akceptacja jednym kliknięciem,
                      automatyczne łączenie gdy wysyłacie zaproszenie w tym samym
                      momencie. Bez kodów, bez linków, bez rejestracji przez
                      trzeci aplet.
                    </p>

                    {/* Mock invite row */}
                    <div className="mt-6 space-y-2.5">
                      {[
                        { name: 'kasia_42', level: 7, status: 'incoming' },
                        { name: 'bartek.iskra', level: 12, status: 'friends' },
                        { name: 'mgla_studio', level: 4, status: 'pending' },
                      ].map((u, idx) => (
                        <motion.div
                          key={u.name}
                          initial={{ opacity: 0, x: -12 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.15 + idx * 0.12, duration: 0.5 }}
                          className="flex items-center gap-3 rounded-2xl bg-white/70 p-3 ring-1 ring-white/70"
                        >
                          <div
                            className="grid h-11 w-11 place-items-center rounded-full font-display text-sm font-semibold text-white"
                            style={{
                              background: `linear-gradient(135deg, ${
                                ['#ff8fa3', '#7dd3b8', '#8bb8ff'][idx]
                              } 0%, rgba(255,255,255,0.5) 150%)`,
                            }}
                          >
                            {u.name[0].toUpperCase()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-display text-sm font-semibold text-ink-900">
                              {u.name}
                            </p>
                            <p className="text-[11px] uppercase tracking-[0.18em] text-ink-500">
                              Poziom {u.level}
                            </p>
                          </div>
                          {u.status === 'incoming' && (
                            <span
                              className="inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-[11px] font-semibold text-white shadow-[0_10px_20px_-10px_rgba(124,109,245,0.7)]"
                              style={{ background: PRIMARY_GRADIENT }}
                            >
                              <Icon name="check" size={12} />
                              Akceptuj
                            </span>
                          )}
                          {u.status === 'pending' && (
                            <span className="rounded-xl bg-white/80 px-3 py-1.5 text-[11px] font-semibold text-ink-500 ring-1 ring-white/70">
                              Wysłane
                            </span>
                          )}
                          {u.status === 'friends' && (
                            <span className="inline-flex items-center gap-1 rounded-xl bg-rpg-sage/20 px-3 py-1.5 text-[11px] font-semibold text-rpg-sage">
                              <Icon name="check" size={12} />W gildii
                            </span>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </GlassPanel>
              </motion.div>

              {/* Supporting card — friend stats peek */}
              <motion.div
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.7, delay: 0.15 }}
                className="md:col-span-5"
              >
                <GlassPanel className="relative h-full overflow-hidden p-8">
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-rpg-sage/30 blur-2xl"
                  />
                  <div className="relative">
                    <div className="flex items-center gap-2 text-rpg-sage">
                      <Icon name="users" size={16} />
                      <span className="text-[11px] font-semibold uppercase tracking-wider">
                        Profil kompana
                      </span>
                    </div>
                    <h3 className="mt-4 font-display text-2xl font-semibold text-ink-900 md:text-3xl">
                      Zobacz progres drużyny
                    </h3>
                    <p className="mt-3 text-sm text-ink-700">
                      Klikasz w awatar znajomego — dostajesz jego poziom, serię
                      dni i paski Grind / Rizz / Aura. Szybkie „hej, brawo za
                      tydzień" zamiast pustego scrollowania.
                    </p>

                    {/* Stat preview */}
                    <div className="mt-6 rounded-2xl bg-white/70 p-4 ring-1 ring-white/70">
                      <div className="flex items-center gap-3">
                        <div
                          className="grid h-12 w-12 place-items-center rounded-full font-display text-base font-semibold text-white"
                          style={{
                            background:
                              'linear-gradient(135deg, #7dd3b8 0%, rgba(255,255,255,0.5) 160%)',
                          }}
                        >
                          K
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-display text-sm font-semibold text-ink-900">
                            kasia_42
                          </p>
                          <p className="text-[11px] uppercase tracking-[0.18em] text-ink-500">
                            Poziom 7 · seria 12 dni
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 space-y-2">
                        {[
                          { k: 'Grind', v: 68, from: '#7c6df5', to: '#ff8fa3' },
                          { k: 'Rizz', v: 42, from: '#ff8fa3', to: '#f5c76a' },
                          { k: 'Aura', v: 55, from: '#7dd3b8', to: '#7c6df5' },
                        ].map((s, i) => (
                          <div key={s.k}>
                            <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-500">
                              <span>{s.k}</span>
                              <span className="tabular-nums text-ink-900">{s.v}</span>
                            </div>
                            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/60 ring-1 ring-white/60">
                              <motion.div
                                initial={{ width: 0 }}
                                whileInView={{ width: `${s.v}%` }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.3 + i * 0.15, duration: 0.9 }}
                                className="h-full rounded-full"
                                style={{
                                  background: `linear-gradient(90deg, ${s.from} 0%, ${s.to} 100%)`,
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </GlassPanel>
              </motion.div>

              {/* 3 small feature tiles */}
              {[
                {
                  icon: 'search',
                  title: 'Szukaj po nicku',
                  desc: 'Live-search od 2 znaków. Widzisz, czy już gracie razem, czy czeka na akceptację.',
                },
                {
                  icon: 'bell',
                  title: 'Badge zaproszeń',
                  desc: 'Czerwona kropka na ikonie gildii pokazuje, ile zaproszeń czeka na Twoją decyzję.',
                },
                {
                  icon: 'lock',
                  title: 'Prywatność w pierwszym miejscu',
                  desc: 'Twój dziennik i rozmowy są tylko Twoje. Kompani widzą tylko publiczny profil.',
                },
              ].map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  className="md:col-span-4"
                >
                  <GlassPanel variant="soft" className="relative h-full overflow-hidden p-7">
                    <div
                      aria-hidden
                      className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-gradient-to-br from-rpg-quest/25 via-rpg-sage/15 to-transparent blur-2xl"
                    />
                    <div className="relative">
                      <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/75 text-rpg-quest shadow-[0_12px_28px_-16px_rgba(124,109,245,0.7)]">
                        <Icon name={f.icon} size={18} />
                      </span>
                      <h4 className="mt-4 font-display text-lg font-semibold text-ink-900">
                        {f.title}
                      </h4>
                      <p className="mt-2 text-sm text-ink-700">{f.desc}</p>
                    </div>
                  </GlassPanel>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* UŚMIECH — smile-of-the-day feature */}
        <section id="usmiech" className="relative px-6 py-24 sm:py-32">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto mb-14 max-w-3xl text-center">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-rpg-quest">
                Uśmiech dnia
              </p>
              <h2 className="font-display text-4xl font-semibold leading-tight text-ink-900 text-balance sm:text-5xl md:text-6xl">
                Trzy sekundy uśmiechu,
                <span
                  className="bg-clip-text text-transparent"
                  style={{ backgroundImage: PRIMARY_GRADIENT }}
                >
                  {' '}
                  dawka endorfin w 10 XP
                </span>
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-base text-ink-700 md:text-lg">
                Mimika twarzy steruje chemią mózgu — nawet wymuszony uśmiech po
                3 sekundach obniża kortyzol. Otucha robi z tego quest. Kamerka,
                3 sekundy, +10 XP i realny mikro-reset.
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.8 }}
            >
              <GlassPanel className="relative overflow-hidden p-8 sm:p-12">
                {/* animated blobs */}
                <motion.div
                  aria-hidden
                  className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full"
                  animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0.9, 0.6] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  style={{
                    background:
                      'radial-gradient(circle, rgba(245,199,106,0.55) 0%, transparent 70%)',
                    filter: 'blur(20px)',
                  }}
                />
                <motion.div
                  aria-hidden
                  className="pointer-events-none absolute -bottom-20 -left-16 h-72 w-72 rounded-full"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.85, 0.5] }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                  style={{
                    background:
                      'radial-gradient(circle, rgba(255,143,163,0.5) 0%, transparent 70%)',
                    filter: 'blur(20px)',
                  }}
                />

                <div className="relative grid gap-10 md:grid-cols-[1.2fr_1fr] md:items-center">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-rpg-quest/20 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-rpg-quest">
                        Aktywność
                      </span>
                      <span className="rounded-full bg-rpg-xp/25 px-3 py-1 text-[11px] font-bold tabular-nums text-amber-700">
                        +10 XP
                      </span>
                      <span className="rounded-full bg-rpg-sage/25 px-3 py-1 text-[11px] font-bold text-emerald-700">
                        MediaPipe FaceLandmarker
                      </span>
                    </div>
                    <h3 className="mt-4 font-display text-3xl font-semibold leading-tight text-ink-900 sm:text-4xl">
                      Pokaż uśmiech — zgarnij endorfiny i EXP
                    </h3>
                    <p className="mt-4 text-base text-ink-700">
                      W aplikacji klikasz „Rozpocznij skan". Włącza się kamerka,
                      AI śledzi 468 punktów twarzy, liczy krzywą ust i trzyma
                      odliczanie przez 3 sekundy uśmiechu. Nie musisz wyglądać
                      dobrze — liczy się sam ruch mimiczny.
                    </p>

                    <div className="mt-6 grid gap-3 sm:grid-cols-3">
                      {[
                        { step: '01', title: 'Włącz kamerkę', desc: 'Jedno kliknięcie, żadnych formularzy.' },
                        { step: '02', title: 'Uśmiechnij się', desc: 'AI odlicza 3 sekundy aktywnego uśmiechu.' },
                        { step: '03', title: 'Zgarnij XP', desc: '+10 EXP i zastrzyk dobrej chemii.' },
                      ].map((s) => (
                        <div
                          key={s.step}
                          className="rounded-2xl bg-white/70 p-3 ring-1 ring-white/70"
                        >
                          <p className="font-display text-xl font-semibold text-rpg-quest">
                            {s.step}
                          </p>
                          <p className="mt-1 font-display text-sm font-semibold text-ink-900">
                            {s.title}
                          </p>
                          <p className="mt-1 text-xs text-ink-500">{s.desc}</p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={goAuth}
                        className="inline-flex items-center gap-2 rounded-2xl px-6 py-3 font-display text-sm font-semibold text-white shadow-[0_18px_40px_-18px_rgba(124,109,245,0.9)] transition-transform hover:-translate-y-0.5"
                        style={{ background: PRIMARY_GRADIENT }}
                      >
                        <Icon name="sparkle" size={14} />
                        Spróbuj uśmiechu
                        <Icon name="arrow" size={14} />
                      </button>
                      <p className="text-xs text-ink-500">
                        Kamera działa lokalnie — nagrania nigdy nie opuszczają
                        Twojego urządzenia.
                      </p>
                    </div>
                  </div>

                  {/* Animated smile emblem */}
                  <div className="relative mx-auto grid h-64 w-64 place-items-center sm:h-72 sm:w-72">
                    <motion.div
                      aria-hidden
                      animate={{ rotate: 360 }}
                      transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
                      className="absolute inset-0 rounded-full"
                      style={{
                        background:
                          'conic-gradient(from 0deg, #7c6df5, #c48cff, #ff8fa3, #f5c76a, #7dd3b8, #7c6df5)',
                        filter: 'blur(14px)',
                        opacity: 0.75,
                      }}
                    />
                    <motion.div
                      aria-hidden
                      animate={{ rotate: -360 }}
                      transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
                      className="absolute inset-3 rounded-full"
                      style={{
                        background:
                          'conic-gradient(from 0deg, rgba(255,255,255,0.95), rgba(255,255,255,0.15), rgba(255,255,255,0.95))',
                        opacity: 0.5,
                      }}
                    />
                    <motion.div
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
                      className="relative grid h-48 w-48 place-items-center rounded-full sm:h-56 sm:w-56"
                      style={{
                        background: 'rgba(255,255,255,0.9)',
                        boxShadow:
                          'inset 0 2px 10px rgba(255,255,255,0.9), 0 30px 60px -20px rgba(124,109,245,0.55)',
                      }}
                    >
                      <span className="text-[92px] leading-none sm:text-[108px]">
                        😊
                      </span>
                    </motion.div>
                    {/* Orbiting sparkles */}
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        aria-hidden
                        className="absolute h-3 w-3 rounded-full"
                        style={{
                          background: ['#f5c76a', '#ff8fa3', '#7dd3b8'][i],
                          boxShadow: '0 0 18px currentColor',
                          color: ['#f5c76a', '#ff8fa3', '#7dd3b8'][i],
                        }}
                        animate={{
                          rotate: 360,
                          x: Math.cos((i / 3) * Math.PI * 2) * 120,
                          y: Math.sin((i / 3) * Math.PI * 2) * 120,
                        }}
                        transition={{
                          duration: 6 + i,
                          repeat: Infinity,
                          ease: 'linear',
                        }}
                      />
                    ))}
                  </div>
                </div>
              </GlassPanel>
            </motion.div>
          </div>
        </section>

        {/* TECH */}
        <section id="tech" className="relative px-6 py-24 sm:py-32">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto mb-14 max-w-3xl text-center">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-rpg-quest">
                Pod maską
              </p>
              <h2 className="font-display text-4xl font-semibold leading-tight text-ink-900 text-balance sm:text-5xl md:text-6xl">
                State-of-the-art AI
                <span
                  className="bg-clip-text text-transparent"
                  style={{ backgroundImage: PRIMARY_GRADIENT }}
                >
                  {' '}
                  zamknięty w bezpiecznej grze
                </span>
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-base text-ink-700 md:text-lg">
                Stack zaprojektowany pod produkcję, nie pod hackathon. Polski od
                pierwszego znaku, mobilny od pierwszego dnia, prywatny od
                pierwszego logowania.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {TECH_TILES.map((t, i) => (
                <motion.div
                  key={t.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.6, delay: i * 0.07 }}
                >
                  <GlassPanel
                    variant="soft"
                    className="relative h-full overflow-hidden p-7"
                  >
                    <div
                      aria-hidden
                      className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gradient-to-br from-rpg-quest/30 via-aura-lavender/40 to-transparent blur-2xl"
                    />
                    <div className="relative">
                      <div className="flex items-center justify-between">
                        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/80 text-rpg-quest shadow-[0_12px_28px_-16px_rgba(124,109,245,0.7)]">
                          <Icon name={t.icon} size={18} />
                        </span>
                        <span className="rounded-full bg-rpg-quest/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-rpg-quest">
                          {t.tag}
                        </span>
                      </div>
                      <h4 className="mt-4 font-display text-lg font-semibold text-ink-900">
                        {t.title}
                      </h4>
                      <p className="mt-2 text-sm text-ink-700">{t.desc}</p>
                    </div>
                  </GlassPanel>
                </motion.div>
              ))}
            </div>

            {/* Personalized quests highlight */}
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.7 }}
              className="mt-10"
            >
              <GlassPanel
                variant="quest"
                className="relative overflow-hidden p-8 sm:p-12"
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-aura-lavender/70 blur-3xl"
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-aura-blush/60 blur-3xl"
                />
                <div className="relative grid gap-8 md:grid-cols-[1.4fr_1fr] md:items-center">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-rpg-quest/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-rpg-quest">
                      <Icon name="sparkle" size={12} />
                      Adaptive quest engine
                    </div>
                    <h3 className="mt-4 font-display text-3xl font-semibold leading-tight text-ink-900 sm:text-4xl">
                      Twoje questy nie są kopią z PDF-a — pisze je AI z Twoich
                      rozmów
                    </h3>
                    <p className="mt-4 max-w-xl text-base text-ink-700">
                      Po każdej sesji z Babeczką, Blondi czy Ziutkiem Mistrz Gry
                      analizuje, o czym mówiłeś, i generuje 1–3 mikro-misje na
                      kolejny dzień. Wspomniałeś o stresie przed kartkówką?
                      Następny quest to oddech 4-7-8 i 60-sekundowa wizualizacja.
                      Rozmawiałeś o samotności? Quest to napisanie do jednej
                      osoby z Gildii. Mechanika dopasowuje się do Twojego życia,
                      a nie odwrotnie.
                    </p>
                    <div className="mt-6 flex flex-wrap gap-2">
                      <Tag label="Kontekstowe" kind="xp" />
                      <Tag label="Aktualizowane co dzień" kind="hp" />
                      <Tag label="Bez powtarzalności" kind="mp" />
                    </div>
                  </div>
                  <div className="relative">
                    <div className="space-y-3">
                      {[
                        {
                          from: 'Ty wczoraj 22:14',
                          msg: '„Znowu nie mogłam zasnąć przez kartkówkę z mata"',
                          tone: 'from-aura-sky/80 to-aura-lavender/80',
                        },
                        {
                          from: 'Mistrz Gry, dziś 7:30',
                          msg: '„Quest dnia: 4-7-8 + wizualizacja. Razem 5 minut, +120 XP"',
                          tone: 'from-rpg-quest/30 to-rpg-hp/30',
                        },
                      ].map((m, idx) => (
                        <motion.div
                          key={m.from}
                          initial={{ opacity: 0, x: idx === 0 ? -20 : 20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{
                            duration: 0.5,
                            delay: 0.2 + idx * 0.2,
                          }}
                          className={`rounded-2xl bg-gradient-to-br ${m.tone} p-4 backdrop-blur-md`}
                        >
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-500">
                            {m.from}
                          </p>
                          <p className="mt-1 text-sm font-medium text-ink-900">
                            {m.msg}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </GlassPanel>
            </motion.div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="jak" className="relative px-6 py-24 sm:py-32">
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto mb-16 max-w-2xl text-center">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-rpg-quest">
                Trzy kroki
              </p>
              <h2 className="font-display text-4xl font-semibold leading-tight text-ink-900 sm:text-5xl">
                Od pierwszego logowania
                <br />
                do pierwszego zwycięstwa
              </h2>
            </div>

            <div className="relative grid gap-6 md:grid-cols-3">
              <div
                aria-hidden
                className="pointer-events-none absolute left-[12%] right-[12%] top-16 hidden h-px bg-gradient-to-r from-transparent via-rpg-quest/40 to-transparent md:block"
              />
              {STEPS.map((s, i) => (
                <motion.div
                  key={s.n}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.6, delay: i * 0.15 }}
                >
                  <GlassPanel className="relative h-full p-7 text-center">
                    <span
                      className="mx-auto grid h-14 w-14 place-items-center rounded-full font-display text-xl font-semibold text-white shadow-glow"
                      style={{ background: PRIMARY_GRADIENT }}
                    >
                      {s.n}
                    </span>
                    <h3 className="mt-5 font-display text-xl font-semibold text-ink-900">
                      {s.title}
                    </h3>
                    <p className="mt-3 text-sm text-ink-700">{s.desc}</p>
                  </GlassPanel>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* SAFETY + METHOD */}
        <section className="relative px-6 py-24 sm:py-32">
          <div className="mx-auto max-w-6xl">
            <GlassPanel className="relative overflow-hidden p-8 sm:p-12">
              <div
                aria-hidden
                className="pointer-events-none absolute -left-20 -top-20 h-80 w-80 rounded-full bg-aura-lavender/60 blur-3xl"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute -bottom-24 -right-16 h-80 w-80 rounded-full bg-aura-blush/60 blur-3xl"
              />
              <div className="relative grid gap-10 md:grid-cols-2 md:items-center">
                <div>
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-rpg-quest">
                    Bezpieczna przystań
                  </p>
                  <h2 className="font-display text-4xl font-semibold leading-tight text-ink-900 sm:text-5xl">
                    Prywatność i metoda — nie „growth hack"
                  </h2>
                  <p className="mt-5 text-base text-ink-700">
                    Otucha nie handluje Twoimi danymi i nie goni Cię
                    powiadomieniami. Mechaniki oparte na CBT, ACT i
                    mindfulness — konsultowane z psychologami pracującymi z
                    młodzieżą.
                  </p>
                </div>

                <div className="grid gap-4">
                  <Benefit
                    icon="lock"
                    title="Pełna prywatność"
                    desc="Rozmowy szyfrowane. Ty decydujesz, co widzi gildia."
                  />
                  <Benefit
                    icon="leaf"
                    title="Metodyka CBT & ACT"
                    desc="Nurty psychoterapeutyczne sprawdzone w pracy z młodymi."
                  />
                  <Benefit
                    icon="bell"
                    title="Tryb spokojnej nocy"
                    desc="Dźwięki relaksacyjne, bajki terapeutyczne, oddech 4-7-8."
                  />
                </div>
              </div>
            </GlassPanel>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="relative px-6 pb-24 sm:pb-32">
          <div className="mx-auto max-w-5xl">
            <div
              className="relative overflow-hidden rounded-6xl p-10 text-center text-white shadow-glow sm:p-16"
              style={{ background: PRIMARY_GRADIENT }}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-40"
                style={{
                  background:
                    'radial-gradient(600px 300px at 20% 0%, rgba(255,255,255,0.6) 0%, transparent 70%), radial-gradient(500px 300px at 80% 100%, rgba(0,0,0,0.2) 0%, transparent 70%)',
                }}
              />
              <div className="relative">
                <h2 className="font-display text-4xl font-semibold leading-tight sm:text-5xl md:text-6xl">
                  Gotowy na pierwszą misję?
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-base text-white/90 md:text-lg">
                  Załóż konto w 30 sekund. Bez karty, bez ankiet, bez
                  doomscrollingu. Tylko Ty i Twój questlog.
                </p>
                <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={goAuth}
                    className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-4 text-base font-semibold text-rpg-quest shadow-lg transition-transform hover:-translate-y-0.5"
                  >
                    {ctaLabel}
                    <Icon name="arrow" size={16} />
                  </button>
                  <a
                    href="#przewodnicy"
                    className="inline-flex items-center gap-2 rounded-full border border-white/60 px-7 py-4 text-base font-semibold text-white transition-colors hover:bg-white/10"
                  >
                    Zobacz demo postaci
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative px-6 pb-10">
        <div className="mx-auto max-w-7xl">
          <GlassPanel variant="soft" className="flex flex-col items-center gap-4 p-6 text-center sm:flex-row sm:justify-between sm:text-left">
            <div className="flex items-center gap-2 font-display text-lg font-semibold tracking-tight">
              <span
                className="grid h-8 w-8 place-items-center rounded-xl text-white"
                style={{ background: PRIMARY_GRADIENT }}
              >
                <Icon name="sparkle" size={14} />
              </span>
              <span className="bg-gradient-to-r from-rpg-quest via-[#c48cff] to-rpg-hp bg-clip-text text-transparent">
                Otucha
              </span>
            </div>
            <p className="text-xs text-ink-500">
              © {new Date().getFullYear()} Otucha — bezpieczna przystań w
              cyfrowej podróży.
            </p>
            <div className="flex items-center gap-4 text-xs text-ink-500">
              <a href="#" className="hover:text-ink-900">
                Prywatność
              </a>
              <a href="#" className="hover:text-ink-900">
                Regulamin
              </a>
              <a href="#" className="hover:text-ink-900">
                Wsparcie
              </a>
            </div>
          </GlassPanel>
        </div>
      </footer>
    </div>
  );
}

function Tag({ label, kind }) {
  const map = {
    xp: 'bg-rpg-xp/20 text-[#8a6a0e]',
    hp: 'bg-rpg-hp/20 text-[#9c2a45]',
    mp: 'bg-rpg-mp/25 text-[#2b4e8f]',
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold ${map[kind]}`}
    >
      {label}
    </span>
  );
}

function Benefit({ icon, title, desc }) {
  return (
    <div className="flex items-start gap-4 rounded-3xl bg-white/60 p-4 backdrop-blur-md">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white text-rpg-quest shadow-[0_8px_22px_-12px_rgba(124,109,245,0.7)]">
        <Icon name={icon} size={16} />
      </span>
      <div>
        <p className="font-display text-base font-semibold text-ink-900">
          {title}
        </p>
        <p className="mt-1 text-sm text-ink-700">{desc}</p>
      </div>
    </div>
  );
}

function ShowcaseTile({ character, showcase, delay }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) v.play().catch(() => {});
          else v.pause();
        });
      },
      { threshold: 0.25 }
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);

  return (
    <motion.article
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, delay }}
      whileHover={{ y: -6 }}
      className="group relative overflow-hidden rounded-[2.5rem] border border-white/60 shadow-[0_40px_100px_-30px_rgba(124,109,245,0.55)]"
      style={{ background: character.gradient }}
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -inset-8 rounded-[3rem]"
        animate={{ opacity: [0.45, 0.85, 0.45] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          background: `radial-gradient(closest-side, ${character.halo} 0%, transparent 75%)`,
          filter: 'blur(34px)',
        }}
      />

      <div className="relative aspect-[3/4] w-full overflow-hidden">
        <video
          ref={videoRef}
          src={showcase.video}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          style={{ objectPosition: 'center top' }}
        />

        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 z-10 h-28"
          style={{
            background:
              'linear-gradient(180deg, rgba(255,255,255,0.45) 0%, transparent 100%)',
          }}
        />

        <div className="absolute left-5 top-5 z-20 inline-flex items-center gap-1.5 rounded-full bg-white/85 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-rpg-quest backdrop-blur-md">
          <span className="h-1.5 w-1.5 animate-sparkle rounded-full bg-rpg-quest" />
          live
        </div>

        <div className="absolute right-5 top-5 z-20 inline-flex items-center gap-1.5 rounded-full bg-black/35 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur-md">
          {showcase.badge}
        </div>

        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-3/5"
          style={{
            background:
              'linear-gradient(180deg, transparent 0%, rgba(20,15,40,0.82) 100%)',
          }}
        />

        <div className="absolute inset-x-0 bottom-0 z-20 p-6 text-white">
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/80"
            style={{ textShadow: '0 2px 12px rgba(0,0,0,0.6)' }}
          >
            {character.name} · moc specjalna
          </p>
          <p
            className="mt-1 font-display text-2xl font-semibold leading-tight"
            style={{ textShadow: '0 4px 20px rgba(0,0,0,0.7)' }}
          >
            {showcase.power}
          </p>
          <p
            className="mt-2 text-sm leading-relaxed text-white/90"
            style={{ textShadow: '0 2px 14px rgba(0,0,0,0.6)' }}
          >
            {showcase.desc}
          </p>
        </div>
      </div>
    </motion.article>
  );
}

function GuideCard({ character, delay }) {
  const videoRef = useRef(null);
  const [hovered, setHovered] = useState(false);
  const blurb = GUIDE_BLURBS[character.agentId] || {
    tag: 'Przewodnik',
    description: character.tagline,
  };

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (hovered) {
      v.currentTime = 0;
      v.play().catch(() => {});
    } else {
      v.pause();
    }
  }, [hovered]);

  return (
    <motion.article
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, delay }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="group relative flex flex-col overflow-hidden rounded-[2rem] border border-white/70 shadow-[0_30px_70px_-30px_rgba(124,109,245,0.45)]"
      style={{
        background: character.gradient,
      }}
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -inset-6 rounded-[3rem]"
        animate={{
          opacity: hovered ? [0.5, 0.9, 0.5] : 0.3,
        }}
        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          background: `radial-gradient(closest-side, ${character.halo} 0%, transparent 75%)`,
          filter: 'blur(28px)',
        }}
      />

      <div className="relative aspect-[4/5] w-full overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 z-10 h-24"
          style={{
            background:
              'linear-gradient(180deg, rgba(255,255,255,0.45) 0%, transparent 100%)',
          }}
        />
        <motion.img
          src={character.idle}
          alt={character.name}
          draggable={false}
          animate={{ opacity: hovered ? 0 : 1 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 h-full w-full select-none object-cover"
          style={{ objectPosition: 'center top' }}
        />
        <motion.video
          ref={videoRef}
          src={character.talk}
          loop
          muted
          playsInline
          preload="metadata"
          animate={{ opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: 'center top' }}
        />

        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-2/3"
          style={{
            background:
              'linear-gradient(180deg, transparent 0%, rgba(20,15,40,0.7) 100%)',
          }}
        />

        <div className="absolute inset-x-0 bottom-0 z-20 p-6">
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/80"
            style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}
          >
            {blurb.tag}
          </p>
          <p
            className="mt-1 font-display text-3xl font-semibold text-white"
            style={{ textShadow: '0 4px 18px rgba(0,0,0,0.55)' }}
          >
            {character.name}
          </p>
        </div>
      </div>

      <div className="relative z-10 bg-white/75 p-6 backdrop-blur-md">
        <p className="text-sm text-ink-700">{blurb.description}</p>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-500">
            {character.tagline}
          </span>
          <span
            className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold text-white"
            style={{
              background: `linear-gradient(135deg, ${character.accent} 0%, rgba(255,255,255,0.4) 180%)`,
            }}
          >
            Porozmawiaj
            <Icon name="arrow" size={12} />
          </span>
        </div>
      </div>
    </motion.article>
  );
}
