"use client";

import {
    Activity, Briefcase, Calendar, LayoutDashboard,
    Map as MapIcon, Settings, Users, LogOut, ChevronRight
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/lib/types";

interface NavItem {
    label: string;
    icon: React.ElementType;
    href: string;
    roles: UserRole[]; // empty = all roles
}

const NAV_ITEMS: NavItem[] = [
    { label: 'Dashboard',  icon: LayoutDashboard, href: '/',           roles: [] },
    { label: 'Orders',     icon: Briefcase,       href: '/orders',     roles: ['ADMIN', 'DISPATCHER'] },
    { label: 'Schedule',   icon: Calendar,        href: '/schedule',   roles: ['ADMIN', 'DISPATCHER'] },
    { label: 'Job Status', icon: Activity,        href: '/status',     roles: ['ADMIN', 'DISPATCHER'] },
    { label: 'My Jobs',    icon: Activity,        href: '/status',     roles: ['ASSEMBLER'] },
    { label: 'Map View',   icon: MapIcon,         href: '/map',        roles: ['ADMIN', 'DISPATCHER'] },
    { label: 'Assemblers', icon: Users,           href: '/assemblers', roles: ['ADMIN', 'DISPATCHER'] },
    { label: 'Settings',   icon: Settings,        href: '/settings',   roles: ['ADMIN'] },
];

const ROLE_BADGE: Record<UserRole, { label: string; cls: string }> = {
    ADMIN:      { label: 'Admin',      cls: 'bg-blue-100 text-blue-700' },
    DISPATCHER: { label: 'Dispatcher', cls: 'bg-amber-100 text-amber-700' },
    ASSEMBLER:  { label: 'Assembler',  cls: 'bg-green-100 text-green-700' },
};

export function Sidebar() {
    const pathname = usePathname();
    const { profile, isLoading, signOut } = useAuth();

    const role = profile?.role ?? null;
    const visibleItems = NAV_ITEMS.filter(
        item => item.roles.length === 0 || (role && item.roles.includes(role))
    );

    return (
        <div className="hidden md:flex h-screen w-64 flex-col border-r bg-white">
            {/* Brand Header */}
            <Link href="/" className="flex h-16 items-center px-6 border-b hover:bg-gray-50 transition-colors">
                <div className="w-16 h-6 bg-[#0058a3] flex items-center justify-center rounded-sm">
                    <span className="text-[#fbd914] font-bold text-sm tracking-widest">IKEA</span>
                </div>
                <span className="ml-3 font-semibold text-gray-800 text-sm">Service</span>
            </Link>

            {/* Navigation */}
            <nav className="flex-1 space-y-0.5 p-3 overflow-y-auto">
                {visibleItems.map((item) => {
                    const isActive = pathname === item.href ||
                        (item.href !== '/' && pathname.startsWith(item.href));
                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all group",
                                isActive
                                    ? "bg-blue-50 text-[#0058a3]"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            )}
                        >
                            <item.icon className={cn("h-4 w-4 flex-shrink-0", isActive ? "text-[#0058a3]" : "text-gray-400 group-hover:text-gray-600")} />
                            {item.label}
                            {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto text-[#0058a3]" />}
                        </Link>
                    );
                })}
            </nav>

            {/* User Footer */}
            <div className="border-t p-3">
                {isLoading ? (
                    <div className="flex items-center gap-3 p-1">
                        <div className="h-8 w-8 rounded-full bg-gray-100 animate-pulse" />
                        <div className="space-y-1.5">
                            <div className="h-3 w-24 bg-gray-100 rounded animate-pulse" />
                            <div className="h-2.5 w-16 bg-gray-100 rounded animate-pulse" />
                        </div>
                    </div>
                ) : profile ? (
                    <div className="space-y-2">
                        <div className="flex items-center gap-3 px-1">
                            <div className="h-8 w-8 rounded-full bg-[#0058a3] flex items-center justify-center flex-shrink-0">
                                <span className="text-white text-xs font-bold">
                                    {profile.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                                </span>
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{profile.name}</p>
                                <div className="flex items-center gap-1 mt-0.5">
                                    {role && (
                                        <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded", ROLE_BADGE[role].cls)}>
                                            {ROLE_BADGE[role].label}
                                        </span>
                                    )}
                                    {profile.region && (
                                        <span className="text-[10px] text-gray-400">{profile.region}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={signOut}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors group"
                        >
                            <LogOut className="w-3.5 h-3.5 group-hover:text-red-500" />
                            Sign out
                        </button>
                    </div>
                ) : null}
            </div>
        </div>
    );
}
