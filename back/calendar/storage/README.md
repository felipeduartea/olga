# Mock Appointment Storage

A simple in-memory storage system for testing appointment functionality without a real database.

## Usage

### Using the Singleton Instance

```typescript
import { mockStorage } from './storage';
import { createAppointment } from '../appointments';

// Create an appointment
const appointmentEntry = {
  summary: 'Doctor Appointment',
  location: 'Clinic',
  description: 'Checkup',
  start: { dateTime: '2025-10-30T10:00:00Z', timeZone: 'UTC' },
  end: { dateTime: '2025-10-30T11:00:00Z', timeZone: 'UTC' },
  attendees: [{ email: 'patient@example.com' }],
  reminders: { useDefault: true, overrides: [] },
  conferenceData: {
    createRequest: {
      requestId: 'abc123',
      conferenceSolutionKey: { type: 'hangoutsMeet' }
    }
  }
};

const created = createAppointment(appointmentEntry);
const stored = mockStorage.create(created);

// Retrieve appointments
const appointment = mockStorage.getById(stored.id);
const allAppointments = mockStorage.getAll();
const patientAppointments = mockStorage.getByAttendeeEmail('patient@example.com');

// Clean up after tests
mockStorage.clear();
```

### Creating Independent Instances

```typescript
import { AppointmentStorage } from './storage';

const storage = new AppointmentStorage();
// Use storage independently
```

## API

### `create(appointment: AppointmentCreated): StoredAppointment`
Create and store a new appointment with auto-generated ID and timestamps.

### `getById(id: string): StoredAppointment | undefined`
Retrieve an appointment by its ID.

### `getAll(): StoredAppointment[]`
Get all stored appointments.

### `getByAttendeeEmail(email: string): StoredAppointment[]`
Find appointments by attendee email address.

### `getByDateRange(startDate: string, endDate: string): StoredAppointment[]`
Get appointments that overlap with a date range.

### `update(id: string, updates: Partial<AppointmentCreated>): StoredAppointment | undefined`
Update an existing appointment. Returns undefined if not found.

### `delete(id: string): boolean`
Delete an appointment. Returns true if deleted, false if not found.

### `clear(): void`
Remove all appointments and reset ID counter.

### `count(): number`
Get the total number of stored appointments.

### `exists(id: string): boolean`
Check if an appointment exists.

## Types

### `StoredAppointment`
Extends `AppointmentCreated` with:
- `id: string` - Unique identifier
- `createdAt: string` - ISO timestamp of creation
- `updatedAt: string` - ISO timestamp of last update

## Testing Tips

1. **Always clear between tests:**
   ```typescript
   beforeEach(() => {
     mockStorage.clear();
   });
   ```

2. **Use independent instances for isolated tests:**
   ```typescript
   const storage = new AppointmentStorage();
   // No need to clear, fresh instance
   ```

3. **Test date ranges with realistic data:**
   ```typescript
   const appointments = storage.getByDateRange(
     new Date().toISOString(),
     new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
   );
   ```

