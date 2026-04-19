import { useEffect, useState } from 'react';
import BackgroundAura from '../components/BackgroundAura';
import Sidebar from '../components/Sidebar';
import StatsHeader from '../components/StatsHeader';
import ActiveQuest from '../components/ActiveQuest';
import TaskList from '../components/TaskList';
import JournalList from '../components/JournalList';
import PlayerCard from '../components/PlayerCard';
import MobileNav from '../components/MobileNav';
import AgentSelect from '../components/AgentSelect';
import SmileActivity from '../components/SmileActivity';
import QuestModal from '../components/QuestModal';
import OnboardingTour from '../components/OnboardingTour';
import { player as mockPlayer, stats as mockStats } from '../data/mock';
import { useAuth } from '../context/AuthContext';
import { getActiveQuest } from '../api/quests';

const onboardingKey = (user) =>
  `hp.onboarding_completed.${user?.id ?? user?.username ?? 'guest'}`;

export default function Home() {
  const { user } = useAuth();
  const [activeQuest, setActiveQuest] = useState(null);
  const [openQuest, setOpenQuest] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (!user) return;
    try {
      const done = localStorage.getItem(onboardingKey(user)) === '1';
      if (!done) setShowOnboarding(true);
    } catch {
      setShowOnboarding(true);
    }
  }, [user]);

  const closeOnboarding = () => {
    try {
      localStorage.setItem(onboardingKey(user), '1');
    } catch {}
    setShowOnboarding(false);
  };

  useEffect(() => {
    let cancelled = false;
    getActiveQuest()
      .then((q) => { if (!cancelled) setActiveQuest(q); })
      .catch(() => { if (!cancelled) setActiveQuest(null); });
    return () => { cancelled = true; };
  }, [reloadKey]);

  const player = {
    name: user?.username || mockPlayer.name,
    class: mockPlayer.class,
    level: user?.level ?? mockPlayer.level,
    seed: mockPlayer.seed,
    avatar: user?.avatar,
  };

  const xp = {
    value: user?.exp_in_current_level ?? 0,
    max: user?.exp_for_current_level ?? 50,
    total: user?.exp ?? 0,
    level: player.level,
  };

  const stats = {
    hp: mockStats.hp,
    mp: mockStats.mp,
    xp,
  };

  const vibes = {
    grind: user?.grind ?? 0,
    rizz: user?.rizz ?? 0,
    aura: user?.aura ?? 0,
  };

  const streak = user?.streak ?? 0;

  return (
    <div className="relative h-screen overflow-hidden">
      <BackgroundAura />

      <div className="relative grid h-full grid-cols-1 gap-4 p-3 sm:gap-5 sm:p-4 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-6">
        <aside className="hidden h-full min-h-0 lg:block">
          <div className="flex h-full flex-col gap-5 overflow-y-auto no-scrollbar pr-1">
            <div data-tour="sidebar" className="glass flex flex-col rounded-[2.5rem] p-5">
              <Sidebar />
            </div>
            <div data-tour="player">
              <PlayerCard player={player} xp={xp} />
            </div>
          </div>
        </aside>

        <main className="h-full min-h-0 overflow-y-auto overflow-x-hidden no-scrollbar pb-28 lg:pb-6 mt-3 animate-fadeUp">
          <div className="space-y-5 sm:space-y-6">
            <div data-tour="stats">
              <StatsHeader
                name={player.name}
                stats={stats}
                streak={streak}
                level={player.level}
                vibes={vibes}
              />
            </div>
            {activeQuest && (
              <div data-tour="quest">
                <ActiveQuest quest={activeQuest} onOpen={setOpenQuest} />
              </div>
            )}
            <div data-tour="agents">
              <AgentSelect />
            </div>
            <div data-tour="smile">
              <SmileActivity />
            </div>
            <div data-tour="tasks">
              <TaskList />
            </div>
            <div data-tour="journal">
              <JournalList />
            </div>
          </div>
        </main>
      </div>

      <MobileNav />

      {openQuest && (
        <QuestModal
          quest={openQuest}
          onClose={() => setOpenQuest(null)}
          onCompleted={() => setReloadKey((k) => k + 1)}
        />
      )}

      {showOnboarding && (
        <OnboardingTour user={user} onClose={closeOnboarding} />
      )}
    </div>
  );
}
