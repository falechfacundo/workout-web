"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
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
import { Database } from "@/lib/database.types";
import { useProfileStore } from "@/lib/stores/profile-store";

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const {
    profile,
    setProfile,
    startLoading,
    stopLoading,
    setError: setStoreError,
  } = useProfileStore();

  useEffect(() => {
    async function loadProfile() {
      startLoading();
      setIsLoading(true);
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        if (userError) throw userError;

        if (!user) {
          throw new Error("Not authenticated");
        }

        // Get the user's profile
        const { data, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (profileError && profileError.code !== "PGRST116") {
          // PGRST116 is the code for "no rows returned" - which is fine if the user doesn't have a profile yet
          throw profileError;
        }

        // Actualiza tanto el state local como el store global
        setProfile(data);
      } catch (error) {
        console.error("Error loading profile:", error);
        const errorMessage = "Failed to load profile information";
        setError(errorMessage);
        setStoreError(errorMessage);
      } finally {
        setIsLoading(false);
        stopLoading();
      }
    }

    loadProfile();
  }, [supabase, setProfile, startLoading, stopLoading, setStoreError]);

  const handleProfileUpdate = () => {
    // Reload profile after update
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase
          .from("profiles")
          .select("*")
          .eq("user_id", user.id)
          .single()
          .then(({ data }) => {
            if (data) {
              // Actualiza tanto el state local como el store global
              setProfile(data);
            }
          });
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        Loading profile information...
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
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
  );
}
