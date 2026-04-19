import babeczkaIdle from './babeczka.png';
import babeczkaTalk from './animacjaMowienia.mp4';
import blondiIdle from './blondyneczka.jpg';
import blondiTalk from './blondi.mp4';
import ziutekIdle from './ziutek.jpg';
import ziutekTalk from './ziutek_gada.mp4';

export const CHARACTERS = [
  {
    agentId: 'mindbuddy',
    name: 'Babeczka',
    tagline: 'Twój kumpel od głowy',
    idle: babeczkaIdle,
    talk: babeczkaTalk,
    accent: '#ff8fa3',
    gradient: 'linear-gradient(135deg, #ff8fa3 0%, #ffc4d6 60%, #ffe0ec 100%)',
    halo: 'rgba(255, 143, 163, 0.55)',
  },
  {
    agentId: 'journal_companion',
    name: 'Blondi',
    tagline: 'Razem zapiszemy myśli',
    idle: blondiIdle,
    talk: blondiTalk,
    accent: '#f5c76a',
    gradient: 'linear-gradient(135deg, #f5c76a 0%, #ffe0a3 55%, #fff4d6 100%)',
    halo: 'rgba(245, 199, 106, 0.55)',
  },
  {
    agentId: 'mindfulness',
    name: 'Ziutek',
    tagline: 'Spokojny oddech, spokojna głowa',
    idle: ziutekIdle,
    talk: ziutekTalk,
    accent: '#7dd3b8',
    gradient: 'linear-gradient(135deg, #7dd3b8 0%, #b6ecd5 55%, #e1f7ec 100%)',
    halo: 'rgba(125, 211, 184, 0.55)',
  },
];

export const getCharacter = (agentId) =>
  CHARACTERS.find((c) => c.agentId === agentId) || CHARACTERS[0];
