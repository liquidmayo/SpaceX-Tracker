import React, { useEffect } from 'react';
import { EnrichedLaunch } from '../types';
import { CountdownTimer } from './CountdownTimer';
import { Bell, PlayCircle, MapPin, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';

interface Props {
  launch: EnrichedLaunch;
}

export const HeroLaunch: React.FC<Props> = ({ launch }) => {
  const launchDate = new Date(launch.date_utc);

  const requestNotification = () => {
    if (!('Notification' in window)) {
        alert("This browser does not support desktop notifications");
        return;
    }
    Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
           new Notification("Launch Reminders Enabled", {
               body: `You'll be notified 1 hour before ${launch.name} launches.`,
               icon: launch.links.patch.small || undefined
           });
           // In a real app, you'd schedule a service worker or local timer here
           // For client-side demo, we just acknowledge permissions
        }
    });
  };

  return (
    <div className="relative w-full bg-gradient-to-r from-space-900 to-space-800 rounded-2xl overflow-hidden shadow-2xl border border-space-700 mb-8">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-brand-accent/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 flex flex-col md:flex-row p-6 md:p-10 gap-8 items-center">
        
        {/* Left Content */}
        <div className="flex-1 text-center md:text-left space-y-4">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-brand-accent/20 text-brand-accent border border-brand-accent/30 text-sm font-semibold mb-2">
                <span className="relative flex h-2 w-2 mr-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-accent opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-accent"></span>
                </span>
                NEXT MISSION
            </div>

            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
                {launch.name}
            </h1>
            
            <div className="text-xl text-gray-300 flex flex-col md:flex-row items-center md:items-start gap-2 md:gap-6">
                 <span>{format(launchDate, 'MMMM d, yyyy')}</span>
                 <span className="hidden md:inline text-gray-600">•</span>
                 <span>{format(launchDate, 'h:mm aa')} (Local)</span>
            </div>

             <div className="flex items-center justify-center md:justify-start text-gray-400 text-sm">
                <MapPin className="w-4 h-4 mr-1" />
                {launch.launchpadData?.full_name}
            </div>

            <div className="py-6">
                <p className="text-gray-400 text-sm md:text-base max-w-xl mx-auto md:mx-0 leading-relaxed">
                    {launch.details || `Upcoming launch of the ${launch.rocketData?.name} rocket carrying payload to orbit.`}
                </p>
            </div>

            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                {launch.links.webcast ? (
                    <a 
                        href={launch.links.webcast} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-bold transition-all shadow-lg hover:shadow-red-900/50"
                    >
                        <PlayCircle className="mr-2 w-5 h-5" />
                        Watch Live
                    </a>
                ) : (
                    <button disabled className="flex items-center bg-gray-700 text-gray-400 px-6 py-3 rounded-lg font-bold cursor-not-allowed">
                         <PlayCircle className="mr-2 w-5 h-5" />
                         Stream Pending
                    </button>
                )}
                
                <button 
                    onClick={requestNotification}
                    className="flex items-center bg-space-700 hover:bg-space-600 text-white px-6 py-3 rounded-lg font-bold transition-all border border-space-600"
                >
                    <Bell className="mr-2 w-5 h-5" />
                    Notify Me
                </button>
            </div>
        </div>

        {/* Right Content - Timer & Patch */}
        <div className="flex flex-col items-center justify-center w-full md:w-auto min-w-[300px]">
             {launch.links.patch.large && (
                 <img 
                    src={launch.links.patch.large} 
                    alt="Mission Patch" 
                    className="w-48 h-48 md:w-64 md:h-64 object-contain drop-shadow-2xl mb-6 animate-pulse-slow" 
                    style={{ animationDuration: '3s' }}
                 />
             )}
             <div className="bg-black/40 backdrop-blur-md rounded-xl p-6 border border-white/10 w-full text-center">
                 <div className="text-gray-400 text-xs uppercase tracking-widest mb-2">T-Minus</div>
                 <CountdownTimer targetDate={launch.date_utc} precision={launch.date_precision} size="lg" />
             </div>
        </div>
      </div>
    </div>
  );
};
