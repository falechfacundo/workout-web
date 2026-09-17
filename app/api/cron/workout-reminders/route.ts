import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// Ventana de tolerancia: el dispatcher externo (GitHub Actions, ver
// .github/workflows/workout-reminders-cron.yml) corre cada 5 min pero el
// schedule de Actions no es puntual (puede atrasarse varios minutos, o una
// corrida puede fallar) — 20 min de ventana cubre eso sin mandar recordatorios
// muy tarde si el runner estuvo caído más tiempo que eso.
const WINDOW_MINUTES = 20;

type ExpoPushMessage = {
  to: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
};

type ExpoPushTicket =
  | { status: "ok"; id: string }
  | { status: "error"; message: string; details?: { error?: string } };

function parseTimeOfDayToMinutes(timeOfDay: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(timeOfDay);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
}

function isSameUtcDay(a: Date, b: Date): boolean {
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  );
}

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.error("[CRON_WORKOUT_REMINDERS] Falta CRON_SECRET en el entorno.");
    return NextResponse.json({ success: false, error: "Not configured" }, { status: 500 });
  }
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const nowMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
  const currentDow = now.getUTCDay();

  try {
    // NOTA sobre timezone: `time_of_day` se guarda sin timezone (viene de un
    // <input type="time"> web). Este dispatcher lo compara contra la hora UTC
    // del server — no contra la hora local del usuario. Si el usuario no está
    // en UTC, el recordatorio va a sonar corrido por su offset. No hay campo
    // de timezone en Profile hoy; agregarlo es la forma correcta de arreglar
    // esto pero es trabajo aparte (ver docs/PUSH-NOTIFICATIONS.md).
    const candidates = await db.workoutReminder.findMany({
      where: {
        is_enabled: true,
        day_of_week: currentDow,
        notification_type: "push",
        time_of_day: { not: null },
      },
      include: {
        training_session: { select: { id: true, name: true } },
      },
    });

    const due = candidates.filter((reminder) => {
      if (!reminder.time_of_day) return false;
      const reminderMinutes = parseTimeOfDayToMinutes(reminder.time_of_day);
      if (reminderMinutes === null) return false;

      const diff = nowMinutes - reminderMinutes;
      if (diff < 0 || diff > WINDOW_MINUTES) return false;

      if (reminder.last_sent_at && isSameUtcDay(reminder.last_sent_at, now)) {
        return false; // ya se mandó hoy
      }
      return true;
    });

    if (due.length === 0) {
      return NextResponse.json({ success: true, data: { processed: 0, sent: 0 } });
    }

    const userIds = [...new Set(due.map((r) => r.user_id))];
    const tokens = await db.pushToken.findMany({ where: { user_id: { in: userIds } } });
    const tokensByUser = new Map<string, typeof tokens>();
    for (const t of tokens) {
      tokensByUser.set(t.user_id, [...(tokensByUser.get(t.user_id) ?? []), t]);
    }

    const messages: ExpoPushMessage[] = [];
    // índice paralelo a `messages` para poder mapear la respuesta de Expo
    // (un ticket por mensaje, mismo orden) de vuelta al pushToken.id.
    const messageTokenIds: string[] = [];

    for (const reminder of due) {
      const userTokens = tokensByUser.get(reminder.user_id) ?? [];
      const title = "Hora de entrenar";
      const body = reminder.training_session?.name
        ? `Tenés programado "${reminder.training_session.name}".`
        : "Tenés un entrenamiento programado.";

      for (const t of userTokens) {
        messages.push({
          to: t.token,
          title,
          body,
          data: reminder.training_session_id
            ? { training_session_id: reminder.training_session_id }
            : undefined,
        });
        messageTokenIds.push(t.id);
      }
    }

    let sent = 0;
    const staleTokenIds: string[] = [];

    if (messages.length > 0) {
      const expoRes = await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "Accept-Encoding": "gzip, deflate",
        },
        body: JSON.stringify(messages),
      });

      if (expoRes.ok) {
        const json = (await expoRes.json()) as { data?: ExpoPushTicket[] };
        const tickets = json.data ?? [];
        tickets.forEach((ticket, i) => {
          if (ticket.status === "ok") {
            sent++;
          } else if (ticket.details?.error === "DeviceNotRegistered") {
            staleTokenIds.push(messageTokenIds[i]);
          }
        });
      } else {
        console.error("[CRON_WORKOUT_REMINDERS] Expo push API error", await expoRes.text());
      }
    }

    if (staleTokenIds.length > 0) {
      await db.pushToken.deleteMany({ where: { id: { in: staleTokenIds } } });
    }

    // Se marca como enviado el batch entero de `due` (tuvieran token o no) —
    // si un usuario sin token todavía registra uno más tarde el mismo día, se
    // pierde el recordatorio de hoy. Trade-off aceptado por simplicidad: sin
    // esto, un usuario sin push token generaría el mismo `due` en cada corrida
    // del cron (cada 5 min) hasta medianoche.
    await db.workoutReminder.updateMany({
      where: { id: { in: due.map((r) => r.id) } },
      data: { last_sent_at: now },
    });

    return NextResponse.json({
      success: true,
      data: { processed: due.length, sent, staleTokensRemoved: staleTokenIds.length },
    });
  } catch (error) {
    console.error("[CRON_WORKOUT_REMINDERS]", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
