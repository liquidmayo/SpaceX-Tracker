export interface Rocket {
  id: string;
  name: string;
  type: string;
  description: string;
}

export interface Launchpad {
  id: string;
  name: string;
  full_name: string;
  locality: string;
  region: string;
  timezone: string;
}

export interface LaunchLinks {
  patch: {
    small: string | null; // Mission patch
    large: string | null; // Rocket photo or large patch
  };
  webcast: string | null;
  youtube_id: string | null;
  article: string | null;
  wikipedia: string | null;
}

// Enriched launch object used by the UI
export interface EnrichedLaunch {
  id: string;
  name: string;
  date_utc: string;
  date_unix: number;
  date_local: string;
  date_precision: 'hour' | 'day' | 'month' | 'half' | 'quarter' | 'year';
  static_fire_date_utc: string | null;
  upcoming: boolean;
  flight_number: number | null;
  details: string | null;
  links: LaunchLinks;
  rocketData?: Rocket;
  launchpadData?: Launchpad;
}

export type SortOption = 'date_asc' | 'date_desc';
export type FilterOption = 'All' | 'Starlink' | 'Crew' | 'Cargo' | 'Falcon 9' | 'Falcon Heavy' | 'Starship';
