"use client";

import { useState } from 'react';
import Link from 'next/link';

interface Shipment {
    id: number;
    predicted_ripeness?: string;
    quality_score?: number;
    shelf_life?: string;
    created_at: string;
    status: string;
}

interface InventoryWidgetProps {
    inventory: Shipment[];
}

export default function InventoryWidget({ inventory }: InventoryWidgetProps) {
    const safeInventory = inventory || [];
    const [sortBy, setSortBy] = useState('shelf_life');

    // Group by ripeness
    const byRipeness: { [key: string]: Shipment[] } = {};
    safeInventory.forEach(shipment => {
        const ripeness = shipment.predicted_ripeness || 'Unknown';
        if (!byRipeness[ripeness]) {
            byRipeness[ripeness] = [];
        }
        byRipeness[ripeness].push(shipment);
    });

    // Calculate total inventory
    const totalItems = safeInventory.length;

    // Sort the inventory
    const sortedInventory = [...safeInventory].sort((a, b) => {
        if (sortBy === 'shelf_life') {
            // Extract the first number from shelf life string (e.g., "3-5 days" -> 3)
            const getDays = (shelf: string | undefined) => {
                if (!shelf) return 999; // No shelf life data, put at the end
                const match = shelf.match(/(\d+)/);
                return match ? parseInt(match[1]) : 999;
            };

            return getDays(a.shelf_life) - getDays(b.shelf_life);
        } else if (sortBy === 'quality') {
            return (b.quality_score || 0) - (a.quality_score || 0);
        } else {
            // Sort by date
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
    });

    return (
        <div className="bg-white rounded-lg shadow-md p-6 h-full hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-blue-800">Current Inventory</h3>
                <div className="flex space-x-2">
                    <button
                        onClick={() => setSortBy('shelf_life')}
                        className={`px-3 py-1 text-xs rounded-full ${sortBy === 'shelf_life' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'}`}
                    >
                        Shelf Life
                    </button>
                    <button
                        onClick={() => setSortBy('quality')}
                        className={`px-3 py-1 text-xs rounded-full ${sortBy === 'quality' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'}`}
                    >
                        Quality
                    </button>
                    <button
                        onClick={() => setSortBy('date')}
                        className={`px-3 py-1 text-xs rounded-full ${sortBy === 'date' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'}`}
                    >
                        Date
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-gray-50 rounded-md p-3 text-center">
                    <div className="text-2xl font-bold">{totalItems}</div>
                    <div className="text-xs text-gray-500">Total Inventory</div>
                </div>
                <div className="bg-green-50 rounded-md p-3 text-center">
                    <div className="text-2xl font-bold text-green-600">
                        {byRipeness['Ripe']?.length || 0}
                    </div>
                    <div className="text-xs text-gray-500">Ripe</div>
                </div>
                <div className="bg-yellow-50 rounded-md p-3 text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                        {(byRipeness['Semi-ripe']?.length || 0) + (byRipeness['Unripe']?.length || 0)}
                    </div>
                    <div className="text-xs text-gray-500">Unripe/Semi-ripe</div>
                </div>
            </div>

            {safeInventory.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    No inventory items to display.
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <th className="px-4 py-2">ID</th>
                                <th className="px-4 py-2">Ripeness</th>
                                <th className="px-4 py-2">Shelf Life</th>
                                <th className="px-4 py-2">Quality</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {sortedInventory.slice(0, 5).map((item) => (
                                <tr
                                    key={item.id}
                                    className="hover:bg-gray-50"
                                >
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <Link href={`/shipments/${item.id}`} className="text-blue-600 hover:underline">
                                            #{item.id}
                                        </Link>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <span className={`inline-block w-3 h-3 rounded-full mr-2 ${item.predicted_ripeness === 'Unripe' ? 'bg-yellow-400' :
                                                item.predicted_ripeness === 'Semi-ripe' ? 'bg-green-300' :
                                                    item.predicted_ripeness === 'Ripe' ? 'bg-green-500' : 'bg-red-400'
                                            }`}></span>
                                        {item.predicted_ripeness || 'Unknown'}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        {item.shelf_life || 'Unknown'}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        {item.quality_score ? (
                                            <div className="flex items-center">
                                                <div className="w-16 bg-gray-200 rounded-full h-2.5 mr-2">
                                                    <div
                                                        className="bg-blue-600 h-2.5 rounded-full"
                                                        style={{ width: `${item.quality_score * 10}%` }}
                                                    ></div>
                                                </div>
                                                <span>{item.quality_score}/10</span>
                                            </div>
                                        ) : "N/A"}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {safeInventory.length > 5 && (
                        <div className="text-center mt-4">
                            <Link href="/inventory" className="text-blue-600 hover:underline text-sm">
                                View all {safeInventory.length} items
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}