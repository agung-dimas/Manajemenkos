'use client'

import { useEffect } from 'react'

/**
 * VisitorVerification
 * Menjalankan verifikasi Vercel BotID pada saat browser pengunjung memuat halaman (Page Load).
 * Jika lolos sebagai manusia, server akan menerbitkan signed cookie __Host-botid-verification.
 * Ini berjalan secara background tanpa memblokir antarmuka pengguna (silent background verification).
 */
export function VisitorVerification() {
  useEffect(() => {
    let isMounted = true

    async function verify() {
      try {
        await fetch('/api/verify', {
          method: 'POST',
          credentials: 'same-origin',
          cache: 'no-store',
        })
      } catch {
        // Silent catch agar tidak mengganggu rendering jika offline/gagal
      }
    }

    verify()

    return () => {
      isMounted = false
    }
  }, [])

  return null
}
