import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BackgroundAura from '../components/BackgroundAura';
import GlassPanel from '../components/GlassPanel';
import Sidebar from '../components/Sidebar';
import MobileNav from '../components/MobileNav';
import AvatarImage from '../components/AvatarImage';
import Icon from '../components/Icon';
import FriendDetailModal from '../components/FriendDetailModal';
import {
  listFriends,
  listFriendRequests,
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  cancelFriendRequest,
  searchUsers,
} from '../api/friends';
import { getAvatar } from '../data/avatars';

const PRIMARY_GRADIENT =
  'linear-gradient(135deg, #7c6df5 0%, #c48cff 55%, #ff8fa3 100%)';

const TABS = [
  { id: 'friends', label: 'Drużyna', icon: 'users' },
  { id: 'requests', label: 'Zaproszenia', icon: 'bell' },
  { id: 'search', label: 'Szukaj', icon: 'search' },
];

const RELATION_LABEL = {
  none: 'Zaproś',
  pending_outgoing: 'Wysłane',
  pending_incoming: 'Akceptuj',
  friends: 'W gildii',
};

function FriendCard({ friend, index, onClick }) {
  const meta = getAvatar(friend.avatar);
  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, type: 'spring', stiffness: 200, damping: 22 }}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.98 }}
      className="group relative flex items-center gap-3 rounded-2xl bg-white/55 p-3 text-left ring-1 ring-white/60 transition hover:shadow-[0_16px_38px_-20px_rgba(124,109,245,0.55)]"
    >
      <AvatarImage avatar={friend.avatar} seed={friend.id} size={56} status="online" />
      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-sm font-semibold text-ink-900">
          {friend.username}
        </p>
        <p className="truncate text-[11px] uppercase tracking-[0.18em] text-ink-500">
          {meta ? meta.label : 'Wojownik'} · poziom {friend.level}
        </p>
        <div className="mt-1.5 flex items-center gap-2 text-[10px] font-semibold text-ink-500">
          <span className="inline-flex items-center gap-1 rounded-full bg-white/70 px-2 py-0.5 ring-1 ring-white/60">
            <Icon name="flame" size={10} className="text-rpg-hp" />
            {friend.streak}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-white/70 px-2 py-0.5 ring-1 ring-white/60">
            <Icon name="sparkle" size={10} className="text-rpg-quest" />
            {friend.exp?.toLocaleString?.('pl-PL') ?? friend.exp}
          </span>
        </div>
      </div>
      <span className="grid h-8 w-8 place-items-center rounded-full bg-white/70 text-ink-500 ring-1 ring-white/60 transition group-hover:bg-rpg-quest group-hover:text-white">
        <Icon name="arrow" size={14} />
      </span>
    </motion.button>
  );
}

function RequestRow({ request, busy, onAccept, onDecline, onCancel }) {
  const { user, direction } = request;
  const meta = getAvatar(user.avatar);
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      className="flex items-center gap-3 rounded-2xl bg-white/55 p-3 ring-1 ring-white/60"
    >
      <AvatarImage avatar={user.avatar} seed={user.id} size={48} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-sm font-semibold text-ink-900">
          {user.username}
        </p>
        <p className="truncate text-[11px] uppercase tracking-[0.18em] text-ink-500">
          {meta ? meta.label : 'Nieznana dusza'} · poziom {user.level}
        </p>
      </div>
      {direction === 'incoming' ? (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onDecline(request.id)}
            disabled={busy}
            className="grid h-9 w-9 place-items-center rounded-xl bg-white/70 text-ink-500 ring-1 ring-white/60 transition hover:text-rpg-hp disabled:opacity-60"
            title="Odrzuć"
          >
            <Icon name="close" size={14} />
          </button>
          <button
            type="button"
            onClick={() => onAccept(request.id)}
            disabled={busy}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-white shadow-[0_12px_28px_-14px_rgba(124,109,245,0.75)] disabled:opacity-60"
            style={{ backgroundImage: PRIMARY_GRADIENT }}
          >
            <Icon name="check" size={14} />
            Akceptuj
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => onCancel(request.id)}
          disabled={busy}
          className="rounded-xl bg-white/70 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-500 ring-1 ring-white/60 transition hover:text-rpg-hp disabled:opacity-60"
        >
          Anuluj
        </button>
      )}
    </motion.div>
  );
}

