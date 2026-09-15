"use client";

import { useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ProfileForm } from "@/components/forms/profile/profile-form";
import { MeasurementHistory } from "@/components/dashboard/profile/measurement-history";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useProfileStore } from "@/lib/stores/profile-store";

export default function ProfilePage() {
  const { profile, isLoading, error, fetchProfile } = useProfileStore();

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleProfileUpdate = () => {
    // Reload profile after update
    fetchProfile();
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center p-8">
          Loading profile information...
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container py-10 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Profile & Measurements</h1>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Personal Information</TabsTrigger>
          <TabsTrigger value="measurements">Body Measurements</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Personal Profile</CardTitle>
              <CardDescription>
                Update your personal information and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileForm profile={profile} onSuccess={handleProfileUpdate} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="measurements">
          {profile ? (
            <MeasurementHistory profile={profile} />
          ) : (
            <Alert>
              <AlertDescription>
                Please complete your profile information first before adding
                measurements.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>
      </Tabs>
      </div>
    </DashboardLayout>
  );
}