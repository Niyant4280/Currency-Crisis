// Shared country metadata — single source of truth for all components

export const ISO_TO_FLAG = {
  // Original 15
  'IND': 'in', 'TUR': 'tr', 'ARG': 'ar', 'PAK': 'pk', 'LKA': 'lk',
  'EGY': 'eg', 'NGA': 'ng', 'BRA': 'br', 'ZAF': 'za', 'IDN': 'id',
  'MEX': 'mx', 'BGD': 'bd', 'GHA': 'gh', 'KEN': 'ke', 'PHL': 'ph',
  // New 20
  'VEN': 've', 'COL': 'co', 'PER': 'pe', 'CHL': 'cl', 'BOL': 'bo',
  'UKR': 'ua', 'ROU': 'ro', 'HUN': 'hu', 'SRB': 'rs', 'KAZ': 'kz',
  'LBN': 'lb', 'JOR': 'jo', 'TUN': 'tn', 'MAR': 'ma', 'DZA': 'dz',
  'VNM': 'vn', 'THA': 'th', 'MYS': 'my', 'MMR': 'mm', 'ETH': 'et',
};

export const REGION_MAP = {
  // Asia
  'IND': 'Asia', 'PAK': 'Asia', 'LKA': 'Asia', 'IDN': 'Asia',
  'BGD': 'Asia', 'PHL': 'Asia', 'KAZ': 'Asia', 'VNM': 'Asia',
  'THA': 'Asia', 'MYS': 'Asia', 'MMR': 'Asia',
  // Europe
  'TUR': 'Europe', 'UKR': 'Europe', 'ROU': 'Europe', 'HUN': 'Europe', 'SRB': 'Europe',
  // LatAm
  'ARG': 'LatAm', 'BRA': 'LatAm', 'MEX': 'LatAm', 'VEN': 'LatAm',
  'COL': 'LatAm', 'PER': 'LatAm', 'CHL': 'LatAm', 'BOL': 'LatAm',
  // Africa
  'EGY': 'Africa', 'NGA': 'Africa', 'ZAF': 'Africa', 'GHA': 'Africa',
  'KEN': 'Africa', 'ETH': 'Africa',
  // MENA
  'LBN': 'MENA', 'JOR': 'MENA', 'TUN': 'MENA', 'MAR': 'MENA', 'DZA': 'MENA',
};

// World Map: TopoJSON numeric ID → our Alpha-3 code
export const NUMERIC_TO_ALPHA3 = {
  '356': 'IND', '792': 'TUR', '032': 'ARG', '586': 'PAK', '144': 'LKA',
  '818': 'EGY', '566': 'NGA', '076': 'BRA', '710': 'ZAF', '360': 'IDN',
  '484': 'MEX', '050': 'BGD', '288': 'GHA', '404': 'KEN', '608': 'PHL',
  '862': 'VEN', '170': 'COL', '604': 'PER', '152': 'CHL', '068': 'BOL',
  '804': 'UKR', '642': 'ROU', '348': 'HUN', '688': 'SRB', '398': 'KAZ',
  '422': 'LBN', '400': 'JOR', '788': 'TUN', '504': 'MAR', '012': 'DZA',
  '704': 'VNM', '764': 'THA', '458': 'MYS', '104': 'MMR', '231': 'ETH',
};
