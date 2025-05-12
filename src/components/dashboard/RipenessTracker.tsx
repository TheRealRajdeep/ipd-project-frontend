"use client";

import { useState } from 'react';

interface Shipment {
    id: number;
    predicted_ripeness?: string;
    quality_score?: number;
    shelf_life?: string;
    status: string;
}

interface RipenessTrackerProps {
    shipments: Shipment[];
}

export default function RipenessTracker({ shipments }: RipenessTrackerProps) {
    const safeShipments = shipments || [];

    // Count shipments by ripeness level
    const ripenessData = {
        'Unripe': 0,
        'Semi-ripe': 0,
        'Ripe': 0,
        'Overripe': 0
    };

    safeShipments.forEach(shipment => {
        if (shipment.predicted_ripeness) {
            ripenessData[shipment.predicted_ripeness as keyof typeof ripenessData] =
                (ripenessData[shipment.predicted_ripeness as keyof typeof ripenessData] || 0) + 1;
        }
    });

    // Find shipments with shortest shelf life
    const sortedByShelfLife = [...safeShipments].sort((a, b) => {
        // Extract the first number from shelf life string (e.g., "3-5 days" -> 3)
        const getDays = (shelf: string | undefined) => {
            if (!shelf) return 999; // No shelf life data, put at the end
            const match = shelf.match(/(\d+)/);
            return match ? parseInt(match[1]) : 999;
        };

        return getDays(a.shelf_life) - getDays(b.shelf_life);
    });

    const urgentShipments = sortedByShelfLife.slice(0, 3);

    return (
        <div className="bg-white rounded-lg shadow-md p-6 h-full hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-semibold text-blue-800 mb-4">Ripeness Tracker</h3>

            <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Incoming Shipments by Ripeness</h4>
                <div className="space-y-2">
                    {Object.entries(ripenessData).map(([label, count]) => (
                        <div key={label} className="flex items-center">
                            <div className="w-24 text-xs font-medium">{label}</div>
                            <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className={`h-4 ${label === 'Unripe' ? 'bg-green-600' :
                                            label === 'Semi-ripe' ? 'bg-yellow-400' :
                                                label === 'Ripe' ? 'bg-yellow-600' :
                                                    label === 'Overripe' ? 'bg-amber-700' : 'bg-gray-800'
                                        }`}
                                    style={{
                                        width: safeShipments.length ? `${(count / safeShipments.length) * 100}%` : '0%'
                                    }}
                                ></div>
                            </div>
                            <div className="w-8 text-xs text-right ml-2">{count}</div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Urgent Attention Required</h4>
                {urgentShipments.length > 0 ? (
                    <div className="space-y-3">
                        {urgentShipments.map(shipment => (
                            <div key={shipment.id} className="bg-orange-50 rounded-md p-3 border-l-4 border-orange-500">
                                <div className="flex justify-between">
                                    <span className="font-medium">Shipment #{shipment.id}</span>
                                    <span className="text-orange-700 text-sm">{shipment.shelf_life}</span>
                                </div>
                                <div className="text-sm text-gray-600 mt-1">
                                    Ripeness: {shipment.predicted_ripeness || 'Unknown'}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-gray-500 text-center py-4">
                        No urgent shipments to display
                    </div>
                )}
            </div>
        </div>
    );
}