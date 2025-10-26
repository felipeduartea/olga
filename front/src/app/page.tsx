'use client';

import { useState } from 'react';
import { DoctorSidebar } from '@/components/DoctorSidebar';
import { Dashboard } from '@/components/Dashboard';
import { Patients } from '@/components/Patients';
import { FollowUps } from '@/components/FollowUps';

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'patients':
        return <Patients />;
      case 'appointments':
        return <ComingSoon title="Appointments" />;
      case 'followups':
        return <FollowUps />;
      case 'settings':
        return <ComingSoon title="Settings" />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      <DoctorSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

function ComingSoon({ title }: { title: string }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-gray-900 mb-1">{title}</h1>
        <p className="text-gray-600">This section is coming soon</p>
      </div>
    </div>
  );
}

