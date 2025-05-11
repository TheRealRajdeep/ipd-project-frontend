"use client";

import { useEffect, useState } from 'react';

interface Shipment {
    id: number;
    predicted_ripeness?: string;
    quality_score?: number;
    created_at: string;
}

interface QualityMetricsProps {
    shipments: Shipment[];
}

export default function QualityMetrics({ shipments }: QualityMetricsProps) {
    // Use dummy data for visualization
    const safeShipments = shipments || [];
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    // Process data for visualization
    const processQualityData = () => {
        // Count shipments by ripeness level
        const ripenessCounts: { [key: string]: number } = {
            'Unripe': 0,
            'Semi-ripe': 0,
            'Ripe': 0,
            'Overripe': 0
        };

        safeShipments.forEach(shipment => {
            if (shipment.predicted_ripeness) {
                ripenessCounts[shipment.predicted_ripeness] =
                    (ripenessCounts[shipment.predicted_ripeness] || 0) + 1;
            }
        });

        return ripenessCounts;
    };

    const qualityData = processQualityData();

    // Calculate average quality score
    const avgQuality = safeShipments.length > 0
        ? safeShipments.reduce((sum, s) => sum + (s.quality_score || 0), 0) / safeShipments.length
        : 0;

    return (
        <div className="bg-white rounded-lg shadow-md p-6 h-full hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-semibold text-green-800 mb-4">Quality Metrics</h3>

            <div className="mb-6">
                <div className="text-sm text-gray-600 mb-1">Average Quality Score</div>
                <div className="flex items-center">
                    <div className="text-3xl font-bold mr-2">
                        {avgQuality.toFixed(1)}
                    </div>
                    <div className="text-sm text-gray-500">/ 10</div>
                </div>
            </div>

            <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Ripeness Distribution</h4>
                <div className="space-y-2">
                    {Object.entries(qualityData).map(([label, count]) => (
                        <div key={label} className="flex items-center">
                            <div className="w-24 text-xs font-medium">{label}</div>
                            <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className={`h-4 ${label === 'Unripe' ? 'bg-yellow-400' :
                                            label === 'Semi-ripe' ? 'bg-green-300' :
                                                label === 'Ripe' ? 'bg-green-500' : 'bg-red-400'
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

            <div className="mt-4 pt-4 border-t">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Best Practices:</h4>
                <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
                    <li>Harvest when bananas are mature but still green</li>
                    <li>Maintain storage temperature between 13-14°C</li>
                    <li>Handle with care to minimize bruising</li>
                </ul>
            </div>
        </div>
    );
}