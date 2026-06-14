export type DashboardSection =
  | 'home'
  | 'profile'
  | 'litter'
  | 'medication'
  | 'vaccination'
  | 'feeding'
  | 'discover'
  | 'catfacts'
  | 'story'
  | 'catbot';

export const CAT_CARE_SECTIONS: DashboardSection[] = [
  'litter',
  'medication',
  'vaccination',
  'feeding',
];

export function isCatCareSection(section: DashboardSection): boolean {
  return CAT_CARE_SECTIONS.includes(section);
}

export function getDefaultDashboardSection(): DashboardSection {
  return 'home';
}
