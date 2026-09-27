"use server"

/**
 * Server Action to check the Fonnte WhatsApp Device status
 */
export async function getFonnteDeviceStatus(): Promise<{
  success: boolean
  mode: "SIMULATED" | "LIVE"
  deviceStatus?: string
  device?: string
  name?: string
  quota?: number
  expired?: string
  message?: string
}> {
  const token = process.env.FONNTE_TOKEN

  // Jika token belum disetel di .env, kembalikan status simulasi
  if (!token) {
    return {
      success: false,
      mode: "SIMULATED",
      message: "Token Fonnte belum dikonfigurasi di .env (Aplikasi berjalan dalam mode simulasi)"
    }
  }

  try {
    const response = await fetch("https://api.fonnte.com/device", {
      method: "POST",
      headers: {
        "Authorization": token
      },
      next: { revalidate: 0 } // Hindari caching agar status selalu live
    })

    const result = await response.json()

    if (response.ok && result.status === true) {
      return {
        success: true,
        mode: "LIVE",
        deviceStatus: result.device_status, // "connect" atau "disconnect"
        device: result.device,
        name: result.name,
        quota: result.quota,
        expired: result.expired
      }
    } else {
      return {
        success: false,
        mode: "LIVE",
        message: result.detail || "Gagal memeriksa status perangkat Fonnte"
      }
    }
  } catch (err: any) {
    console.error("Gagal memeriksa status Fonnte Device:", err)
    return {
      success: false,
      mode: "LIVE",
      message: err.message || "Terjadi kesalahan jaringan"
    }
  }
}
