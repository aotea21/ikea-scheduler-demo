import { Activity, Briefcase, Calendar, LayoutDashboard, Map as MapIcon, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/' },
    { label: 'Schedule', icon: Calendar, href: '/schedule' },
    { label: 'Status', icon: Activity, href: '/status' },
    { label: 'Orders', icon: Briefcase, href: '/orders' },
    { label: 'Map', icon: MapIcon, href: '/map' },
    { label: 'Assemblers', icon: Users, href: '/assemblers' },
];

export function MobileNav() {
    const pathname = usePathname();

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 h-auto min-h-[4rem] bg-white border-t flex items-center justify-around z-[3000] pb-safe">
            {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                return (
                    <Link
                        key={item.label}
                        href={item.href}
                        className={cn(
                            "flex flex-col items-center justify-center w-full h-full space-y-1",
                            isActive
                                ? "text-[#0058a3]"
                                : "text-gray-500 hover:text-gray-900"
                        )}
                    >
                        <item.icon className="h-5 w-5" />
                        <span className="text-[10px] font-medium">{item.label}</span>
                    </Link>
                );
            })}
        </div>
    );
}
