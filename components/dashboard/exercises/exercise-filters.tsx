import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, Search, Target } from "lucide-react";
import { useTranslations } from "next-intl";
import { type MuscleGroup } from "@/lib/schemas/muscle-group";

interface ExerciseFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  muscleGroups: MuscleGroup[];
  selectedMuscleGroupId: string;
  onMuscleGroupSelect: (id: string) => void;
}

export function ExerciseFilters({
  searchQuery,
  setSearchQuery,
  muscleGroups,
  selectedMuscleGroupId,
  onMuscleGroupSelect,
}: ExerciseFiltersProps) {
  const t = useTranslations("exercises");
  const tMuscle = useTranslations("muscleGroups");
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder={t("searchPlaceholder")}
          className="w-full bg-background pl-8"
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full sm:w-auto">
            <Target className="mr-2 h-4 w-4" />
            {selectedMuscleGroupId
              ? muscleGroups.find((mg) => mg.id === selectedMuscleGroupId)
                  ?.name || t("filterByMuscleGroup")
              : t("filterByMuscleGroup")}
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>{tMuscle("title")}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem
            checked={!selectedMuscleGroupId}
            onClick={() => onMuscleGroupSelect("")}
          >
            {t("all")}
          </DropdownMenuCheckboxItem>
          {muscleGroups.map((muscleGroup) => (
            <DropdownMenuCheckboxItem
              key={muscleGroup.id}
              checked={selectedMuscleGroupId === muscleGroup.id}
              onClick={() => onMuscleGroupSelect(muscleGroup.id)}
            >
              {muscleGroup.name}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
