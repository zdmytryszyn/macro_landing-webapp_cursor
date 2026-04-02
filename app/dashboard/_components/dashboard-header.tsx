"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MenuIcon,
  XIcon,
  UserIcon,
  SettingsIcon,
  LogOutIcon,
  BellIcon,
} from "lucide-react";

export function DashboardHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sessionLabel, setSessionLabel] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    const loadSession = async () => {
      const response = await fetch("/api/auth/session");
      if (!response.ok) return;
      const payload = (await response.json()) as {
        user: { email?: string; displayName?: string } | null;
      };
      if (!payload.user) return;
      setSessionLabel(payload.user.displayName || payload.user.email || "");
    };
    loadSession();
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-card">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
              <span className="text-sm font-bold text-accent-foreground">M</span>
            </div>
            <span className="text-lg font-bold text-foreground">MacroTrack</span>
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <Link
              href="/dashboard"
              className="text-sm font-medium text-foreground transition-colors hover:text-accent"
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/goals"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Goals
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {sessionLabel && (
            <Badge variant="secondary" className="hidden max-w-48 truncate md:inline-flex">
              {sessionLabel}
            </Badge>
          )}
          <Button variant="ghost" size="icon" className="relative">
            <BellIcon className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-accent" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="hidden h-9 w-9 rounded-full bg-secondary p-0 md:flex"
              >
                <UserIcon className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem>
                <UserIcon className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <SettingsIcon className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={handleLogout}>
                <LogOutIcon className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <XIcon className="h-5 w-5" />
            ) : (
              <MenuIcon className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="border-t bg-card px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-3">
            {sessionLabel && (
              <Badge variant="secondary" className="mb-1 w-fit max-w-full truncate">
                {sessionLabel}
              </Badge>
            )}
            <Link
              href="/dashboard"
              className="text-sm font-medium text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/goals"
              className="text-sm font-medium text-muted-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              Goals
            </Link>
            <div className="mt-2 border-t pt-3">
              <Link
                href="/dashboard/profile"
                className="text-sm font-medium text-muted-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                Profile
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
