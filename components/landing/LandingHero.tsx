import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ArrowDown,
  CheckCircle2,
  ShieldCheck,
  Wifi,
  Sparkles,
  MapPin,
  CalendarCheck
} from "lucide-react"

interface LandingHeroProps {
  totalRooms: number
  availableRooms: number
  minPrice: number
}

export function LandingHero({ totalRooms, availableRooms, minPrice }: LandingHeroProps) {
  const formattedMinPrice = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(minPrice)

  return (
    <section className="relative pt-24 pb-12 sm:pb-16 lg:pt-28 lg:pb-20 overflow-hidden bg-radial from-emerald-50/40 via-background to-background dark:from-emerald-950/20 dark:via-background dark:to-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left Column: Copy & Value Proposition */}
          <div className="lg:col-span-7 space-y-6">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/70 dark:bg-emerald-950/60 border border-emerald-300/80 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>{availableRooms} Kamar Siap Huni Bulan Ini</span>
            </div>

            {/* Headline (Max 2 lines on desktop) */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.1] text-balance">
              Hunian Kost Nyaman & Bersih di Pusat Kota
            </h1>

            {/* Subtext (Under 20 words, concise & high impact) */}
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-[54ch]">
              Kamar bersih, fasilitas lengkap, lingkungan aman, serta proses reservasi sewa bulanan praktis dan transparan.
            </p>

            {/* CTAs (No wrap, distinct intents) */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <a href="#katalog-kamar">
                <Button
                  size="lg"
                  className="h-11 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm gap-2"
                >
                  <CalendarCheck className="h-4 w-4" />
                  Cek Kamar Tersedia
                </Button>
              </a>

              <a href="#cara-reservasi">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-11 px-5 rounded-xl border-border text-foreground hover:bg-muted font-medium gap-2"
                >
                  Panduan Reservasi
                  <ArrowDown className="h-4 w-4 text-muted-foreground" />
                </Button>
              </a>
            </div>

            {/* Live Highlights Strip */}
            <div className="pt-4 border-t border-border/70 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="space-y-0.5">
                <span className="text-muted-foreground">Kamar Kosong</span>
                <p className="font-bold text-foreground text-sm flex items-center gap-1">
                  <span className="text-emerald-600 font-extrabold">{availableRooms}</span> dari {totalRooms} Unit
                </p>
              </div>

              <div className="space-y-0.5">
                <span className="text-muted-foreground">Mulai Dari</span>
                <p className="font-bold text-foreground text-sm">
                  {formattedMinPrice}<span className="text-xs font-normal text-muted-foreground">/bln</span>
                </p>
              </div>

              <div className="space-y-0.5">
                <span className="text-muted-foreground">Keamanan</span>
                <p className="font-bold text-foreground text-sm flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  CCTV & Kunci 24 Jam
                </p>
              </div>

              <div className="space-y-0.5">
                <span className="text-muted-foreground">Konektivitas</span>
                <p className="font-bold text-foreground text-sm flex items-center gap-1">
                  <Wifi className="h-3.5 w-3.5 text-emerald-600" />
                  Free WiFi Cepat
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual Asset (Clean Interior Showcase Card) */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden border border-border shadow-xl bg-card">
              <div className="aspect-4/3 relative w-full overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1000&q=80"
                  alt="Interior Kamar Kost Bu Wati"
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
                
                {/* Floating pill badge on photo */}
                <div className="absolute top-3 left-3 bg-background/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-border/80 text-xs font-semibold text-foreground flex items-center gap-1.5 shadow-xs">
                  <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                  Kamar Siap Huni
                </div>

                <div className="absolute bottom-3 right-3 bg-emerald-600 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-md">
                  Mulai {formattedMinPrice}
                </div>
              </div>

              {/* Bottom Card Summary */}
              <div className="p-4 bg-card/95 backdrop-blur-sm border-t border-border flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <p className="font-bold text-foreground text-sm">Kost Bu Wati — Unit Deluxe</p>
                  <p className="text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-emerald-600" />
                    Area Strategis, Tenang & Bebas Banjir
                  </p>
                </div>

                <a href="#katalog-kamar" className="text-emerald-600 hover:underline font-semibold shrink-0">
                  Lihat Semua Kamar →
                </a>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
