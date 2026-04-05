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

export const COUNTRY_COORDS = {
  'IND': [20.59, 78.96], 'TUR': [38.96, 35.24], 'ARG': [-38.41, -63.61], 'PAK': [30.37, 69.34], 'LKA': [7.87, 80.77],
  'EGY': [26.82, 30.80], 'NGA': [9.08, 8.67], 'BRA': [-14.23, -51.92], 'ZAF': [-30.55, 22.93], 'IDN': [-0.78, 113.92],
  'MEX': [23.63, -102.55], 'BGD': [23.68, 90.35], 'GHA': [7.94, -1.02], 'KEN': [-0.02, 37.90], 'PHL': [12.87, 121.77],
  'VEN': [6.42, -66.58], 'COL': [4.57, -74.29], 'PER': [-9.19, -75.01], 'CHL': [-35.67, -71.54], 'BOL': [-16.29, -63.58],
  'UKR': [48.37, 31.16], 'ROU': [45.94, 24.96], 'HUN': [47.16, 19.50], 'SRB': [44.01, 21.00], 'KAZ': [48.01, 66.92],
  'LBN': [33.85, 35.86], 'JOR': [31.24, 36.56], 'TUN': [33.88, 9.53], 'MAR': [31.79, -7.09], 'DZA': [28.03, 1.65],
  'VNM': [14.05, 108.27], 'THA': [15.87, 100.99], 'MYS': [4.21, 101.97], 'MMR': [21.91, 95.95], 'ETH': [9.14, 40.48],
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
