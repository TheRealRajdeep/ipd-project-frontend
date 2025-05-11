"use client";

import { useState, useEffect } from 'react';

export default function MarketPrices() {
    const [timeRange, setTimeRange] = useState('week');
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    // Simulated market insights
    const insights = [
        { trend: 'Increasing', cause: 'Lower harvest yield expected next week', impact: 'Prices may rise by 5-8%' },
        { trend: 'Seasonal peak', cause: 'High demand in summer months', impact: 'Favorable selling period for farmers' },
        { trend: 'Transport disruption', cause: 'Upcoming road maintenance on highway', impact: 'Delivery delays possible' },
    ];

    return (
        <div className="bg-white rounded-lg shadow-md p-6 h-full hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-green-800">Market Prices</h3>
                <div className="flex space-x-2">
                    <button
                        onClick={() => setTimeRange('week')}
                        className={`px-3 py-1 text-xs rounded-full ${timeRange === 'week' ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}
                    >
                        Week
                    </button>
                    <button
                        onClick={() => setTimeRange('month')}
                        className={`px-3 py-1 text-xs rounded-full ${timeRange === 'month' ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}
                    >
                        Month
                    </button>
                    <button
                        onClick={() => setTimeRange('year')}
                        className={`px-3 py-1 text-xs rounded-full ${timeRange === 'year' ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}
                    >
                        Year
                    </button>
                </div>
            </div>

            <div className="mb-6 h-[200px] bg-gray-50 flex items-center justify-center">
                <p className="text-gray-500">Price chart visualization would appear here</p>
                {/* We're not implementing the actual chart to keep things simple */}
            </div>

            <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Market Insights</h4>
                <div className="space-y-3">
                    {insights.map((insight, index) => (
                        <div
                            key={index}
                            className="bg-gray-50 p-3 rounded-md"
                        >
                            <div className="flex items-center mb-1">
                                <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                                <span className="font-medium text-sm">{insight.trend}</span>
                            </div>
                            <div className="text-xs text-gray-600">{insight.cause}</div>
                            <div className="text-xs font-medium text-green-700 mt-1">{insight.impact}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}