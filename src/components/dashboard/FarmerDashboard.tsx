"use client";

import { useState, useEffect } from 'react';

// Components
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import WeatherWidget from '@/components/dashboard/WeatherWidget';
import ShipmentOverview from '@/components/dashboard/ShipmentOverview';
import QualityMetrics from '@/components/dashboard/QualityMetrics';
import MarketPrices from '@/components/dashboard/MarketPrices';

interface FarmerDashboardProps {
    user: any;
}

interface Shipment {
    id: number;
    source_location: string;
    destination: string;
    status: string;
    quality_score: number;
    predicted_ripeness: string;
    created_at: string;
}

export default function FarmerDashboard({ user }: FarmerDashboardProps) {
    const [shipments, setShipments] = useState<Shipment[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Create dummy data right away instead of using async function
        const dummyShipments = [
            {
                id: 1,
                source_location: "Farm A",
                destination: "Warehouse 1",
                status: "DELIVERED",
                quality_score: 8.5,
                predicted_ripeness: "Ripe",
                created_at: "2025-05-08T10:00:00Z"
            },
            {
                id: 2,
                source_location: "Farm B",
                destination: "Market X",
                status: "IN_TRANSIT",
                quality_score: 7.2,
                predicted_ripeness: "Semi-ripe",
                created_at: "2025-05-09T14:30:00Z"
            },
            {
                id: 3,
                source_location: "Farm A",
                destination: "Store Y",
                status: "PENDING",
                quality_score: 9.1,
                predicted_ripeness: "Unripe",
                created_at: "2025-05-10T09:15:00Z"
            }
        ];

        console.log("Setting farmer dummy shipments:", dummyShipments);
        setShipments(dummyShipments);
        setIsLoading(false);

    }, []);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-green-500"></div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-green-50 to-emerald-100 min-h-screen">
            <DashboardHeader user={user} />

            <main className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-green-800">
                        Welcome back, {user?.first_name || 'Farmer'}!
                    </h1>
                    <p className="text-gray-600">Here's an overview of your farm's performance</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Weather Widget */}
                    <div className="col-span-1">
                        <WeatherWidget location={user?.profile?.address || "Unknown location"} />
                    </div>

                    {/* Shipment Overview - explicitly pass an array to avoid undefined */}
                    <div className="col-span-1 lg:col-span-2">
                        <ShipmentOverview
                            shipments={shipments || []}
                            title="My Shipments"
                            viewAllLink="/shipments"
                        />
                    </div>

                    {/* Quality Metrics */}
                    <div className="col-span-1">
                        <QualityMetrics shipments={shipments || []} />
                    </div>

                    {/* Market Prices */}
                    <div className="col-span-1 lg:col-span-2">
                        <MarketPrices />
                    </div>
                </div>
            </main>
        </div>
    );
}