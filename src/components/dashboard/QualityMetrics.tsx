import { useState } from 'react';
import { PieChart, Pie, Cell, Legend, ResponsiveContainer } from 'recharts';

interface Shipment {
    id: number;
    ripeness_status?: string;
    dominant_ripeness?: string;
    // Other properties
}

interface QualityMetricsProps {
    shipments: Shipment[];
}

export default function QualityMetrics({ shipments }: QualityMetricsProps) {
    // Count ripeness distribution
    const ripenessData = shipments.reduce((acc: any, shipment) => {
        const ripeness = shipment.dominant_ripeness || shipment.ripeness_status || 'Unknown';
        if (!acc[ripeness]) {
            acc[ripeness] = 0;
        }
        acc[ripeness] += 1;
        return acc;
    }, {});

    // Transform for chart
    const chartData = Object.entries(ripenessData).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value
    }));

    // Colors for ripeness states
    const COLORS = {
        unripe: '#5d8c25',         // Green unripe banana
        freshripe: '#f9e076',      // Yellow-green fresh ripe banana  
        ripe: '#fed330',           // Golden yellow ripe banana
        overripe: '#a15c07',       // Brown spotted overripe banana
        rotten: '#3c3c3c',         // Dark gray/black for rotten
        unknown: '#d4d4d8'         // Light gray for unknown
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-5 h-full">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Quality Metrics</h2>

            {shipments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    <p>No quality data available.</p>
                </div>
            ) : (
                <>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={COLORS[entry.name.toLowerCase() as keyof typeof COLORS] || '#9ca3af'}
                                        />
                                    ))}
                                </Pie>
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="mt-4">
                        <h3 className="text-md font-medium text-gray-700 mb-2">Quality Summary</h3>
                        <ul className="space-y-1">
                            {Object.entries(ripenessData).map(([status, count]) => (
                                <li key={status} className="flex justify-between">
                                    <span className="capitalize">{status}:</span>
                                    <span className="font-medium">{Number(count)} shipment{Number(count) !== 1 ? 's' : ''}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </>
            )}
        </div>
    );
}