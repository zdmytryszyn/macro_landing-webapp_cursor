"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "../_components/dashboard-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FlameIcon,
  BeefIcon,
  WheatIcon,
  DropletIcon,
  TargetIcon,
  CalculatorIcon,
  SaveIcon,
  RotateCcwIcon,
} from "lucide-react";

interface MacroGoals {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

const defaultGoals: MacroGoals = {
  calories: 2200,
  protein: 150,
  carbs: 250,
  fats: 70,
};

export default function GoalsPage() {
  const router = useRouter();
  const [goals, setGoals] = useState<MacroGoals>(defaultGoals);
  const [savedGoals, setSavedGoals] = useState<MacroGoals>(defaultGoals);
  const [isSaved, setIsSaved] = useState(true);

  useEffect(() => {
    const loadGoals = async () => {
      const response = await fetch("/api/goals/current");
      if (response.status === 401) {
        router.push("/login");
        return;
      }
      if (!response.ok) return;
      const data = (await response.json()) as MacroGoals;
      setGoals(data);
      setSavedGoals(data);
      setIsSaved(true);
    };
    void loadGoals();
  }, [router]);

  const handleChange = (field: keyof MacroGoals, value: string) => {
    const numValue = parseInt(value) || 0;
    setGoals((prev) => ({ ...prev, [field]: numValue }));
    setIsSaved(false);
  };

  const handleSave = async () => {
    const response = await fetch("/api/goals/current", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(goals),
    });
    if (response.status === 401) {
      router.push("/login");
      return;
    }
    if (!response.ok) return;

    const data = (await response.json()) as MacroGoals;
    setGoals(data);
    setSavedGoals(data);
    setIsSaved(true);
  };

  const handleReset = () => {
    setGoals(savedGoals);
    setIsSaved(true);
  };

  const calculateFromCalories = () => {
    const protein = Math.round((goals.calories * 0.3) / 4);
    const carbs = Math.round((goals.calories * 0.4) / 4);
    const fats = Math.round((goals.calories * 0.3) / 9);
    setGoals({ ...goals, protein, carbs, fats });
    setIsSaved(false);
  };

  const macroBreakdown = {
    protein: { calories: goals.protein * 4, percentage: 0 },
    carbs: { calories: goals.carbs * 4, percentage: 0 },
    fats: { calories: goals.fats * 9, percentage: 0 },
  };

  const totalMacroCalories =
    macroBreakdown.protein.calories +
    macroBreakdown.carbs.calories +
    macroBreakdown.fats.calories;

