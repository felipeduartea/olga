import { Card } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Search, Plus } from 'lucide-react';

export function Patients() {
  const patients = [
    { id: 1, name: 'John Smith', age: 45, lastVisit: '2025-10-20', condition: 'Hypertension' },
    { id: 2, name: 'Sarah Johnson', age: 32, lastVisit: '2025-10-18', condition: 'Diabetes' },
    { id: 3, name: 'Michael Brown', age: 58, lastVisit: '2025-10-15', condition: 'Arthritis' },
    { id: 4, name: 'Emma Davis', age: 28, lastVisit: '2025-10-12', condition: 'Asthma' },
    { id: 5, name: 'James Wilson', age: 51, lastVisit: '2025-10-10', condition: 'Heart Disease' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 mb-1">Patients</h1>
          <p className="text-gray-600">Manage your patient records</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Patient
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Search patients..."
          className="pl-10"
        />
      </div>

      {/* Patients List */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left p-4 text-gray-600">Patient Name</th>
                <th className="text-left p-4 text-gray-600">Age</th>
                <th className="text-left p-4 text-gray-600">Last Visit</th>
                <th className="text-left p-4 text-gray-600">Condition</th>
                <th className="text-left p-4 text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((patient) => (
                <tr key={patient.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-gray-900">{patient.name[0]}</span>
                      </div>
                      <span className="text-gray-900">{patient.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-gray-600">{patient.age}</td>
                  <td className="p-4 text-gray-600">{patient.lastVisit}</td>
                  <td className="p-4 text-gray-600">{patient.condition}</td>
                  <td className="p-4">
                    <Button variant="outline" size="sm">View</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
