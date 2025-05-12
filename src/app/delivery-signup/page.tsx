"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createAPIRequest } from '@/lib/apiUtils';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { getCurrentUser } from '@/lib/auth';

export default function DeliverySignupPage() {
    const router = useRouter();
    const [phoneNumber, setPhoneNumber] = useState('');
    const [vehicleInfo, setVehicleInfo] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<any>(null);
    const [isPageLoading, setIsPageLoading] = useState(true);

    useEffect(() => {
        // Check if user is authenticated
        const currentUser = getCurrentUser();

        if (!currentUser) {
            router.push('/login');
            return;
        }

        setUser(currentUser);
        setIsPageLoading(false);
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            await createAPIRequest(
                '/api/shipments/delivery-persons/',
                'POST',
                {
                    phone_number: phoneNumber,
                    vehicle_info: vehicleInfo,
                    user_id: user?.id
                }
            );

            // Redirect to dashboard after successful registration
            router.push('/dashboard');
        } catch (err: any) {
            console.error("Registration error:", err);
            if (err.response?.data) {
                // Format API errors
                const errorData = err.response.data;
                let errorMessage = "Registration failed";

                if (typeof errorData === 'object') {
                    const firstErrorKey = Object.keys(errorData)[0];
                    errorMessage = `${firstErrorKey}: ${errorData[firstErrorKey]}`;
                }

                setError(errorMessage);
            } else {
                setError("Failed to register as delivery person. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (isPageLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">Register as Delivery Person</CardTitle>
                </CardHeader>
                <CardContent>
                    {error && (
                        <Alert variant="destructive" className="mb-4">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Phone Number</label>
                            <Input
                                type="text"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                placeholder="+1234567890"
                                style={{ color: 'black' }}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Vehicle License Plate</label>
                            <Input
                                type="text"
                                value={vehicleInfo}
                                onChange={(e) => setVehicleInfo(e.target.value.toUpperCase())}
                                placeholder="ABC-123"
                                style={{ color: 'black', textTransform: 'uppercase' }}
                                required
                                maxLength={10}
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isLoading}
                        >
                            {isLoading ? "Registering..." : "Register as Delivery Person"}
                        </Button>

                        <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            onClick={() => router.push('/dashboard')}
                        >
                            Cancel
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}