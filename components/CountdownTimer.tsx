import React from 'react';
import { useCountdown } from '../hooks/useCountdown';
import { Clock } from 'lucide-react';

interface Props {
  targetDate: string;
  precision: string;
  size?: 'sm' | 'lg';
}

export const CountdownTimer: React.FC<Props> = ({ targetDate, precision, size = 'sm' }) => {
  const { formatted, isExpired } = useCountdown(targetDate);

  // If precision is vague (month, year), don't show specific ticker
  const isVague = precision === 'month' || precision === 'year' || precision === 'half' || precision === 'quarter';

  if (isVague) {
    return (
      <div className={`flex items-center text-gray-400 ${size === 'lg' ? 'text-xl' : 'text-sm'}`}>
        <Clock className={`mr-2 ${size === 'lg' ? 'w-6 h-6' : 'w-4 h-4'}`} />
        <span>Date TBD</span>
      </div>
    );
  }

  if (isExpired) {
    return <span className="text-red-500 font-bold">LIFTOFF / PAST</span>;
  }

  return (
    <div className={`font-mono font-bold tracking-widest text-brand-accent ${size === 'lg' ? 'text-3xl md:text-5xl' : 'text-base'}`}>
      {formatted}
    </div>
  );
};
