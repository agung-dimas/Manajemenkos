import { NextResponse } from "next/server"
import { processPaymentReminders } from "@/src/lib/reminder-service"

export const dynamic = "force-dynamic"

// Dipanggil otomatis oleh Vercel Cron
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const force = searchParams.get("force") === "true"

    const result = await processPaymentReminders({ force })
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
    try {
      const body = await request.json()
      if (body && typeof body.force === "boolean") {
        force = body.force
      }
    } catch {
      // Body kosong, default force = true
    }

    const result = await processPaymentReminders({ force })
    return NextResponse.json(result)
  } catch (err: any) {
    console.error("Gagal menjalankan trigger manual reminder:", err)
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500 }
    )
  }
}
