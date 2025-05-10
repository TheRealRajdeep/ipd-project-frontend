"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  const { user, isAuthenticated, logout, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return (
    <div className="container py-10">
      <h1 className="mb-6 text-3xl font-bold">Dashboard</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Welcome, {user?.first_name || user?.username}</CardTitle>
          <CardDescription>
            You are logged in as a {user?.profile?.user_type || "User"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>This is your dashboard where you can manage your banana shipments and track ripeness.</p>
        </CardContent>
        <CardFooter>
          <Button onClick={() => logout()}>Logout</Button>
        </CardFooter>
      </Card>
      
      {/* Additional dashboard content will go here */}
    </div>
  );
}
