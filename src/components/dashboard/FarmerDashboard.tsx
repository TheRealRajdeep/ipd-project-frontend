"use client";
import { createAPIRequest } from '@/lib/apiUtils';
import { useState, useEffect } from 'react';
// import { shipmentService } from '@/services/api';

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
    origin: string;
    destination: string;
    status: string;
    quantity: number;
    ripeness_status: string;
    dominant_ripeness: string;
    shelf_life: string;
    created_at: string;
    shipment_date: string;
    estimated_arrival: string;
}

// Dummy data that matches your actual model (for fallback)
const dummyFarmerShipments = [
    {
        id: 1,
        origin: "Farm A",
        destination: "Distribution Center",
        status: "IN_TRANSIT",
        quantity: 100,
        ripeness_status: "unripe",
        dominant_ripeness: "unripe",
        shelf_life: "10 days",
        created_at: "2025-05-08T10:00:00Z",
        shipment_date: "2025-05-08",
        estimated_arrival: "2025-05-12"
    },
    {
        id: 2,
        origin: "Farm A",
        destination: "Retailer B",
        status: "PENDING",
        quantity: 75,
        ripeness_status: "unripe",
        dominant_ripeness: "unripe",
        shelf_life: "14 days",
        created_at: "2025-05-10T10:00:00Z",
        shipment_date: "2025-05-10",
        estimated_arrival: "2025-05-15"
    }
];

export default function FarmerDashboard({ user }: FarmerDashboardProps) {
    const [shipments, setShipments] = useState<Shipment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchShipments() {
            try {
                // Store token in localStorage for the request
                if (user?.auth_token) {
                    localStorage.setItem('auth_token', user.auth_token);
                }

                const response = await createAPIRequest('/api/shipments/', 'GET', {
                    created_by: 'current'
                });

                if (response) {
                    console.log("Fetched farmer shipments:", response.data);
                    setShipments(response.data);
                } else {
                    throw new Error("No response received from API");
                }
            } catch (err: any) {
                console.error("Error fetching shipments:", err);
                setError("Failed to load shipments. Using demo data instead.");

                // Fallback to dummy data
                setShipments(dummyFarmerShipments);
            } finally {
                setIsLoading(false);
            }
        }

        fetchShipments();
    }, [user]);

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
                    <p className="text-gray-600">Here's an overview of your farm's shipments</p>

                    {error && (
                        <div className="mt-2 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                            {error}
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Weather Widget */}
                    <div className="col-span-1">
                        <WeatherWidget location={user?.profile?.address || "Unknown location"} />
                    </div>

                    {/* Shipment Overview */}
                    <div className="col-span-1 lg:col-span-2">
                        <ShipmentOverview
                            shipments={shipments}
                            title="My Shipments"
                            viewAllLink="/shipments"
                        />
                    </div>

                    {/* Quality Metrics */}
                    <div className="col-span-1">
                        <QualityMetrics shipments={shipments} />
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