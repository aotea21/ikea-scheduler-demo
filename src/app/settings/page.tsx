"use client";

import { DashboardLayout } from "@/components/features/DashboardLayout";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
    return (
        <DashboardLayout>
            <div className="p-6 md:p-8 max-w-2xl mx-auto w-full">
                <h1 className="text-2xl font-bold mb-6 text-[#111111]">Settings</h1>

                <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
                    <div>
                        <h3 className="font-semibold text-lg mb-2">Application Info</h3>
                        <div className="text-sm text-gray-500 space-y-1">
                            <p>Version: 1.0.0-prototype</p>
                            <p>Region: New Zealand (NZ)</p>
                        </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t">
                        <div className="flex items-center justify-between">
                            <span className="font-medium">Dark Mode (Coming Soon)</span>
                            <div className="w-10 h-6 bg-gray-200 rounded-full cursor-not-allowed relative">
                                <div className="w-4 h-4 bg-white rounded-full absolute left-1 top-1 shadow-sm" />
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="font-medium">Notifications</span>
                            <div className="w-10 h-6 bg-[#0058a3] rounded-full cursor-pointer relative">
                                <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1 shadow-sm" />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t">
                        <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50 w-full border-red-200">
                            Sign Out
                        </Button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
