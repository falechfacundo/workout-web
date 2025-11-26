"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, Calendar, Dumbbell, LayoutDashboard, LogOut, Menu, Settings, Target, User } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

interface NavItem {
  title: string
  href: string
  icon: React.ReactNode
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    title: "Muscle Groups",
    href: "/dashboard/muscle-groups",
    icon: <Target className="h-5 w-5" />,
  },
  {
    title: "Exercises",
    href: "/dashboard/exercises",
    icon: <Dumbbell className="h-5 w-5" />,
  },
  {
    title: "Mesocycles",
    href: "/dashboard/mesocycles",
    icon: <Calendar className="h-5 w-5" />,
  },
  {
    title: "Workout Logs",
    href: "/dashboard/workout-logs",
    icon: <BarChart3 className="h-5 w-5" />,
  },
  {
    title: "Profile",
    href: "/dashboard/profile",
    icon: <User className="h-5 w-5" />,
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: <Settings className="h-5 w-5" />,
  },
]

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="flex flex-col">
            <nav className="grid gap-2 text-lg font-medium">
              <Link href="/" className="flex items-center gap-2 text-lg font-semibold" onClick={() => setOpen(false)}>
                <Dumbbell className="h-6 w-6 text-primary" />
                <span>GymTrack</span>
              </Link>
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-accent",
                    pathname === item.href ? "bg-accent" : "transparent",
                  )}
                >
                  {item.icon}
                  {item.title}
                </Link>
              ))}
              <Link
                href="/auth/signout"
                className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-accent"
                onClick={() => setOpen(false)}
              >
                <LogOut className="h-5 w-5" />
                Sign Out
              </Link>
            </nav>
          </SheetContent>
        </Sheet>
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Dumbbell className="h-6 w-6 text-primary" />
          <span className="hidden md:inline-block">GymTrack</span>
        </Link>
        <div className="flex-1"></div>
        <Button variant="outline" size="icon" className="rounded-full">
          <User className="h-5 w-5" />
          <span className="sr-only">User menu</span>
        </Button>
      </header>
      <div className="grid flex-1 md:grid-cols-[220px_1fr]">
        <aside className="hidden border-r bg-muted/40 md:block">
          <nav className="grid gap-2 p-4 text-sm">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-accent",
                  pathname === item.href ? "bg-accent" : "transparent",
                )}
              >
                {item.icon}
                {item.title}
              </Link>
            ))}
            <Link href="/auth/signout" className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-accent">
              <LogOut className="h-5 w-5" />
              Sign Out
            </Link>
          </nav>
        </aside>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
