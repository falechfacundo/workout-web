import { Dumbbell } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl">
                    Track Your Fitness Journey Like Never Before
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Plan your training, track your progress, and achieve your
                    fitness goals with our comprehensive workout management
                    system.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button size="lg" asChild>
                    <Link href="/auth/register">Get Started</Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link href="#features">Learn More</Link>
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative h-[350px] w-full overflow-hidden rounded-xl bg-muted/50">
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                    <Dumbbell className="h-24 w-24 text-primary/20" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section
          className="w-full py-12 md:py-24 lg:py-32 bg-muted/50"
          id="features"
        >
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Powerful Features for Serious Athletes
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Everything you need to plan, track, and optimize your training
                  programs.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Dumbbell className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Exercise Library</h3>
                <p className="text-center text-muted-foreground">
                  Access a comprehensive database of exercises with detailed
                  instructions and muscle targeting.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Dumbbell className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Mesocycle Planning</h3>
                <p className="text-center text-muted-foreground">
                  Design structured training programs with progressive overload
                  for optimal results.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Dumbbell className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Workout Tracking</h3>
                <p className="text-center text-muted-foreground">
                  Log your workouts with detailed set, rep, and weight
                  information to monitor progress.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Dumbbell className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Progress Analytics</h3>
                <p className="text-center text-muted-foreground">
                  Visualize your progress with detailed charts and metrics to
                  optimize your training.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Dumbbell className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Volume Management</h3>
                <p className="text-center text-muted-foreground">
                  Track and optimize your training volume across muscle groups
                  for balanced development.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Dumbbell className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Rest Timer</h3>
                <p className="text-center text-muted-foreground">
                  Built-in rest timer to optimize recovery between sets for
                  maximum performance.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32" id="pricing">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Simple, Transparent Pricing
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Choose the plan that fits your training needs.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col rounded-lg border p-6">
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold">Free</h3>
                  <p className="text-muted-foreground">
                    Basic features for casual gym-goers.
                  </p>
                </div>
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-bold">$0</span>
                  <span className="ml-1 text-muted-foreground">/month</span>
                </div>
                <ul className="mt-6 space-y-2">
                  <li className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-2 h-4 w-4 text-primary"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Exercise library
                  </li>
                  <li className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-2 h-4 w-4 text-primary"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Basic workout tracking
                  </li>
                  <li className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-2 h-4 w-4 text-primary"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    1 active mesocycle
                  </li>
                </ul>
                <Button className="mt-6" asChild>
                  <Link href="/auth/register">Get Started</Link>
                </Button>
              </div>
              <div className="flex flex-col rounded-lg border border-primary p-6 shadow-lg">
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold">Pro</h3>
                  <p className="text-muted-foreground">
                    Advanced features for serious lifters.
                  </p>
                </div>
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-bold">$9.99</span>
                  <span className="ml-1 text-muted-foreground">/month</span>
                </div>
                <ul className="mt-6 space-y-2">
                  <li className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-2 h-4 w-4 text-primary"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Everything in Free
                  </li>
                  <li className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-2 h-4 w-4 text-primary"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Unlimited mesocycles
                  </li>
                  <li className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-2 h-4 w-4 text-primary"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Advanced analytics
                  </li>
                  <li className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-2 h-4 w-4 text-primary"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Volume tracking
                  </li>
                </ul>
                <Button className="mt-6" asChild>
                  <Link href="/auth/register">Get Started</Link>
                </Button>
              </div>
              <div className="flex flex-col rounded-lg border p-6">
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold">Elite</h3>
                  <p className="text-muted-foreground">
                    Premium features for athletes and coaches.
                  </p>
                </div>
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-bold">$19.99</span>
                  <span className="ml-1 text-muted-foreground">/month</span>
                </div>
                <ul className="mt-6 space-y-2">
                  <li className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-2 h-4 w-4 text-primary"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Everything in Pro
                  </li>
                  <li className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-2 h-4 w-4 text-primary"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Coach dashboard
                  </li>
                  <li className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-2 h-4 w-4 text-primary"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Client management
                  </li>
                  <li className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-2 h-4 w-4 text-primary"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Priority support
                  </li>
                </ul>
                <Button className="mt-6" asChild>
                  <Link href="/auth/register">Get Started</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
        <section
          className="w-full py-12 md:py-24 lg:py-32 bg-muted/50"
          id="faq"
        >
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Frequently Asked Questions
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Find answers to common questions about our platform.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2">
              <div className="space-y-2">
                <h3 className="text-xl font-bold">
                  How do I create a mesocycle?
                </h3>
                <p className="text-muted-foreground">
                  Navigate to the Mesocycles section in your dashboard and click
                  "Create Mesocycle". Follow the guided process to set up your
                  training program.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">
                  Can I track multiple goals at once?
                </h3>
                <p className="text-muted-foreground">
                  Yes, you can create multiple mesocycles with different goals
                  and track them simultaneously with our Pro and Elite plans.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">
                  How do I track my progress?
                </h3>
                <p className="text-muted-foreground">
                  Use the Workout Logs section to record your training sessions.
                  Our analytics dashboard will automatically generate progress
                  charts and metrics.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">
                  Can I customize exercises?
                </h3>
                <p className="text-muted-foreground">
                  Yes, you can add custom exercises to your library with
                  detailed information about muscle targeting and instructions.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Is there a mobile app?</h3>
                <p className="text-muted-foreground">
                  Our platform is fully responsive and works on all devices. We
                  also have native mobile apps for iOS and Android coming soon.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">
                  Can I cancel my subscription?
                </h3>
                <p className="text-muted-foreground">
                  Yes, you can cancel your subscription at any time from your
                  account settings. You'll continue to have access until the end
                  of your billing period.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full border-t px-4 md:px-6">
        <p className="text-center text-sm text-muted-foreground md:text-left">
          &copy; {new Date().getFullYear()} GymTrack. All rights reserved.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6 justify-center">
          <Link href="#" className="text-sm hover:underline underline-offset-4">
            Terms of Service
          </Link>
          <Link href="#" className="text-sm hover:underline underline-offset-4">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
