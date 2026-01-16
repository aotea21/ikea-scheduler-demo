"use client";

import { useStore } from "@/lib/store";
import { useEffect, useState } from "react";
// Leaflet imports
import Link from "next/link";
import 'leaflet/dist/leaflet.css';
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";

// Fix Leaflet Default Icon issue in Next.js/Webpack
const iconAnchor: [number, number] = [12, 41];
const iconSize: [number, number] = [25, 41];

const DefaultIcon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    iconAnchor,
    iconSize
});

const AssemblerIcon = L.icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const TaskIcon = L.icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const SelectedTaskIcon = L.icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

export default function MapComponent() {
    const { tasks, assemblers, orders, selectedTaskId, selectTask } = useStore();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) return <div className="h-full w-full bg-gray-100 flex items-center justify-center">Loading Map...</div>;

    const center = { lat: -36.8485, lng: 174.7633 }; // Auckland CBD Center

    return (
        <div className="h-full w-full z-0 relative">
            <MapContainer
                center={[center.lat, center.lng]}
                zoom={11}
                scrollWheelZoom={true}
                className="h-full w-full"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {/* Render Assemblers */}
                {assemblers.map(a => (
                    <Marker
                        key={a.id}
                        position={[a.currentLocation.lat, a.currentLocation.lng]}
                        icon={AssemblerIcon}
                    >
                        <Popup>
                            <div className="p-1">
                                <strong>{a.name}</strong><br />
                                Rating: {a.rating} ★<br />
                                Skills: {a.skills.join(', ')}
                            </div>
                        </Popup>
                    </Marker>
                ))}

                {/* Render Tasks */}
                {tasks.map(t => {
                    const order = orders.find(o => o.id === t.orderId);
                    if (!order) return null;
                    const isSelected = selectedTaskId === t.id;

                    return (
                        <Marker
                            key={t.id}
                            position={[order.address.lat, order.address.lng]}
                            icon={isSelected ? SelectedTaskIcon : TaskIcon}
                            eventHandlers={{
                                click: () => selectTask(t.id),
                            }}
                        >
                            <Popup>
                                <div className="p-1">
                                    <strong>Order #{order.id}</strong><br />
                                    {order.items[0].name}<br />
                                    Status: {t.status}
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>

            {/* Legend Overlay */}
            <div className="absolute bottom-4 right-4 bg-white p-3 rounded-lg shadow-md z-[1000] text-xs">
                <h4 className="font-bold mb-2">Map Legend</h4>
                <div className="flex items-center gap-2 mb-1">
                    <img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png" className="h-4" />
                    <span>Open Task</span>
                </div>
                <div className="flex items-center gap-2 mb-1">
                    <img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png" className="h-4" />
                    <span>Selected Task</span>
                </div>
                <div className="flex items-center gap-2">
                    <img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png" className="h-4" />
                    <span>Assembler</span>
                </div>
            </div>
        </div>
    );
}
