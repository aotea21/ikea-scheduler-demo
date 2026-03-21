"use client";

import { useState } from "react";
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
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { CreateOrderModal } from "@/components/features/CreateOrderModal";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function OrdersPage() {
    const { orders, fetchOrders, isLoading } = useStore();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingOrder, setEditingOrder] = useState<import('@/lib/types').Order | null>(null);
    const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async (orderId: string) => {
        setIsDeleting(true);
        try {
            const response = await fetch(`/api/orders/${orderId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                let errorMessage = 'Failed to delete order';
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorMessage;
                } catch (e: unknown) {
                    console.error('Failed to parse error:', e);
                    // Ignore JSON parse error, use default message
                }
                throw new Error(errorMessage);
            }

            // Refresh orders list
            await fetchOrders();
            setDeletingOrderId(null);
        } catch (error) {
            console.error('Error deleting order:', error);
            alert('Failed to delete order. Please try again.');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto w-full">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <h1 className="text-2xl font-bold text-[#111111]">All Orders</h1>
                        <Badge variant="outline" className="text-sm px-3 py-1">
                            Total Orders: {orders.length}
                        </Badge>
                    </div>
                    <Button onClick={() => setIsCreateModalOpen(true)} className="bg-[#0058a3] hover:bg-[#004f93]">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Order
                    </Button>
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
                                    <TableHead className="w-[120px] text-center font-semibold">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {orders.map((order) => (
                                    <TableRow key={order.id} className="hover:bg-blue-50/50 transition-colors">
                                        <TableCell className="font-medium text-[#0058a3]">
                                            #{order.id.slice(0, 8).toUpperCase()}
                                        </TableCell>
                                        <TableCell>{order.customerName}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col text-sm">
                                                <span>{order.customerPhone}</span>
                                                <span className="text-gray-500 text-xs">{order.email}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm">{order.address.address}</TableCell>
                                        <TableCell>{order.deliveryDate}</TableCell>
                                        <TableCell>{order.assemblyWindow}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1">
                                                {(order.items || []).map((item, idx) => (
                                                    <div key={idx} className="text-sm">
                                                        <span className="font-medium">{item.name}</span>
                                                        <span className="text-gray-500 text-xs ml-1">(x{item.quantity})</span>
                                                    </div>
                                                ))}
                                                <span className="text-xs text-gray-400">SKU: {(order.items || [])[0]?.sku}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right text-sm">
                                            {Math.floor(order.estimatedTime / 60)}h {order.estimatedTime % 60}m
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            ${(order.serviceFee || 0).toFixed(2)}
                                        </TableCell>
                                        <TableCell className="text-sm text-gray-500 italic">
                                            {order.notes || "-"}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center justify-center gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-[#0058a3]"
                                                    onClick={() => {
                                                        setEditingOrder(order);
                                                        setIsCreateModalOpen(true);
                                                    }}
                                                    title="Edit order"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                                                    onClick={() => setDeletingOrderId(order.id)}
                                                    title="Delete order"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center text-gray-500">
                                <p className="text-lg font-medium">Loading orders...</p>
                            </div>
                        ) : orders.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center text-gray-500">
                                <p className="text-lg font-medium">No orders found</p>
                                <p className="text-sm">Click &apos;Create Order&apos; to add a new order.</p>
                            </div>
                        ) : null}
                    </div>
                </Card>

                <CreateOrderModal
                    isOpen={isCreateModalOpen}
                    onClose={() => {
                        setIsCreateModalOpen(false);
                        setEditingOrder(null);
                    }}
                    order={editingOrder}
                    onSuccess={() => {
                        fetchOrders();
                        setIsCreateModalOpen(false);
                        setEditingOrder(null);
                    }}
                />

                {/* Delete Confirmation Dialog */}
                <AlertDialog open={deletingOrderId !== null} onOpenChange={(open: boolean) => !open && setDeletingOrderId(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete Order</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to delete this order? This will also delete all associated tasks.
                                This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={() => deletingOrderId && handleDelete(deletingOrderId)}
                                disabled={isDeleting}
                                className="bg-red-600 hover:bg-red-700"
                            >
                                {isDeleting ? 'Deleting...' : 'Delete'}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        );
}
