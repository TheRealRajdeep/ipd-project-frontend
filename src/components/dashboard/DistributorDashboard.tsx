"use client";

import { useState, useEffect } from 'react';
import { createAPIRequest } from '@/lib/apiUtils';
import { useRouter } from 'next/navigation';
import axios from 'axios';

// Components
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import ShipmentOverview from '@/components/dashboard/ShipmentOverview';
import PendingShipments from '@/components/dashboard/PendingShipments';
import RipenessTracker from '@/components/dashboard/RipenessTracker';
import InventoryWidget from '@/components/dashboard/InventoryWidget';
// import { shipmentService } from '@/services/api';
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
    current_lat?: number;
    current_lon?: number;
}

interface DistributorDashboardProps {
    user: any;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Dummy data for fallback
const dummyIncomingShipments = [
    {
        id: 3,
        origin: "Farm C",
        destination: "Distribution Center",
        status: "IN_TRANSIT",
        quantity: 150,
        ripeness_status: "unripe",
        dominant_ripeness: "unripe",
        shelf_life: "8 days",
        created_at: "2025-05-09T10:00:00Z",
        shipment_date: "2025-05-09",
        estimated_arrival: "2025-05-13",
        current_lat: 37.7749,
        current_lon: -122.4194
    }
];

const dummyInventory = [
    {
        id: 4,
        origin: "Farm D",
        destination: "Distribution Center",
        status: "DELIVERED",
        quantity: 200,
        ripeness_status: "freshripe",
        dominant_ripeness: "freshripe",
        shelf_life: "5 days",
        created_at: "2025-05-06T10:00:00Z",
        shipment_date: "2025-05-06",
        estimated_arrival: "2025-05-10"
    }
];
const filterUniqueShipments = (shipments: Shipment[]): Shipment[] => {
    const seen = new Set();
    return shipments.filter(shipment => {
        if (seen.has(shipment.id)) {
            return false;
        }
        seen.add(shipment.id);
        return true;
    });
};

export default function DistributorDashboard({ user }: DistributorDashboardProps) {
    const router = useRouter();
    const [incomingShipments, setIncomingShipments] = useState<Shipment[]>([]);
    const [inventory, setInventory] = useState<Shipment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isDeliveryPerson, setIsDeliveryPerson] = useState(false);

    async function fetchData() {
        try {
            console.log("Making API request to fetch distributor shipments");

            // First, check if user is a delivery person by fetching all delivery persons
            // and finding the one that matches the current user
            let deliveryPersonId = null;
            try {
                // Get all delivery persons
                const profileResponse = await createAPIRequest('/api/shipments/delivery-persons/', 'GET');
                console.log("All delivery persons:", profileResponse?.data);

                // Find if current user is a delivery person
                const currentUserDeliveryPerson = profileResponse?.data?.find(
                    (person: any) => {
                        // Log to see what we're comparing
                        console.log("Comparing:", {
                            personUserId: person.user.id || person.user,
                            currentUserId: user.id
                        });

                        // Check both possibilities: user could be an object with id or just an id
                        return (person.user.id && person.user.id === user.id) ||
                            (typeof person.user === 'number' && person.user === user.id) ||
                            (typeof person.user === 'string' && parseInt(person.user) === user.id);
                    }
                );

                if (currentUserDeliveryPerson) {
                    console.log("User is a delivery person:", currentUserDeliveryPerson);
                    deliveryPersonId = currentUserDeliveryPerson.id;
                    setIsDeliveryPerson(true);
                } else {
                    console.log("User is not a delivery person yet");
                    setIsDeliveryPerson(false);
                }
            } catch (profileErr) {
                console.error("Error checking delivery person status:", profileErr);
            }

            // If user is not a delivery person, we'll still show the dashboard with empty data
            if (!deliveryPersonId) {
                setError("Your account is not set up as a delivery person yet.");
                setIncomingShipments([]);
                setInventory([]);
            } else {
                setError(null); // Clear any previous errors

                // Fetch incoming shipments (not delivered) for this specific delivery person
                try {
                    const incomingResponse = await createAPIRequest(
                        '/api/shipments/',
                        'GET',
                        {
                            delivery_person: deliveryPersonId,
                            status: 'PENDING,IN_TRANSIT'
                        }
                    );
                    console.log("Incoming shipments:", incomingResponse?.data);
                    const uniqueIncomingShipments = filterUniqueShipments(incomingResponse?.data || []);
                    setIncomingShipments(uniqueIncomingShipments);
                } catch (err) {
                    console.error("Error fetching incoming shipments:", err);
                    setIncomingShipments(dummyIncomingShipments);
                }

                // Fetch inventory (delivered shipments) for this specific delivery person
                try {
                    const inventoryResponse = await createAPIRequest(
                        '/api/shipments/',
                        'GET',
                        {
                            delivery_person: deliveryPersonId,
                            status: 'DELIVERED'
                        }
                    );
                    console.log("Inventory:", inventoryResponse?.data);
                    const uniqueInventory = filterUniqueShipments(inventoryResponse?.data || []);
                    setInventory(uniqueInventory);
                } catch (err) {
                    console.error("Error fetching inventory:", err);
                    setInventory(dummyInventory);
                }
            }
        } catch (err: any) {
            console.error("Error fetching distributor data:", err.response || err);
            setError("Failed to load shipment data. Using demo data instead.");

            // Fallback to dummy data
            setIncomingShipments(dummyIncomingShipments);
            setInventory(dummyInventory);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        // Just call the function here
        fetchData();
    }, [user]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
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
                    <p className="text-gray-800">Here's an overview of your distribution operations</p>

                    {error && (
                        <div className="mt-2 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                            <span className="block sm:inline">{error}</span>
                            {/* Only show the button if the error indicates they're not set up as a delivery person */}
                            {error.includes("not set up as a delivery person") && (
                                <button
                                    onClick={() => router.push('/delivery-signup')}
                                    className="mt-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                >
                                    Register as Delivery Person
                                </button>
                            )}
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Only display shipment data for delivery persons */}
                    {isDeliveryPerson && (
                        <>
                            {/* Pending Shipments */}
                            <div className="col-span-1 lg:col-span-2">
                                <PendingShipments shipments={incomingShipments} />
                            </div>

                            {/* Ripeness Tracker */}
                            <div className="col-span-1">
                                <RipenessTracker shipments={incomingShipments} />
                            </div>

                            {/* Inventory Widget */}
                            <div className="col-span-1 lg:col-span-2">
                                <InventoryWidget inventory={inventory} />
                            </div>

                            {/* All Shipments */}
                            <div className="col-span-1 lg:col-span-3">
                                <ShipmentOverview
                                    // Use the filterUniqueShipments function here
                                    shipments={filterUniqueShipments([...incomingShipments, ...inventory])}
                                    title="All Shipments"
                                    viewAllLink="/shipments"
                                />
                            </div>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}