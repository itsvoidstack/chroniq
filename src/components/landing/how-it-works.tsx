import { UserPlus, Search, Chrome, BarChart3 } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: UserPlus,
    title: "Create your account",
    description: "Sign up for free in seconds. No credit card required.",
  },
  {
    number: "02",
    icon: Search,
    title: "Search and add media",
    description:
      "Search for anime, movies, shows, or manga and add them to your library.",
  },
  {
    number: "03",
    icon: Chrome,
    title: "Install the extension",
    description:
      "Add the Chroniq extension to auto-sync your watch activity from approved streaming sites.",
  },
  {
    number: "04",
    icon: BarChart3,
    title: "Track your progress",
    description:
      "Mark episodes watched, rate titles, and watch your stats grow over time.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
            Up and running in minutes
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            No complicated setup. Just sign up and start tracking.
          </p>
        </div>

        <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map(({ number, icon: Icon, title, description }) => (
            <div
              key={number}
              className="relative flex flex-col items-center text-center"
            >
              <div className="relative mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-card shadow-sm">
                <Icon className="h-7 w-7 text-primary" />
                <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                  {number.slice(1)}
                </span>
              </div>
              <h3 className="font-semibold mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
