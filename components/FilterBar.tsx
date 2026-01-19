import React from 'react';
import { FilterOption, SortOption } from '../types';
import { Search, Filter, ArrowUpDown } from 'lucide-react';

interface Props {
  searchTerm: string;
  setSearchTerm: (s: string) => void;
  filterOption: FilterOption;
  setFilterOption: (f: FilterOption) => void;
  sortOption: SortOption;
  setSortOption: (s: SortOption) => void;
}

export const FilterBar: React.FC<Props> = ({
  searchTerm,
  setSearchTerm,
  filterOption,
  setFilterOption,
  sortOption,
  setSortOption,
}) => {
  return (
    <div className="bg-space-800 p-4 rounded-xl border border-space-700 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between sticky top-4 z-40 shadow-xl shadow-black/50 backdrop-blur-sm bg-opacity-95">
      
      {/* Search */}
      <div className="relative w-full md:w-auto flex-1 max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-500" />
        </div>
        <input
          type="text"
          placeholder="Search mission..."
          className="bg-space-900 border border-space-700 text-white text-sm rounded-lg focus:ring-brand-accent focus:border-brand-accent block w-full pl-10 p-2.5 placeholder-gray-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Controls Group */}
      <div className="flex gap-4 w-full md:w-auto">
        {/* Filter Dropdown */}
        <div className="relative flex-1 md:flex-none">
            <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                 <Filter className="h-4 w-4 text-gray-500" />
            </div>
            <select
                className="bg-space-900 border border-space-700 text-white text-sm rounded-lg focus:ring-brand-accent focus:border-brand-accent block w-full pl-8 p-2.5 appearance-none cursor-pointer"
                value={filterOption}
                onChange={(e) => setFilterOption(e.target.value as FilterOption)}
            >
                <option value="All">All Missions</option>
                <option value="Starlink">Starlink</option>
                <option value="Crew">Crewed</option>
                <option value="Cargo">Cargo</option>
                <option value="Falcon 9">Falcon 9</option>
                <option value="Falcon Heavy">Falcon Heavy</option>
            </select>
        </div>

        {/* Sort Dropdown */}
        <div className="relative flex-1 md:flex-none">
            <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                 <ArrowUpDown className="h-4 w-4 text-gray-500" />
            </div>
             <select
                className="bg-space-900 border border-space-700 text-white text-sm rounded-lg focus:ring-brand-accent focus:border-brand-accent block w-full pl-8 p-2.5 appearance-none cursor-pointer"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as SortOption)}
            >
                <option value="date_asc">Date: Soonest</option>
                <option value="date_desc">Date: Latest</option>
            </select>
        </div>
      </div>
    </div>
  );
};
