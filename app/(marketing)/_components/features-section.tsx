import { Zap, BarChart3, Target, Smartphone, Utensils, Bell } from "lucide-react";

export function FeaturesSection() {
  const features = [
    {
      icon: Zap,
      title: "Instant Food Scanning",
      description: "Scan barcodes or take photos of your meals. Our AI identifies foods and calculates macros in seconds.",
    },
    {
      icon: BarChart3,
      title: "Detailed Analytics",
      description: "Visualize your progress with beautiful charts. Track trends, identify patterns, and optimize your nutrition.",
    },
    {
      icon: Target,
      title: "Personalized Goals",
      description: "Set custom macro targets based on your fitness goals—whether bulking, cutting, or maintaining.",
    },
    {
      icon: Smartphone,
      title: "Sync Everywhere",
      description: "Access your data across all devices. Your progress syncs seamlessly in real-time.",
    },
    {
      icon: Utensils,
      title: "Recipe Database",
      description: "Browse thousands of macro-friendly recipes or add your own with automatic nutrition calculation.",
    },
    {
      icon: Bell,
      title: "Smart Reminders",
      description: "Never miss a meal log. Get gentle reminders customized to your eating schedule.",
    },
  ];

  return (
    <section id="features" className="bg-background py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Everything you need to hit your macros
          </h2>
          <p className="mt-4 text-pretty text-lg text-muted-foreground">
            Powerful features designed to make nutrition tracking effortless and effective.
          </p>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group rounded-2xl border border-border bg-card p-6 transition-all hover:border-accent/50 hover:shadow-lg"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
                <feature.icon className="h-6 w-6 text-accent" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">{feature.title}</h3>
              <p className="mt-2 leading-relaxed text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
