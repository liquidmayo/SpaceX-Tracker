import axios from 'axios';
import { EnrichedLaunch } from '../types';

const API_URL = 'https://ll.thespacedevs.com/2.2.0/launch/upcoming/';
const CACHE_KEY = 'spacex_data_cache_v2';
const CACHE_DURATION = 1000 * 60 * 15; // 15 minutes cache due to stricter rate limits

// Realistic fallback data for 2025/2026 in case API rate limits (15 req/hr) are hit
const MOCK_LAUNCHES: EnrichedLaunch[] = [
  {
    id: 'mock-1',
    name: 'Starship | Integrated Flight Test 7',
    date_utc: '2025-06-15T13:00:00Z',
    date_unix: 1750002000000,
    date_local: '2025-06-15T08:00:00-05:00',
    date_precision: 'day',
    static_fire_date_utc: null,
    upcoming: true,
    flight_number: 7,
    details: 'Seventh integrated flight test of the Starship system, focusing on orbital insertion and recovery of the Super Heavy booster.',
    links: {
      patch: { small: 'https://upload.wikimedia.org/wikipedia/commons/e/ee/Starship_S24_on_B7.jpg', large: 'https://upload.wikimedia.org/wikipedia/commons/e/ee/Starship_S24_on_B7.jpg' },
      webcast: 'https://www.youtube.com/spacex',
      youtube_id: null,
      article: null,
      wikipedia: null
    },
    rocketData: { id: 'starship', name: 'Starship', type: 'Rocket', description: 'Super Heavy Starship Launch Vehicle' },
    launchpadData: { id: 'starbase', name: 'Orbital Launch Mount A', full_name: 'Starbase, Boca Chica, TX', locality: 'Starbase', region: 'Texas', timezone: 'America/Chicago' }
  },
  {
    id: 'mock-2',
    name: 'Falcon 9 Block 5 | Starlink Group 12-5',
    date_utc: '2025-02-10T22:30:00Z',
    date_unix: 1739226600000,
    date_local: '2025-02-10T17:30:00-05:00',
    date_precision: 'hour',
    static_fire_date_utc: null,
    upcoming: true,
    flight_number: 354,
    details: 'A batch of Starlink satellites for the Gen 2 constellation.',
    links: {
      patch: { small: null, large: 'https://farm5.staticflickr.com/4648/38583830575_ba6d27197c_b.jpg' },
      webcast: null,
      youtube_id: null,
      article: null,
      wikipedia: null
    },
    rocketData: { id: 'f9', name: 'Falcon 9 Block 5', type: 'Rocket', description: 'Reusable two-stage rocket.' },
    launchpadData: { id: 'cc-40', name: 'SLC-40', full_name: 'Cape Canaveral SFS, FL, USA', locality: 'Cape Canaveral', region: 'Florida', timezone: 'America/New_York' }
  },
  {
    id: 'mock-3',
    name: 'Falcon Heavy | GPS III SV10',
    date_utc: '2025-08-20T14:00:00Z',
    date_unix: 1755708000000,
    date_local: '2025-08-20T10:00:00-04:00',
    date_precision: 'month',
    static_fire_date_utc: null,
    upcoming: true,
    flight_number: 12,
    details: 'Launch of the tenth GPS III satellite for the US Space Force.',
    links: {
      patch: { small: null, large: 'https://live.staticflickr.com/65535/49493123868_733568a526_b.jpg' },
      webcast: null,
      youtube_id: null,
      article: null,
      wikipedia: null
    },
    rocketData: { id: 'fh', name: 'Falcon Heavy', type: 'Rocket', description: 'Heavy-lift launch vehicle.' },
    launchpadData: { id: 'ksc-39a', name: 'LC-39A', full_name: 'Kennedy Space Center, FL, USA', locality: 'KSC', region: 'Florida', timezone: 'America/New_York' }
  },
  {
    id: 'mock-4',
    name: 'Starship | Artemis III',
    date_utc: '2026-09-01T12:00:00Z',
    date_unix: 1788264000000,
    date_local: '2026-09-01T07:00:00-05:00',
    date_precision: 'month',
    static_fire_date_utc: null,
    upcoming: true,
    flight_number: null,
    details: 'First crewed lunar landing since Apollo 17. Starship HLS will transfer crew from Orion to the lunar surface.',
    links: {
      patch: { small: 'https://images-assets.nasa.gov/image/artemis_logo_trans_text_v1/artemis_logo_trans_text_v1~medium.png', large: 'https://images-assets.nasa.gov/image/artemis_logo_trans_text_v1/artemis_logo_trans_text_v1~medium.png' },
      webcast: null,
      youtube_id: null,
      article: null,
      wikipedia: null
    },
    rocketData: { id: 'starship-hls', name: 'Starship HLS', type: 'Rocket', description: 'Human Landing System' },
    launchpadData: { id: 'starbase', name: 'Orbital Launch Mount A', full_name: 'Starbase, Boca Chica, TX', locality: 'Starbase', region: 'Texas', timezone: 'America/Chicago' }
  }
];

