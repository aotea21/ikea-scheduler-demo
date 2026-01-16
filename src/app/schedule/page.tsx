"use client";

import { DashboardLayout } from "@/components/features/DashboardLayout";

export default function SchedulePage() {
    return (
        <DashboardLayout>
            <div className="p-6 md:p-8 max-w-5xl mx-auto w-full h-full flex flex-col">
                <h1 className="text-2xl font-bold mb-6 text-[#111111]">Weekly Schedule</h1>

                <div className="flex-1 bg-white rounded-xl border border-dashed border-gray-300 flex items-center justify-center flex-col gap-4 text-gray-500">
                    <span className="text-4xl text-gray-200 font-bold">WIP</span>
                    <p>Calendar View Under Construction</p>
                </div>
            </div>
        </DashboardLayout>
    );
}