function SearchRow({ user, onInvite, busy, invitedIds }) {
  const meta = getAvatar(user.avatar);
  const localRelation = invitedIds.has(user.id) ? 'pending_outgoing' : user.relation;
  const disabled =
    localRelation === 'pending_outgoing' || localRelation === 'friends' || busy;
  const label = RELATION_LABEL[localRelation] || 'Zaproś';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 rounded-2xl bg-white/55 p-3 ring-1 ring-white/60"
    >
      <AvatarImage avatar={user.avatar} seed={user.id} size={48} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-sm font-semibold text-ink-900">
          {user.username}
        </p>
        <p className="truncate text-[11px] uppercase tracking-[0.18em] text-ink-500">
          {meta ? meta.label : 'Wędrowiec'} · poziom {user.level}
        </p>
      </div>
      <button
        type="button"
        onClick={() => onInvite(user)}
        disabled={disabled}
        className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] transition disabled:cursor-not-allowed ${
          localRelation === 'none' || localRelation === 'pending_incoming'
            ? 'text-white shadow-[0_12px_28px_-14px_rgba(124,109,245,0.75)] disabled:opacity-60'
            : 'bg-white/70 text-ink-500 ring-1 ring-white/60 disabled:opacity-80'
        }`}
        style={
          localRelation === 'none' || localRelation === 'pending_incoming'
            ? { backgroundImage: PRIMARY_GRADIENT }
            : undefined
        }
      >
        <Icon
          name={localRelation === 'friends' ? 'check' : 'userPlus'}
          size={12}
        />
        {label}
      </button>
    </motion.div>
  );
}

export default function Friends() {
  const [tab, setTab] = useState('friends');
  const [friends, setFriends] = useState([]);
  const [friendsLoading, setFriendsLoading] = useState(true);

  const [requests, setRequests] = useState({ incoming: [], outgoing: [] });
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [requestBusy, setRequestBusy] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [invitedIds, setInvitedIds] = useState(new Set());
  const [toast, setToast] = useState(null);
  const searchDebounce = useRef(null);

  const [manualUsername, setManualUsername] = useState('');
  const [manualBusy, setManualBusy] = useState(false);

  const [selectedFriend, setSelectedFriend] = useState(null);

  const pendingIncomingCount = requests.incoming.length;

  const loadFriends = useCallback(async () => {
    setFriendsLoading(true);
    try {
      const data = await listFriends();
      setFriends(data || []);
    } catch {
      setFriends([]);
    } finally {
      setFriendsLoading(false);
    }
  }, []);

  const loadRequests = useCallback(async () => {
    setRequestsLoading(true);
    try {
      const data = await listFriendRequests();
      setRequests(data || { incoming: [], outgoing: [] });
    } catch {
      setRequests({ incoming: [], outgoing: [] });
    } finally {
      setRequestsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFriends();
    loadRequests();
  }, [loadFriends, loadRequests]);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 2400);
    return () => clearTimeout(id);
  }, [toast]);

  useEffect(() => {
    if (tab !== 'search') return;
    if (searchDebounce.current) clearTimeout(searchDebounce.current);
    const query = searchQuery.trim();
    if (query.length < 2) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }
    setSearchLoading(true);
    searchDebounce.current = setTimeout(async () => {
      try {
        const data = await searchUsers(query);
        setSearchResults(data || []);
      } catch {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 260);
    return () => searchDebounce.current && clearTimeout(searchDebounce.current);
  }, [searchQuery, tab]);

  const invite = useCallback(
    async (targetUser) => {
      try {
        const created = await sendFriendRequest(targetUser.username);
        setInvitedIds((prev) => new Set(prev).add(targetUser.id));
        setToast({ type: 'ok', text: `Zaproszenie dla ${targetUser.username} wysłane!` });
        if (created?.direction === 'incoming') {
          await loadFriends();
          await loadRequests();
          setToast({ type: 'ok', text: `${targetUser.username} dołącza do Twojej gildii!` });
        } else {
          setRequests((prev) => ({
            ...prev,
            outgoing: [created, ...prev.outgoing.filter((r) => r.id !== created.id)],
          }));
        }
      } catch (err) {
        setToast({ type: 'err', text: err.message || 'Nie udało się wysłać zaproszenia' });
      }
    },
    [loadFriends, loadRequests]
  );

  const handleManualInvite = async (e) => {
    e.preventDefault();
    const name = manualUsername.trim();
    if (!name || manualBusy) return;
    setManualBusy(true);
    try {
      const created = await sendFriendRequest(name);
      if (created?.direction === 'incoming') {
        await loadFriends();
        await loadRequests();
        setToast({ type: 'ok', text: `${name} dołącza do Twojej gildii!` });
      } else {
        setRequests((prev) => ({
          ...prev,
          outgoing: [created, ...prev.outgoing.filter((r) => r.id !== created.id)],
        }));
        setToast({ type: 'ok', text: `Zaproszenie dla ${name} wysłane!` });
      }
      setManualUsername('');
    } catch (err) {
      setToast({ type: 'err', text: err.message || 'Nie udało się wysłać zaproszenia' });
    } finally {
      setManualBusy(false);
    }
  };

  const handleAccept = async (id) => {
    setRequestBusy(true);
    try {
      await acceptFriendRequest(id);
      setRequests((prev) => ({
        ...prev,
        incoming: prev.incoming.filter((r) => r.id !== id),
      }));
      await loadFriends();
      setToast({ type: 'ok', text: 'Nowy kompan w gildii!' });
    } catch (err) {
      setToast({ type: 'err', text: err.message || 'Nie udało się zaakceptować' });
    } finally {
      setRequestBusy(false);
    }
  };

  const handleDecline = async (id) => {
    setRequestBusy(true);
    try {
      await declineFriendRequest(id);
      setRequests((prev) => ({
        ...prev,
        incoming: prev.incoming.filter((r) => r.id !== id),
      }));
    } catch (err) {
      setToast({ type: 'err', text: err.message || 'Nie udało się odrzucić' });
    } finally {
      setRequestBusy(false);
    }
  };

  const handleCancel = async (id) => {
    setRequestBusy(true);
    try {
      await cancelFriendRequest(id);
      setRequests((prev) => ({
        ...prev,
        outgoing: prev.outgoing.filter((r) => r.id !== id),
      }));
    } catch (err) {
      setToast({ type: 'err', text: err.message || 'Nie udało się anulować' });
    } finally {
      setRequestBusy(false);
    }
  };

  const handleFriendRemoved = (id) => {
    setFriends((prev) => prev.filter((f) => f.id !== id));
  };

  const showEmpty = useMemo(() => {
    if (tab === 'friends') return !friendsLoading && friends.length === 0;
    if (tab === 'requests')
      return (
        !requestsLoading &&
        requests.incoming.length === 0 &&
        requests.outgoing.length === 0
      );
    return false;
  }, [tab, friends, friendsLoading, requests, requestsLoading]);

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
              <span className="pointer-events-none absolute -top-24 -right-12 h-60 w-60 rounded-full bg-rpg-quest/25 blur-3xl" />
              <span className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-rpg-hp/20 blur-3xl" />

              <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-rpg-quest to-rpg-hp text-white shadow-[0_18px_36px_-16px_rgba(124,109,245,0.8)]">
                    <Icon name="users" size={22} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-ink-500">
                      Gildia Przyjaciół
                    </p>
                    <h1 className="font-display text-3xl font-semibold leading-tight text-ink-900 sm:text-4xl">
                      Twoja drużyna
                    </h1>
                    <p className="mt-1 text-sm text-ink-500">
                      Zaproś kompanów, sprawdzaj ich progres i trzymaj się razem.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="rounded-2xl bg-white/55 px-4 py-3 text-center ring-1 ring-white/60">
                    <p className="font-display text-2xl font-semibold text-ink-900">
                      {friends.length}
                    </p>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-ink-500">
                      W gildii
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white/55 px-4 py-3 text-center ring-1 ring-white/60">
                    <p className="font-display text-2xl font-semibold text-rpg-quest">
                      {pendingIncomingCount}
                    </p>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-ink-500">
                      Oczekują
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative mt-5 flex gap-1.5 rounded-2xl bg-white/45 p-1.5 ring-1 ring-white/60">
                {TABS.map((t) => {
                  const isActive = tab === t.id;
                  const badge =
                    t.id === 'requests' && pendingIncomingCount > 0
                      ? pendingIncomingCount
                      : null;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTab(t.id)}
                      className={`relative flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] transition ${
                        isActive
                          ? 'bg-white text-rpg-quest shadow-[0_10px_24px_-14px_rgba(124,109,245,0.7)]'
                          : 'text-ink-500 hover:text-ink-900'
                      }`}
                    >
                      <Icon name={t.icon} size={14} />
                      {t.label}
                      {badge && (
                        <span className="absolute -right-1 -top-1 grid h-5 min-w-[20px] place-items-center rounded-full bg-rpg-hp px-1 text-[10px] font-bold text-white shadow-[0_6px_16px_-6px_rgba(255,143,163,0.9)]">
                          {badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </GlassPanel>

            <AnimatePresence mode="wait">
              {tab === 'friends' && (
                <motion.div
                  key="friends"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                >
                  <GlassPanel className="p-5 sm:p-6">
                    {friendsLoading ? (
                      <div className="grid gap-2 sm:grid-cols-2">
                        {[0, 1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className="h-[84px] animate-pulse rounded-2xl bg-white/40"
                          />
                        ))}
                      </div>
                    ) : friends.length === 0 ? (
                      <EmptyState
                        icon="users"
                        title="Jeszcze nie masz drużyny"
                        subtitle="Zaproś pierwszego kompana — wspólne questy są 2x bardziej skuteczne."
                        cta="Szukaj znajomych"
                        onCta={() => setTab('search')}
                      />
                    ) : (
                      <div className="grid gap-2.5 sm:grid-cols-2">
                        {friends.map((f, i) => (
                          <FriendCard
                            key={f.id}
                            friend={f}
                            index={i}
                            onClick={() => setSelectedFriend(f)}
                          />
                        ))}
                      </div>
                    )}
                  </GlassPanel>
                </motion.div>
              )}

              {tab === 'requests' && (
                <motion.div
                  key="requests"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-4"
                >
                  <GlassPanel className="p-5 sm:p-6">
                    <div className="mb-3 flex items-center gap-2">
                      <Icon name="bell" size={16} className="text-rpg-quest" />
                      <h2 className="font-display text-lg font-semibold text-ink-900">
                        Przychodzące
                      </h2>
                      <span className="rounded-full bg-white/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-ink-500 ring-1 ring-white/60">
                        {requests.incoming.length}
                      </span>
                    </div>
                    {requests.incoming.length === 0 ? (
                      <p className="rounded-2xl bg-white/45 px-4 py-3 text-sm text-ink-500 ring-1 ring-white/60">
                        Brak zaproszeń. Kiedy ktoś Cię zaprosi — zobaczysz to tutaj.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        <AnimatePresence initial={false}>
                          {requests.incoming.map((r) => (
                            <RequestRow
                              key={r.id}
                              request={r}
                              busy={requestBusy}
                              onAccept={handleAccept}
                              onDecline={handleDecline}
                            />
                          ))}
                        </AnimatePresence>
                      </div>
                    )}
                  </GlassPanel>

                  <GlassPanel className="p-5 sm:p-6">
                    <div className="mb-3 flex items-center gap-2">
                      <Icon name="arrow" size={16} className="text-ink-500" />
                      <h2 className="font-display text-lg font-semibold text-ink-900">
                        Wysłane
                      </h2>
                      <span className="rounded-full bg-white/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-ink-500 ring-1 ring-white/60">
                        {requests.outgoing.length}
                      </span>
                    </div>
                    {requests.outgoing.length === 0 ? (
                      <p className="rounded-2xl bg-white/45 px-4 py-3 text-sm text-ink-500 ring-1 ring-white/60">
                        Nikogo jeszcze nie zaprosiłeś. Sprawdź zakładkę „Szukaj".
                      </p>
                    ) : (
                      <div className="space-y-2">
                        <AnimatePresence initial={false}>
                          {requests.outgoing.map((r) => (
                            <RequestRow
                              key={r.id}
                              request={r}
                              busy={requestBusy}
                              onCancel={handleCancel}
                            />
                          ))}
                        </AnimatePresence>
                      </div>
                    )}
                  </GlassPanel>
                </motion.div>
              )}

              {tab === 'search' && (
                <motion.div
                  key="search"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-4"
                >
                  <GlassPanel className="p-5 sm:p-6">
                    <div className="flex items-center gap-2">
                      <span className="grid h-9 w-9 place-items-center rounded-xl bg-rpg-quest/15 text-rpg-quest">
                        <Icon name="search" size={16} />
                      </span>
                      <div>
                        <h2 className="font-display text-lg font-semibold text-ink-900">
                          Znajdź kompana
                        </h2>
                        <p className="text-[11px] text-ink-500">
                          Wpisz nick — minimum 2 znaki.
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-2 rounded-2xl bg-white/60 px-4 py-3 ring-1 ring-white/60 focus-within:ring-rpg-quest/50">
                      <Icon name="search" size={16} className="text-ink-500" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Wojownik_42"
                        className="flex-1 bg-transparent text-sm text-ink-900 placeholder:text-ink-300 focus:outline-none"
                      />
                      {searchLoading && (
                        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-rpg-quest/40 border-t-rpg-quest" />
                      )}
                    </div>

                    <div className="mt-4 space-y-2">
                      <AnimatePresence initial={false}>
                        {searchResults.map((u) => (
                          <SearchRow
                            key={u.id}
                            user={u}
                            onInvite={invite}
                            busy={false}
                            invitedIds={invitedIds}
                          />
                        ))}
                      </AnimatePresence>
                      {!searchLoading &&
                        searchQuery.trim().length >= 2 &&
                        searchResults.length === 0 && (
                          <p className="rounded-2xl bg-white/45 px-4 py-3 text-sm text-ink-500 ring-1 ring-white/60">
                            Nic nie znalazłem. Spróbuj innego nicku.
                          </p>
                        )}
                    </div>
                  </GlassPanel>

                  <GlassPanel className="p-5 sm:p-6">
                    <div className="flex items-center gap-2">
                      <span className="grid h-9 w-9 place-items-center rounded-xl bg-rpg-hp/15 text-rpg-hp">
                        <Icon name="userPlus" size={16} />
                      </span>
                      <div>
                        <h2 className="font-display text-lg font-semibold text-ink-900">
                          Znasz już nick?
                        </h2>
                        <p className="text-[11px] text-ink-500">
                          Wpisz dokładną nazwę i wyślij zaproszenie jednym kliknięciem.
                        </p>
                      </div>
                    </div>
                    <form
                      onSubmit={handleManualInvite}
                      className="mt-4 flex flex-col gap-2 sm:flex-row"
                    >
                      <div className="flex flex-1 items-center gap-2 rounded-2xl bg-white/60 px-4 py-3 ring-1 ring-white/60 focus-within:ring-rpg-quest/50">
                        <Icon name="user" size={16} className="text-ink-500" />
                        <input
                          type="text"
                          value={manualUsername}
                          onChange={(e) => setManualUsername(e.target.value)}
                          placeholder="Nick kompana"
                          className="flex-1 bg-transparent text-sm text-ink-900 placeholder:text-ink-300 focus:outline-none"
                          minLength={3}
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={!manualUsername.trim() || manualBusy}
                        className="relative overflow-hidden rounded-2xl px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_-18px_rgba(124,109,245,0.9)] transition hover:shadow-[0_22px_46px_-16px_rgba(124,109,245,1)] disabled:cursor-not-allowed disabled:opacity-50"
                        style={{ backgroundImage: PRIMARY_GRADIENT }}
                      >
                        <span className="relative z-10 inline-flex items-center gap-2">
                          {manualBusy && (
                            <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/60 border-t-white" />
                          )}
                          Wyślij zaproszenie
                          {!manualBusy && <Icon name="arrow" size={14} />}
                        </span>
                      </button>
                    </form>
                  </GlassPanel>
                </motion.div>
              )}
            </AnimatePresence>

            {showEmpty && null}
          </div>
        </main>
      </div>

      <MobileNav />

      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.text}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className={`pointer-events-none fixed inset-x-0 bottom-28 z-40 mx-auto w-fit max-w-[90%] rounded-full px-5 py-3 text-sm font-semibold ring-1 backdrop-blur-md lg:bottom-8 ${
              toast.type === 'ok'
                ? 'bg-rpg-sage/25 text-ink-900 ring-rpg-sage/50'
                : 'bg-rpg-hp/25 text-ink-900 ring-rpg-hp/50'
            }`}
          >
            {toast.text}
          </motion.div>
        )}
      </AnimatePresence>

      {selectedFriend && (
        <FriendDetailModal
          friend={selectedFriend}
          onClose={() => setSelectedFriend(null)}
          onRemoved={handleFriendRemoved}
        />
      )}
    </div>
  );
}

function EmptyState({ icon, title, subtitle, cta, onCta }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl bg-white/45 px-6 py-10 text-center ring-1 ring-white/60">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-rpg-quest/80 to-rpg-hp/80 text-white shadow-[0_18px_36px_-16px_rgba(124,109,245,0.8)]">
        <Icon name={icon} size={22} />
      </span>
      <h3 className="font-display text-lg font-semibold text-ink-900">{title}</h3>
      <p className="max-w-xs text-sm text-ink-500">{subtitle}</p>
      {cta && (
        <button
          type="button"
          onClick={onCta}
          className="mt-1 inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-[0_14px_32px_-14px_rgba(124,109,245,0.8)]"
          style={{ backgroundImage: PRIMARY_GRADIENT }}
        >
          <Icon name="userPlus" size={14} />
          {cta}
        </button>
      )}
    </div>
  );
}
