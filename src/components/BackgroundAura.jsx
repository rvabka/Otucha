const particles = Array.from({ length: 18 }).map((_, i) => ({
  id: i,
  left: Math.random() * 100,
  top: Math.random() * 100,
  size: 2 + Math.random() * 4,
  delay: Math.random() * 4,
  duration: 14 + Math.random() * 10,
}));

export default function BackgroundAura() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full bg-aura-sky opacity-60 blur-3xl animate-drift" />
      <div
        className="absolute top-1/3 -right-32 h-[460px] w-[460px] rounded-full bg-aura-blush opacity-55 blur-3xl animate-drift"
        style={{ animationDelay: '-6s' }}
      />
      <div
        className="absolute -bottom-40 left-1/3 h-[520px] w-[520px] rounded-full bg-aura-lavender opacity-60 blur-3xl animate-drift"
        style={{ animationDelay: '-10s' }}
      />
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute rounded-full bg-white animate-sparkle"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: p.size,
            height: p.size,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            boxShadow: '0 0 10px 2px rgba(255,255,255,0.7)',
          }}
        />
      ))}
    </div>
  );
}
