export function HowItWorksSection() {
  const steps = [
    {
      step: "01",
      title: "Set your goals",
      description: "Tell us about your fitness objectives and we'll calculate your ideal macro split—protein, carbs, and fats tailored to you.",
    },
    {
      step: "02",
      title: "Log your meals",
      description: "Scan barcodes, search our database, or snap a photo. Logging takes seconds with our smart food recognition.",
    },
    {
      step: "03",
      title: "Track progress",
      description: "Watch your daily, weekly, and monthly trends. See how your nutrition aligns with your goals in real-time.",
    },
    {
      step: "04",
      title: "Achieve results",
      description: "Stay consistent with insights and reminders. Celebrate milestones as you transform your health.",
    },
  ];

  return (
    <section id="how-it-works" className="bg-secondary/30 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            How it works
          </h2>
          <p className="mt-4 text-pretty text-lg text-muted-foreground">
            Start tracking your macros in minutes, not hours.
          </p>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((item, index) => (
            <div key={index} className="relative">
              <div className="mb-4 text-5xl font-bold text-accent/20">{item.step}</div>
              <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
              <p className="mt-2 leading-relaxed text-muted-foreground">{item.description}</p>
              
              {index < steps.length - 1 && (
                <div className="absolute right-0 top-8 hidden h-0.5 w-8 bg-border lg:block" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
