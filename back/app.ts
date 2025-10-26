import { Hono } from 'hono';
import { mockBusyTimes, availableTimes, createAppointment } from './calendar/appointments.js';
import type { BusyTimeEntry, AvailableTimeEntry, AppointmentEntry } from './calendar/types/appointment.ts';

const app = new Hono();

app.get('/', (c) => c.text('Hello World'));

// Calendar Routes
const calendar = new Hono();

// Mock busy times
calendar.post('/mock-busy-times', async (c) => {
  try {
    const body = await c.req.json<BusyTimeEntry>();
    const result = mockBusyTimes(body);
    return c.json(result);
  } catch (error) {
    return c.json({ error: 'Invalid request body' }, 400);
  }
});

// Get available times
calendar.post('/available-times', async (c) => {
  try {
    const body = await c.req.json<AvailableTimeEntry>();
    const result = availableTimes(body);
    return c.json(result);
  } catch (error) {
    return c.json({ error: 'Invalid request body' }, 400);
  }
});

// Create appointment
calendar.post('/create-appointment', async (c) => {
  try {
    const body = await c.req.json<AppointmentEntry>();
    const result = createAppointment(body);
    return c.json(result);
  } catch (error) {
    return c.json({ error: 'Invalid request body' }, 400);
  }
});

// Mount calendar routes
app.route('/calendar', calendar);

export default app;