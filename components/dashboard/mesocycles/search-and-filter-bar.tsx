"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Calendar, ChevronDown, Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

interface SearchAndFilterBarProps {
  onSearch?: (query: string) => void;
  searchQuery?: string;
  onFilterChange?: (status: string | null) => void;
  currentFilter?: string | null;
}

export function SearchAndFilterBar({
  onSearch,
  searchQuery = "",
  onFilterChange,
  currentFilter = null,
}: SearchAndFilterBarProps) {
  const [inputValue, setInputValue] = useState(searchQuery);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  const handleFilterSelect = (status: string | null) => {
    if (onFilterChange) {
      onFilterChange(status);
    }
  };

  const clearSearch = () => {
    setInputValue("");
    if (onSearch) {
      onSearch("");
    }
  };

  const clearFilter = () => {
    if (onFilterChange) {
      onFilterChange(null);
    }
  };

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search mesocycles..."
          className="w-full bg-background pl-8"
          value={inputValue}
          onChange={handleSearch}
        />
        {inputValue && (
          <button
            onClick={clearSearch}
            className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full sm:w-auto">
            <Calendar className="mr-2 h-4 w-4" />
            {currentFilter ? `Status: ${currentFilter}` : "Filter by Status"}
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Status</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem
            checked={currentFilter === null}
            onClick={() => handleFilterSelect(null)}
          >
            All
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={currentFilter === "planned"}
            onClick={() => handleFilterSelect("planned")}
          >
            Planned
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={currentFilter === "in_progress"}
            onClick={() => handleFilterSelect("in_progress")}
          >
            In Progress
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={currentFilter === "completed"}
            onClick={() => handleFilterSelect("completed")}
          >
            Completed
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={currentFilter === "cancelled"}
            onClick={() => handleFilterSelect("cancelled")}
          >
            Cancelled
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Muestra las condiciones de filtrado actuales */}
      {(searchQuery || currentFilter) && (
        <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
          {searchQuery && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Search: {searchQuery}
              <button onClick={clearSearch} className="ml-1">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {currentFilter && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Status: {currentFilter}
              <button onClick={clearFilter} className="ml-1">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
