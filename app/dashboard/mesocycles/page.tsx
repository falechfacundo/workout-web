"use client";

import { useState, useEffect, useMemo } from "react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useMesocyclesStore } from "@/lib/stores/mesocycles-store";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { PageHeader } from "@/components/dashboard/mesocycles/page-header";
import { SearchAndFilterBar } from "@/components/dashboard/mesocycles/search-and-filter-bar";
import { MesocycleCard } from "@/components/dashboard/mesocycles/mesocycle-card";
import { EmptyState } from "@/components/dashboard/mesocycles/empty-state";
import { MesocycleCardSkeleton } from "@/components/ui/data-skeletons";

export default function MesocyclesPage() {
  const { user } = useRequireAuth();
  const [loading, setLoading] = useState(true);
  const [, setUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  const {
    mesocycles,
    isLoading: mesocyclesLoading,
    error: mesocyclesError,
    fetchMesocycles,
  } = useMesocyclesStore();

  // Mesociclos filtrados derivados de los datos y los criterios de filtrado
  const filteredMesocycles = useMemo(() => {
    if (!mesocycles) return [];

    let result = [...mesocycles];

    // Filtrar por búsqueda
    if (searchQuery) {
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (m.goals && m.goals.some(g => g.notes?.toLowerCase().includes(searchQuery.toLowerCase()) || g.goal_type.toLowerCase().includes(searchQuery.toLowerCase())))
      );
    }

    // Filtrar por estado
    if (filterStatus) {
      result = result.filter((m) => m.status === filterStatus);
    }

    return result;
  }, [mesocycles, searchQuery, filterStatus]);

  // Verificar autenticación y cargar mesociclos
  useEffect(() => {
    async function loadData() {
      if (!user) return;

      setLoading(true);
      try {
        setUserId(user.id);
        await fetchMesocycles(user.id);
      } catch (err) {
        console.error("Error loading mesocycles:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user, fetchMesocycles]);

  // Maneja la búsqueda
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  // Maneja el filtrado por estado
  const handleFilterChange = (status: string | null) => {
    setFilterStatus(status);
  };

  const showSkeleton = loading || mesocyclesLoading;
  const hasMesocycles = filteredMesocycles.length > 0;

  if (mesocyclesError && !showSkeleton) {
    return (
      <DashboardLayout>
        <div className="text-destructive">
          Error loading mesocycles: {mesocyclesError}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="grid gap-4 md:gap-8">
        <PageHeader />
        {showSkeleton ? (
          <div className="grid gap-4">
            {Array.from({ length: 3 }, (_, i) => (
              <MesocycleCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <>
            <SearchAndFilterBar
              onSearch={handleSearch}
              searchQuery={searchQuery}
              onFilterChange={handleFilterChange}
              currentFilter={filterStatus}
            />
            {!hasMesocycles && !searchQuery && !filterStatus ? (
              <EmptyState />
            ) : hasMesocycles ? (
              <div className="grid gap-4">
                {filteredMesocycles.filter((m) => m.id).map((mesocycle) => (
                  <MesocycleCard key={mesocycle.id!} mesocycle={mesocycle as any} />
                ))}
              </div>
            ) : (
              <div className="text-center p-8 text-muted-foreground">
                No mesocycles found matching your search criteria.
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
