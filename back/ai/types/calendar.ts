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
