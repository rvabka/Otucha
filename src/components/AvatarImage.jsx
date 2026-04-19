import { getAvatar } from '../data/avatars';
import Avatar from './Avatar';

export default function AvatarImage({
  avatar,
  seed = 0,
  size = 48,
  status,
  ring = true,
  className = ''
}) {
  const data = getAvatar(avatar);

  if (!data) {
    return <Avatar seed={seed} size={size} status={status} ring={ring} />;
  }

  return (
    <span
      className={`relative inline-flex shrink-0 select-none ${className}`}
      style={{ width: size, height: size }}
    >
      <span
        className={`relative block h-full w-full overflow-hidden rounded-full ${
          ring ? 'ring-2 ring-white/80' : ''
        } shadow-[0_10px_28px_-12px_rgba(76,60,140,0.45)]`}
      >
        <img
          src={data.src}
          alt={data.label}
          draggable={false}
          className="h-full w-full object-cover object-top"
        />
      </span>
    </span>
  );
}
