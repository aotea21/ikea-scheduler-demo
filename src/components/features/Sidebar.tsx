import { Briefcase, Calendar, LayoutDashboard, Map as MapIcon, Settings, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/' },
    { label: 'Orders', icon: Briefcase, href: '/orders' },
    { label: 'Schedule', icon: Calendar, href: '/schedule' },
    { label: 'Map View', icon: MapIcon, href: '/map' },
    { label: 'Assemblers', icon: Users, href: '/assemblers' },
    { label: 'Settings', icon: Settings, href: '/settings' },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="hidden md:flex h-screen w-64 flex-col border-r bg-white">
            {/* Brand Header */}
            <div className="flex h-16 items-center px-6 border-b">
                {/* IKEA Logo Placeholder / Text */}
                <div className="w-16 h-6 bg-[#0058a3] flex items-center justify-center rounded-sm">
                    <span className="text-[#fbd914] font-bold text-sm tracking-widest">IKEA</span>
                </div>
                <span className="ml-3 font-semibold text-gray-800 text-sm">Service</span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 p-4">
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-blue-50 text-[#0058a3]"
                                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                            )}
                        >
                            <item.icon className="h-4 w-4" />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            {/* User Footer */}
            <div className="border-t p-4">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium">
                        DA
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-900">Dispatcher A.</p>
                        <p className="text-xs text-gray-500">London Region</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
