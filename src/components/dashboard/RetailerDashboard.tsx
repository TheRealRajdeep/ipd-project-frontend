// "use client";

// import { useState, useEffect } from 'react';
// // import { shipmentService } from '@/services/api';

// // Components
// import DashboardHeader from '@/components/dashboard/DashboardHeader';
// import ShipmentOverview from '@/components/dashboard/ShipmentOverview';
// import InventoryWidget from '@/components/dashboard/InventoryWidget';
// // import UpcomingDeliveries from '@/components/dashboard/UpcomingDeliveries';

// interface Shipment {
//     id: number;
//     origin: string;
//     destination: string;
//     status: string;
//     quantity: number;
//     ripeness_status: string;
//     dominant_ripeness: string;
//     shelf_life: string;
//     created_at: string;
//     shipment_date: string;
//     estimated_arrival: string;
//     current_lat?: number;
//     current_lon?: number;
// }

// interface RetailerDashboardProps {
//     user: any;
// }

// // Dummy data for fallback
// const dummyRetailerShipments = [
//     {
//         id: 5,
//         origin: "Distribution Center",
//         destination: "Retail Store A",
//         status: "IN_TRANSIT",
//         quantity: 50,
//         ripeness_status: "freshripe",
//         dominant_ripeness: "freshripe",
//         shelf_life: "4 days",
//         created_at: "2025-05-10T10:00:00Z",
//         shipment_date: "2025-05-10",
//         estimated_arrival: "2025-05-12",
//         current_lat: 37.7749,
//         current_lon: -122.4194
//     },
//     {
//         id: 6,
//         origin: "Farm E",
//         destination: "Retail Store A",
//         status: "DELIVERED",
//         quantity: 30,
//         ripeness_status: "ripe",
//         dominant_ripeness: "ripe",
//         shelf_life: "2 days",
//         created_at: "2025-05-08T10:00:00Z",
//         shipment_date: "2025-05-08",
//         estimated_arrival: "2025-05-10"
//     }
// ];

// export default function RetailerDashboard({ user }: RetailerDashboardProps) {
//     const [shipments, setShipments] = useState<Shipment[]>([]);
//     const [isLoading, setIsLoading] = useState(true);
//     const [error, setError] = useState<string | null>(null);

//     useEffect(() => {
//         async function fetchShipments() {
//             try {
//                 // Store token in localStorage for the interceptor to use
//                 if (user?.auth_token) {
//                     localStorage.setItem('auth_token', user.auth_token);
//                 }

//                 const response = await shipmentService.getRetailerShipments();
//                 console.log("Fetched retailer shipments:", response.data);
//                 setShipments(response.data);
//             } catch (err: any) {
//                 console.error("Error fetching shipments:", err);
//                 setError("Failed to load shipments. Using demo data instead.");

//                 // Fallback to dummy data
//                 setShipments(dummyRetailerShipments);
//             } finally {
//                 setIsLoading(false);
//             }
//         }

//         fetchShipments();
//     }, [user]);

//     // Separate shipments by status
//     const incomingShipments = shipments.filter(s => s.status !== "DELIVERED");
//     const inventoryShipments = shipments.filter(s => s.status === "DELIVERED");

//     if (isLoading) {
//         return (
//             <div className="flex justify-center items-center min-h-screen">
//                 <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
//             </div>
//         );
//     }

//     return (
//         <div className="bg-gradient-to-br from-purple-50 to-indigo-100 min-h-screen">
//             <DashboardHeader user={user} />

//             <main className="container mx-auto px-4 py-8">
//                 <div className="mb-8">
//                     <h1 className="text-3xl font-bold text-purple-800">
//                         Welcome back, {user?.first_name || 'Retailer'}!
//                     </h1>
//                     <p className="text-gray-600">Here's an overview of your store's operations</p>

//                     {error && (
//                         <div className="mt-2 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
//                             {error}
//                         </div>
//                     )}
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                     {/* Upcoming Deliveries */}
//                     {/* <div className="col-span-1 lg:col-span-2">
//                         <UpcomingDeliveries shipments={incomingShipments} />
//                     </div> */}

//                     {/* Inventory */}
//                     <div className="col-span-1">
//                         <InventoryWidget inventory={inventoryShipments} />
//                     </div>

//                     {/* All Shipments */}
//                     <div className="col-span-1 lg:col-span-3">
//                         <ShipmentOverview
//                             shipments={shipments}
//                             title="All Shipments"
//                             viewAllLink="/shipments"
//                         />
//                     </div>
//                 </div>
//             </main>
//         </div>
//     );
// }