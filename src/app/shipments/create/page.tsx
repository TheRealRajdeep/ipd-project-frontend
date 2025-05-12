"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createAPIRequest } from '@/lib/apiUtils';
import { getCurrentUser } from '@/lib/auth';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function CreateShipmentPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        origin: '',
        destination: '',
        quantity: '',
        status: 'PENDING',
        shipment_date: '',
        estimated_arrival: '',
        created_by_id: '',
        receiver_id: '2' // Setting a default receiver ID for now
    });
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [user, setUser] = useState<any>(null);
    const [isPageLoading, setIsPageLoading] = useState(true);

    useEffect(() => {
        console.log("CreateShipmentPage mounted");

        // Check if user is authenticated
        const currentUser = getCurrentUser();
        console.log("Create Shipment - Current user:", currentUser?.username,
            "Role:", currentUser?.profile?.user_type);

        if (!currentUser) {
            console.log("No user found, redirecting to login");
            router.push('/login');
            return;
        }

        // Allow both uppercase and lowercase farmer role types
        if (currentUser.profile?.user_type !== 'FARMER' &&
            currentUser.profile?.user_type !== 'farmer') {
            console.log("User type:", currentUser.profile?.user_type);
            console.log("User is not a farmer, redirecting to dashboard");
            router.push('/dashboard');
            return;
        }

        setUser(currentUser);
        setFormData(prev => ({
            ...prev,
            created_by_id: currentUser.id.toString()
        }));

        setIsPageLoading(false);

        return () => {
            console.log("CreateShipmentPage unmounted");
        };
    }, [router]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccess(null);

        if (!image) {
            setError("Please upload an image of your bananas for quality assessment");
            setIsLoading(false);
            return;
        }

        try {
            // Create form data for API request
            const submitFormData = new FormData();
            submitFormData.append('created_by_id', formData.created_by_id);
            submitFormData.append('receiver_id', formData.receiver_id); // Using default receiver
            submitFormData.append('origin', formData.origin);
            submitFormData.append('destination', formData.destination);
            submitFormData.append('quantity', formData.quantity);
            submitFormData.append('status', 'PENDING');
            submitFormData.append('shipment_date', formData.shipment_date);
            submitFormData.append('estimated_arrival', formData.estimated_arrival);

            if (image) {
                submitFormData.append('image', image);
            }

            console.log("Submitting shipment with data:", {
                origin: formData.origin,
                destination: formData.destination,
                quantity: formData.quantity,
                shipment_date: formData.shipment_date,
                estimated_arrival: formData.estimated_arrival,
                created_by_id: formData.created_by_id,
                receiver_id: formData.receiver_id,
                has_image: !!image
            });

            // Create the shipment
            const response = await createAPIRequest(
                '/api/shipments/',
                'POST',
                submitFormData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            console.log("Response received:", response?.data);
            setSuccess("Shipment created successfully! A delivery person has been assigned. Redirecting to dashboard...");

            // Redirect to dashboard after brief delay
            setTimeout(() => {
                router.push('/dashboard');
            }, 2000);
        } catch (err: any) {
            console.error("Shipment creation error:", err);
            if (err.response?.data) {
                const errorData = err.response.data;
                let errorMessage = "Failed to create shipment";

                if (typeof errorData === 'object') {
                    const firstErrorKey = Object.keys(errorData)[0];
                    errorMessage = `${firstErrorKey}: ${errorData[firstErrorKey]}`;
                }

                setError(errorMessage);
            } else {
                setError("Failed to create shipment. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (isPageLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-green-500"></div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-green-50 to-emerald-100 min-h-screen">
            <DashboardHeader user={user} />

            <main className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-green-800">Create New Shipment</h1>
                    <p className="text-gray-600">Create a new banana shipment and analyze product quality</p>
                </div>

                <Card className="w-full max-w-2xl mx-auto">
                    <CardHeader>
                        <CardTitle>Shipment Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {error && (
                            <Alert variant="destructive" className="mb-4">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        {success && (
                            <Alert className="mb-4 bg-success/15 text-success border-success/20">
                                <AlertDescription>{success}</AlertDescription>
                            </Alert>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Origin</label>
                                    <Input
                                        type="text"
                                        name="origin"
                                        value={formData.origin}
                                        onChange={handleInputChange}
                                        placeholder="Origin location"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Destination</label>
                                    <Input
                                        type="text"
                                        name="destination"
                                        value={formData.destination}
                                        onChange={handleInputChange}
                                        placeholder="Destination"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Quantity (kg)</label>
                                    <Input
                                        type="number"
                                        name="quantity"
                                        value={formData.quantity}
                                        onChange={handleInputChange}
                                        placeholder="Quantity in kg"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Shipment Date</label>
                                    <Input
                                        type="date"
                                        name="shipment_date"
                                        value={formData.shipment_date}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Estimated Arrival</label>
                                    <Input
                                        type="date"
                                        name="estimated_arrival"
                                        value={formData.estimated_arrival}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Upload Banana Image (for ripeness assessment)</label>
                                <Input
                                    type="file"
                                    onChange={handleImageChange}
                                    accept="image/*"
                                    className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                                    required
                                />
                                {imagePreview && (
                                    <div className="mt-2">
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="max-h-40 rounded-md border border-gray-200"
                                        />
                                    </div>
                                )}
                                <p className="text-sm text-gray-500 mt-1">
                                    A delivery person will be automatically assigned to your shipment
                                </p>
                            </div>

                            <div className="flex justify-end space-x-4 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.push('/dashboard')}
                                    className="border-input hover:bg-accent hover:text-accent-foreground"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                                    disabled={isLoading}
                                >
                                    {isLoading ? "Creating Shipment..." : "Create Shipment"}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}