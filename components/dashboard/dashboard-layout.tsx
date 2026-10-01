"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTranslations } from "next-intl"
import { BarChart3, Calendar, ClipboardList, Dumbbell, LayoutDashboard, LogOut, Menu, Settings, Target, User } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { SignOutButton } from "@/components/auth/sign-out-button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ThemeToggle } from "@/components/theme-toggle"
import { LocaleToggle } from "@/components/locale-toggle"
import { BrandMark } from "@/components/brand-mark"

interface NavItem {
  titleKey: string
  href: string
  icon: React.ReactNode
}

const navItems: NavItem[] = [
  {
    titleKey: "dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    titleKey: "calendar",
    href: "/dashboard/calendar",
    icon: <Calendar className="h-5 w-5" />,
  },
  {
    titleKey: "muscleGroups",
    href: "/dashboard/muscle-groups",
    icon: <Target className="h-5 w-5" />,
  },
  {
    titleKey: "exercises",
    href: "/dashboard/exercises",
    icon: <Dumbbell className="h-5 w-5" />,
  },
  {
    titleKey: "analytics",
    href: "/dashboard/analytics",
    icon: <BarChart3 className="h-5 w-5" />,
  },
  {
    titleKey: "mesocycles",
    href: "/dashboard/mesocycles",
    icon: <Calendar className="h-5 w-5" />,
  },
  {
    titleKey: "workoutLogs",
    href: "/dashboard/workout-logs",
    icon: <ClipboardList className="h-5 w-5" />,
  },
  {
    titleKey: "profile",
    href: "/dashboard/profile",
    icon: <User className="h-5 w-5" />,
  },
  {
    titleKey: "settings",
    href: "/dashboard/settings",
    icon: <Settings className="h-5 w-5" />,
  },
]

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const t = useTranslations("nav")

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === href : pathname.startsWith(href)

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 bg-card px-4 md:px-6">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">{t("toggleNav")}</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="flex flex-col">
            <nav className="grid gap-2 text-lg font-medium">
              <Link href="/" className="flex items-center gap-2 text-lg font-semibold" onClick={() => setOpen(false)}>
                <BrandMark className="h-8 w-8 text-primary" />
                <span>GymTrack</span>
              </Link>
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent",
                    isActive(item.href) ? "bg-accent" : "transparent",
                  )}
                >
                  {item.icon}
                  {t(item.titleKey)}
                </Link>
              ))}
              <SignOutButton className="w-full justify-start gap-2 rounded-lg px-3 py-2">
                <LogOut className="h-5 w-5" />
                {t("signOut")}
              </SignOutButton>
            </nav>
          </SheetContent>
        </Sheet>
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <BrandMark className="h-8 w-8 text-primary" />
          <span className="hidden md:inline-block">GymTrack</span>
        </Link>
        <div className="flex-1"></div>
        <LocaleToggle />
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="rounded-full">
              <User className="h-5 w-5" />
              <span className="sr-only">{t("userMenu")}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href="/dashboard/profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                {t("profile")}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                {t("settings")}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <SignOutButton
                variant="ghost"
                className="h-auto w-full justify-start gap-2 px-2 py-1.5 font-normal"
              >
                <LogOut className="h-4 w-4" />
                {t("signOut")}
              </SignOutButton>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>
      <div className="grid flex-1 md:grid-cols-[220px_1fr]">
        <aside className="hidden bg-card md:block">
          <nav className="grid gap-2 p-4 text-sm">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent",
                  isActive(item.href) ? "bg-accent" : "transparent",
                )}
              >
                {item.icon}
                {t(item.titleKey)}
              </Link>
            ))}
            <SignOutButton className="w-full justify-start gap-2 rounded-lg px-3 py-2">
              <LogOut className="h-5 w-5" />
              {t("signOut")}
            </SignOutButton>
          </nav>
        </aside>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
