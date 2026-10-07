"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Building2, Sun, Moon } from "lucide-react"
import { useTheme } from "next-themes"

export function LandingFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-border bg-card text-xs text-muted-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs">
                <Building2 className="h-4 w-4" />
              </div>
              <span className="font-bold text-sm tracking-tight text-foreground">
                KOST BU WATI
              </span>
            </Link>
            <p className="text-xs leading-relaxed max-w-sm">
              Sistem manajemen kost modern dengan hunian bersih, fasilitas lengkap, dan pencatatan transaksi yang transparan.
            </p>
            <p className="text-[11px] text-muted-foreground">
              Menerapkan prinsip sewa di muka yang tertib, aman, dan nyaman untuk semua penghuni.
            </p>
          </div>

          {/* Quick Nav */}
          <div className="space-y-3">
            <span className="font-semibold text-foreground text-xs uppercase tracking-wider block">
              Navigasi Halaman
            </span>
            <ul className="space-y-2">
              <li>
                <a href="#katalog-kamar" className="hover:text-foreground transition-colors">
                  Katalog Kamar & Tarif
                </a>
              </li>
              <li>
                <a href="#fasilitas" className="hover:text-foreground transition-colors">
                  Fasilitas Unggulan
                </a>
              </li>
              <li>
                <a href="#cara-reservasi" className="hover:text-foreground transition-colors">
                  Panduan Cara Reservasi
                </a>
              </li>
              <li>
                <a href="#lokasi" className="hover:text-foreground transition-colors">
                  Lokasi & Kontak
                </a>
              </li>
            </ul>
          </div>

          {/* Access & Portals */}
          <div className="space-y-3">
            <span className="font-semibold text-foreground text-xs uppercase tracking-wider block">
              Akses Sistem
            </span>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/tenant/login"
                  className="hover:text-foreground transition-colors text-emerald-700 dark:text-emerald-400 font-semibold"
                >
                  Portal Mandiri Penghuni →
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-foreground transition-colors">
                  Login Pengelola / Admin
                </Link>
              </li>
              <li>
                <span className="text-[11px] text-muted-foreground block pt-2">
                  Butuh bantuan reservasi? Silakan hubungi nomor WhatsApp pengelola.
                </span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Strip */}
        <div className="mt-12 pt-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <p>© {currentYear} Kost Bu Wati. Hak Cipta Dilindungi.</p>
          
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Mode Tampilan:</span>
            <FooterThemeSwitch />
          </div>

          <p className="flex items-center gap-1">
            Hunian Kost Nyaman, Aman & Bersih
          </p>
        </div>
      </div>
    </footer>
  )
}

function FooterThemeSwitch() {
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="w-20 h-7 rounded-lg bg-muted animate-pulse" />
  }

  const isDark = resolvedTheme === "dark"

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-border bg-background hover:bg-muted text-foreground transition-colors cursor-pointer text-xs font-medium shadow-2xs"
      title={isDark ? "Ganti ke Mode Terang (Light Mode)" : "Ganti ke Mode Gelap (Dark Mode)"}
    >
      {isDark ? (
        <>
          <Sun className="h-3.5 w-3.5 text-amber-400" />
          <span>Mode Terang</span>
        </>
      ) : (
        <>
          <Moon className="h-3.5 w-3.5 text-slate-700" />
          <span>Mode Gelap</span>
        </>
      )}
    </button>
  )
}
