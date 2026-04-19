/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Fraunces"', 'ui-serif', 'Georgia', 'serif'],
        sans: ['"Manrope"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: {
          900: '#1a1a3a',
          700: '#3b3867',
          500: '#6b6a9a',
          300: '#9a9ac0',
        },
        aura: {
          sky: '#b8d4ff',
          lavender: '#c9b8ff',
          blush: '#f5c4e0',
          mint: '#c8f0dc',
        },
        rpg: {
          hp: '#ff8fa3',
          mp: '#8bb8ff',
          xp: '#f5c76a',
          quest: '#7c6df5',
          sage: '#7dd3b8',
        },
      },
      boxShadow: {
        glass:
          '0 1px 0 0 rgba(255,255,255,0.6) inset, 0 -1px 0 0 rgba(255,255,255,0.25) inset, 0 20px 60px -20px rgba(76, 60, 140, 0.25)',
        glow: '0 0 40px -8px rgba(124, 109, 245, 0.55)',
        softpink: '0 0 40px -8px rgba(255, 143, 163, 0.55)',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
        '6xl': '3rem',
        '7xl': '3.5rem',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        drift: {
          '0%': { transform: 'translate3d(0,0,0)' },
          '50%': { transform: 'translate3d(20px,-30px,0)' },
          '100%': { transform: 'translate3d(0,0,0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        wave: {
          '0%, 100%': { transform: 'scaleY(0.4)' },
          '50%': { transform: 'scaleY(1)' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        sparkle: {
          '0%, 100%': { opacity: '0.2', transform: 'scale(0.8)' },
          '50%': { opacity: '1', transform: 'scale(1.1)' },
        },
        confettiFall: {
          '0%': { transform: 'translate(0, -20vh) rotate(0deg)', opacity: '0' },
          '8%': { opacity: '1' },
          '100%': {
            transform:
              'translate(var(--sway, 0), 110vh) rotate(var(--rot, 0deg))',
            opacity: '1',
          },
        },
        xpBlast: {
          '0%': { opacity: '0', transform: 'translate(-50%, -50%) scale(0.3)' },
          '12%': { opacity: '1', transform: 'translate(-50%, -50%) scale(1.35)' },
          '22%': { transform: 'translate(-50%, -50%) scale(0.95)' },
          '32%': { transform: 'translate(-50%, -50%) scale(1.05)' },
          '42%': { transform: 'translate(-50%, -50%) scale(1)' },
          '75%': { opacity: '1', transform: 'translate(-50%, -58%) scale(1)' },
          '100%': { opacity: '0', transform: 'translate(-50%, -80%) scale(0.9)' },
        },
        screenFlash: {
          '0%': { opacity: '0' },
          '12%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        drift: 'drift 18s ease-in-out infinite',
        shimmer: 'shimmer 3s linear infinite',
        wave: 'wave 1.1s ease-in-out infinite',
        fadeUp: 'fadeUp 0.7s ease-out both',
        sparkle: 'sparkle 2.4s ease-in-out infinite',
        confettiFall: 'confettiFall 3s cubic-bezier(0.23, 1, 0.32, 1) forwards',
        xpBlast: 'xpBlast 2.6s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        screenFlash: 'screenFlash 0.9s ease-out forwards',
      },
    },
  },
  plugins: [],
};
