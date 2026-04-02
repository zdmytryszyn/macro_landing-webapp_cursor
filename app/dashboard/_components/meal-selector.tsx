"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SunriseIcon, SunIcon, SunsetIcon, CookieIcon } from "lucide-react";

type MealType = "breakfast" | "lunch" | "dinner" | "snacks";

interface MealSelectorProps {
  selectedMeal: MealType;
  onSelectMeal: (meal: MealType) => void;
}

const meals = [
  { id: "breakfast" as const, label: "Breakfast", icon: SunriseIcon },
  { id: "lunch" as const, label: "Lunch", icon: SunIcon },
  { id: "dinner" as const, label: "Dinner", icon: SunsetIcon },
  { id: "snacks" as const, label: "Snacks", icon: CookieIcon },
];

export function MealSelector({ selectedMeal, onSelectMeal }: MealSelectorProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Logging to</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-2">
          {meals.map((meal) => {
            const Icon = meal.icon;
            const isSelected = selectedMeal === meal.id;

            return (
              <Button
                key={meal.id}
                variant={isSelected ? "default" : "outline"}
                className="flex h-auto flex-col gap-1 py-3"
                onClick={() => onSelectMeal(meal.id)}
              >
                <Icon className="h-4 w-4" />
                <span className="text-xs">{meal.label}</span>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
