import { AvailableTimeEntry, AvailableTimes, BusyTimeEntry, BusyTimes } from "../types";
import { availableSlots } from "./utils";

const mockBusyTimes = (busyTime: BusyTimeEntry): BusyTimes => {
  const { timeMin, timeMax, emails } = busyTime;
  
  return {
    kind: 'calendar#freeBusy',
    timeMin: timeMin,
    timeMax: timeMax,
    calendars: {
      [emails[0]]: {
        busy: [],
      },
    },
  };
};

const mockAvailableTimes = (availableTime: AvailableTimeEntry): AvailableTimes => {
  const { doctorTimeMin, doctorTimeMax, appointmentDuration, busyTimes } = availableTime;

  const busyPeriods = Object.values(busyTimes.calendars).flatMap(calendar => calendar.busy);

  const slots = availableSlots(doctorTimeMin, doctorTimeMax, busyPeriods, appointmentDuration);
  const emails = Object.keys(busyTimes.calendars);

  return {
    kind: 'calendar#freeBusy',
    timeMin: doctorTimeMin,
    timeMax: doctorTimeMax,
    calendars: {
      [emails[0]]: {
        available: slots,
      },
    },
  };
};

export { mockBusyTimes, mockAvailableTimes };

