"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { SignOutButton } from "@/components/auth/sign-out-button"
import { useRequireAuth } from "@/hooks/use-require-auth"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  getGoogleLinkStatus,
  unlinkGoogleAccount,
} from "@/lib/actions/google-link"

const LINK_ERROR_MESSAGES: Record<string, string> = {
  invalid_state: "La sesión de vinculación expiró. Probá de nuevo.",
  token_exchange_failed: "No se pudo confirmar la cuenta de Google. Probá de nuevo.",
  email_mismatch: "Esa cuenta de Google usa un email distinto al de tu cuenta.",
  already_linked_elsewhere: "Esa cuenta de Google ya está vinculada a otro usuario.",
  unknown: "Ocurrió un error al vincular Google. Probá de nuevo.",
}

function GoogleAccountCard() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<{ linked: boolean; canUnlink: boolean } | null>(null)
  const [isUnlinking, setIsUnlinking] = useState(false)

  useEffect(() => {
    getGoogleLinkStatus().then((result) => {
      if (result.data) setStatus(result.data)
    })
  }, [])

  useEffect(() => {
    if (searchParams.get("linked") === "1") {
      toast.success("Cuenta de Google vinculada")
    }
    const linkError = searchParams.get("linkError")
    if (linkError) {
      toast.error(LINK_ERROR_MESSAGES[linkError] ?? LINK_ERROR_MESSAGES.unknown)
    }
  }, [searchParams])

  async function handleUnlink() {
    setIsUnlinking(true)
    try {
      const result = await unlinkGoogleAccount()
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success("Cuenta de Google desvinculada")
      setStatus((prev) => (prev ? { ...prev, linked: false } : prev))
    } finally {
      setIsUnlinking(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Google</CardTitle>
        <CardDescription>
          {status === null
            ? "Cargando..."
            : status.linked
              ? "Tu cuenta está vinculada con Google. Podés iniciar sesión con Google o con tu contraseña."
              : "Vinculá tu cuenta de Google para iniciar sesión sin contraseña."}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-start gap-2">
        {status?.linked ? (
          <Button
            variant="outline"
            onClick={handleUnlink}
            disabled={isUnlinking || !status.canUnlink}
            title={
              !status.canUnlink
                ? "Establecé una contraseña antes de desvincular Google"
                : undefined
            }
          >
            {isUnlinking ? "Desvinculando..." : "Desvincular Google"}
          </Button>
        ) : (
          <Button asChild variant="outline">
            <a href="/api/google-link">Vincular con Google</a>
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

export default function SettingsPage() {
  const { user, isLoading } = useRequireAuth()

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col gap-4 md:gap-8">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-72" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-9 w-28" />
            </CardContent>
          </Card>
        </div>
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

        <Suspense fallback={null}>
          <GoogleAccountCard />
        </Suspense>
      </div>
    </DashboardLayout>
  )
}