import { useState } from 'react';
import Icon from './Icon';

export default function AuthInput({
  icon,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  autoComplete,
  required,
  minLength,
  togglePassword = false,
  hint,
  error,
  name,
}) {
  const [show, setShow] = useState(false);
  const isPwd = type === 'password';
  const effectiveType = togglePassword && show ? 'text' : type;

  return (
    <label className="block">
      {label && (
        <span className="mb-1.5 ml-1 block text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-500">
          {label}
        </span>
      )}
      <span
        className={`group relative flex items-center rounded-2xl bg-white/55 ring-1 transition ${
          error
            ? 'ring-rpg-hp/70 focus-within:ring-rpg-hp'
            : 'ring-white/60 focus-within:ring-rpg-quest/60 focus-within:bg-white/70'
        } focus-within:shadow-[0_0_0_4px_rgba(124,109,245,0.12)]`}
      >
        {icon && (
          <span className="pl-4 text-ink-500">
            <Icon name={icon} size={18} />
          </span>
        )}
        <input
          name={name}
          type={effectiveType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          minLength={minLength}
          className="w-full bg-transparent px-4 py-3 text-sm font-medium text-ink-900 placeholder:text-ink-300 focus:outline-none"
        />
        {isPwd && togglePassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="mr-3 rounded-full p-1.5 text-ink-500 transition hover:bg-white/60 hover:text-ink-700"
            aria-label={show ? 'Ukryj hasło' : 'Pokaż hasło'}
          >
            <Icon name={show ? 'eyeOff' : 'eye'} size={16} />
          </button>
        )}
      </span>
      {(error || hint) && (
        <span
          className={`mt-1.5 ml-1 block text-[11px] ${
            error ? 'text-rpg-hp' : 'text-ink-500'
          }`}
        >
          {error || hint}
        </span>
      )}
    </label>
  );
}
