export default function GlassPanel({
  as: Tag = 'section',
  variant = 'default',
  className = '',
  children,
  ...rest
}) {
  const base =
    variant === 'quest'
      ? 'glass-card-quest'
      : variant === 'soft'
      ? 'glass-soft'
      : 'glass';
  return (
    <Tag
      className={`${base} rounded-[2.5rem] ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}
