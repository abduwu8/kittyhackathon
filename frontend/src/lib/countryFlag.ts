const COUNTRY_CODES: Record<string, string> = {
  afghanistan: 'AF',
  algeria: 'DZ',
  argentina: 'AR',
  armenia: 'AM',
  australia: 'AU',
  austria: 'AT',
  bangladesh: 'BD',
  belgium: 'BE',
  brazil: 'BR',
  burma: 'MM',
  cambodia: 'KH',
  canada: 'CA',
  chile: 'CL',
  china: 'CN',
  colombia: 'CO',
  cuba: 'CU',
  denmark: 'DK',
  egypt: 'EG',
  ethiopia: 'ET',
  finland: 'FI',
  france: 'FR',
  germany: 'DE',
  greece: 'GR',
  india: 'IN',
  indonesia: 'ID',
  iran: 'IR',
  iraq: 'IQ',
  ireland: 'IE',
  israel: 'IL',
  italy: 'IT',
  japan: 'JP',
  kenya: 'KE',
  korea: 'KR',
  lebanon: 'LB',
  malaysia: 'MY',
  mexico: 'MX',
  morocco: 'MA',
  myanmar: 'MM',
  nepal: 'NP',
  netherlands: 'NL',
  'new zealand': 'NZ',
  norway: 'NO',
  pakistan: 'PK',
  peru: 'PE',
  philippines: 'PH',
  poland: 'PL',
  portugal: 'PT',
  qatar: 'QA',
  russia: 'RU',
  'saudi arabia': 'SA',
  scotland: 'GB',
  singapore: 'SG',
  'south africa': 'ZA',
  spain: 'ES',
  sweden: 'SE',
  switzerland: 'CH',
  syria: 'SY',
  taiwan: 'TW',
  thailand: 'TH',
  tunisia: 'TN',
  turkey: 'TR',
  'united arab emirates': 'AE',
  'united kingdom': 'GB',
  'united states': 'US',
  vietnam: 'VN',
  wales: 'GB',
  yemen: 'YE',
};

function codeToFlag(code: string): string {
  const upper = code.toUpperCase();

  if (upper.length !== 2 || !/^[A-Z]{2}$/.test(upper)) {
    return '🌍';
  }

  const points = [...upper].map((char) => 0x1f1e6 + char.charCodeAt(0) - 65);
  return String.fromCodePoint(...points);
}

function findCountryCodes(country: string): string[] {
  const normalized = country.toLowerCase().trim();

  if (!normalized) {
    return [];
  }

  if (COUNTRY_CODES[normalized]) {
    return [COUNTRY_CODES[normalized]];
  }

  const matches: string[] = [];

  for (const [name, code] of Object.entries(COUNTRY_CODES)) {
    if (normalized.includes(name)) {
      matches.push(code);
    }
  }

  return [...new Set(matches)];
}

export function getCountryFlags(country: string): string {
  const codes = findCountryCodes(country);

  if (codes.length === 0) {
    return '🌍';
  }

  return codes.map(codeToFlag).join(' ');
}

export function getPrimaryCountryLabel(country: string): string {
  const trimmed = country.trim();
  return trimmed || 'unknown origin';
}
