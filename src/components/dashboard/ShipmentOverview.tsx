import { useState } from 'react';
import Link from 'next/link';
import { FaTruck, FaBoxOpen, FaClipboardCheck, FaBan } from 'react-icons/fa';

interface Shipment {
    id: number;
    origin: string;
    destination: string;
    status: string;
    quantity: number;
    ripeness_status?: string;
    shelf_life?: string;
    created_at: string;
    shipment_date?: string;
    estimated_arrival?: string;
}

interface ShipmentOverviewProps {
    shipments: Shipment[];
    title?: string;
    viewAllLink?: string;
}

export default function ShipmentOverview({
    shipments = [],
    title = "Recent Shipments",
    viewAllLink = "/shipments"
}: ShipmentOverviewProps) {
    const [displayCount, setDisplayCount] = useState(3);

    const sortedShipments = [...shipments].sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    const displayShipments = sortedShipments.slice(0, displayCount);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'PENDING':
                return <FaBoxOpen className="text-yellow-500" />;
            case 'IN_TRANSIT':
                return <FaTruck className="text-blue-500" />;
            case 'DELIVERED':
                return <FaClipboardCheck className="text-green-500" />;
            case 'CANCELLED':
                return <FaBan className="text-red-500" />;
            default:
                return <FaBoxOpen className="text-gray-500" />;
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-800';
            case 'IN_TRANSIT':
                return 'bg-blue-100 text-blue-800';
            case 'DELIVERED':
                return 'bg-green-100 text-green-800';
            case 'CANCELLED':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-5">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-700">{title}</h2>
                {viewAllLink && (
                    <Link href={viewAllLink} className="text-blue-600 hover:underline text-sm">
                        View All
                    </Link>
                )}
            </div>

            {shipments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    <p>No shipments found.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">To</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ripeness</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shelf Life</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {displayShipments.map(shipment => (
                                <tr key={shipment.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <Link href={`/shipments/${shipment.id}`} className="text-blue-600 hover:underline">
                                            #{shipment.id}
                                        </Link>
                                    </td>
                                    <td className="text-black px-4 py-3 whitespace-nowrap">{shipment.origin}</td>
                                    <td className="text-black px-4 py-3 whitespace-nowrap">{shipment.destination}</td>
                                    <td className="text-black px-4 py-3 whitespace-nowrap">{shipment.quantity}</td>
                                    <td className="text-black px-4 py-3 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusStyle(shipment.status)}`}>
                                                {getStatusIcon(shipment.status)}
                                                <span className="ml-1">{shipment.status}</span>
                                            </span>
                                        </div>
                                    </td>
                                    <td className="text-black px-4 py-3 whitespace-nowrap">
                                        {shipment.ripeness_status && (
                                            <span className="capitalize">{shipment.ripeness_status}</span>
                                        )}
                                    </td>
                                    <td className="text-black px-4 py-3 whitespace-nowrap">{shipment.shelf_life || "N/A"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {sortedShipments.length > displayCount && (
                <div className="mt-4 text-center">
                    <button
                        onClick={() => setDisplayCount(prev => prev + 3)}
                        className="px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    >
                        Load More
                    </button>
                </div>
            )}
        </div>
    );
}