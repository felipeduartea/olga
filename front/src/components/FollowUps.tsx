import { Card } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Search, Plus, CheckCircle } from 'lucide-react';

export function FollowUps() {
  const followUps = [
    {
      id: 1,
      patient: 'Robert Martinez',
      note: 'Schedule follow-up for blood pressure monitoring',
      dueDate: '2025-10-28',
      priority: 'high',
    },
    {
      id: 2,
      patient: 'Linda Chen',
      note: "Review lab results from last week's tests",
      dueDate: '2025-10-27',
      priority: 'high',
    },
    {
      id: 3,
      patient: 'David Thompson',
      note: 'Medication adjustment needed - check side effects',
      dueDate: '2025-10-30',
      priority: 'medium',
    },
    {
      id: 4,
      patient: 'Maria Garcia',
      note: 'Post-surgery check-in - assess recovery progress',
      dueDate: '2025-10-29',
      priority: 'high',
    },
    {
      id: 5,
      patient: 'James Wilson',
      note: 'Annual physical exam reminder',
      dueDate: '2025-11-02',
      priority: 'low',
    },
    {
      id: 6,
      patient: 'Emma Davis',
      note: 'Discuss treatment plan for chronic condition',
      dueDate: '2025-10-31',
      priority: 'medium',
    },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'low':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 mb-1">Follow-Ups</h1>
          <p className="text-gray-600">Manage patient follow-up tasks</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Follow-Up
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Search follow-ups..."
          className="pl-10"
        />
      </div>

      {/* Follow-ups List */}
      <div className="space-y-3">
        {followUps.map((followUp) => (
          <Card key={followUp.id} className="p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4 flex-1">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-gray-900">{followUp.patient[0]}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-gray-900">{followUp.patient}</p>
                    <span className={`px-2 py-1 rounded text-xs ${getPriorityColor(followUp.priority)}`}>
                      {followUp.priority}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-2">{followUp.note}</p>
                  <p className="text-gray-500">Due: {followUp.dueDate}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Complete
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
