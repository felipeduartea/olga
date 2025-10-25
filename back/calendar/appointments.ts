import { AppointmentCreated, AppointmentEntry, AvailableTimeEntry, AvailableTimes, BusyTimeEntry, BusyTimes } from "./types";
import { availableSlots } from "./utils";


export const checkAvailableTime = (availability: AvailableTimeEntry): AvailableTimes => {
  const { doctorTimeMin, doctorTimeMax, doctorEmail, appointmentDuration, timeZone } = availability;

  const busyPeriods = busyTimes({
    timeMin: doctorTimeMin,
    timeMax: doctorTimeMax,
    timeZone: timeZone,
    emails: [doctorEmail],
  });

  const doctorAvailableSlots = calculateAvailableTime(
    availability,
    busyPeriods,
  );
  
  const slots = Object.values(doctorAvailableSlots.calendars)[0].available;
  
  return {
    kind: 'calendar#freeBusy',
    timeMin: doctorTimeMin,
    timeMax: doctorTimeMax,
    calendars: {
      [doctorEmail]: {
        available: slots,
      },
    },
  };
}

export const busyTimes = (busyTime: BusyTimeEntry): BusyTimes => {
  const { timeMin, timeMax, emails } = busyTime;
  

  //in a real implementation, we would fetch the busy times from the calendar

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

export const calculateAvailableTime = (availability: AvailableTimeEntry, busyTimes: BusyTimes): AvailableTimes => {
  const { doctorTimeMin, doctorTimeMax, appointmentDuration } = availability;

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

  //in a real implementation, we would create the appointment in the calendar

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
