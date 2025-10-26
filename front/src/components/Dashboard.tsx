import { Card } from './ui/card';
import { Users, Calendar, Clock, Activity } from 'lucide-react';

export function Dashboard() {
  const stats = [
    { label: 'Total Patients', value: '1,234', icon: Users, change: '+12%' },
    { label: "Today's Appointments", value: '18', icon: Calendar, change: '+5%' },
    { label: 'Pending Reviews', value: '7', icon: Clock, change: '-2%' },
    { label: 'Active Cases', value: '45', icon: Activity, change: '+8%' },
  ];

  const upcomingAppointments = [
    { id: 1, patient: 'John Smith', time: '09:00 AM', type: 'Check-up' },
    { id: 2, patient: 'Sarah Johnson', time: '10:30 AM', type: 'Follow-up' },
    { id: 3, patient: 'Michael Brown', time: '02:00 PM', type: 'Consultation' },
    { id: 4, patient: 'Emma Davis', time: '03:30 PM', type: 'Check-up' },
  ];

  const patientFollowUps = [
    { id: 1, patient: 'Robert Martinez', note: 'Schedule follow-up for blood pressure monitoring' },
    { id: 2, patient: 'Linda Chen', note: 'Review lab results from last week\'s tests' },
    { id: 3, patient: 'David Thompson', note: 'Medication adjustment needed - check side effects' },
    { id: 4, patient: 'Maria Garcia', note: 'Post-surgery check-in - assess recovery progress' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-gray-900 mb-1">Dashboard</h1>
        <p className="text-gray-600">Welcome back, Dr. Anderson</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-gray-900">{stat.value}</p>
                  <p className="text-gray-500 mt-1">{stat.change} from last month</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <Icon className="w-5 h-5 text-gray-600" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Appointments */}
        <Card className="p-6">
          <h2 className="text-gray-900 mb-4">Today's Appointments</h2>
          <div className="space-y-3">
            {upcomingAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                    <span className="text-gray-900">{appointment.patient[0]}</span>
                  </div>
                  <div>
                    <p className="text-gray-900">{appointment.patient}</p>
                    <p className="text-gray-500">{appointment.type}</p>
                  </div>
                </div>
                <div className="text-gray-600">{appointment.time}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Patient Follow-ups */}
        <Card className="p-6">
          <h2 className="text-gray-900 mb-4">Patient Follow-ups</h2>
          <div className="space-y-3">
            {patientFollowUps.map((followUp) => (
              <div
                key={followUp.id}
                className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-gray-900">{followUp.patient[0]}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900 mb-1">{followUp.patient}</p>
                    <p className="text-gray-600">{followUp.note}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
