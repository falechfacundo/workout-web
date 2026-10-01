"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
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

const LINK_ERROR_KEYS: Record<
  string,
  | "linkErrorInvalidState"
  | "linkErrorTokenExchangeFailed"
  | "linkErrorEmailMismatch"
  | "linkErrorAlreadyLinkedElsewhere"
  | "linkErrorUnknown"
> = {
  invalid_state: "linkErrorInvalidState",
  token_exchange_failed: "linkErrorTokenExchangeFailed",
  email_mismatch: "linkErrorEmailMismatch",
  already_linked_elsewhere: "linkErrorAlreadyLinkedElsewhere",
  unknown: "linkErrorUnknown",
}

function GoogleAccountCard() {
  const t = useTranslations("settings")
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
      toast.success(t("toastGoogleLinked"))
    }
    const linkError = searchParams.get("linkError")
    if (linkError) {
      toast.error(t(LINK_ERROR_KEYS[linkError] ?? "linkErrorUnknown"))
    }
  }, [searchParams, t])

  async function handleUnlink() {
    setIsUnlinking(true)
    try {
      const result = await unlinkGoogleAccount()
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success(t("toastGoogleUnlinked"))
      setStatus((prev) => (prev ? { ...prev, linked: false } : prev))
    } finally {
      setIsUnlinking(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("googleTitle")}</CardTitle>
        <CardDescription>
          {status === null
            ? t("googleLoading")
            : status.linked
              ? t("googleLinkedDescription")
              : t("googleUnlinkedDescription")}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-start gap-2">
        {status?.linked ? (
          <Button
            variant="outline"
            onClick={handleUnlink}
            disabled={isUnlinking || !status.canUnlink}
            title={
              !status.canUnlink ? t("unlinkDisabledTitle") : undefined
            }
          >
            {isUnlinking ? t("unlinkingButton") : t("unlinkButton")}
          </Button>
        ) : (
          <Button asChild variant="outline">
            <a href="/api/google-link">{t("linkButton")}</a>
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

export default function SettingsPage() {
  const t = useTranslations("settings")
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
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t("accountTitle")}</CardTitle>
            <CardDescription>
              {t("accountDescription", { email: user.email ?? "" })}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-start gap-2">
            <SignOutButton variant="destructive">{t("signOut")}</SignOutButton>
          </CardContent>
        </Card>

        <Suspense fallback={null}>
          <GoogleAccountCard />
        </Suspense>
      </div>
    </DashboardLayout>
  )
}