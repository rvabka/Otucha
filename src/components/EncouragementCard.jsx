import GlassPanel from './GlassPanel';
import Icon from './Icon';

export default function EncouragementCard() {
  return (
    <GlassPanel variant="soft" className="relative overflow-hidden p-5">
      <span className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-rpg-xp/40 blur-2xl" />
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-rpg-xp/25 text-rpg-xp">
          <Icon name="sparkle" size={16} />
        </span>
        <div>
          <p className="font-display text-sm font-semibold text-ink-900">
            Drobne kroki budują Twoją moc
          </p>
          <p className="mt-1 text-xs leading-relaxed text-ink-700">
            Opowiedz znajomemu o dzisiejszym queście — dostaniesz bonus +20 XP
            do wieczora.
          </p>
        </div>
      </div>
    </GlassPanel>
  );
}
