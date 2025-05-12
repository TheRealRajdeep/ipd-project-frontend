"use client";

import Link from 'next/link';
import { useMemo } from 'react';
interface Shipment {
    id: number;
    origin?: string;
    source_location?: string; // Handle both field names
    destination?: string;
    status: string;
    created_at: string;
    predicted_ripeness?: string;
    ripeness_status?: string;
    dominant_ripeness?: string;
    shelf_life?: string;
}

interface PendingShipmentsProps {
    shipments: Shipment[];
}

export default function PendingShipments({ shipments }: PendingShipmentsProps) {
    const safeShipments = shipments || [];

    const uniqueShipments = useMemo(() => {
        const seen = new Set();
        return safeShipments.filter(shipment => {
            if (seen.has(shipment.id)) {
                return false;
            }
            seen.add(shipment.id);
            return true;
        });
    }, [safeShipments]);

    // Filter shipments that are pending or in transit
    const pendingShipments = uniqueShipments.filter(
        s => s.status === 'PENDING' || s.status === 'IN_TRANSIT'
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return 'bg-yellow-100 text-yellow-800';
            case 'IN_TRANSIT': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    // Helper function to handle field name differences
    const getOrigin = (shipment: Shipment) => {
        return shipment.origin || shipment.source_location || 'N/A';
    };

    // Helper function to handle ripeness field differences
    const getRipeness = (shipment: Shipment) => {
        return shipment.predicted_ripeness ||
            shipment.dominant_ripeness ||
            shipment.ripeness_status ||
            'Unknown';
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6 h-full hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-blue-800">Pending Shipments</h3>
                <Link href="/api/shipments?status=pending" className="text-blue-600 hover:text-blue-800 text-sm">
                    View All
                </Link>
            </div>

            {pendingShipments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    No pending shipments at this time.
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <th className="px-4 py-2">ID</th>
                                <th className="px-4 py-2">From</th>
                                <th className="px-4 py-2">Status</th>
                                <th className="px-4 py-2">Ripeness</th>
                                <th className="px-4 py-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {pendingShipments.map((shipment) => (
                                <tr
                                    key={shipment.id}
                                    className="hover:bg-gray-50"
                                >
                                    <td className="px-4 py-3 whitespace-nowrap text-black">
                                        <Link href={`/shipments/${shipment.id}`} className="text-blue-600 hover:underline">
                                            #{shipment.id}
                                        </Link>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-black">
                                        {getOrigin(shipment)}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-black">
                                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(shipment.status)}`}>
                                            {shipment.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-black">
                                        {getRipeness(shipment)}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-black">
                                        <Link href={`/shipments/${shipment.id}`} className="text-blue-600 hover:underline mr-3">
                                            View
                                        </Link>
                                        {shipment.status === 'IN_TRANSIT' && (
                                            <Link href={`/shipments/${shipment.id}/receive`} className="text-green-600 hover:underline">
                                                Receive
                                            </Link>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}