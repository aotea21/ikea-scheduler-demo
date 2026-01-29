"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/features/DashboardLayout";
import { useStore } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Star, MapPin, Plus } from "lucide-react";
import { CreateAssemblerModal } from "@/components/features/CreateAssemblerModal";

export default function AssemblersPage() {
    const { assemblers } = useStore();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    return (
        <DashboardLayout>
            <div className="p-6 md:p-8 max-w-5xl mx-auto w-full">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-[#111111]">Assembler Workforce</h1>
                    <Button onClick={() => setIsCreateModalOpen(true)} className="bg-[#0058a3] hover:bg-[#004f93]">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Assembler
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {assemblers.map((assembler) => (
                        <Card key={assembler.id} className="bg-white hover:shadow-md transition-shadow">
                            <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
                                    {assembler.avatarUrl ? (
                                        <img src={assembler.avatarUrl} alt={assembler.name} className="w-full h-full rounded-full object-cover" />
                                    ) : (
                                        <User className="w-10 h-10 text-gray-400" />
                                    )}
                                </div>

                                <div className="space-y-1">
                                    <h3 className="font-bold text-lg">{assembler.name}</h3>
                                    <div className="flex items-center justify-center gap-1 text-sm font-medium">
                                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                        <span>{assembler.rating.toFixed(1)}</span>
                                        <span className="text-gray-400 text-xs">({assembler.ratingCount})</span>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2 justify-center">
                                    {assembler.skills.map(skill => (
                                        <Badge key={skill} variant="secondary" className="text-[10px]">
                                            {skill}
                                        </Badge>
                                    ))}
                                </div>

                                <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                                    <MapPin className="w-3 h-3" />
                                    <span>{assembler.currentLocation.address || 'Unknown Location'}</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <CreateAssemblerModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                />
            </div>
        </DashboardLayout>
    );
}
