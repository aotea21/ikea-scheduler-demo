import { DashboardLayout } from "@/components/features/DashboardLayout";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
