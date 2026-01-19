import React, { useEffect, useState, useMemo } from 'react';
import { fetchLaunchData } from './services/spacexService';
import { EnrichedLaunch, FilterOption, SortOption } from './types';
import { LaunchCard } from './components/LaunchCard';
import { HeroLaunch } from './components/HeroLaunch';
import { FilterBar } from './components/FilterBar';
import { LoadingSpinner } from './components/LoadingSpinner';
import { RefreshCw, WifiOff } from 'lucide-react';

const App: React.FC = () => {
  const [launches, setLaunches] = useState<EnrichedLaunch[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Filter & Sort State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOption, setFilterOption] = useState<FilterOption>('All');
  const [sortOption, setSortOption] = useState<SortOption>('date_asc');

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchLaunchData();
      // Filter out past launches just in case API returns them in upcoming
      const now = new Date().toISOString();
      const upcoming = data.filter(l => l.date_utc >= now || l.upcoming);
      setLaunches(upcoming);
      setLastUpdated(new Date());
    } catch (err) {
      setError('Failed to load launch data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Auto refresh every 5 minutes
    const interval = setInterval(loadData, 5 * 60 * 1000);

    // Network status listeners
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Filter Logic
  const filteredLaunches = useMemo(() => {
    let result = launches;

    // Search
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(l => 
        l.name.toLowerCase().includes(lower) || 
        (l.details || '').toLowerCase().includes(lower) ||
        l.rocketData?.name.toLowerCase().includes(lower)
      );
    }

    // Category Filter
    if (filterOption !== 'All') {
      result = result.filter(l => {
        if (filterOption === 'Falcon 9') return l.rocketData?.name.includes('Falcon 9');
        if (filterOption === 'Falcon Heavy') return l.rocketData?.name.includes('Falcon Heavy');
        if (filterOption === 'Starship') return l.rocketData?.name.includes('Starship');
        
        // Naive heuristic for mission types based on names/details
        const text = (l.name + ' ' + (l.details || '')).toLowerCase();
        if (filterOption === 'Starlink') return text.includes('starlink');
        if (filterOption === 'Crew') return text.includes('crew') || text.includes('axiom') || text.includes('artemis');
        if (filterOption === 'Cargo') return text.includes('supply') || text.includes('dragon') || text.includes('gps');
        return true;
      });
    }

    // Sort
    result.sort((a, b) => {
      const dateA = new Date(a.date_utc).getTime();
      const dateB = new Date(b.date_utc).getTime();
      return sortOption === 'date_asc' ? dateA - dateB : dateB - dateA;
    });

    return result;
  }, [launches, searchTerm, filterOption, sortOption]);

  const nextLaunch = useMemo(() => {
    if (launches.length === 0) return null;
    // Sort by date ascending to find the absolute next one
    const sorted = [...launches].sort((a, b) => new Date(a.date_utc).getTime() - new Date(b.date_utc).getTime());
    return sorted[0];
  }, [launches]);


  return (
    <div className="min-h-screen bg-space-900 text-gray-100 font-sans pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* Header */}
        <header className="flex justify-between items-center mb-8 pb-4 border-b border-space-700">
          <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white flex items-center">
                  <span className="text-brand-accent mr-2">✦</span>
                  SpaceX Tracker
              </h1>
              <p className="text-sm text-gray-400 mt-1">Real-time launch schedule (2025-2026)</p>
          </div>
          <div className="flex items-center gap-4">
              {isOffline && (
                  <span className="flex items-center text-yellow-500 text-xs font-bold bg-yellow-500/10 px-3 py-1 rounded-full">
                      <WifiOff className="w-3 h-3 mr-1" />
                      OFFLINE
                  </span>
              )}
               <button 
                onClick={loadData} 
                className="p-2 rounded-full hover:bg-space-800 text-gray-400 hover:text-white transition-colors"
                title={`Last updated: ${lastUpdated.toLocaleTimeString()}`}
               >
                 <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
               </button>
          </div>
        </header>

        {/* Hero Section */}
        {nextLaunch && !loading && !searchTerm && filterOption === 'All' && (
             <HeroLaunch launch={nextLaunch} />
        )}

        {/* Filters */}
        <FilterBar 
            searchTerm={searchTerm} 
            setSearchTerm={setSearchTerm}
            filterOption={filterOption}
            setFilterOption={setFilterOption}
            sortOption={sortOption}
            setSortOption={setSortOption}
        />

        {/* Content Area */}
        {loading && launches.length === 0 ? (
          <LoadingSpinner />
        ) : error && launches.length === 0 ? (
          <div className="text-center py-20 bg-space-800 rounded-xl">
             <h2 className="text-xl text-red-400 mb-2">Connection Error</h2>
             <p className="text-gray-400">{error}</p>
             <button onClick={loadData} className="mt-4 text-brand-accent hover:underline">Try Again</button>
          </div>
        ) : filteredLaunches.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
             <p className="text-xl">No upcoming launches found.</p>
             <button onClick={() => {setSearchTerm(''); setFilterOption('All');}} className="mt-2 text-brand-accent">Clear Filters</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLaunches.map((launch) => (
              <LaunchCard key={launch.id} launch={launch} />
            ))}
          </div>
        )}

        {/* Footer */}
        <footer className="mt-20 border-t border-space-800 pt-8 text-center text-gray-600 text-sm">
            <p>Data provided by The Space Devs (Launch Library 2).</p>
            <p className="mt-2">Not affiliated with SpaceX.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
