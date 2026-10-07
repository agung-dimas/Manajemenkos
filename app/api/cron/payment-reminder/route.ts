import { NextResponse } from "next/server"
import { processPaymentReminders } from "@/src/lib/reminder-service"

export const dynamic = "force-dynamic"

// Dipanggil otomatis oleh Cron (Vercel Cron, cron-job.org, atau Webhook)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const force = searchParams.get("force") === "true"
    // Parameter checkHour: jika true atau tidak diset, sistem akan mengecek apakah jam saat ini cocok dengan reminderHour.
    // Jika force=true atau ignoreHour=true, jam diabaikan dan langsung dieksekusi.
    const ignoreHour = searchParams.get("ignoreHour") === "true" || force
    const checkHour = !ignoreHour

    const result = await processPaymentReminders({ force, checkHour })
    return NextResponse.json(result)
  } catch (err: any) {
    console.error("Gagal menjalankan cron reminder:", err)
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500 }
    )
  }
}

// Dipanggil secara manual oleh tombol test dari dashboard admin
export async function POST(request: Request) {
  try {
    let force = true
    let checkHour = false
    try {
      const body = await request.json()
      if (body && typeof body.force === "boolean") {
        force = body.force
      }
      if (body && typeof body.checkHour === "boolean") {
        checkHour = body.checkHour
      }
    } catch {
      // Body kosong, default force = true
    }

    const result = await processPaymentReminders({ force, checkHour })
    return NextResponse.json(result)
  } catch (err: any) {
    console.error("Gagal menjalankan trigger manual reminder:", err)
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500 }
    )
  }
}