  macroBreakdown.protein.percentage = Math.round(
    (macroBreakdown.protein.calories / totalMacroCalories) * 100
  ) || 0;
  macroBreakdown.carbs.percentage = Math.round(
    (macroBreakdown.carbs.calories / totalMacroCalories) * 100
  ) || 0;
  macroBreakdown.fats.percentage = Math.round(
    (macroBreakdown.fats.calories / totalMacroCalories) * 100
  ) || 0;

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
              <TargetIcon className="h-5 w-5 text-accent-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Daily Macro Goals
              </h1>
              <p className="text-muted-foreground">
                Set your daily nutrition targets to track progress
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Calories Card */}
          <Card className="md:col-span-2">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <FlameIcon className="h-5 w-5 text-orange-500" />
                Daily Calorie Target
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                <div className="flex-1">
                  <label className="mb-2 block text-sm font-medium text-muted-foreground">
                    Calories (kcal)
                  </label>
                  <Input
                    type="number"
                    value={goals.calories}
                    onChange={(e) => handleChange("calories", e.target.value)}
                    className="text-lg font-semibold"
                    min={0}
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={calculateFromCalories}
                  className="gap-2"
                >
                  <CalculatorIcon className="h-4 w-4" />
                  Auto-Calculate Macros
                </Button>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                Click &quot;Auto-Calculate Macros&quot; to set a balanced 30/40/30
                split (protein/carbs/fats)
              </p>
            </CardContent>
          </Card>

          {/* Protein Card */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <BeefIcon className="h-5 w-5 text-red-500" />
                Protein
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-muted-foreground">
                  Grams per day
                </label>
                <Input
                  type="number"
                  value={goals.protein}
                  onChange={(e) => handleChange("protein", e.target.value)}
                  className="text-lg font-semibold"
                  min={0}
                />
              </div>
              <div className="flex items-center justify-between rounded-lg bg-secondary p-3">
                <span className="text-sm text-muted-foreground">Equals</span>
                <div className="text-right">
                  <p className="font-semibold text-foreground">
                    {macroBreakdown.protein.calories} kcal
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {macroBreakdown.protein.percentage}% of total
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Carbs Card */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <WheatIcon className="h-5 w-5 text-amber-500" />
                Carbohydrates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-muted-foreground">
                  Grams per day
                </label>
                <Input
                  type="number"
                  value={goals.carbs}
                  onChange={(e) => handleChange("carbs", e.target.value)}
                  className="text-lg font-semibold"
                  min={0}
                />
              </div>
              <div className="flex items-center justify-between rounded-lg bg-secondary p-3">
                <span className="text-sm text-muted-foreground">Equals</span>
                <div className="text-right">
                  <p className="font-semibold text-foreground">
                    {macroBreakdown.carbs.calories} kcal
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {macroBreakdown.carbs.percentage}% of total
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fats Card */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <DropletIcon className="h-5 w-5 text-blue-500" />
                Fats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-muted-foreground">
                  Grams per day
                </label>
                <Input
                  type="number"
                  value={goals.fats}
                  onChange={(e) => handleChange("fats", e.target.value)}
                  className="text-lg font-semibold"
                  min={0}
                />
              </div>
              <div className="flex items-center justify-between rounded-lg bg-secondary p-3">
                <span className="text-sm text-muted-foreground">Equals</span>
                <div className="text-right">
                  <p className="font-semibold text-foreground">
                    {macroBreakdown.fats.calories} kcal
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {macroBreakdown.fats.percentage}% of total
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary Card */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Macro Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 h-4 overflow-hidden rounded-full bg-secondary">
                <div className="flex h-full">
                  <div
                    className="bg-red-500 transition-all"
                    style={{ width: `${macroBreakdown.protein.percentage}%` }}
                  />
                  <div
                    className="bg-amber-500 transition-all"
                    style={{ width: `${macroBreakdown.carbs.percentage}%` }}
                  />
                  <div
                    className="bg-blue-500 transition-all"
                    style={{ width: `${macroBreakdown.fats.percentage}%` }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-500" />
                    <span>Protein</span>
                  </div>
                  <span className="font-medium">
                    {macroBreakdown.protein.percentage}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-amber-500" />
                    <span>Carbs</span>
                  </div>
                  <span className="font-medium">
                    {macroBreakdown.carbs.percentage}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-blue-500" />
                    <span>Fats</span>
                  </div>
                  <span className="font-medium">
                    {macroBreakdown.fats.percentage}%
                  </span>
                </div>
              </div>
              <div className="mt-4 border-t pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Total from macros
                  </span>
                  <span className="font-semibold">{totalMacroCalories} kcal</span>
                </div>
                {Math.abs(totalMacroCalories - goals.calories) > 50 && (
                  <p className="mt-2 text-xs text-amber-600">
                    Note: Your macro totals differ from your calorie target by{" "}
                    {Math.abs(totalMacroCalories - goals.calories)} kcal
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={isSaved}
            className="gap-2"
          >
            <RotateCcwIcon className="h-4 w-4" />
            Reset Changes
          </Button>
          <Button onClick={handleSave} disabled={isSaved} className="gap-2">
            <SaveIcon className="h-4 w-4" />
            Save Goals
          </Button>
        </div>

        {isSaved && (
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Your goals are saved and will be used to track your daily progress.
          </p>
        )}
      </main>
    </div>
  );
}
