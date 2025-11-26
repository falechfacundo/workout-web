"use client";

import { getExercises } from "@/lib/actions/exercises";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Button } from "@/components/ui/button";
import { ErrorMessage } from "@/components/error-message";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useExercisesStore, useMuscleGroupsStore } from "@/lib/stores";
import { ExerciseFilters } from "@/components/dashboard/exercises/exercise-filters";
import { ExerciseList } from "@/components/dashboard/exercises/exercise-list";
import { createClient } from "@/lib/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useRequireAuth } from "@/hooks/use-require-auth";

export default function ExercisesPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useRequireAuth();
  const [loading, setLoading] = useState(true);

  // Usando los custom hooks de Zustand
  const {
    filteredExercises,
    isLoading,
    error,
    searchQuery,
    selectedMuscleGroupId,
    fetchExercises,
    setSearchQuery,
    setSelectedMuscleGroup,
  } = useExercisesStore();

  const { muscleGroups, fetchMuscleGroups } = useMuscleGroupsStore();

  useEffect(() => {
    async function loadData() {
      if (authLoading || !user) return;

      setLoading(true);
      try {
        await Promise.all([fetchExercises(), fetchMuscleGroups()]);
      } catch (err) {
        console.error("Error loading data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [fetchExercises, fetchMuscleGroups, user, authLoading]);

  // Función para manejar la selección de grupo muscular
  const handleMuscleGroupSelect = (id: string) => {
    setSelectedMuscleGroup(id === selectedMuscleGroupId ? "" : id);
  };

  if (authLoading || loading) {
    return (
      <DashboardLayout>
        <div className="grid gap-4 md:gap-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Exercises</h1>
              <p className="text-muted-foreground">
                Manage your exercise library for your training programs.
              </p>
            </div>
          </div>
          <div className="flex justify-center p-8">Loading exercises...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return null; // Will be redirected by useRequireAuth
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="grid gap-4 md:gap-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Exercises</h1>
              <p className="text-muted-foreground">
                Manage your exercise library for your training programs.
              </p>
            </div>
            <Button asChild>
              <Link href="/dashboard/exercises/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Exercise
              </Link>
            </Button>
          </div>
          <ErrorMessage message={error} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="grid gap-4 md:gap-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Exercises</h1>
            <p className="text-muted-foreground">
              Manage your exercise library for your training programs.
            </p>
          </div>
          <Button asChild>
            <Link href="/dashboard/exercises/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Exercise
            </Link>
          </Button>
        </div>

        <ExerciseFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          muscleGroups={muscleGroups}
          selectedMuscleGroupId={selectedMuscleGroupId}
          onMuscleGroupSelect={handleMuscleGroupSelect}
        />

        <ExerciseList
          exercises={filteredExercises}
          isLoading={isLoading}
          searchQuery={searchQuery}
          selectedMuscleGroupId={selectedMuscleGroupId}
        />
      </div>
    </DashboardLayout>
  );
}
