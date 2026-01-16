import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";
import React from "react";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen bg-[#f5f5f5] overflow-hidden">
            <Sidebar />
            <main className="flex-1 h-full overflow-hidden flex flex-col relative pb-16 md:pb-0">
                {children}
            </main>
            <MobileNav />
        </div>
    );
}
