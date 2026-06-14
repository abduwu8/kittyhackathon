export type ToasterCatTheme = {
  id: string;
  image: number;
  backgroundColor: string;
  borderColor: string;
  titleColor: string;
  messageColor: string;
};

export const TOASTER_CAT_THEMES: ToasterCatTheme[] = [
  {
    id: 'toaster1',
    image: require('../toastercats/toaster1.png'),
    backgroundColor: '#FFF4E8',
    borderColor: '#E8B887',
    titleColor: '#6B3F1F',
    messageColor: '#8B5E3C',
  },
  {
    id: 'toaster2',
    image: require('../toastercats/toaster2.png'),
    backgroundColor: '#FFF0DE',
    borderColor: '#DFA56E',
    titleColor: '#5A3418',
    messageColor: '#7A4E28',
  },
  {
    id: 'toaster3',
    image: require('../toastercats/toaster3.png'),
    backgroundColor: '#FFF8EC',
    borderColor: '#F0C27B',
    titleColor: '#7A4516',
    messageColor: '#9A5A24',
  },
  {
    id: 'toaster4',
    image: require('../toastercats/toaster4.png'),
    backgroundColor: '#FDEFDD',
    borderColor: '#D9A56A',
    titleColor: '#4F2E14',
    messageColor: '#6E4524',
  },
];

export function pickRandomToasterCatTheme() {
  const index = Math.floor(Math.random() * TOASTER_CAT_THEMES.length);
  return TOASTER_CAT_THEMES[index];
}
