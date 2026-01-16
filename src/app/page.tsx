"use client";

import dynamic from 'next/dynamic';
import { DashboardLayout } from '@/components/features/DashboardLayout';
import { TaskList } from '@/components/features/TaskList';
import { AssignmentModal } from '@/components/features/AssignmentModal';
import React from 'react';

// Dynamically import MapComponent to disable SSR for Leaflet
const MapComponent = dynamic(
  () => import('@/components/features/MapComponent'),
  {
    ssr: false,
    loading: () => <div className="h-full w-full flex items-center justify-center bg-gray-100 text-gray-500">Loading Map Engine...</div>
  }
);

export default function Home() {
  const [view, setView] = React.useState<'list' | 'map'>('list');

  return (
    <DashboardLayout>
      <div className="flex h-full w-full relative">
        {/* Left Panel: Task List */}
        {/* Mobile: Show if view is list. Desktop: Always show. */}
        <div className={`
          w-full md:w-[400px] h-full z-10 shadow-xl bg-white flex-shrink-0
          ${view === 'list' ? 'block' : 'hidden md:block'}
        `}>
          <TaskList />
        </div>

        {/* Right Panel: Map */}
        {/* Mobile: Show if view is map. Desktop: Always show (flex-1). */}
        <div className={`
          flex-1 h-full relative z-0
          ${view === 'map' ? 'block' : 'hidden md:block'}
        `}>
          <MapComponent />
        </div>

        {/* Mobile View Toggle (Floating) */}
        <div className="md:hidden absolute bottom-20 left-1/2 -translate-x-1/2 z-[500]">
          <button
            onClick={() => setView(view === 'list' ? 'map' : 'list')}
            className="bg-[#111111] text-white px-6 py-3 rounded-full shadow-lg font-bold text-sm flex items-center gap-2 animate-in slide-in-from-bottom-5"
          >
            {view === 'list' ? (
              <>
                <span className="w-2 h-2 bg-[#fbd914] rounded-full" /> Show Map
              </>
            ) : (
              <>
                Show List
              </>
            )}
          </button>
        </div>
      </div>

      {/* Modal Overlay */}
      <AssignmentModal />
    </DashboardLayout>
  );
}
