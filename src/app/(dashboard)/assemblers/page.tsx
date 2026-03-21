/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Plus, Mail, Phone, Edit2, Trash2 } from "lucide-react";
import { AssemblerFormModal } from "@/components/features/AssemblerFormModal";
import { Assembler } from "@/lib/types";
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

export default function AssemblersPage() {
    const { assemblers, deleteAssembler } = useStore();
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [editingAssembler, setEditingAssembler] = useState<Assembler | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // Filter out inactive assemblers from the view
    const activeAssemblers = assemblers.filter(a => a.status !== 'INACTIVE');

    const handleAddClick = () => {
        setEditingAssembler(null);
        setIsFormModalOpen(true);
    };

    const handleEditClick = (assembler: Assembler) => {
        setEditingAssembler(assembler);
        setIsFormModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!deletingId) return;
        await deleteAssembler(deletingId);
        setDeletingId(null);
    };

    return (
        <>
            <div className="p-6 md:p-8 max-w-5xl mx-auto w-full">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-[#111111]">Assembler Workforce</h1>
                        <p className="text-sm text-gray-500 mt-1">{activeAssemblers.length} active assemblers</p>
                    </div>
                    <Button onClick={handleAddClick} className="bg-[#0058a3] hover:bg-[#004f93]">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Assembler
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-16">
                    {activeAssemblers.map((assembler) => (
                        <Card key={assembler.id} className="bg-white hover:shadow-md transition-shadow relative overflow-hidden">
                            {/* Color bar top based on status */}
                            <div className={`absolute top-0 left-0 right-0 h-1.5 ${
                                assembler.status === 'AVAILABLE' ? 'bg-green-500' :
                                assembler.status === 'WORKING' ? 'bg-purple-500' :
                                assembler.status === 'EN_ROUTE' ? 'bg-orange-500' :
                                'bg-gray-300'
                            }`} />

                            <CardContent className="p-6 flex flex-col items-center text-center gap-4 pt-8">
                                {/* Actions absolute pos */}
                                <div className="absolute top-4 right-4 flex gap-1">
                                    <button 
                                        onClick={() => handleEditClick(assembler)}
                                        className="p-1.5 text-gray-400 hover:text-[#0058a3] hover:bg-blue-50 rounded-md transition-colors"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => setDeletingId(assembler.id)}
                                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center relative shadow-sm border border-gray-200">
                                    {assembler.avatarUrl ? (
                                        <img src={assembler.avatarUrl} alt={assembler.name} className="w-full h-full rounded-full object-cover" />
                                    ) : (
                                        <span className="text-gray-400 text-xl font-bold">
                                            {assembler.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                                        </span>
                                    )}
                                </div>

                                <div className="space-y-1 w-full">
                                    <h3 className="font-bold text-lg text-gray-900 truncate px-4">{assembler.name}</h3>
                                    <div className="flex justify-center items-center gap-2">
                                        <Badge variant="outline" className={`text-[10px] font-bold ${
                                            assembler.status === 'AVAILABLE' ? 'text-green-700 bg-green-50 border-green-200' :
                                            assembler.status === 'WORKING' ? 'text-purple-700 bg-purple-50 border-purple-200' :
                                            assembler.status === 'EN_ROUTE' ? 'text-orange-700 bg-orange-50 border-orange-200' :
                                            'text-gray-600 bg-gray-50 border-gray-200'
                                        }`}>
                                            {assembler.status}
                                        </Badge>
                                        
                                        <div className="flex items-center gap-1 text-sm font-medium">
                                            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                                            <span>{assembler.rating.toFixed(1)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="w-full space-y-2 mt-2 bg-gray-50 p-3 rounded-lg text-left">
                                    <div className="flex items-center gap-2 text-xs text-gray-600">
                                        <Mail className="w-3.5 h-3.5 text-gray-400" />
                                        <span className="truncate">{assembler.email || 'No email provided'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-600">
                                        <Phone className="w-3.5 h-3.5 text-gray-400" />
                                        <span>{assembler.phonePrimary || 'No phone'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-600">
                                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                                        <span className="truncate">{assembler.currentLocation.address || 'Unknown Location'}</span>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-1.5 justify-center mt-2">
                                    {assembler.skills.map(skill => (
                                        <Badge key={skill} variant="secondary" className="text-[10px] bg-white border border-gray-200">
                                            {skill}
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            <AssemblerFormModal
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                assembler={editingAssembler}
            />

            <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Deactivate Assembler</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to deactivate this assembler? They will no longer be visible in the active workforce or be assignable to new tasks. Their history will remain intact.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
                            Deactivate
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
        );
}
