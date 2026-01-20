"use client";

import { DashboardLayout } from "@/components/features/DashboardLayout";
import { useStore } from "@/lib/store";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export default function OrdersPage() {
    const { orders } = useStore();

    return (
        <DashboardLayout>
            <div className="p-6 md:p-8 max-w-7xl mx-auto w-full">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-[#111111]">All Orders</h1>
                    <Badge variant="outline" className="text-sm px-3 py-1">
                        Total Orders: {orders.length}
                    </Badge>
                </div>

                <Card className="bg-white overflow-hidden shadow-sm border border-gray-200">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50 hover:bg-gray-50">
                                    <TableHead className="w-[100px] font-semibold">Order ID</TableHead>
                                    <TableHead className="font-semibold">Customer</TableHead>
                                    <TableHead className="font-semibold">Contact</TableHead>
                                    <TableHead className="min-w-[150px] font-semibold">Address</TableHead>
                                    <TableHead className="font-semibold">Delivery Date</TableHead>
                                    <TableHead className="font-semibold">Assembly Window</TableHead>
                                    <TableHead className="font-semibold">Products</TableHead>
                                    <TableHead className="text-right font-semibold">Est. Time</TableHead>
                                    <TableHead className="text-right font-semibold">Service Fee</TableHead>
                                    <TableHead className="min-w-[150px] font-semibold">Notes</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {orders.map((order) => (
                                    <TableRow key={order.id} className="hover:bg-blue-50/50 transition-colors">
                                        <TableCell className="font-medium text-[#0058a3]">
                                            #{order.id.toUpperCase()}
                                        </TableCell>
                                        <TableCell>{order.customerName}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col text-sm">
                                                <span>{order.phone}</span>
                                                <span className="text-gray-500 text-xs">{order.email}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm">{order.address.address}</TableCell>
                                        <TableCell>{order.deliveryDate}</TableCell>
                                        <TableCell>{order.assemblyWindow}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1">
                                                {order.items.map((item, idx) => (
                                                    <div key={idx} className="text-sm">
                                                        <span className="font-medium">{item.name}</span>
                                                        <span className="text-gray-500 text-xs ml-1">(x{item.quantity})</span>
                                                    </div>
                                                ))}
                                                <span className="text-xs text-gray-400">SKU: {order.items[0]?.sku}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right text-sm">
                                            {Math.floor(order.estimatedTime / 60)}h {order.estimatedTime % 60}m
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            ${order.serviceFee.toFixed(2)}
                                        </TableCell>
                                        <TableCell className="text-sm text-gray-500 italic">
                                            {order.notes || "-"}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </Card>
            </div>
        </DashboardLayout>
    );
}
