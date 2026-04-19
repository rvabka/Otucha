import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import GlassPanel from './GlassPanel';
import AvatarImage from './AvatarImage';
import Icon from './Icon';
import FriendDetailModal from './FriendDetailModal';
import { listFriends, listFriendRequests } from '../api/friends';

export default function GuildPanel() {
  const navigate = useNavigate();
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(0);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([listFriends(), listFriendRequests().catch(() => null)])
      .then(([friendList, req]) => {
        if (cancelled) return;
        setFriends(friendList || []);
        setPending(req?.incoming?.length || 0);
      })
      .catch(() => {
        if (!cancelled) setFriends([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const shown = friends.slice(0, 4);

  return (
    <GlassPanel className="p-6">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-rpg-quest/80">
            Gildia Przyjaciół
          </p>
          <h3 className="mt-1 font-display text-lg font-semibold leading-tight text-ink-900 text-balance">
            {friends.length > 0 ? 'Twoja drużyna' : 'Zbuduj swoją drużynę'}
          </h3>
        </div>
        <Link
          to="/friends"
          className="relative rounded-full bg-rpg-sage/20 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-rpg-sage transition hover:bg-rpg-sage/30"
        >
          {friends.length}
          {pending > 0 && (
            <span className="absolute -right-1 -top-1 grid h-4 min-w-[16px] place-items-center rounded-full bg-rpg-hp px-1 text-[9px] font-bold text-white shadow-[0_4px_10px_-2px_rgba(255,143,163,0.9)]">
              {pending}
            </span>
          )}
        </Link>
      </div>

      {loading ? (
        <div className="mt-4 space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-14 animate-pulse rounded-2xl bg-white/40" />
          ))}
        </div>
      ) : shown.length === 0 ? (
        <div className="mt-4 rounded-2xl bg-white/50 p-4 text-center ring-1 ring-white/60">
          <span className="mx-auto grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-rpg-quest/80 to-rpg-hp/80 text-white shadow-[0_14px_28px_-14px_rgba(124,109,245,0.8)]">
            <Icon name="users" size={18} />
          </span>
          <p className="mt-3 text-sm text-ink-700">
            Zaproś pierwszego kompana — razem poziomujecie szybciej.
          </p>
        </div>
      ) : (
        <ul className="mt-4 space-y-2.5">
          {shown.map((m, i) => (
            <motion.li
              key={m.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <button
                type="button"
                onClick={() => setSelected(m)}
                className="flex w-full items-center gap-3 rounded-2xl bg-white/50 px-3 py-2 text-left ring-1 ring-white/60 transition hover:bg-white/70"
              >
                <AvatarImage avatar={m.avatar} seed={m.id} size={40} status="online" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink-900">{m.username}</p>
                  <p className="truncate text-xs text-ink-500">
                    Poziom {m.level} · Seria {m.streak}
                  </p>
                </div>
                <span className="grid h-7 w-7 place-items-center rounded-full bg-white/70 text-rpg-quest ring-1 ring-white/70">
                  <Icon name="arrow" size={12} />
                </span>
              </button>
            </motion.li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={() => navigate('/friends')}
        className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-2xl border border-dashed border-rpg-quest/50 bg-rpg-quest/5 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-rpg-quest transition-colors hover:bg-rpg-quest/10"
      >
        <Icon name="userPlus" size={13} />
        {friends.length > 0 ? 'Zarządzaj gildią' : 'Zaproś do gildii'}
        {pending > 0 && (
          <span className="rounded-full bg-rpg-hp/85 px-1.5 py-0.5 text-[10px] font-bold text-white">
            {pending}
          </span>
        )}
      </button>

      {selected && (
        <FriendDetailModal
          friend={selected}
          onClose={() => setSelected(null)}
          onRemoved={(id) => setFriends((prev) => prev.filter((f) => f.id !== id))}
        />
      )}
    </GlassPanel>
  );
}
