"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function CTASection() {
  const [userLabel, setUserLabel] = useState<string | null>(null);
  const [contactOpen, setContactOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [contactError, setContactError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", message: "" });

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

  const primaryHref = userLabel ? "/dashboard" : "/signup";

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactError("");
    setSubmitting(true);
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSubmitting(false);
    if (!res.ok) {
      setContactError("Something went wrong. Please try again.");
      return;
    }
    setForm({ name: "", email: "", message: "" });
    setContactOpen(false);
  };

  return (
    <section id="contact-us" className="bg-primary py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
            Ready to take control of your nutrition?
          </h2>
          <p className="mt-4 text-pretty text-lg text-primary-foreground/80">
            Join 500,000+ users who are crushing their fitness goals with MacroTrack. Start your free trial today.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              variant="secondary"
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
              asChild
            >
              <Link href={primaryHref}>
                Get started for free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>

            <Dialog open={contactOpen} onOpenChange={setContactOpen}>
              <DialogTrigger asChild>
                <Button
                  size="lg"
                  type="button"
                  variant="outline"
                  className="border-primary-foreground/40 bg-primary-foreground/15 text-primary-foreground shadow-sm hover:bg-primary-foreground/25 hover:text-primary-foreground"
                >
                  Talk to sales
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Contact us</DialogTitle>
                  <DialogDescription>
                    Tell us a bit about what you need. We&apos;ll get back to you soon.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleContactSubmit} className="grid gap-4">
                  {contactError && (
                    <p className="text-sm text-destructive">{contactError}</p>
                  )}
                  <div className="grid gap-2">
                    <Label htmlFor="contact-name">Name</Label>
                    <Input
                      id="contact-name"
                      value={form.name}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, name: e.target.value }))
                      }
                      required
                      autoComplete="name"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="contact-email">Email</Label>
                    <Input
                      id="contact-email"
                      type="email"
                      value={form.email}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, email: e.target.value }))
                      }
                      required
                      autoComplete="email"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="contact-message">Message</Label>
                    <Textarea
                      id="contact-message"
                      value={form.message}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, message: e.target.value }))
                      }
                      required
                      rows={4}
                      className="resize-none"
                    />
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={submitting}>
                      {submitting ? "Sending…" : "Send message"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <p className="mt-4 text-sm text-primary-foreground/60">
            No credit card required. Free 14-day trial.
          </p>
        </div>
      </div>
    </section>
  );
}
