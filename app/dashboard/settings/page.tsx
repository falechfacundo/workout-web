"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { SignOutButton } from "@/components/auth/sign-out-button"
import { useRequireAuth } from "@/hooks/use-require-auth"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function SettingsPage() {
  const { user, isLoading } = useRequireAuth()

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center p-8">Loading settings...</div>
      </DashboardLayout>
    )
  }

  if (!user) {
    return null
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4 md:gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account and session.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>
              Signed in as {user.email}. Manage your profile information from
              the Profile page.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-start gap-2">
            <SignOutButton variant="destructive">Sign Out</SignOutButton>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}