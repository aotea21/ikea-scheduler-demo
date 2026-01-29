"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface CreateAssemblerModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const SKILL_OPTIONS = ['EASY', 'MEDIUM', 'HARD'];

export function CreateAssemblerModal({ isOpen, onClose }: CreateAssemblerModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        rating: '5.0',
        addressLine: '',
        skills: [] as string[]
    });

    if (!isOpen) return null;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
            const response = await fetch('/api/assemblers/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to create assembler');
            }

            // Success
            onClose();
            // Reset form
            setFormData({
                name: '',
                phone: '',
                rating: '5.0',
                addressLine: '',
                skills: []
            });

        } catch (error) {
            console.error('Failed to create assembler:', error);
            alert('Failed to create assembler. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-white rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b bg-gray-50">
                    <h2 className="text-xl font-bold text-[#111111]">Add New Assembler</h2>
                    <Button variant="ghost" size="icon" onClick={onClose} type="button">
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden h-full">
                    <div className="p-6 overflow-y-auto flex-1 space-y-6">

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
                            <label className="block text-sm font-medium text-gray-700 mb-1">Starting Rating</label>
                            <input
                                type="number"
                                step="0.1"
                                min="1"
                                max="5"
                                name="rating"
                                value={formData.rating}
                                onChange={handleInputChange}
                                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#0058a3] focus:border-transparent outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Home Address / Base</label>
                            <input
                                required
                                name="addressLine"
                                value={formData.addressLine}
                                onChange={handleInputChange}
                                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#0058a3] focus:border-transparent outline-none"
                                placeholder="123 Main St, Auckland"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Skills</label>
                            <div className="flex gap-2">
                                {SKILL_OPTIONS.map(skill => (
                                    <button
                                        key={skill}
                                        type="button"
                                        onClick={() => toggleSkill(skill)}
                                        className={`px-3 py-1 text-xs font-bold rounded-full border transition-colors ${formData.skills.includes(skill)
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
                            {isLoading ? 'Adding...' : 'Add Assembler'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
