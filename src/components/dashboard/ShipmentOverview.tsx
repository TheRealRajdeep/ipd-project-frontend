import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { FaTruck, FaBoxOpen, FaClipboardCheck, FaBan } from 'react-icons/fa';
import { createAPIRequest } from '@/lib/apiUtils';
import { getCurrentUser } from '@/lib/auth';
interface Shipment {
    id: number;
    origin: string;
    destination: string;
    status: string;
    quantity: number;
    ripeness_status?: string;
    dominant_ripeness?: string;  // Make sure this is included
    shelf_life?: string;
    created_at: string;
    shipment_date?: string;
    estimated_arrival?: string;
    delivery_person?: {
        id: number;
        user: {
            id: number;
        };
    };
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
    const [currentUserDeliveryPersonId, setCurrentUserDeliveryPersonId] = useState<number | null>(null);

    useEffect(() => {
        async function checkDeliveryPerson() {
            try {
                const currentUser = getCurrentUser();
                if (!currentUser) return;

                const profileResponse = await createAPIRequest('/api/shipments/delivery-persons/', 'GET');
                const deliveryPersons = profileResponse?.data || [];

                const userDeliveryPerson = deliveryPersons.find(
                    (person: any) => (person.user.id === currentUser.id)
                );

                if (userDeliveryPerson) {
                    setCurrentUserDeliveryPersonId(userDeliveryPerson.id);
                }
            } catch (err) {
                console.error("Error checking delivery person status:", err);
            }
        }

        checkDeliveryPerson();
    }, []);

    const visibleShipments = useMemo(() => {
        // If we're not sure if user is a delivery person yet, show all
        if (currentUserDeliveryPersonId === null) {
            return shipments;
        }

        // If user is a delivery person, only show their shipments
        return shipments.filter(shipment => {
            if (!shipment.delivery_person) return false;
            return shipment.delivery_person.id === currentUserDeliveryPersonId;
        });
    }, [shipments, currentUserDeliveryPersonId]);

    const uniqueShipments = useMemo(() => {
        const seen = new Set();
        return visibleShipments.filter(shipment => {
            if (seen.has(shipment.id)) {
                return false;
            }
            seen.add(shipment.id);
            return true;
        });
    }, [visibleShipments]);

    const sortedShipments = useMemo(() =>
        [...uniqueShipments].sort((a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        ), [uniqueShipments]);

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

    // Add after getStatusStyle function

    const getRipenessColor = (ripeness: string | undefined) => {
        switch (ripeness?.toLowerCase()) {
            case 'unripe':
                return 'bg-green-100 text-green-800';
            case 'freshripe':
                return 'bg-yellow-100 text-yellow-800';
            case 'ripe':
                return 'bg-amber-100 text-amber-800';
            case 'overripe':
                return 'bg-amber-100 text-amber-900';
            case 'rotten':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getRipenessBackgroundColor = (ripeness: string | undefined) => {
        switch (ripeness?.toLowerCase()) {
            case 'unripe':
                return 'bg-green-600'; // Green for unripe bananas
            case 'freshripe':
                return 'bg-yellow-400'; // Yellow-green for fresh ripe bananas
            case 'ripe':
                return 'bg-yellow-600'; // Golden yellow for ripe bananas
            case 'overripe':
                return 'bg-amber-700'; // Brown for overripe bananas
            case 'rotten':
                return 'bg-gray-800'; // Almost black for rotten bananas
            default:
                return 'bg-gray-400'; // Default gray for unknown
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
                                        {(shipment.dominant_ripeness || shipment.ripeness_status) ? (
                                            <div className="flex items-center">
                                                <span
                                                    className={`w-2.5 h-2.5 rounded-full mr-2 ${getRipenessBackgroundColor(shipment.dominant_ripeness || shipment.ripeness_status)}`}
                                                ></span>
                                                <span className={`capitalize ${getRipenessColor(shipment.dominant_ripeness || shipment.ripeness_status)}`}>
                                                    {shipment.dominant_ripeness || shipment.ripeness_status}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-gray-400">Unknown</span>
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

