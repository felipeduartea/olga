export type BusyTimeEntry = {
  timeMin: string;
  timeMax: string;
  timeZone: string;
  emails: string[];
};

export type BusyTimes = {
  kind: string;
  timeMin: string;
  timeMax: string;
  calendars: {
    [email: string]: {
      busy: {
        start: string;
        end: string;
      }[];
    };
  };
};

export type AvailableTimeEntry = {
  doctorTimeMin: string;
  doctorTimeMax: string;
  appointmentDuration: number;
  busyTimes: BusyTimes;
};


export type AvailableTimes = {
  kind: string;
  timeMin: string;
  timeMax: string;
  calendars: {
    [email: string]: {
      available: {
        start: string;
        end: string;
      }[];
    };
  };
};

export type AppointmentEntry = {
  summary: string;
  location: string;
  description: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  attendees: {
    email: string;
  }[];
  reminders: {
    useDefault: boolean;
    overrides: {
      method: string;
      minutes: number;
    }[];
  };
  conferenceData: {
    createRequest: {
      requestId: string;
      conferenceSolutionKey: {
        type: string;
      };
    };
  };
};

export type AppointmentCreated = {
  kind: string;
  summary: string;
  location: string;
  description: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  attendees: {
    email: string;
    responseStatus: string;
  }[];
  hangoutLink?: string;
};
