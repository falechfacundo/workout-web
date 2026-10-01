"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { Globe } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { setLocale } from "@/lib/actions/locale"
import type { Locale } from "@/i18n/request"

export function LocaleToggle() {
  const t = useTranslations("nav")
  const locale = useLocale()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function onSelect(next: Locale) {
    if (next === locale) return
    startTransition(async () => {
      await setLocale(next)
      router.refresh()
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="rounded-full"
          disabled={isPending}
        >
          <Globe className="h-5 w-5" />
          <span className="sr-only">{t("toggleLanguage")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onSelect("en")}>
          English
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onSelect("es")}>
          Español
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
