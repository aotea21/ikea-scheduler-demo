"use client";

import { Activity, Briefcase, Calendar, LayoutDashboard, Map as MapIcon, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/lib/types";

interface MobileNavItem {
    label: string;
    icon: React.ElementType;
    href: string;
    roles: UserRole[];
}

const NAV_ITEMS: MobileNavItem[] = [
    { label: 'Home',      icon: LayoutDashboard, href: '/',          roles: [] },
    { label: 'Schedule',  icon: Calendar,        href: '/schedule',  roles: ['ADMIN', 'DISPATCHER'] },
    { label: 'My Jobs',   icon: Activity,        href: '/status',    roles: ['ASSEMBLER'] },
    { label: 'Orders',    icon: Briefcase,       href: '/orders',    roles: ['ADMIN', 'DISPATCHER'] },
    { label: 'Map',       icon: MapIcon,         href: '/map',       roles: ['ADMIN', 'DISPATCHER'] },
    { label: 'Team',      icon: Users,           href: '/assemblers',roles: ['ADMIN', 'DISPATCHER'] },
];

export function MobileNav() {
    const pathname = usePathname();
    const { profile } = useAuth();

    const role = profile?.role ?? null;
    const visibleItems = NAV_ITEMS.filter(
        item => item.roles.length === 0 || (role && item.roles.includes(role))
    );

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t flex items-stretch z-[3000]"
             style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
            {visibleItems.map((item) => {
                const isActive = pathname === item.href ||
                    (item.href !== '/' && pathname.startsWith(item.href));
                return (
                    <Link
                        key={item.label}
                        href={item.href}
                        className={cn(
                            "flex flex-col items-center justify-center flex-1 py-3 gap-1 transition-colors",
                            isActive
                                ? "text-[#0058a3]"
                                : "text-gray-400 hover:text-gray-700"
                        )}
                    >
                        <item.icon className={cn("h-5 w-5", isActive && "stroke-[2.5px]")} />
                        <span className="text-[10px] font-medium">{item.label}</span>
                        {isActive && (
                            <span className="absolute bottom-0 w-1 h-1 rounded-full bg-[#0058a3]" />
                        )}
                    </Link>
                );
            })}
        </div>
    );
}
