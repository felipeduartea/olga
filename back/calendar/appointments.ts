import { AppointmentCreated, AppointmentEntry, AvailableTimeEntry, AvailableTimes, BusyTimeEntry, BusyTimes } from "./types";
import { availableSlots } from "./utils";

export const mockBusyTimes = (busyTime: BusyTimeEntry): BusyTimes => {
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

export const availableTimes = (availableTime: AvailableTimeEntry): AvailableTimes => {
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

export const createAppointment = (appointment: AppointmentEntry): AppointmentCreated => {
  const { summary, location, description, start, end, attendees } = appointment;

  return {
    kind: 'calendar#event',
    summary: summary,
    location: location,
    description: description,
    start: start,
    end: end,
    attendees: attendees.map(attendee => ({
      email: attendee.email,
      responseStatus: 'needsAction',
    })),
  };
};
