"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useStore } from "@/lib/store";
import { Assembler, DomainSkill } from "@/lib/types";

interface AssemblerFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    assembler?: Assembler | null; // If provided, we are in Edit mode
}

const SKILL_OPTIONS: DomainSkill[] = ['CABINETRY', 'PLUMBING', 'ELECTRICAL', 'MEASURING', 'COUNTERTOP'];

export function AssemblerFormModal({ isOpen, onClose, assembler }: AssemblerFormModalProps) {
    const { addAssembler, updateAssembler } = useStore();
    const [isLoading, setIsLoading] = useState(false);
    
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        region: '',
        skills: [] as string[],
        status: 'AVAILABLE'
    });

    useEffect(() => {
        if (assembler && isOpen) {
            setFormData({
                name: assembler.name,
                email: assembler.email || '',
                phone: assembler.phonePrimary || '',
                region: assembler.currentLocation.address || '',
                skills: assembler.skills || [],
                status: assembler.status || 'AVAILABLE'
            });
        } else if (isOpen) {
            setFormData({
                name: '',
                email: '',
                phone: '',
                region: '',
                skills: [],
                status: 'AVAILABLE'
            });
        }
    }, [assembler, isOpen]);

    if (!isOpen) return null;

    const isEdit = !!assembler;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const toggleSkill = (skill: string) => {
        setFormData(prev => {
            const skills = prev.skills.includes(skill)
                ? prev.skills.filter(s => s !== skill)
                : [...prev.skills, skill];
            return { ...prev, skills };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const success = isEdit
                ? await updateAssembler(assembler.id, {
                    name: formData.name,
                    email: formData.email,
                    phonePrimary: formData.phone,
                    currentLocation: { ...assembler.currentLocation, address: formData.region },
                    skills: formData.skills as DomainSkill[],
                    status: formData.status as import('@/lib/types').AssemblerStatus
                })
                : await addAssembler({
                    name: formData.name,
                    email: formData.email,
                    phonePrimary: formData.phone,
                    currentLocation: { lat: 0, lng: 0, address: formData.region },
                    skills: formData.skills as DomainSkill[],
                });

            if (success) {
                onClose();
            } else {
                alert(`Failed to ${isEdit ? 'update' : 'create'} assembler.`);
            }
        } catch (error) {
            console.error(`Error saving assembler:`, error);
            alert(`An error occurred. Please try again.`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-white rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b bg-gray-50">
                    <h2 className="text-xl font-bold text-[#111111]">
                        {isEdit ? 'Edit Assembler' : 'Add New Assembler'}
                    </h2>
                    <Button variant="ghost" size="icon" onClick={onClose} type="button">
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden h-full">
                    <div className="p-6 overflow-y-auto flex-1 space-y-5">

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <input
                                required
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#0058a3] focus:border-transparent outline-none"
                                placeholder="Jane Doe"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-xs text-gray-400 font-normal">(Login account)</span></label>
                            <input
                                required
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                disabled={isEdit} // Do not allow changing email for now because it's tied to Auth
                                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#0058a3] focus:border-transparent outline-none disabled:bg-gray-100 disabled:text-gray-500"
                                placeholder="jane@ikeaservice.com"
                            />
                            {isEdit && <p className="text-[10px] text-gray-400 mt-1">Email cannot be changed after creation.</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Phone</label>
                            <input
                                required
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#0058a3] focus:border-transparent outline-none"
                                placeholder="021 555 1234"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Home Region / Address</label>
                            <input
                                required
                                name="region"
                                value={formData.region}
                                onChange={handleInputChange}
                                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#0058a3] focus:border-transparent outline-none"
                                placeholder="Auckland, NZ"
                            />
                        </div>

                        {isEdit && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#0058a3] focus:border-transparent outline-none"
                                >
                                    <option value="AVAILABLE">AVAILABLE</option>
                                    <option value="WORKING">WORKING</option>
                                    <option value="INACTIVE">INACTIVE</option>
                                </select>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Skills</label>
                            <div className="flex gap-2">
                                {SKILL_OPTIONS.map(skill => (
                                    <button
                                        key={skill}
                                        type="button"
                                        onClick={() => toggleSkill(skill)}
                                        className={`px-3 py-1.5 text-xs font-bold rounded-full border transition-colors ${
                                            formData.skills.includes(skill)
                                                ? 'bg-[#0058a3] text-white border-[#0058a3]'
                                                : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                                        }`}
                                    >
                                        {skill}
                                    </button>
                                ))}
                            </div>
                            {formData.skills.length === 0 && <p className="text-xs text-red-500 mt-1">Select at least one skill</p>}
                        </div>

                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t flex justify-end gap-2 bg-gray-50">
                        <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading || formData.skills.length === 0}
                            className="bg-[#0058a3] hover:bg-[#004f93]"
                        >
                            {isLoading ? (isEdit ? 'Saving...' : 'Adding...') : (isEdit ? 'Save Changes' : 'Add Assembler')}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
