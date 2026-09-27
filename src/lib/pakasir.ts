/**
 * Layanan Integrasi Payment Gateway Pakasir API v2
 * Dokumentasi: https://app.pakasir.com
 */

interface CreateTransactionParams {
  orderId: string
  amount: number
  method?: "payment_link" | "qris" | "bri_va" | "bni_va" | "cimb_niaga_va" | "permata_va" | "maybank_va"
}

export interface CreateTransactionResult {
  success: boolean
  paymentLink?: string
  txnId?: string
  error?: string
  data?: any
}

export async function createPakasirTransaction({
  orderId,
  amount,
  method = "payment_link"
}: CreateTransactionParams): Promise<CreateTransactionResult> {
  const slug = process.env.PAKASIR_SLUG
  const apiKey = process.env.PAKASIR_API_KEY

  // Mode Simulasi jika kredensial belum diatur
  if (!slug || !apiKey) {
    console.log(`\n--- [PAKASIR PAYMENT GATEWAY SIMULASI] ---`)
    console.log(`Order ID : ${orderId}`)
    console.log(`Nominal  : Rp ${amount.toLocaleString("id-ID")}`)
    console.log(`Metode   : ${method}`)
    console.log(`Keterangan: Berjalan dalam mode simulasi karena PAKASIR_SLUG atau PAKASIR_API_KEY belum disetel di .env`)
    console.log(`-----------------------------------------\n`)

    return {
      success: true,
      txnId: `SIM-${Date.now()}`,
      paymentLink: `https://app.pakasir.com/simulation?order_id=${orderId}&amount=${amount}`,
      data: { is_simulation: true }
    }
  }

  try {
    const url = `https://app.pakasir.com/api/v2/create-transaction/${encodeURIComponent(slug)}/${encodeURIComponent(orderId)}`

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": apiKey
      },
      body: JSON.stringify({
        method,
        amount: Math.round(amount)
      })
    })

    const result = await response.json()

    if (response.ok && (result.payment_link || result.txn_id)) {
      return {
        success: true,
        paymentLink: result.payment_link || `https://app.pakasir.com/pay-v2/${result.txn_id}`,
        txnId: result.txn_id,
        data: result
      }
    } else {
      console.error("[PAKASIR ERROR] Gagal membuat transaksi:", result)
      return {
        success: false,
        error: result.message || result.error || "Gagal membuat link pembayaran Pakasir"
      }
    }
  } catch (err: any) {
    console.error("[PAKASIR EXCEPTION] Error koneksi:", err)
    return {
      success: false,
      error: err.message || "Gagal menghubungi server Pakasir"
    }
  }
}
