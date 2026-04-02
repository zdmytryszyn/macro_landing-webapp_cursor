export function StatsSection() {
  const stats = [
    { value: "500K+", label: "Active users", description: "tracking daily" },
    { value: "98%", label: "Accuracy rate", description: "in macro calculations" },
    { value: "2.5M", label: "Meals logged", description: "every month" },
    { value: "4.9", label: "App Store rating", description: "from 50K reviews" },
  ];

  return (
    <section className="border-y border-border bg-secondary/50">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl font-bold text-foreground sm:text-4xl">{stat.value}</div>
              <div className="mt-2 text-sm font-medium text-foreground">{stat.label}</div>
              <div className="text-sm text-muted-foreground">{stat.description}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
