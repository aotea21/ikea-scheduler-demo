"use client";

import dynamic from 'next/dynamic';
import { DashboardLayout } from "@/components/features/DashboardLayout";
import { AssignmentModal } from '@/components/features/AssignmentModal';

const MapComponent = dynamic(
    () => import('@/components/features/MapComponent'),
    {
        ssr: false,
        loading: () => <div className="h-full w-full flex items-center justify-center bg-gray-100 text-gray-500">Loading Map Engine...</div>
    }
);

export default function MapPage() {
    return (
        <DashboardLayout>
            <div className="h-full w-full relative">
                <MapComponent />
            </div>
            <AssignmentModal />
        </DashboardLayout>
    );
}
