"use client";

import { Card, CardContent, CardHeader, CardTitle, CardAction } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ListIcon, TrashIcon, EditIcon, MoreHorizontalIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatMacro } from "@/lib/format-macros";

interface FoodEntry {
  id: string;
  name: string;
  brand?: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  servingSize: string;
  meal: "breakfast" | "lunch" | "dinner" | "snacks";
  time: string;
}

interface FoodLogProps {
  entries: FoodEntry[];
  onRemoveEntry: (id: string) => void;
}

const mealLabels = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snacks: "Snacks",
};

const mealOrder = ["breakfast", "lunch", "dinner", "snacks"] as const;

export function FoodLog({ entries, onRemoveEntry }: FoodLogProps) {
  const groupedEntries = mealOrder.reduce((acc, meal) => {
    acc[meal] = entries.filter((entry) => entry.meal === meal);
    return acc;
  }, {} as Record<string, FoodEntry[]>);

  const getMealTotals = (mealEntries: FoodEntry[]) => {
    return mealEntries.reduce(
      (acc, entry) => ({
        calories: acc.calories + entry.calories,
        protein: acc.protein + entry.protein,
        carbs: acc.carbs + entry.carbs,
        fats: acc.fats + entry.fats,
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ListIcon className="h-5 w-5 text-accent" />
          Today&apos;s Food Log
        </CardTitle>
        <CardAction>
          <span className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "short",
              day: "numeric",
            })}
          </span>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-6">
        {mealOrder.map((meal) => {
          const mealEntries = groupedEntries[meal];
          const totals = getMealTotals(mealEntries);

          return (
            <div key={meal}>
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="font-semibold">{mealLabels[meal]}</h3>
                <span className="text-sm text-muted-foreground tabular-nums">
                  {formatMacro(totals.calories)} cal
                </span>
              </div>

              {mealEntries.length > 0 ? (
                <div className="mt-3 space-y-2">
                  {mealEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className="group flex items-center justify-between rounded-lg p-2 transition-colors hover:bg-secondary/50"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{entry.name}</p>
                          <span className="text-xs text-muted-foreground">
                            {entry.time}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {entry.servingSize}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="hidden gap-3 text-xs text-muted-foreground tabular-nums sm:flex">
                          <span>{formatMacro(entry.calories)} cal</span>
                          <span>{formatMacro(entry.protein)}g P</span>
                          <span>{formatMacro(entry.carbs)}g C</span>
                          <span>{formatMacro(entry.fats)}g F</span>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                            >
                              <MoreHorizontalIcon className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <EditIcon className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => onRemoveEntry(entry.id)}
                            >
                              <TrashIcon className="mr-2 h-4 w-4" />
                              Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-center text-sm text-muted-foreground">
                  No foods logged yet
                </p>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
