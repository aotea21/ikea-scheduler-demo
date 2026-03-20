"use client";

import { useStore } from "@/lib/store";
import { useEffect, useState, useCallback } from "react";
import 'leaflet/dist/leaflet.css';
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import { AssemblyTask, Assembler, AssemblerStatus, TaskStatus } from "@/lib/types";

// ─── Icon Factories ─────────────────────────────────────────────────────────

/** Assembler status → ring color CSS */
const ASSEMBLER_RING: Record<AssemblerStatus, string> = {
    OFFLINE:   '#9ca3af',
    AVAILABLE: '#22c55e',
    ASSIGNED:  '#3b82f6',
    EN_ROUTE:  '#f97316',
    WORKING:   '#ef4444',
    BUSY:      '#ef4444',
    INACTIVE:  '#d1d5db',
};

const ASSEMBLER_BG: Record<AssemblerStatus, string> = {
    OFFLINE:   '#f3f4f6',
    AVAILABLE: '#dcfce7',
    ASSIGNED:  '#dbeafe',
    EN_ROUTE:  '#ffedd5',
    WORKING:   '#fee2e2',
    BUSY:      '#fee2e2',
    INACTIVE:  '#f3f4f6',
};

/** Task status → dot color */
const TASK_DOT: Record<string, string> = {
    CREATED:    '#9ca3af',
    SCHEDULING: '#a78bfa',
    ASSIGNED:   '#3b82f6',
    CONFIRMED:  '#6366f1',
    EN_ROUTE:   '#f97316',
    ARRIVED:    '#f59e0b',
    IN_PROGRESS:'#8b5cf6',
    COMPLETED:  '#22c55e',
    VERIFIED:   '#16a34a',
    ISSUE:      '#ef4444',
    CANCELLED:  '#6b7280',
};

function assemblerDivIcon(status: AssemblerStatus, name: string, selected: boolean) {
    const ring = ASSEMBLER_RING[status] ?? '#9ca3af';
    const bg   = ASSEMBLER_BG[status]  ?? '#f3f4f6';
    const pulse = status === 'EN_ROUTE' ? 'animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;' : '';
    const initial = name.charAt(0).toUpperCase();
    const border  = selected ? '3px solid #0058a3' : `2px solid ${ring}`;
    const shadow  = selected ? '0 0 0 3px rgba(0,88,163,0.4)' : `0 0 0 2px ${ring}40`;

    return L.divIcon({
        className: '',
        iconAnchor: [18, 18],
        iconSize:   [36, 36],
        html: `
            <div style="position:relative;width:36px;height:36px;">
                ${status === 'EN_ROUTE' ? `
                <div style="position:absolute;inset:0;border-radius:50%;background:${ring};opacity:0.3;${pulse}"></div>
                ` : ''}
                <div style="
                    position:absolute;inset:0;
                    border-radius:50%;
                    background:${bg};
                    border:${border};
                    box-shadow:${shadow};
                    display:flex;align-items:center;justify-content:center;
                    font-weight:700;font-size:13px;color:${ring};
                    font-family:sans-serif;
                ">${initial}</div>
            </div>
        `,
    });
}

function taskDivIcon(status: TaskStatus, selected: boolean) {
    const color = TASK_DOT[status] ?? '#6b7280';
    const size  = selected ? 18 : 14;
    const border = selected ? '2.5px solid #0058a3' : `2px solid ${color}`;
    return L.divIcon({
        className: '',
        iconAnchor: [size / 2, size / 2],
        iconSize:   [size, size],
        html: `<div style="
            width:${size}px;height:${size}px;border-radius:50%;
            background:${color};border:${border};
            box-shadow:0 1px 4px rgba(0,0,0,0.3);
        "></div>`,
    });
}

// ─── Map auto-fly helper ─────────────────────────────────────────────────────

function FlyToSelected({ lat, lng }: { lat: number | null; lng: number | null }) {
    const map = useMap();
    useEffect(() => {
        if (lat && lng) map.flyTo([lat, lng], Math.max(map.getZoom(), 13), { duration: 1 });
    }, [lat, lng, map]);
    return null;
}

// ─── Props ───────────────────────────────────────────────────────────────────

interface MapComponentProps {
    /** If provided, only tasks/assemblers with these IDs are shown highlighted */
    highlightAssemblerStatus?: AssemblerStatus | null;
    selectedAssemblerId?: string | null;
    onAssemblerClick?: (id: string) => void;
    onTaskClick?: (id: string) => void;
}

