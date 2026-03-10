"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { X, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import * as React from 'react';

interface OrderItem {
    name: string;
    sku: string;
    quantity: number;
}

interface CreateOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    order?: any; // Using any for now to avoid strict type checks against the store Order type if it differs slightly
    onSuccess?: () => void;
}

export function CreateOrderModal({ isOpen, onClose, order, onSuccess }: CreateOrderModalProps) {
    const [isLoading, setIsLoading] = useState(false);

    // Initialize state properly based on order prop if present
    const [formData, setFormData] = useState(() => ({
        customerName: order?.customerName || '',
        customerPhone: order?.customerPhone || '',
        email: order?.email || '',
        addressLine: order?.address.address || '',
        deliveryDate: order?.deliveryDate || '',
        assemblyWindowStart: order?.assemblyWindow ? order.assemblyWindow.split(' - ')[0] : '09:00',
        assemblyWindowEnd: order?.assemblyWindow ? order.assemblyWindow.split(' - ')[1] : '12:00',
        serviceFee: order?.serviceFee ? order.serviceFee.toString() : '100',
        notes: order?.notes || ''
    }));

    const [items, setItems] = useState<OrderItem[]>(() =>
        order?.items ? order.items.map((item: any) => ({
            name: item.name,
            sku: item.sku || '',
            quantity: item.quantity
        })) : [{ name: '', sku: '', quantity: 1 }]
    );

    // Effect to update state when order prop changes (e.g. when opening modal for different orders)
    // We can't rely on this alone because isOpen toggles
    // But since we mount/unmount or just show/hide, we should ensure data is fresh.
    // simpler: pass a key to component in parent or use useEffect.
    // Let's rely on the parent to unmount or reset, OR use useEffect here.
    // Actually simpler: Parent controls mounting or we use useEffect

    // Using useEffect to reset/set form data when modal opens/order changes
    React.useEffect(() => {
        if (isOpen) {
            setFormData({
                customerName: order?.customerName || '',
                customerPhone: order?.customerPhone || '',
                email: order?.email || '',
                addressLine: order?.address?.address || order?.addressLine || '',
                deliveryDate: order?.deliveryDate || '',
                assemblyWindowStart: order?.assemblyWindow ? order.assemblyWindow.split(' - ')[0] : '09:00',
                assemblyWindowEnd: order?.assemblyWindow ? order.assemblyWindow.split(' - ')[1] : '12:00',
                serviceFee: order?.serviceFee ? order.serviceFee.toString() : '100',
                notes: order?.notes || ''
            });
            setItems(order?.items ? order.items.map((item: any) => ({
                name: item.name,
                sku: item.sku || '',
                quantity: item.quantity
            })) : [{ name: '', sku: '', quantity: 1 }]);
        }
    }, [isOpen, order]);

    if (!isOpen) return null;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleItemChange = (index: number, field: keyof OrderItem, value: string | number) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        setItems(newItems);
    };

    const addItem = () => {
        setItems([...items, { name: '', sku: '', quantity: 1 }]);
    };

    const removeItem = (index: number) => {
        if (items.length > 1) {
            setItems(items.filter((_, i) => i !== index));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const payload = {
                ...formData,
                items
            };

            const url = order ? `/api/orders/${order.id}` : '/api/orders/create';
            const method = order ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || `Failed to ${order ? 'update' : 'create'} order`);
            }

            // Success
            if (onSuccess) onSuccess();
            onClose();

            // Only reset if creating
            if (!order) {
                setFormData({
                    customerName: '',
                    customerPhone: '',
                    email: '',
                    addressLine: '',
                    deliveryDate: '',
                    assemblyWindowStart: '09:00',
                    assemblyWindowEnd: '12:00',
                    serviceFee: '100',
                    notes: ''
                });
                setItems([{ name: '', sku: '', quantity: 1 }]);
            }

        } catch (error) {
            console.error(`Failed to ${order ? 'update' : 'create'} order:`, error);
            alert(error instanceof Error ? error.message : `Failed to ${order ? 'update' : 'create'} order. Please try again.`);

        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-2xl bg-white rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b bg-gray-50">
                    <h2 className="text-xl font-bold text-[#111111]">{order ? 'Edit Order' : 'Create New Order'}</h2>
                    <Button variant="ghost" size="icon" onClick={onClose} type="button">
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden h-full">
                    <div className="p-6 overflow-y-auto flex-1 space-y-6">

                        {/* Customer Info */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-sm uppercase tracking-wide text-gray-500 border-b pb-2">Customer Details</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                    <input
                                        required
                                        name="customerName"
                                        value={formData.customerName}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#0058a3] focus:border-transparent outline-none"
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                    <input
                                        required
                                        name="customerPhone"
                                        value={formData.customerPhone}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#0058a3] focus:border-transparent outline-none"
                                        placeholder="021 123 4567"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#0058a3] focus:border-transparent outline-none"
                                        placeholder="john@example.com"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                    <input
                                        required
                                        name="addressLine"
                                        value={formData.addressLine}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#0058a3] focus:border-transparent outline-none"
                                        placeholder="123 Queen St, Auckland"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Delivery Info */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-sm uppercase tracking-wide text-gray-500 border-b pb-2">Delivery & Service</h3>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                    <input
                                        required
                                        type="date"
                                        name="deliveryDate"
                                        value={formData.deliveryDate}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#0058a3] focus:border-transparent outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Window Start</label>
                                    <input
                                        type="time"
                                        name="assemblyWindowStart"
                                        value={formData.assemblyWindowStart}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#0058a3] focus:border-transparent outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Window End</label>
                                    <input
                                        type="time"
                                        name="assemblyWindowEnd"
                                        value={formData.assemblyWindowEnd}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#0058a3] focus:border-transparent outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Fee ($)</label>
                                    <input
                                        type="number"
                                        name="serviceFee"
                                        value={formData.serviceFee}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#0058a3] focus:border-transparent outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Items */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between border-b pb-2">
                                <h3 className="font-semibold text-sm uppercase tracking-wide text-gray-500">Items</h3>
                                <Button type="button" variant="outline" size="sm" onClick={addItem} className="h-7 text-xs">
                                    <Plus className="h-3 w-3 mr-1" /> Add Item
                                </Button>
                            </div>

                            <div className="space-y-3">
                                {items.map((item, idx) => (
                                    <div key={idx} className="flex gap-2 items-start bg-gray-50 p-3 rounded">
                                        <div className="flex-1">
                                            <input
                                                required
                                                placeholder="Product Name"
                                                value={item.name}
                                                onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                                                className="w-full p-2 border border-gray-300 rounded text-sm mb-2"
                                            />
                                            <div className="flex gap-2">
                                                <input
                                                    placeholder="SKU"
                                                    value={item.sku}
                                                    onChange={(e) => handleItemChange(idx, 'sku', e.target.value)}
                                                    className="w-1/2 p-2 border border-gray-300 rounded text-sm"
                                                />
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={item.quantity}
                                                    onChange={(e) => handleItemChange(idx, 'quantity', parseInt(e.target.value))}
                                                    className="w-1/2 p-2 border border-gray-300 rounded text-sm"
                                                />
                                            </div>
                                        </div>
                                        {items.length > 1 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeItem(idx)}
                                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                            <textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleInputChange}
                                rows={3}
                                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#0058a3] focus:border-transparent outline-none"
                                placeholder="Gate code, special instructions, etc."
                            />
                        </div>

                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t flex justify-end gap-2 bg-gray-50">
                        <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading} className="bg-[#0058a3] hover:bg-[#004f93]">
                            {isLoading ? (order ? 'Updating...' : 'Creating...') : (order ? 'Save Changes' : 'Create Order')}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
