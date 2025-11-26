"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { ErrorMessage } from "@/components/error-message";
import { useMuscleGroupsStore } from "@/lib/stores/muscle-groups-store";
import { Database } from "@/lib/database.types";
import { useRequireAuth } from "@/hooks/use-require-auth";

// Import the components with explicit paths
import { MuscleGroupCard } from "@/components/dashboard/muscle-groups/muscle-group-card";
import { MuscleGroupSkeleton } from "@/components/dashboard/muscle-groups/muscle-group-skeleton";
import { SearchBar } from "@/components/dashboard/muscle-groups/search-bar";
import { MuscleGroupList } from "@/components/dashboard/muscle-groups/muscle-group-list";

type MuscleGroup = Database["public"]["Tables"]["muscle_groups"]["Row"];

export default function MuscleGroupsPage() {
  const { user, isLoading: authLoading } = useRequireAuth();
  const { muscleGroups, isLoading, error, fetchMuscleGroups } =
    useMuscleGroupsStore();

  const [filteredMuscleGroups, setFilteredMuscleGroups] = useState<
    MuscleGroup[]
  >([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // Only load muscle groups when authentication is complete
    if (authLoading || !user) return;

    // Cargar los grupos musculares
    fetchMuscleGroups();
  }, [fetchMuscleGroups, user, authLoading]);

  // Actualizar los grupos musculares filtrados cuando cambian los datos o la búsqueda
  useEffect(() => {
    if (!searchQuery) {
      setFilteredMuscleGroups(muscleGroups);
      return;
    }

    const filtered = muscleGroups.filter(
      (group) =>
        group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (group.description &&
          group.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    setFilteredMuscleGroups(filtered);
  }, [muscleGroups, searchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  if (authLoading || isLoading) {
    return (
      <DashboardLayout>
        <div className="grid gap-4 md:gap-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Muscle Groups
              </h1>
              <p className="text-muted-foreground">
                Manage your muscle groups for exercise categorization.
              </p>
            </div>
          </div>
          <div className="flex justify-center p-8">
            Loading muscle groups...
          </div>
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
              <h1 className="text-3xl font-bold tracking-tight">
                Muscle Groups
              </h1>
              <p className="text-muted-foreground">
                Manage your muscle groups for exercise categorization.
              </p>
            </div>
            <Button asChild>
              <Link href="/dashboard/muscle-groups/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Muscle Group
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
            <h1 className="text-3xl font-bold tracking-tight">Muscle Groups</h1>
            <p className="text-muted-foreground">
              Manage your muscle groups for exercise categorization.
            </p>
          </div>
          <Button asChild>
            <Link href="/dashboard/muscle-groups/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Muscle Group
            </Link>
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <SearchBar onSearch={handleSearch} />
        </div>
        <MuscleGroupList
          muscleGroups={filteredMuscleGroups}
          isLoading={isLoading}
        />
      </div>
    </DashboardLayout>
  );
}