interface CacheData {
  timestamp: number;
  launches: EnrichedLaunch[];
}

// Type definitions for The Space Devs API Response
interface TSDRocket {
  configuration: {
    id: number;
    name: string;
    description: string;
    full_name: string;
  };
}

interface TSDPad {
  id: number;
  name: string;
  location: {
    name: string;
    country_code: string;
  };
}

interface TSDLaunchResult {
  id: string;
  name: string;
  net: string; // ISO Date
  status: { id: number; name: string; description: string };
  launch_service_provider: { name: string };
  rocket: TSDRocket;
  mission: { description: string; type: string } | null;
  pad: TSDPad;
  webcast_live: boolean;
  image: string | null; // Rocket photo
  mission_patches: Array<{ image_url: string; agency: { name: string } }> | null;
  vidURLs: Array<{ url: string }> | null;
}

export const fetchLaunchData = async (): Promise<EnrichedLaunch[]> => {
  try {
    // Check cache first
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed: CacheData = JSON.parse(cached);
      const isExpired = Date.now() - parsed.timestamp > CACHE_DURATION;
      if (!isExpired) {
        console.log('Serving from cache (SpaceDevs)');
        return parsed.launches;
      }
    }

    console.log('Fetching fresh data from The Space Devs');
    // Fetch upcoming SpaceX launches. Limit 20 to get into 2025/2026
    const response = await axios.get(`https://ll.thespacedevs.com/2.2.0/launch/upcoming/`, {
      params: {
        search: 'SpaceX',
        mode: 'detailed',
        limit: 20
      }
    });

    const results: TSDLaunchResult[] = response.data.results;
    
    // Map to internal format
    const mappedLaunches: EnrichedLaunch[] = results.map(item => ({
      id: item.id,
      name: item.name,
      date_utc: item.net,
      date_unix: new Date(item.net).getTime(),
      date_local: item.net, // Simplified for demo
      date_precision: 'hour', // SpaceDevs usually provides precise T-0
      static_fire_date_utc: null,
      upcoming: true,
      flight_number: null, // Not strictly provided
      details: item.mission?.description || item.status.description,
      links: {
        patch: {
          small: item.mission_patches?.find(p => p.agency.name === 'SpaceX')?.image_url || item.mission_patches?.[0]?.image_url || null,
          large: item.image || null // Use rocket image as 'large' if available
        },
        webcast: item.vidURLs?.[0]?.url || null,
        youtube_id: null,
        article: null,
        wikipedia: null
      },
      rocketData: {
        id: String(item.rocket.configuration.id),
        name: item.rocket.configuration.name,
        type: 'Rocket',
        description: item.rocket.configuration.description
      },
      launchpadData: {
        id: String(item.pad.id),
        name: item.pad.name,
        full_name: item.pad.location.name,
        locality: item.pad.location.name.split(',')[0],
        region: item.pad.location.country_code,
        timezone: 'UTC'
      }
    }));

    // Cache the result
    const cachePayload: CacheData = {
      timestamp: Date.now(),
      launches: mappedLaunches,
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cachePayload));

    return mappedLaunches;

  } catch (error) {
    console.warn("SpaceDevs API Error (likely rate limit), using Mock Data fallback.", error);
    
    // Fallback to cache if available even if expired
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      console.log('Serving from expired cache due to API error');
      const parsed: CacheData = JSON.parse(cached);
      return parsed.launches;
    }

    // Fallback to Hardcoded Mock Data for 2025/2026
    return MOCK_LAUNCHES;
  }
};
