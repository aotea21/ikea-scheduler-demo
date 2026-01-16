"use client";

import { DashboardLayout } from "@/components/features/DashboardLayout";
import { useStore } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Star, MapPin } from "lucide-react";

export default function AssemblersPage() {
    const { assemblers } = useStore();

    return (
        <DashboardLayout>
            <div className="p-6 md:p-8 max-w-5xl mx-auto w-full">
                <h1 className="text-2xl font-bold mb-6 text-[#111111]">Assembler Workforce</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {assemblers.map((assembler) => (
                        <Card key={assembler.id} className="bg-white hover:shadow-md transition-shadow">
                            <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
                                    <User className="w-10 h-10 text-gray-400" />
                                </div>

                                <div className="space-y-1">
                                    <h3 className="font-bold text-lg">{assembler.name}</h3>
                                    <div className="flex items-center justify-center gap-1 text-sm font-medium">
                                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                        <span>{assembler.rating.toFixed(1)}</span>
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
                                    <span>{assembler.currentLocation.address}</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
}
