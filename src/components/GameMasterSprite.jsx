import Icon from './Icon';

export default function GameMasterSprite({ speaking = true, message }) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative animate-float">
        <div className="absolute inset-0 -z-10 rounded-full bg-rpg-quest/30 blur-xl" />
        <div className="relative h-[72px] w-[72px] rounded-full bg-gradient-to-br from-white/90 to-white/50 p-1 shadow-glass ring-1 ring-white/70">
          <div className="relative h-full w-full overflow-hidden rounded-full bg-gradient-to-br from-aura-sky via-aura-lavender to-aura-blush">
            <svg viewBox="0 0 80 80" className="absolute inset-0">
              <defs>
                <radialGradient id="gm-cheek" cx="0.5" cy="0.5" r="0.5">
                  <stop offset="0%" stopColor="#ff9bb6" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#ff9bb6" stopOpacity="0" />
                </radialGradient>
              </defs>
              <ellipse cx="40" cy="52" rx="20" ry="15" fill="#ffffff" opacity="0.9" />
              <path
                d="M22 32 Q22 18 40 18 Q58 18 58 32 L58 46 Q58 54 40 54 Q22 54 22 46 Z"
                fill="#ffffff"
                opacity="0.95"
              />
              <circle cx="40" cy="14" r="2.2" fill="#7c6df5" />
              <line x1="40" y1="16" x2="40" y2="20" stroke="#7c6df5" strokeWidth="1.5" />
              <circle cx="31" cy="34" r="3.2" fill="#1a1a3a" />
              <circle cx="49" cy="34" r="3.2" fill="#1a1a3a" />
              <circle cx="32" cy="33" r="1" fill="#ffffff" />
              <circle cx="50" cy="33" r="1" fill="#ffffff" />
              <ellipse cx="27" cy="41" rx="4" ry="2.5" fill="url(#gm-cheek)" />
              <ellipse cx="53" cy="41" rx="4" ry="2.5" fill="url(#gm-cheek)" />
              <path
                d="M36 42 Q40 46 44 42"
                stroke="#1a1a3a"
                strokeWidth="1.8"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          </div>
        </div>
        <span className="absolute -bottom-1 -right-1 grid h-6 w-6 place-items-center rounded-full bg-rpg-sage text-white ring-2 ring-white">
          <Icon name="sparkle" size={12} />
        </span>
      </div>

      <div className="relative max-w-[220px] rounded-2xl rounded-bl-md bg-white/75 px-4 py-3 text-sm leading-relaxed text-ink-900 ring-1 ring-white/80 backdrop-blur-md">
        <span
          aria-hidden="true"
          className="absolute -left-1.5 bottom-2 h-3 w-3 rotate-45 bg-white/75"
        />
        <p className="text-balance">
          {message ?? 'Oddychaj powoli. Zostało kilka kroków, dasz radę!'}
        </p>
        {speaking && (
          <div
            className="mt-2 flex items-end gap-0.5 text-rpg-quest"
            aria-label="Mistrz Gry mówi"
          >
            {[0.2, 0.5, 0.8, 0.4, 0.9, 0.3, 0.6, 0.4].map((h, i) => (
              <span
                key={i}
                className="block w-1 animate-wave rounded-full bg-current"
                style={{
                  height: `${10 + h * 14}px`,
                  animationDelay: `${i * 0.08}s`,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
