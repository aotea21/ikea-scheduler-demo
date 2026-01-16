"use client";

import { DashboardLayout } from "@/components/features/DashboardLayout";
import { useStore } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Package } from "lucide-react";

export default function OrdersPage() {
    const { orders } = useStore();

    return (
        <DashboardLayout>
            <div className="p-6 md:p-8 max-w-5xl mx-auto w-full">
                <h1 className="text-2xl font-bold mb-6 text-[#111111]">All Orders</h1>

                <div className="grid gap-4">
                    {orders.map((order) => (
                        <Card key={order.id} className="bg-white hover:shadow-md transition-shadow">
                            <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-lg">#{order.id.toUpperCase()}</span>
                                        <Badge variant="outline">Pending</Badge>
                                    </div>
                                    <h3 className="font-semibold text-lg">{order.items[0].name}</h3>
                                    <div className="text-sm text-gray-500 flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <Package className="w-4 h-4" />
                                            <span>{order.items.length} Items (SKU: {order.items[0].sku})</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4" />
                                            <span>{order.address.address}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col items-end gap-2">
                                    <div className="text-right">
                                        <span className="block text-sm font-medium text-gray-900">{order.customerName}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
}
