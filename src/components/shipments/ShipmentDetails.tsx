"use client";

import { useState, useEffect } from 'react';
import { createAPIRequest } from '@/lib/apiUtils';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { getCurrentUser } from '@/lib/auth';
interface ShipmentDetailsProps {
    id: string;
}

export default function ShipmentDetails({ id }: ShipmentDetailsProps) {
    const [shipment, setShipment] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        async function fetchShipmentDetails() {
            try {
                const response = await createAPIRequest(`/api/shipments/${id}/`, 'GET');
                const shipmentData = response?.data || null;

                // Check if this shipment is assigned to the current user (if they're a delivery person)
                if (shipmentData) {
                    // Get current user's delivery person ID if available
                    const userDeliveryPersonId = await getUserDeliveryPersonId();

                    // If user is a delivery person, verify this shipment is assigned to them
                    if (userDeliveryPersonId &&
                        shipmentData.delivery_person &&
                        shipmentData.delivery_person.id !== userDeliveryPersonId) {
                        setError("You are not authorized to view this shipment.");
                        setShipment(null);
                    } else {
                        setShipment(shipmentData);
                    }
                } else {
                    setShipment(null);
                    setError("Shipment not found");
                }
            } catch (err) {
                console.error("Failed to fetch shipment details:", err);
                setError("Failed to load shipment details. Please try again.");
            } finally {
                setLoading(false);
            }
        }

        // Helper function to get the user's delivery person ID
        async function getUserDeliveryPersonId() {
            try {
                // Check if user is authenticated
                const currentUser = getCurrentUser();
                if (!currentUser) return null;

                // Get all delivery persons and find current user
                const profileResponse = await createAPIRequest('/api/shipments/delivery-persons/', 'GET');
                const deliveryPersons = profileResponse?.data || [];

                const userDeliveryPerson = deliveryPersons.find(
                    (person: any) => (person.user.id === currentUser.id)
                );

                return userDeliveryPerson ? userDeliveryPerson.id : null;
            } catch (err) {
                console.error("Error checking delivery person status:", err);
                return null;
            }
        }

        if (id) {
            fetchShipmentDetails();
        }
    }, [id]);

    if (loading) {
        return (
            <div className="flex justify-center items-center p-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            </div>
        );
    }

    if (error || !shipment) {
        return (
            <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error || "Shipment not found"}
            </div>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return 'bg-yellow-100 text-yellow-800';
            case 'IN_TRANSIT': return 'bg-blue-100 text-blue-800';
            case 'DELIVERED': return 'bg-green-100 text-green-800';
            case 'CANCELLED': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getRipenessColor = (ripeness: string) => {
        switch (ripeness) {
            case 'unripe': return 'bg-yellow-100 text-yellow-800';
            case 'freshripe': return 'bg-green-100 text-green-800';
            case 'ripe': return 'bg-green-200 text-green-800';
            case 'overripe': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">
                    Shipment #{shipment.id}
                </h1>
                <Button
                    variant="outline"
                    onClick={() => router.back()}
                >
                    Back
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl">Shipment Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Status</p>
                                    <Badge className={getStatusColor(shipment.status)}>{shipment.status}</Badge>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Quantity</p>
                                    <p>{shipment.quantity} kg</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Origin</p>
                                    <p>{shipment.origin}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Destination</p>
                                    <p>{shipment.destination}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Shipment Date</p>
                                    <p>{new Date(shipment.shipment_date).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Estimated Arrival</p>
                                    <p>{shipment.estimated_arrival ? new Date(shipment.estimated_arrival).toLocaleDateString() : 'Not set'}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Created At</p>
                                    <p>{new Date(shipment.created_at).toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Last Updated</p>
                                    <p>{new Date(shipment.last_updated).toLocaleString()}</p>
                                </div>
                            </div>

                            <div className="mt-6 border-t pt-6">
                                <h3 className="font-medium mb-2">Participants</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Created By</p>
                                        <p>{shipment.created_by?.first_name} {shipment.created_by?.last_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Receiver</p>
                                        <p>{shipment.receiver?.first_name} {shipment.receiver?.last_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Delivery Person</p>
                                        <p>{shipment.delivery_person ?
                                            `${shipment.delivery_person.user?.first_name} ${shipment.delivery_person.user?.last_name}` :
                                            'Not assigned'}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl">Ripeness Assessment</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Dominant Ripeness</p>
                                    <Badge className={getRipenessColor(shipment.dominant_ripeness)}>
                                        {shipment.dominant_ripeness}
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Shelf Life</p>
                                    <p className="font-medium">{shipment.shelf_life || 'Unknown'}</p>
                                </div>

                                {shipment.ripeness_summary && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 mb-2">Ripeness Distribution</p>
                                        {Object.entries(shipment.ripeness_summary).map(([key, value]: [string, any]) => (
                                            <div key={key} className="flex items-center mb-1">
                                                <div className="w-24 text-xs capitalize">{key}</div>
                                                <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-3 ${getRipenessColor(key)}`}
                                                        style={{
                                                            width: `${(Number(value) / Object.values(shipment.ripeness_summary).reduce((a: number, b: unknown) => a + Number(b), 0)) * 100}%`
                                                        }}
                                                    ></div>
                                                </div>
                                                <div className="w-6 text-xs text-right ml-2">{value}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {shipment.result_image && (
                        <Card className="mt-6">
                            <CardHeader>
                                <CardTitle className="text-xl">Processed Image</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="relative aspect-video w-full">
                                    <img
                                        src={`data:image/jpeg;base64,${shipment.result_image}`}
                                        alt="Processed banana image"
                                        className="rounded-md border border-gray-200 w-full h-auto"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}