export default function MapComponent({
    highlightAssemblerStatus,
    selectedAssemblerId,
    onAssemblerClick,
    onTaskClick,
}: MapComponentProps = {}) {
    const { tasks, assemblers, orders, selectedTaskId, selectTask } = useStore();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => { setTimeout(() => setIsMounted(true), 0); }, []);

    const handleTaskClick = useCallback((taskId: string) => {
        selectTask(taskId);
        onTaskClick?.(taskId);
    }, [selectTask, onTaskClick]);

    if (!isMounted) {
        return (
            <div className="h-full w-full bg-gray-100 flex items-center justify-center">
                <div className="text-center space-y-2">
                    <div className="w-8 h-8 border-2 border-[#0058a3] border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-xs text-gray-400">Loading Map…</p>
                </div>
            </div>
        );
    }

    const center: [number, number] = [-36.8485, 174.7633]; // Auckland CBD

    // Determine fly-to target
    const selectedTask      = tasks.find(t => t.id === selectedTaskId);
    const selectedOrder     = selectedTask ? orders.find(o => o.id === selectedTask.orderId) : null;
    const flyLat = selectedOrder?.address?.lat ?? null;
    const flyLng = selectedOrder?.address?.lng ?? null;

    // Filter assemblers by status if required
    const visibleAssemblers: Assembler[] = highlightAssemblerStatus
        ? assemblers.filter(a => a.status === highlightAssemblerStatus)
        : assemblers;

    return (
        <div className="h-full w-full z-0 relative rounded-xl overflow-hidden">
            <MapContainer
                center={center}
                zoom={11}
                scrollWheelZoom={true}
                className="h-full w-full"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {flyLat && flyLng && <FlyToSelected lat={flyLat} lng={flyLng} />}

                {/* ── Assembler Markers ── */}
                {visibleAssemblers.map(a => {
                    const lat = a.currentLocation?.lat;
                    const lng = a.currentLocation?.lng;
                    if (!lat || !lng) return null;
                    const isSelected = selectedAssemblerId === a.id;
                    return (
                        <Marker
                            key={a.id}
                            position={[lat, lng]}
                            icon={assemblerDivIcon(a.status, a.name, isSelected)}
                            zIndexOffset={isSelected ? 1000 : 100}
                            eventHandlers={{ click: () => onAssemblerClick?.(a.id) }}
                        >
                            <Popup>
                                <div className="text-xs space-y-1 min-w-[140px]">
                                    <div className="font-bold text-sm border-b pb-1">{a.name}</div>
                                    <div className="flex items-center gap-1">
                                        <span className="w-2 h-2 rounded-full inline-block" style={{ background: ASSEMBLER_RING[a.status] }} />
                                        <span className="font-medium" style={{ color: ASSEMBLER_RING[a.status] }}>{a.status}</span>
                                    </div>
                                    <div>⭐ {a.rating} · {a.skills?.join(', ')}</div>
                                    {a.activeTaskId && <div className="text-orange-600 font-medium">Active task assigned</div>}
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}

                {/* ── Task Markers ── */}
                {tasks.map((t: AssemblyTask) => {
                    const order = orders.find(o => o.id === t.orderId);
                    if (!order) return null;
                    const lat = order.address?.lat;
                    const lng = order.address?.lng;
                    if (!lat || !lng) return null;
                    const isSelected = selectedTaskId === t.id;

                    return (
                        <Marker
                            key={t.id}
                            position={[lat, lng]}
                            icon={taskDivIcon(t.status, isSelected)}
                            zIndexOffset={isSelected ? 900 : 0}
                            eventHandlers={{ click: () => handleTaskClick(t.id) }}
                        >
                            <Popup>
                                <div className="text-xs space-y-1 min-w-[160px]">
                                    <div className="font-bold text-[#0058a3] border-b pb-1">
                                        Order #{order.id.slice(0, 8).toUpperCase()}
                                    </div>
                                    <div className="font-semibold">{order.items?.[0]?.name}</div>
                                    <div className="flex items-center gap-1">
                                        <span className="w-2 h-2 rounded-full inline-block" style={{ background: TASK_DOT[t.status] ?? '#6b7280' }} />
                                        <span>{t.status}</span>
                                    </div>
                                    <div className="text-gray-400 italic">{order.address.address}</div>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>

            {/* ── Legend overlay ── */}
            <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm p-3 rounded-xl shadow-lg z-[1000] text-[11px] border border-gray-100">
                <div className="font-bold text-gray-700 mb-2 text-xs">Assemblers</div>
                {(Object.entries(ASSEMBLER_RING) as [AssemblerStatus, string][])
                    .filter(([s]) => s !== 'OFFLINE')
                    .map(([status, color]) => (
                        <div key={status} className="flex items-center gap-1.5 mb-1">
                            <span className="w-3 h-3 rounded-full inline-block flex-shrink-0" style={{ background: color }} />
                            <span className="text-gray-600">{status.replace('_', ' ')}</span>
                        </div>
                    ))}
                <div className="font-bold text-gray-700 mt-2 mb-1.5 text-xs border-t pt-1.5">Tasks</div>
                {[
                    ['#3b82f6', 'Assigned'],
                    ['#f97316', 'En Route'],
                    ['#8b5cf6', 'In Progress'],
                    ['#ef4444', 'Issue'],
                    ['#22c55e', 'Completed'],
                ].map(([color, label]) => (
                    <div key={label} className="flex items-center gap-1.5 mb-1">
                        <span className="w-3 h-3 rounded-full inline-block flex-shrink-0" style={{ background: color }} />
                        <span className="text-gray-600">{label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
