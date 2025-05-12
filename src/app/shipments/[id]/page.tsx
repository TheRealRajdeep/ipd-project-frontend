"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import ShipmentDetails from '@/components/shipments/ShipmentDetails';

export default function ShipmentDetailsPage() {
    const params = useParams();
    const id = params?.id as string;
    const [user, setUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Check if user is authenticated
        const currentUser = getCurrentUser();
        if (!currentUser) {
            router.push('/login');
            return;
        }

        setUser(currentUser);
        setIsLoading(false);
    }, [router]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500"></div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
            <DashboardHeader user={user} />

            <main className="container mx-auto px-4 py-8">
                <ShipmentDetails id={id} />
            </main>
        </div>
    );
}