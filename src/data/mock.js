export const player = {
  name: 'Wojownik',
  class: 'Badacz Spokoju',
  level: 11,
  totalXp: 19842,
  seed: 2,
};

export const stats = {
  hp: { value: 82, max: 100 },
  mp: { value: 58, max: 100 },
  xp: { value: 1240, max: 2000 },
};

export const activeQuest = {
  title: 'Zadanie: 15 min. Uważnego Oddechu',
  description:
    'Znajdź ciche miejsce, usiądź wygodnie i podążaj za rytmem fal. Mistrz Gry poprowadzi Cię krok po kroku.',
  progress: 7,
  target: 15,
  tags: ['Relaks', 'Oddech 4-7-8', 'Spokojny wieczór'],
  xpReward: 120,
  gmMessage:
    'Oddychaj powoli. Policz do czterech przy wdechu, siedem przy zatrzymaniu. Dasz radę!',
};

export const journal = [
  {
    id: 1,
    type: 'breath',
    title: 'Poranny oddech · 5 minut',
    summary: 'Ukończono sesję "Ciche jezioro". Puls spokojny.',
    xp: 40,
    date: 'dziś · 08:12',
  },
  {
    id: 2,
    type: 'talk',
    title: 'Rozmowa z Mistrzem Gry',
    summary: 'Omówiono stres przed sprawdzianem z matematyki.',
    xp: 60,
    date: 'dziś · 07:40',
  },
  {
    id: 3,
    type: 'mood',
    title: 'Zapis nastroju',
    summary: 'Energia nieco niższa — polecona przerwa 10 min.',
    xp: -10,
    date: 'wczoraj · 21:05',
  },
  {
    id: 4,
    type: 'quest',
    title: 'Quest: Mapa uczuć',
    summary: 'Nowa wyspa odkryta: „Zatoka wdzięczności”.',
    xp: 120,
    date: 'wczoraj · 17:22',
  },
];

export const guild = [
  {
    name: 'Alicja „Szałwia"',
    note: 'Medytuje w Gaju Świerków',
    status: 'online',
    seed: 0,
  },
  {
    name: 'Mikołaj „Kometa"',
    note: 'Quest: bieg po parku',
    status: 'online',
    seed: 1,
  },
  {
    name: 'Zofia „Mgła"',
    note: 'Rysuje w Dzienniku',
    status: 'away',
    seed: 3,
  },
  {
    name: 'Bartek „Iskra"',
    note: 'Offline od 2h',
    status: 'offline',
    seed: 4,
  },
];
