import { useState, useEffect } from 'react';
import { intervalToDuration, Duration, isPast } from 'date-fns';

interface CountdownResult {
  duration: Duration;
  isExpired: boolean;
  formatted: string;
}

export const useCountdown = (targetDate: string | number): CountdownResult => {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const target = new Date(targetDate);
  const expired = isPast(target);

  if (expired) {
    return {
      duration: {},
      isExpired: true,
      formatted: 'T-00:00:00'
    };
  }

  const duration = intervalToDuration({
    start: now,
    end: target,
  });

  const pad = (n: number | undefined) => (n || 0).toString().padStart(2, '0');

  const days = duration.days || 0;
  const hours = pad(duration.hours);
  const minutes = pad(duration.minutes);
  const seconds = pad(duration.seconds);
  const months = duration.months || 0;
  const years = duration.years || 0;

  let formatted = '';
  
  // Format logic
  if (years > 0) formatted = `T-${years}y ${months}m ${days}d`;
  else if (months > 0) formatted = `T-${months}m ${days}d ${hours}h`;
  else if (days > 0) formatted = `T-${days}d ${hours}h ${minutes}m ${seconds}s`;
  else formatted = `T-${hours}:${minutes}:${seconds}`;

  return {
    duration,
    isExpired: false,
    formatted,
  };
};
