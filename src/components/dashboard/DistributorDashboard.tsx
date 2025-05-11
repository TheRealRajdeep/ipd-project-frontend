"use client";

import { useState, useEffect } from 'react';

// Components
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import ShipmentOverview from '@/components/dashboard/ShipmentOverview';
import PendingShipments from '@/components/dashboard/PendingShipments';
import RipenessTracker from '@/components/dashboard/RipenessTracker';
import InventoryWidget from '@/components/dashboard/InventoryWidget';

interface Shipment {
    id: number;
    source_location: string;
    destination: string;
    status: string;
    quality_score: number;
    predicted_ripeness: string;
    shelf_life: string;
    created_at: string;
}

interface DistributorDashboardProps {
    user: any;
}

export default function DistributorDashboard({ user }: DistributorDashboardProps) {
    const [incomingShipments, setIncomingShipments] = useState<Shipment[]>([]);
    const [inventory, setInventory] = useState<Shipment[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Create dummy data directly instead of using async function
        const dummyShipments = [
            {
                id: 1,
                source_location: "Farm A",
                destination: "Warehouse 1",
                status: "IN_TRANSIT",
                quality_score: 8.5,
                predicted_ripeness: "Ripe",
                shelf_life: "3-5 days",
                created_at: "2025-05-08T10:00:00Z"
            },
            {
                id: 2,
                source_location: "Farm B",
                destination: "Market X",
                status: "PENDING",
                quality_score: 7.2,
                predicted_ripeness: "Semi-ripe",
                shelf_life: "7-9 days",
                created_at: "2025-05-09T14:30:00Z"
            },
            {
                id: 3,
                source_location: "Farm C",
                destination: "Store Y",
                status: "DELIVERED",
                quality_score: 9.1,
                predicted_ripeness: "Ripe",
                shelf_life: "2-4 days",
                created_at: "2025-05-07T09:15:00Z"
            },
            {
                id: 4,
                source_location: "Farm D",
                destination: "Store Y",
                status: "DELIVERED",
                quality_score: 8.7,
                predicted_ripeness: "Ripe",
                shelf_life: "1-3 days",
                created_at: "2025-05-05T09:15:00Z"
            }
        ];

        const incoming = dummyShipments.filter(s => s.status !== 'DELIVERED');
        const delivered = dummyShipments.filter(s => s.status === 'DELIVERED');

        console.log("Setting distributor incoming shipments:", incoming);
        console.log("Setting distributor inventory:", delivered);

        setIncomingShipments(incoming);
        setInventory(delivered);
        setIsLoading(false);
    }, []);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
            <DashboardHeader user={user} />

            <main className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-blue-800">
                        Welcome back, {user?.first_name || 'Distributor'}!
                    </h1>
                    <p className="text-gray-600">Here's an overview of your distribution operations</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Pending Shipments */}
                    <div className="col-span-1 lg:col-span-2">
                        <PendingShipments shipments={incomingShipments || []} />
                    </div>

                    {/* Ripeness Tracker */}
                    <div className="col-span-1">
                        <RipenessTracker shipments={incomingShipments || []} />
                    </div>

                    {/* Inventory Widget */}
                    <div className="col-span-1 lg:col-span-2">
                        <InventoryWidget inventory={inventory || []} />
                    </div>

                    {/* All Shipments */}
                    <div className="col-span-1 lg:col-span-3">
                        <ShipmentOverview
                            shipments={[...incomingShipments, ...inventory]}
                            title="All Shipments"
                            viewAllLink="/shipments"
                        />
                    </div>
                </div>
            </main>
        </div>
    );
}