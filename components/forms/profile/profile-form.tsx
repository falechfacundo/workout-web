"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useProfileStore } from "@/lib/stores/profile-store";
import { ProfileFormData } from "@/lib/actions/profile";
import { createLogger } from "@/lib/utils/logger";

import {
  profileFormSchema,
  type ProfileFormValues,
  type Profile,
} from "@/lib/schemas/profile";

import { PhysicalStatsSection } from "./physical-stats-section";
import { TrainingPreferencesSection } from "./training-preferences-section";
import { PersonalInfoSection } from "./personal-info-section";

const logger = createLogger("profile-form");

interface ProfileFormProps {
  profile?: Profile | null;
  onSuccess?: () => void;
}

export function ProfileForm({
  profile: profileProp,
  onSuccess,
}: ProfileFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const {
    profile: storeProfile,
    isLoading,
    fetchProfile,
    updateUserProfile,
  } = useProfileStore();

  // Use the profile from props if available, otherwise use from store
  const profile = profileProp || storeProfile;

  // Fetch profile if not provided and not already in store
  useEffect(() => {
    if (!profileProp && !storeProfile && !isLoading) {
      logger.debug("Fetching profile from store");
      fetchProfile();
    }
  }, [profileProp, storeProfile, isLoading, fetchProfile]);

  // Default values for the form
  const defaultValues: Partial<ProfileFormValues> = {
    username: profile?.username || "",
    full_name: profile?.full_name || "",
    weight_kg: profile?.weight_kg || null,
    height_cm: profile?.height_cm || null,
    birth_date: profile?.birth_date ? new Date(profile.birth_date) : null,
    sex: profile?.sex || null,
    experience_level: profile?.experience_level || null,
    training_goal: profile?.training_goal || null,
    weekly_availability: profile?.weekly_availability || null,
    session_duration_preference: profile?.session_duration_preference || null,
  };

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
  });

  async function onSubmit(data: ProfileFormValues) {
    logger.debug("Submitting profile form", { username: data.username });
    setSubmitting(true);

    try {
      // Format date as ISO string if it exists
      const formattedData = {
        ...data,
        birth_date: data.birth_date
          ? data.birth_date.toISOString().split("T")[0]
          : null,
      } as ProfileFormData;

      const result = await updateUserProfile(formattedData);

      if (result.error) {
        logger.warn("Error updating profile", { error: result.error });
      } else {
        logger.info("Profile updated successfully");

        // Refresh the profile in store
        fetchProfile();

        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error) {
      logger.error(
        "Exception in profile form submission",
        error instanceof Error ? error : new Error(String(error))
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (isLoading && !profileProp) {
    return (
      <div className="flex justify-center p-8">Loading profile data...</div>
    );
  }

  return (
    <FormProvider {...form}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Personal Information</h3>
            <PersonalInfoSection />
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-medium">Physical Stats</h3>
            <PhysicalStatsSection />
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-medium">Training Preferences</h3>
            <TrainingPreferencesSection />
          </div>

          <Button type="submit" disabled={submitting || isLoading}>
            {submitting ? "Saving..." : "Save Profile"}
          </Button>
        </form>
      </Form>
    </FormProvider>
  );
}
