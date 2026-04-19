import { NavLink } from 'react-router-dom';
import Icon from './Icon';

const items = [
  { to: '/app', label: 'Dziennik', icon: 'journal' },
  { to: '/chat', label: 'Chat GM', icon: 'chat' },
  { to: '/friends', label: 'Gildia', icon: 'users' },
  { to: '/profil', label: 'Profil', icon: 'profile' },
];

export default function MobileNav() {
  return (
    <nav
      className="fixed inset-x-3 bottom-3 z-30 lg:hidden"
      aria-label="Nawigacja"
    >
      <ul className="glass flex items-center justify-between gap-1 rounded-full px-2 py-2">
        {items.map(({ to, label, icon }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end={to === '/app'}
              className={({ isActive }) =>
                `group flex flex-col items-center gap-0.5 rounded-full py-1.5 text-[10px] font-semibold transition-colors ${
                  isActive
                    ? 'bg-white/80 text-rpg-quest shadow-glow'
                    : 'text-ink-500 hover:text-ink-900'
                }`
              }
            >
              <Icon name={icon} size={18} />
              <span className="uppercase tracking-wider">{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
