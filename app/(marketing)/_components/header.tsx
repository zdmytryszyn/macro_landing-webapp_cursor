"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userLabel, setUserLabel] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/auth/session");
      if (!res.ok) return;
      const data = (await res.json()) as {
        user: { email?: string; displayName?: string } | null;
      };
      if (data.user) {
        setUserLabel(data.user.displayName || data.user.email || null);
      }
    };
    load();
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
            <span className="text-sm font-bold text-accent-foreground">M</span>
          </div>
          <span className="text-lg font-semibold text-foreground">MacroTrack</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link href="#features" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Features
          </Link>
          <Link href="#how-it-works" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            How it Works
          </Link>
          <Link href="#contact-us" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Contact Us
          </Link>
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          {userLabel ? (
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard">{userLabel}</Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Log in</Link>
              </Button>
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90" asChild>
                <Link href="/signup">Get Started</Link>
              </Button>
            </>
          )}
        </div>

        <button
          className="flex items-center justify-center md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {isMenuOpen && (
        <div className="border-t border-border bg-background px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-4">
            <Link href="#features" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              Features
            </Link>
            <Link href="#how-it-works" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              How it Works
            </Link>
            <Link href="#contact-us" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              Contact Us
            </Link>
            <div className="flex flex-col gap-2 pt-4">
              {userLabel ? (
                <Button variant="outline" size="sm" className="justify-start" asChild>
                  <Link href="/dashboard">{userLabel}</Link>
                </Button>
              ) : (
                <>
                  <Button variant="ghost" size="sm" className="justify-start" asChild>
                    <Link href="/login">Log in</Link>
                  </Button>
                  <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90" asChild>
                    <Link href="/signup">Get Started</Link>
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
