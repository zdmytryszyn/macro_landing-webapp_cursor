"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ZapIcon } from "lucide-react";

interface QuickAddProps {
  onQuickAdd: (macros: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  }) => void;
}

export function QuickAdd({ onQuickAdd }: QuickAddProps) {
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fats, setFats] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onQuickAdd({
      calories: parseInt(calories) || 0,
      protein: parseInt(protein) || 0,
      carbs: parseInt(carbs) || 0,
      fats: parseInt(fats) || 0,
    });
    setCalories("");
    setProtein("");
    setCarbs("");
    setFats("");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ZapIcon className="h-5 w-5 text-accent" />
          Quick Add
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Calories</label>
              <Input
                type="number"
                placeholder="0"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Protein (g)</label>
              <Input
                type="number"
                placeholder="0"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Carbs (g)</label>
              <Input
                type="number"
                placeholder="0"
                value={carbs}
                onChange={(e) => setCarbs(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Fats (g)</label>
              <Input
                type="number"
                placeholder="0"
                value={fats}
                onChange={(e) => setFats(e.target.value)}
              />
            </div>
          </div>
          <Button type="submit" className="w-full">
            Add Entry
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
