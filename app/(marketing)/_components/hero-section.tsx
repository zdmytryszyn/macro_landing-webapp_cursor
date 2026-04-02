"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-background py-20 sm:py-28 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col">
            <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Track your macros,{" "}
              <span className="text-accent">transform</span> your health
            </h1>
            <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
              Effortlessly monitor your protein, carbs, fats, and calories. Reach your fitness goals with intelligent tracking and personalized insights.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Button
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                asChild
              >
                <Link href="/signup">
                Get started—it&apos;s free
                <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="#how-it-works">
                See how it works
                </Link>
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-lg">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-medium text-foreground">Today&apos;s Progress</h3>
                <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
                  +12% from yesterday
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <MacroCard label="Protein" value={145} goal={160} color="bg-chart-1" unit="g" />
                <MacroCard label="Carbs" value={220} goal={250} color="bg-chart-5" unit="g" />
                <MacroCard label="Fats" value={62} goal={70} color="bg-chart-2" unit="g" />
                <MacroCard label="Calories" value={1840} goal={2100} color="bg-chart-3" unit="kcal" />
              </div>
              
              <div className="mt-6">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Daily Goal Progress</span>
                  <span className="font-medium text-foreground">87%</span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-secondary">
                  <div className="h-full w-[87%] rounded-full bg-accent transition-all duration-500" />
                </div>
              </div>
            </div>
            
            <div className="absolute -bottom-4 -left-4 -z-10 h-full w-full rounded-2xl bg-accent/10" />
          </div>
        </div>
      </div>
    </section>
  );
}

function MacroCard({ 
  label, 
  value, 
  goal, 
  color, 
  unit 
}: { 
  label: string; 
  value: number; 
  goal: number; 
  color: string; 
  unit: string;
}) {
  const percentage = Math.min((value / goal) * 100, 100);
  
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <div className="mb-2 flex items-center gap-2">
        <div className={`h-2 w-2 rounded-full ${color}`} />
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold text-foreground">{value}</span>
        <span className="text-sm text-muted-foreground">/ {goal}{unit}</span>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
        <div 
          className={`h-full rounded-full ${color} transition-all duration-500`} 
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
