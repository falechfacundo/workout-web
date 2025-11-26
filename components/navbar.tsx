import Link from "next/link";
import { Dumbbell } from "lucide-react";

import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <header className="flex h-16 items-center border-b px-4 md:px-6">
      <Link href="/" className="flex items-center gap-2 font-semibold">
        <Dumbbell className="h-6 w-6 text-primary" />
        <span>GymTrack</span>
      </Link>
      <nav className="ml-auto flex gap-4 sm:gap-6">
        <Link
          href="#features"
          className="text-sm font-medium hover:underline underline-offset-4"
        >
          Features
        </Link>
        <Link
          href="#pricing"
          className="text-sm font-medium hover:underline underline-offset-4"
        >
          Pricing
        </Link>
        <Link
          href="#faq"
          className="text-sm font-medium hover:underline underline-offset-4"
        >
          FAQ
        </Link>
      </nav>
      <div className="ml-4 flex items-center gap-2">
        <Button variant="outline" asChild>
          <Link href="/auth/login">Sign In</Link>
        </Button>
        <Button asChild>
          <Link href="/auth/register">Sign Up</Link>
        </Button>
      </div>
    </header>
  );
}
