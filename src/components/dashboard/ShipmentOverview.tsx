// Updated to include title and viewAllLink props

"use client";

import { useState } from 'react';
import Link from 'next/link';

interface Shipment {
    id: number;
    source_location?: string;
    destination?: string;
    status: string;
    created_at: string;
    predicted_ripeness?: string;
    quality_score?: number;
}

interface ShipmentOverviewProps {
    shipments: Shipment[];
    title?: string;
    viewAllLink?: string;
}

export default function ShipmentOverview({
    shipments,
    title = "Shipments Overview",
    viewAllLink = "/shipments"
}: ShipmentOverviewProps) {
    const [filter, setFilter] = useState('all');

    // If shipments array is empty or undefined, use an empty array
    const safeShipments = shipments || [];

    const filteredShipments = safeShipments.filter(shipment => {
        if (filter === 'all') return true;
        return shipment.status.toLowerCase() === filter.toLowerCase();
    });

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'in_transit': return 'bg-blue-100 text-blue-800';
            case 'delivered': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getShipmentStats = () => {
        const total = safeShipments.length;
        const pending = safeShipments.filter(s => s.status.toLowerCase() === 'pending').length;
        const inTransit = safeShipments.filter(s => s.status.toLowerCase() === 'in_transit').length;
        const delivered = safeShipments.filter(s => s.status.toLowerCase() === 'delivered').length;

        return { total, pending, inTransit, delivered };
    };

    const stats = getShipmentStats();

    return (
        <div className="bg-white rounded-lg shadow-md p-6 h-full hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-green-800">{title}</h3>
                <Link href={viewAllLink} className="text-green-600 hover:text-green-800 text-sm">
                    View All
                </Link>
            </div>

            <div className="grid grid-cols-4 gap-2 mb-6">
                <div className="bg-gray-50 rounded-md p-3 text-center">
                    <div className="text-2xl font-bold">{stats.total}</div>
                    <div className="text-xs text-gray-500">Total</div>
                </div>
                <div className="bg-yellow-50 rounded-md p-3 text-center">
                    <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                    <div className="text-xs text-gray-500">Pending</div>
                </div>
                <div className="bg-blue-50 rounded-md p-3 text-center">
                    <div className="text-2xl font-bold text-blue-600">{stats.inTransit}</div>
                    <div className="text-xs text-gray-500">In Transit</div>
                </div>
                <div className="bg-green-50 rounded-md p-3 text-center">
                    <div className="text-2xl font-bold text-green-600">{stats.delivered}</div>
                    <div className="text-xs text-gray-500">Delivered</div>
                </div>
            </div>

            <div className="flex space-x-2 mb-4 flex-wrap gap-y-2">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-3 py-1 text-sm rounded-full ${filter === 'all' ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}
                >
                    All
                </button>
                <button
                    onClick={() => setFilter('pending')}
                    className={`px-3 py-1 text-sm rounded-full ${filter === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100'}`}
                >
                    Pending
                </button>
                <button
                    onClick={() => setFilter('in_transit')}
                    className={`px-3 py-1 text-sm rounded-full ${filter === 'in_transit' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'}`}
                >
                    In Transit
                </button>
                <button
                    onClick={() => setFilter('delivered')}
                    className={`px-3 py-1 text-sm rounded-full ${filter === 'delivered' ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}
                >
                    Delivered
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead>
                        <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <th className="px-4 py-2">ID</th>
                            <th className="px-4 py-2">From</th>
                            <th className="px-4 py-2">To</th>
                            <th className="px-4 py-2">Status</th>
                            <th className="px-4 py-2">Quality</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {filteredShipments.length > 0 ? filteredShipments.slice(0, 5).map((shipment) => (
                            <tr
                                key={shipment.id}
                                className="hover:bg-gray-50"
                            >
                                <td className="px-4 py-3 whitespace-nowrap">
                                    <Link href={`/shipments/${shipment.id}`} className="text-green-600 hover:underline">
                                        #{shipment.id}
                                    </Link>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">{shipment.source_location || 'N/A'}</td>
                                <td className="px-4 py-3 whitespace-nowrap">{shipment.destination || 'N/A'}</td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(shipment.status)}`}>
                                        {shipment.status}
                                    </span>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                    {shipment.quality_score ? (
                                        <div className="flex items-center">
                                            <div className="w-16 bg-gray-200 rounded-full h-2.5 mr-2">
                                                <div
                                                    className="bg-green-600 h-2.5 rounded-full"
                                                    style={{ width: `${shipment.quality_score * 10}%` }}
                                                ></div>
                                            </div>
                                            <span>{shipment.quality_score}/10</span>
                                        </div>
                                    ) : "N/A"}
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={5} className="px-4 py-3 text-center text-gray-500">
                                    No shipments found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}