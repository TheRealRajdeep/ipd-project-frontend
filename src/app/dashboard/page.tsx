"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';

// Import the dashboards
import FarmerDashboard from '@/components/dashboard/FarmerDashboard';
import DistributorDashboard from '@/components/dashboard/DistributorDashboard';

export default function DashboardRouter() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    const currentUser = getCurrentUser();
    console.log("Current user:", currentUser); // Debug user data
    
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
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  // Route to the appropriate dashboard based on user type
  const userType = user?.profile?.user_type?.toUpperCase();
  console.log("User type for dashboard:", userType); // Debug user type

  if (userType === 'FARMER') {
    return <FarmerDashboard user={user} />;
  } else if (userType === 'DISTRIBUTOR') {
    return <DistributorDashboard user={user} />;
  } else {
    // Generic dashboard for other user types or show error
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Unsupported User Type</h1>
          <p className="text-gray-600 mb-6">
            Your account type ({userType || 'Unknown'}) does not have a dashboard.
            Please contact support for assistance.
          </p>
          <button
            onClick={() => router.push('/')}
            className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }
}