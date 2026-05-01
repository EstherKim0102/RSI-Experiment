import { useState, useRef, useEffect } from 'react';

export const useTimer = () => {
  const [elapsed, setElapsed] = useState(0);
  const startTime = useRef<number | null>(null);
  const timerId = useRef<number | null>(null);

  const start = () => {
    startTime.current = Date.now();
    timerId.current = window.setInterval(() => {
      setElapsed(Date.now() - (startTime.current || 0));
    }, 10);
  };

  const stop = () => {
    if (timerId.current) {
      clearInterval(timerId.current);
      timerId.current = null;
    }
    const finalTime = Date.now() - (startTime.current || 0);
    setElapsed(finalTime);
    return finalTime;
  };

  const reset = () => {
    setElapsed(0);
    startTime.current = null;
    if (timerId.current) clearInterval(timerId.current);
  };

  useEffect(() => {
    return () => {
      if (timerId.current) clearInterval(timerId.current);
    };
  }, []);

  return { elapsed, start, stop, reset };
};
