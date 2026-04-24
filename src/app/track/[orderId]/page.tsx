"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { TASK_STATUS_LABELS, TASK_STATUS_COLORS } from "@/lib/task-fsm-config";
import { TaskStatus } from "@/lib/types";
import { CheckCircle2, Truck, MapPin, Wrench, Clock, Package } from "lucide-react";

interface TrackingData {
    orderId: string;
    customerName: string;
    address: string;
    status: TaskStatus;
    scheduledStart?: string;
    items: Array<{ name: string; quantity: number }>;
}

const STATUS_STEPS: TaskStatus[] = [
    'CREATED', 'ASSIGNED', 'CONFIRMED', 'EN_ROUTE', 'ARRIVED',
    'MATERIALS_VERIFIED', 'IN_PROGRESS', 'COMPLETED', 'VERIFIED'
];

const STATUS_ICON: Partial<Record<TaskStatus, React.ReactNode>> = {
    EN_ROUTE:    <Truck className="w-5 h-5" />,
    ARRIVED:     <MapPin className="w-5 h-5" />,
    IN_PROGRESS: <Wrench className="w-5 h-5" />,
    COMPLETED:   <CheckCircle2 className="w-5 h-5" />,
    VERIFIED:    <CheckCircle2 className="w-5 h-5" />,
};

export default function TrackingPage() {
    const params = useParams();
    const orderId = params.orderId as string;
    const [data, setData] = useState<TrackingData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const supabase = createClient();

        async function fetchTracking() {
            try {
                // Fetch order
                const { data: order, error: orderErr } = await supabase
                    .from('orders')
                    .select('id, customer_name, address_line, items')
                    .eq('id', orderId)
                    .single();

                if (orderErr || !order) {
                    setError('Order not found');
                    setLoading(false);
                    return;
                }

                // Fetch latest task for this order
                const { data: tasks } = await supabase
                    .from('tasks')
                    .select('status, scheduled_start')
                    .eq('order_id', orderId)
                    .order('created_at', { ascending: false })
                    .limit(1);

                const task = tasks?.[0];

                setData({
                    orderId: order.id,
                    customerName: order.customer_name,
                    address: order.address_line,
                    status: (task?.status || 'CREATED') as TaskStatus,
                    scheduledStart: task?.scheduled_start,
                    items: order.items || [],
                });
            } catch {
                setError('Failed to load tracking data');
            } finally {
                setLoading(false);
            }
        }

        fetchTracking();

        // Subscribe to real-time task updates
        const channel = supabase
            .channel(`tracking-${orderId}`)
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'tasks',
                filter: `order_id=eq.${orderId}`,
            }, (payload) => {
                setData(prev => prev ? { ...prev, status: payload.new.status as TaskStatus } : prev);
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [orderId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#003f7d] via-[#0058a3] to-[#0073cf] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#003f7d] via-[#0058a3] to-[#0073cf] flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                    <div className="inline-flex items-center justify-center w-16 h-10 bg-[#fbd914] rounded mb-4">
                        <span className="text-[#0058a3] font-extrabold text-lg tracking-widest">IKEA</span>
                    </div>
                    <h1 className="text-xl font-bold text-gray-800 mb-2">Order Not Found</h1>
                    <p className="text-gray-500 text-sm">{error || 'Unable to find the requested order.'}</p>
                </div>
            </div>
        );
    }

    const currentStepIndex = STATUS_STEPS.indexOf(data.status);
    const colors = TASK_STATUS_COLORS[data.status] ?? { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#003f7d] via-[#0058a3] to-[#0073cf] flex items-center justify-center p-4">
            <div className="w-full max-w-lg">
                {/* Card */}
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-[#0058a3] px-6 py-6 text-center">
                        <div className="inline-flex items-center justify-center w-14 h-9 bg-[#fbd914] rounded mb-3">
                            <span className="text-[#0058a3] font-extrabold text-sm tracking-widest">IKEA</span>
                        </div>
                        <h1 className="text-white text-xl font-bold">Order Tracking</h1>
                        <p className="text-blue-200 text-sm mt-1">#{data.orderId}</p>
                    </div>

                    {/* Status */}
                    <div className="px-6 py-5 border-b">
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <p className="text-sm text-gray-500">Current Status</p>
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold mt-1 ${colors.bg} ${colors.text}`}>
                                    <span className={`w-2 h-2 rounded-full ${colors.dot}`} />
                                    {TASK_STATUS_LABELS[data.status] ?? data.status}
                                </span>
                            </div>
                            {STATUS_ICON[data.status] && (
                                <div className={`p-3 rounded-full ${colors.bg}`}>
                                    <span className={colors.text}>{STATUS_ICON[data.status]}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Progress Steps */}
                    <div className="px-6 py-5 border-b">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Progress</p>
                        <div className="space-y-3">
                            {STATUS_STEPS.map((step, idx) => {
                                const isCompleted = idx <= currentStepIndex;
                                const isCurrent = idx === currentStepIndex;
                                return (
                                    <div key={step} className="flex items-center gap-3">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold transition-all ${
                                            isCompleted
                                                ? 'bg-[#0058a3] text-white'
                                                : 'bg-gray-100 text-gray-400'
                                        } ${isCurrent ? 'ring-2 ring-[#0058a3] ring-offset-2' : ''}`}>
                                            {isCompleted ? '✓' : idx + 1}
                                        </div>
                                        <span className={`text-sm ${isCompleted ? 'font-medium text-gray-800' : 'text-gray-400'}`}>
                                            {TASK_STATUS_LABELS[step] ?? step}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Order Info */}
                    <div className="px-6 py-5 space-y-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span>{data.address}</span>
                        </div>
                        {data.scheduledStart && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                <span suppressHydrationWarning>
                                    {new Date(data.scheduledStart).toLocaleString('en-NZ', {
                                        weekday: 'short', month: 'short', day: 'numeric',
                                        hour: '2-digit', minute: '2-digit'
                                    })}
                                </span>
                            </div>
                        )}
                        {data.items.length > 0 && (
                            <div className="border rounded-lg p-3 space-y-1">
                                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide flex items-center gap-1">
                                    <Package className="w-3 h-3" /> Items
                                </p>
                                {data.items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between text-sm">
                                        <span className="text-gray-700">{item.name}</span>
                                        <span className="text-gray-400">×{item.quantity}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Live indicator */}
                    <div className="px-6 py-3 bg-gray-50 border-t">
                        <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                            Live updates enabled
                        </div>
                    </div>
                </div>

                <p className="text-center text-blue-200 text-xs mt-4">
                    IKEA Field Service · Real-time Tracking
                </p>
            </div>
        </div>
    );
}
