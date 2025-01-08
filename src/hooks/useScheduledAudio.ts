import { useEffect, useRef, useState, useCallback } from 'react';

export function useScheduledAudio(audioUrl: string, scheduledTimes: string[]) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [nextPlayTime, setNextPlayTime] = useState<Date | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const isSchedulingRef = useRef(false);

  const calculateNextPlayTime = useCallback(() => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const tomorrow = new Date(now.setDate(now.getDate() + 1)).toISOString().split('T')[0];
    
    const possibleTimes = [
      ...scheduledTimes.map(time => new Date(`${today}T${time}`)),
      ...scheduledTimes.map(time => new Date(`${tomorrow}T${time}`))
    ].filter(date => date > now);
    
    return possibleTimes.sort((a, b) => a.getTime() - b.getTime())[0];
  }, [scheduledTimes]);

  const scheduleNextPlay = useCallback(() => {
    if (isSchedulingRef.current) return;
    isSchedulingRef.current = true;
    
    const next = calculateNextPlayTime();
    if (next?.getTime() !== nextPlayTime?.getTime()) {
      setNextPlayTime(next);
    }
    
    if (next) {
      const timeUntilPlay = next.getTime() - new Date().getTime();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.play();
          isSchedulingRef.current = false;
          scheduleNextPlay();
        }
      }, timeUntilPlay);
    }
    
    isSchedulingRef.current = false;
  }, [calculateNextPlayTime, nextPlayTime]);

  useEffect(() => {
    if (!audioUrl) return;
    
    audioRef.current = new Audio(audioUrl);
    scheduleNextPlay();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [audioUrl, scheduleNextPlay]);

  return { nextPlayTime };
}