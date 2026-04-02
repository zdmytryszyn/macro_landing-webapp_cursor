"use client";

import { useState, useEffect, useRef } from "react";
import { formatMacro } from "@/lib/format-macros";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SearchIcon, PlusIcon, ScanLineIcon, SparklesIcon } from "lucide-react";

interface FoodItem {
  id: string;
  name: string;
  brand?: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  servingSize: string;
  source?: string;
}

interface FoodSearchProps {
  onAddFood: (food: FoodItem) => void;
}

const MIN_CHARS = 2;
const DEBOUNCE_MS = 350;

export function FoodSearch({ onAddFood }: FoodSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<FoodItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [fatsecretIpHint, setFatsecretIpHint] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const q = searchQuery.trim();

    if (q.length < MIN_CHARS) {
      abortRef.current?.abort();
      setResults([]);
      setSearchError("");
      setFatsecretIpHint(false);
      setIsSearching(false);
      return;
    }

    const timer = window.setTimeout(() => {
      abortRef.current?.abort();
      abortRef.current = new AbortController();
      const { signal } = abortRef.current;

      setIsSearching(true);
      setSearchError("");
      setFatsecretIpHint(false);

      void (async () => {
        try {
          const response = await fetch(
            `/api/foods/search?q=${encodeURIComponent(q)}&limit=10`,
            { cache: "no-store", signal }
          );
          const payload = await response.json().catch(() => null);

          if (!response.ok) {
            const err =
              payload && typeof payload === "object" && "error" in payload
                ? String((payload as { error: string }).error)
                : "Search failed. Try again.";
            setSearchError(err);
            setResults([]);
            return;
          }

          const data = Array.isArray(payload) ? (payload as FoodItem[]) : [];
          setResults(data);
          setFatsecretIpHint(
            response.headers.get("X-Food-Search-Warning") ===
              "fatsecret-ip-blocked"
          );
        } catch (e) {
          if (e instanceof Error && e.name === "AbortError") return;
          setSearchError("Search failed. Try again.");
          setResults([]);
        } finally {
          setIsSearching(false);
        }
      })();
    }, DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timer);
      abortRef.current?.abort();
    };
  }, [searchQuery]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <SearchIcon className="h-5 w-5 text-accent" />
          Add Food
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              autoComplete="off"
              placeholder="Type at least 2 letters…"
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Suggestions appear as you type. Results come from FatSecret when
          configured, or the local catalog as a fallback.
        </p>

        <div className="mt-4 flex gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" type="button">
            <ScanLineIcon className="h-4 w-4" />
            Scan Barcode
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5" type="button">
            <SparklesIcon className="h-4 w-4" />
            AI Describe
          </Button>
        </div>

        {searchQuery.trim().length >= MIN_CHARS && (
          <div className="mt-4 space-y-2">
            {fatsecretIpHint && (
              <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-950 dark:text-amber-100">
                FatSecret blocked this server&apos;s IP (error 21). In the{" "}
                <a
                  href="https://platform.fatsecret.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium underline"
                >
                  FatSecret developer console
                </a>
                , open your application and add your current public IP to the
                allowlist. Until then, search uses the small local food list only.
              </div>
            )}
            {isSearching && (
              <p className="py-2 text-center text-sm text-muted-foreground">
                Searching…
              </p>
            )}
            {searchError && (
              <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {searchError}
              </p>
            )}
            {!isSearching && !searchError && (
              <>
                {results.length > 0 ? (
                  results.map((food) => (
                    <div
                      key={food.id}
                      className="flex items-center justify-between rounded-lg border bg-background p-3 transition-colors hover:bg-secondary/50"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{food.name}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {[food.brand, food.servingSize]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                        <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
                          <span>{formatMacro(food.calories)} cal</span>
                          <span>{formatMacro(food.protein)}g P</span>
                          <span>{formatMacro(food.carbs)}g C</span>
                          <span>{formatMacro(food.fats)}g F</span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        type="button"
                        className="h-8 w-8 shrink-0 p-0 text-accent hover:bg-accent hover:text-accent-foreground"
                        onClick={() => onAddFood(food)}
                      >
                        <PlusIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="py-4 text-center text-sm text-muted-foreground">
                    No foods found. Try another term.
                  </p>
                )}
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
