import { useEffect } from 'react';

export function useSmartNotifications(routines, onTriggerAlert) {
  useEffect(() => {
    if (!routines || !routines.length) return;

    const intervalId = setInterval(() => {
      const now = new Date();
      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();

      routines.forEach((routine) => {
        if (!routine.startTime) return;
        
        const [targetHours, targetMinutes] = routine.startTime.split(':').map(Number);
        
        const targetTotalMinutes = targetHours * 60 + targetMinutes;
        const currentTotalMinutes = currentHours * 60 + currentMinutes;
        
        // Push-alert trigger exactly 5 minutes before scheduled block window starts
        if (targetTotalMinutes - currentTotalMinutes === 5) {
          onTriggerAlert(`Up next: ${routine.title} begins in 5 minutes!`, routine.id);
        }
      });
    }, 60000); // Evaluates every 60 seconds

    return () => clearInterval(intervalId);
  }, [routines, onTriggerAlert]);
}