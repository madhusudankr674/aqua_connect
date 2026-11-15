export const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

// Neutral fallback map center when device GPS is unavailable
export const DEFAULT_MAP_CENTER = {
  lat: 20.5937,
  lng: 78.9629,
};

export const DEMO_MAP_ID = 'DEMO_MAP_ID';

export const GMP_ATTRIBUTION_IDS = ['gmp_mcp_codeassist_v1_aistudio'];
