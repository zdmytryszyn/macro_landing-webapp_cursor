"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FlameIcon, BeefIcon, WheatIcon, DropletIcon } from "lucide-react";
import { formatMacro } from "@/lib/format-macros";

interface MacroData {
  current: number;
  goal: number;
  unit: string;
}

interface MacroSummaryProps {
  calories: MacroData;
  protein: MacroData;
  carbs: MacroData;
  fats: MacroData;
}

export function MacroSummary({ calories, protein, carbs, fats }: MacroSummaryProps) {
  const macros = [
    {
      name: "Calories",
      icon: FlameIcon,
      data: calories,
      color: "bg-orange-500",
      bgColor: "bg-orange-100",
      textColor: "text-orange-600",
    },
    {
      name: "Protein",
      icon: BeefIcon,
      data: protein,
      color: "bg-red-500",
      bgColor: "bg-red-100",
      textColor: "text-red-600",
    },
    {
      name: "Carbs",
      icon: WheatIcon,
      data: carbs,
      color: "bg-amber-500",
      bgColor: "bg-amber-100",
      textColor: "text-amber-600",
    },
    {
      name: "Fats",
      icon: DropletIcon,
      data: fats,
      color: "bg-blue-500",
      bgColor: "bg-blue-100",
      textColor: "text-blue-600",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {macros.map((macro) => {
        const goal = macro.data.goal || 0;
        const current = macro.data.current;
        const percentage =
          goal > 0 ? Math.min((current / goal) * 100, 100) : 0;
        const remaining = goal - current;
        const Icon = macro.icon;

        return (
          <Card key={macro.name}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {macro.name}
              </CardTitle>
              <div className={`rounded-lg p-2 ${macro.bgColor}`}>
                <Icon className={`h-4 w-4 ${macro.textColor}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex min-w-0 items-baseline gap-1">
                <span className="truncate text-2xl font-bold tabular-nums">
                  {formatMacro(current)}
                </span>
                <span className="shrink-0 text-sm text-muted-foreground">
                  / {formatMacro(goal)} {macro.data.unit}
                </span>
              </div>
              <div className="mt-3">
                <div className="h-2 overflow-hidden rounded-full bg-secondary">
                  <div
                    className={`h-full rounded-full transition-all ${macro.color}`}
                    style={{ width: `${Number(percentage.toFixed(2))}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {remaining > 0
                    ? `${formatMacro(remaining)} ${macro.data.unit} remaining`
                    : "Goal reached!"}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
