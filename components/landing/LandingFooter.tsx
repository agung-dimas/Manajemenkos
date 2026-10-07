import Link from "next/link"
import { Building2, ShieldCheck, Heart } from "lucide-react"

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
        <div className="mt-12 pt-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]">
          <p>© {currentYear} Kost Bu Wati. Hak Cipta Dilindungi.</p>
          <p className="flex items-center gap-1">
            Hunian Kost Nyaman, Aman & Bersih
          </p>
        </div>
      </div>
    </footer>
  )
}
