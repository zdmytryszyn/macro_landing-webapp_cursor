"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "./_components/dashboard-header";
import { MacroSummary } from "./_components/macro-summary";
import { FoodSearch } from "./_components/food-search";
import { FoodLog } from "./_components/food-log";
import { QuickAdd } from "./_components/quick-add";
import { MealSelector } from "./_components/meal-selector";

type MealType = "breakfast" | "lunch" | "dinner" | "snacks";

interface FoodEntry {
  id: string;
  name: string;
  brand?: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  servingSize: string;
  meal: MealType;
  time: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [selectedMeal, setSelectedMeal] = useState<MealType>("lunch");
  const [goals, setGoals] = useState({
    calories: { current: 0, goal: 2200, unit: "cal" },
    protein: { current: 0, goal: 150, unit: "g" },
    carbs: { current: 0, goal: 250, unit: "g" },
    fats: { current: 0, goal: 70, unit: "g" },
  });

  const hydrateDashboard = useCallback(async () => {
    const date = new Date().toISOString().slice(0, 10);
    const [entriesRes, summaryRes] = await Promise.all([
      fetch(`/api/log-entries?date=${date}`),
      fetch(`/api/dashboard/summary?date=${date}`),
    ]);

    if (entriesRes.ok) {
      const serverEntries = (await entriesRes.json()) as FoodEntry[];
      setEntries(serverEntries);
    } else if (entriesRes.status === 401) {
      router.push("/login");
      return;
    }

    if (summaryRes.ok) {
      const summary = (await summaryRes.json()) as {
        progress: {
          calories: { current: number; goal: number; unit: string };
          protein: { current: number; goal: number; unit: string };
          carbs: { current: number; goal: number; unit: string };
          fats: { current: number; goal: number; unit: string };
        };
      };
      setGoals(summary.progress);
    } else if (summaryRes.status === 401) {
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    void hydrateDashboard();
  }, [hydrateDashboard]);

  const handleAddFood = async (food: {
    id: string;
    name: string;
    brand?: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    servingSize: string;
  }) => {
    await fetch("/api/log-entries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        meal: selectedMeal,
        name: food.name,
        brand: food.brand,
        servingSize: food.servingSize,
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fats: food.fats,
        sourceType: "search",
      }),
    });
    await hydrateDashboard();
  };

  const handleQuickAdd = async (macros: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  }) => {
    await fetch("/api/log-entries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        meal: selectedMeal,
        name: "Quick Add",
        servingSize: "1 serving",
        calories: macros.calories,
        protein: macros.protein,
        carbs: macros.carbs,
        fats: macros.fats,
        sourceType: "quick_add",
      }),
    });
    await hydrateDashboard();
  };

  const handleRemoveEntry = async (id: string) => {
    await fetch(`/api/log-entries/${id}`, { method: "DELETE" });
    await hydrateDashboard();
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">
            Good afternoon, Alex
          </h1>
          <p className="text-muted-foreground">
            Track your nutrition and stay on top of your goals
          </p>
        </div>

        <div className="mb-8">
          <MacroSummary
            calories={goals.calories}
            protein={goals.protein}
            carbs={goals.carbs}
            fats={goals.fats}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <FoodLog entries={entries} onRemoveEntry={handleRemoveEntry} />
          </div>

          <div className="space-y-6">
            <MealSelector
              selectedMeal={selectedMeal}
              onSelectMeal={setSelectedMeal}
            />
            <FoodSearch onAddFood={handleAddFood} />
            <QuickAdd onQuickAdd={handleQuickAdd} />
          </div>
        </div>
      </main>
    </div>
  );
}
