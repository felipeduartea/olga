export const availableSlots = (
    timeMin: string,
    timeMax: string,
    busyPeriods: { start: string; end: string }[],
    appointmentDuration: number
  ): { start: string; end: string }[] => {
    const slots: { start: string; end: string }[] = [];
    
    const startTime = new Date(timeMin);
    const endTime = new Date(timeMax);
    const durationMs = appointmentDuration * 60 * 1000;
    
    const sortedBusy = busyPeriods.sort((a, b) => 
      new Date(a.start).getTime() - new Date(b.start).getTime()
    );
    
    let currentTime = startTime;
    
    for (const busy of sortedBusy) {
      const busyStart = new Date(busy.start);
      
      while (currentTime.getTime() + durationMs <= busyStart.getTime()) {
        const slotEnd = new Date(currentTime.getTime() + durationMs);
        slots.push({
          start: currentTime.toISOString(),
          end: slotEnd.toISOString(),
        });
        currentTime = slotEnd;
      }
      
      currentTime = new Date(Math.max(
        currentTime.getTime(),
        new Date(busy.end).getTime()
      ));
    }
    
    while (currentTime.getTime() + durationMs <= endTime.getTime()) {
      const slotEnd = new Date(currentTime.getTime() + durationMs);
      slots.push({
        start: currentTime.toISOString(),
        end: slotEnd.toISOString(),
      });
      currentTime = slotEnd;
    }
    
    return slots;
  };