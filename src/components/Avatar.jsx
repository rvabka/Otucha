const palettes = [
  ['#a4c1ff', '#d7b8ff'],
  ['#ffc1d6', '#ffd9a1'],
  ['#b9e8d1', '#a7d0ff'],
  ['#f3c3ff', '#c4ddff'],
  ['#ffd1a3', '#ffb0c4'],
  ['#c3e5ff', '#d7c6ff']
];

export default function Avatar({
  seed = 0,
  initials,
  size = 48,
  status,
  ring = true
}) {
  const [a, b] = palettes[seed % palettes.length];
  return (
    <span
      className="relative inline-flex shrink-0 select-none items-center justify-center"
      style={{ width: size, height: size }}
    >
      <span
        className={`relative grid h-full w-full place-items-center overflow-hidden rounded-full ${
          ring ? 'ring-2 ring-white/80' : ''
        } shadow-[0_8px_20px_-10px_rgba(76,60,140,0.4)]`}
        style={{ background: `linear-gradient(135deg, ${a}, ${b})` }}
      >
        <svg viewBox="0 0 48 48" className="absolute inset-0 h-full w-full">
          <circle cx="24" cy="19" r="8" fill="rgba(255,255,255,0.9)" />
          <path
            d="M8 44 C 10 32, 38 32, 40 44 Z"
            fill="rgba(255,255,255,0.85)"
          />
          <circle cx="21" cy="18" r="1.3" fill="#1a1a3a" />
          <circle cx="27" cy="18" r="1.3" fill="#1a1a3a" />
          <path
            d="M21 22 Q24 24 27 22"
            stroke="#1a1a3a"
            strokeWidth="1.2"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
        {initials && (
          <span className="relative font-display text-[13px] font-semibold text-ink-900/80">
            {initials}
          </span>
        )}
      </span>
    </span>
  );
}
