import React from 'react';
import { EnrichedLaunch } from '../types';
import { CountdownTimer } from './CountdownTimer';
import { Calendar, MapPin, Rocket as RocketIcon, Info } from 'lucide-react';
import { format } from 'date-fns';

interface Props {
  launch: EnrichedLaunch;
}

export const LaunchCard: React.FC<Props> = ({ launch }) => {
  const launchDate = new Date(launch.date_utc);
  const isTBD = launch.date_precision === 'month' || launch.date_precision === 'year';

  // Determine display image: patch > rocket image > default icon
  const displayImage = launch.links.patch.small || launch.links.patch.large;
  const isPhoto = !launch.links.patch.small && !!launch.links.patch.large;

  return (
    <div className="bg-space-800 rounded-xl overflow-hidden shadow-lg border border-space-700 hover:border-brand-accent/50 transition-all duration-300 flex flex-col h-full group">
      {/* Header with image */}
      <div className="relative h-48 bg-space-900 overflow-hidden flex items-center justify-center">
         {displayImage ? (
             <img 
               src={displayImage} 
               alt={`${launch.name} visual`} 
               className={`w-full h-full ${isPhoto ? 'object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105' : 'object-contain p-4 group-hover:scale-110'} transition-all duration-500`}
             />
         ) : (
            <div className="text-space-100 opacity-20">
                 <RocketIcon size={64} />
            </div>
         )}
         {/* Overlay gradient for text legibility if it's a photo */}
         {isPhoto && <div className="absolute inset-0 bg-gradient-to-t from-space-800 to-transparent opacity-80"></div>}
         
         {launch.flight_number && (
            <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-xs font-mono text-white border border-white/10">
                #{launch.flight_number}
            </div>
         )}
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col relative -mt-4 bg-space-800 rounded-t-xl">
        <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-bold text-white truncate w-full" title={launch.name}>{launch.name}</h3>
        </div>

        <div className="mb-4">
             <CountdownTimer targetDate={launch.date_utc} precision={launch.date_precision} />
        </div>

        <div className="space-y-2 text-sm text-gray-300 mb-4 flex-1">
            <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                <span>
                    {isTBD ? 'Date Pending' : format(launchDate, 'MMM d, yyyy h:mm aa')}
                </span>
            </div>
            <div className="flex items-center">
                <RocketIcon className="w-4 h-4 mr-2 text-gray-500" />
                <span>{launch.rocketData?.name || 'Unknown Rocket'}</span>
            </div>
             <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                <span className="truncate" title={launch.launchpadData?.full_name}>
                    {launch.launchpadData?.name || 'Unknown Pad'}, {launch.launchpadData?.region}
                </span>
            </div>
            {launch.details && (
                <div className="flex items-start mt-2 text-xs text-gray-400 line-clamp-2" title={launch.details}>
                    <Info className="w-3 h-3 mr-2 mt-0.5 flex-shrink-0" />
                    {launch.details}
                </div>
            )}
        </div>

        {/* Actions */}
        <div className="mt-auto pt-4 border-t border-space-700 flex gap-2">
            {launch.links.webcast && (
                <a 
                    href={launch.links.webcast} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2 px-4 rounded text-center transition-colors"
                >
                    LIVE STREAM
                </a>
            )}
            {!launch.links.webcast && (
                 <button 
                 disabled
                 className="flex-1 bg-space-700 text-gray-500 text-xs font-bold py-2 px-4 rounded text-center cursor-not-allowed"
             >
                 NO STREAM YET
             </button>
             )}
        </div>
      </div>
    </div>
  );
};
