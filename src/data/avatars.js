import boy1 from './boy1.png';
import boy2 from './boy2.png';
import boy3 from './boy3.png';
import boy4 from './boy4.png';
import girl1 from './girl1.png';
import girl2 from './girl2.png';

// Indexy 1..6. `0` to „nie wybrano" (domyślna wartość nowego konta z backendu).
export const avatars = [
  { id: 1, src: boy1, label: 'Wiatrogon', hint: 'Chłopak', tone: 'sky' },
  { id: 2, src: boy2, label: 'Iskrowit', hint: 'Chłopak', tone: 'lavender' },
  { id: 3, src: boy3, label: 'Leśnik', hint: 'Chłopak', tone: 'mint' },
  { id: 4, src: boy4, label: 'Kryształ', hint: 'Chłopak', tone: 'blush' },
  { id: 5, src: girl1, label: 'Świt', hint: 'Dziewczyna', tone: 'blush' },
  { id: 6, src: girl2, label: 'Szałwia', hint: 'Dziewczyna', tone: 'lavender' },
];

export function getAvatar(index) {
  if (index == null || index === 0) return null;
  return avatars.find((a) => a.id === index) || null;
}
