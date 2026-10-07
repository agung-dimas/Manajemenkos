"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export interface ReminderSettings {
  reminderDaysBefore: number // e.g. 3 (H-3), 5, 7
  reminderHour: number       // e.g. 18 (18:00 WIB)
  reminderMinute: number     // e.g. 24 (18:24 WIB)
  autoDailyReminder: boolean  // true = kirim setiap hari jika belum bayar sampai hari H jatuh tempo
  emailReminderActive: boolean
  whatsappReminderActive: boolean
}

const DEFAULT_SETTINGS: ReminderSettings = {
  reminderDaysBefore: 3,
  reminderHour: 8,
  reminderMinute: 0,
  autoDailyReminder: true,
  emailReminderActive: true,
  whatsappReminderActive: true,
}

export async function getReminderSettings(): Promise<ReminderSettings> {
  try {
    const settings = await prisma.systemSetting.findMany({
      where: {
        key: {
          in: [
            "reminder_days_before",
            "reminder_hour",
            "reminder_minute",
            "auto_daily_reminder",
            "email_reminder_active",
            "whatsapp_reminder_active",
          ],
        },
      },
    })

    const map = new Map(settings.map((s) => [s.key, s.value]))

    return {
      reminderDaysBefore: map.has("reminder_days_before")
        ? parseInt(map.get("reminder_days_before")!) || DEFAULT_SETTINGS.reminderDaysBefore
        : DEFAULT_SETTINGS.reminderDaysBefore,
      reminderHour: map.has("reminder_hour")
        ? parseInt(map.get("reminder_hour")!) || DEFAULT_SETTINGS.reminderHour
        : DEFAULT_SETTINGS.reminderHour,
      reminderMinute: map.has("reminder_minute")
        ? parseInt(map.get("reminder_minute")!) || DEFAULT_SETTINGS.reminderMinute
        : DEFAULT_SETTINGS.reminderMinute,
      autoDailyReminder: map.has("auto_daily_reminder")
        ? map.get("auto_daily_reminder") === "true"
        : DEFAULT_SETTINGS.autoDailyReminder,
      emailReminderActive: map.has("email_reminder_active")
        ? map.get("email_reminder_active") === "true"
        : DEFAULT_SETTINGS.emailReminderActive,
      whatsappReminderActive: map.has("whatsapp_reminder_active")
        ? map.get("whatsapp_reminder_active") === "true"
        : DEFAULT_SETTINGS.whatsappReminderActive,
    }
  } catch (err) {
    console.error("Gagal membaca pengaturan pengingat:", err)
    return DEFAULT_SETTINGS
  }
}

export async function saveReminderSettings(data: Partial<ReminderSettings>) {
  try {
    const upserts = []

    if (data.reminderDaysBefore !== undefined) {
      upserts.push(
        prisma.systemSetting.upsert({
          where: { key: "reminder_days_before" },
          update: { value: data.reminderDaysBefore.toString() },
          create: { key: "reminder_days_before", value: data.reminderDaysBefore.toString() },
        })
      )
    }

    if (data.reminderHour !== undefined) {
      upserts.push(
        prisma.systemSetting.upsert({
          where: { key: "reminder_hour" },
          update: { value: data.reminderHour.toString() },
          create: { key: "reminder_hour", value: data.reminderHour.toString() },
        })
      )
    }

    if (data.reminderMinute !== undefined) {
      upserts.push(
        prisma.systemSetting.upsert({
          where: { key: "reminder_minute" },
          update: { value: data.reminderMinute.toString() },
          create: { key: "reminder_minute", value: data.reminderMinute.toString() },
        })
      )
    }

    if (data.autoDailyReminder !== undefined) {
      upserts.push(
        prisma.systemSetting.upsert({
          where: { key: "auto_daily_reminder" },
          update: { value: data.autoDailyReminder ? "true" : "false" },
          create: { key: "auto_daily_reminder", value: data.autoDailyReminder ? "true" : "false" },
        })
      )
    }

    if (data.emailReminderActive !== undefined) {
      upserts.push(
        prisma.systemSetting.upsert({
          where: { key: "email_reminder_active" },
          update: { value: data.emailReminderActive ? "true" : "false" },
          create: { key: "email_reminder_active", value: data.emailReminderActive ? "true" : "false" },
        })
      )
    }

    if (data.whatsappReminderActive !== undefined) {
      upserts.push(
        prisma.systemSetting.upsert({
          where: { key: "whatsapp_reminder_active" },
          update: { value: data.whatsappReminderActive ? "true" : "false" },
          create: { key: "whatsapp_reminder_active", value: data.whatsappReminderActive ? "true" : "false" },
        })
      )
    }

    await prisma.$transaction(upserts)
    revalidatePath("/dashboard/pengaturan")
    return { success: true }
  } catch (err: any) {
    console.error("Gagal menyimpan pengaturan pengingat:", err)
    return { success: false, error: err.message || "Gagal menyimpan pengaturan." }
  }
}

export async function triggerReminderTest(force: boolean = true) {
  try {
    const { processPaymentReminders } = await import("@/src/lib/reminder-service")
    const res = await processPaymentReminders({ force })
    revalidatePath("/dashboard/pembayaran")
    revalidatePath("/dashboard/pengaturan")
    return res
  } catch (err: any) {
    console.error("Gagal menjalankan uji coba pengingat:", err)
    return {
      success: false,
      error: err.message || "Terjadi kesalahan saat memproses pengingat.",
      processedCount: 0,
      results: []
    }
  }
}

