"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { createAPIRequest } from '@/lib/apiUtils';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface DeliveryPerson {
    id: number;
    user: {
        id: number;
        username: string;
        first_name: string;
        last_name: string;
    };
    phone_number: string;
    vehicle_info: string;
}

interface Retailer {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
}

export default function CreateShipmentForm() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [origin, setOrigin] = useState('');
    const [destination, setDestination] = useState('');
    const [quantity, setQuantity] = useState('');
    const [shipmentDate, setShipmentDate] = useState('');
    const [estimatedArrival, setEstimatedArrival] = useState('');
    const [deliveryPersons, setDeliveryPersons] = useState<DeliveryPerson[]>([]);
    const [selectedDeliveryPerson, setSelectedDeliveryPerson] = useState<string>('');
    const [retailers, setRetailers] = useState<Retailer[]>([]);
    const [selectedReceiver, setSelectedReceiver] = useState<string>('');
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        // Check if user is authenticated
        const currentUser = getCurrentUser();
        if (!currentUser) {
            router.push('/login');
            return;
        }
        setUser(currentUser);

        // Fetch available delivery persons
        fetchDeliveryPersons();

        // Fetch retailers (potential receivers)
        fetchRetailers();
    }, [router]);

    const fetchDeliveryPersons = async () => {
        try {
            const response = await createAPIRequest('/api/shipments/delivery-persons/', 'GET');
            setDeliveryPersons(response?.data || []);
        } catch (err) {
            console.error("Failed to fetch delivery persons:", err);
            setError("Failed to load delivery persons. Please try again.");
        }
    };

    const fetchRetailers = async () => {
        try {
            // Assuming you have an endpoint to fetch users with role "retailer"
            const response = await createAPIRequest('/api/accounts/users/?role=retailer', 'GET');
            setRetailers(response?.data || []);
        } catch (err) {
            console.error("Failed to fetch retailers:", err);
            setError("Failed to load retailers. Please try again.");
        }
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
            // Create form data for the API request
            const formData = new FormData();
            formData.append('origin', origin);
            formData.append('destination', destination);
            formData.append('quantity', quantity);
            formData.append('shipment_date', shipmentDate);
            formData.append('estimated_arrival', estimatedArrival);
            formData.append('created_by_id', user.id);
            formData.append('receiver_id', selectedReceiver);
            if (selectedDeliveryPerson) {
                formData.append('delivery_person_id', selectedDeliveryPerson);
            }
            if (image) {
                formData.append('image', image);
            }

            // Create the shipment
            const response = await createAPIRequest(
                '/api/shipments/',
                'POST',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            setSuccess("Shipment created successfully! Ripeness assessment complete.");

            // Redirect to shipment details or dashboard after brief delay
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

    return (
        <Card className="w-full max-w-4xl mx-auto">
            <CardHeader>
                <CardTitle className="text-2xl font-bold text-green-800">Create New Shipment</CardTitle>
            </CardHeader>
            <CardContent>
                {error && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {success && (
                    <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
                        <AlertDescription>{success}</AlertDescription>
                    </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Origin Location</label>
                            <Input
                                value={origin}
                                onChange={(e) => setOrigin(e.target.value)}
                                placeholder="Enter origin location"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Destination</label>
                            <Input
                                value={destination}
                                onChange={(e) => setDestination(e.target.value)}
                                placeholder="Enter destination"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Quantity (kg)</label>
                            <Input
                                type="number"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                placeholder="Enter quantity"
                                min="1"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Shipment Date</label>
                            <Input
                                type="date"
                                value={shipmentDate}
                                onChange={(e) => setShipmentDate(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Estimated Arrival Date</label>
                            <Input
                                type="date"
                                value={estimatedArrival}
                                onChange={(e) => setEstimatedArrival(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Select Receiver (Retailer)</label>
                            <Select
                                value={selectedReceiver}
                                onValueChange={setSelectedReceiver}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select a retailer" />
                                </SelectTrigger>
                                <SelectContent>
                                    {retailers.map((retailer) => (
                                        <SelectItem key={retailer.id} value={retailer.id.toString()}>
                                            {retailer.first_name} {retailer.last_name} ({retailer.username})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Select Delivery Person (optional)</label>
                            <Select
                                value={selectedDeliveryPerson}
                                onValueChange={setSelectedDeliveryPerson}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select a delivery person" />
                                </SelectTrigger>
                                <SelectContent>
                                    {deliveryPersons.map((person) => (
                                        <SelectItem key={person.id} value={person.id.toString()}>
                                            {person.user.first_name} {person.user.last_name} - {person.vehicle_info}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Upload Banana Image (for ripeness assessment)</label>
                        <Input
                            type="file"
                            onChange={handleImageChange}
                            accept="image/*"
                            className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                            required
                        />

                        {imagePreview && (
                            <div className="mt-4">
                                <p className="text-sm font-medium mb-2">Preview:</p>
                                <img
                                    src={imagePreview}
                                    alt="Banana image preview"
                                    className="max-h-40 rounded-md border border-gray-200"
                                />
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end space-x-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.push('/dashboard')}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="bg-green-600 hover:bg-green-700"
                            disabled={isLoading}
                        >
                            {isLoading ? "Creating Shipment..." : "Create Shipment"}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}