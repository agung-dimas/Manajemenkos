import { Badge } from "@/components/ui/badge"
import {
  Wifi,
  ShieldCheck,
  Utensils,
  Wind,
  Bath,
  Smartphone,
  Sparkles,
  Zap,
  Clock,
  Car
} from "lucide-react"

export function FacilityHighlights() {
  const features = [
    {
      title: "AC & Kamar Mandi Dalam",
      desc: "Tersedia pilihan kamar tipe Deluxe & Executive dengan pendingin udara AC sejuk dan kamar mandi pribadi.",
      icon: Wind,
    },
    {
      title: "Internet WiFi Cepat Gratis",
      desc: "Koneksi internet tanpa batas di seluruh area lantai 1 & 2 untuk menunjang belajar, bekerja, dan hiburan.",
      icon: Wifi,
    },
    {
      title: "Keamanan CCTV & Akses 24 Jam",
      desc: "Pantauan kamera keamanan di titik-titik strategis dan akses gerbang 24 jam dengan kunci mandiri.",
      icon: ShieldCheck,
    },
    {
      title: "Dapur Bersama & Area Masak",
      desc: "Fasilitas memasak praktis bersama, lengkap dengan kompor, wastafel cuci piring, dan area makan santai.",
      icon: Utensils,
    },
    {
      title: "Portal Mandiri Penghuni",
      desc: "Kemudahan cek tagihan, riwayat transaksi, kuitansi digital, dan bayar sewa online langsung dari smartphone Anda.",
      icon: Smartphone,
    },
    {
      title: "Area Parkir Motor Luas & Aman",
      desc: "Lahan parkir motor di dalam pagar kost yang terlindung dari cuaca hujan dan aman dari jalan raya.",
      icon: Car,
    },
  ]

  return (
    <section id="fasilitas" className="py-16 sm:py-20 lg:py-24 border-t border-border bg-muted/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <Badge
            variant="outline"
            className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40"
          >
            Fasilitas Kost
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Kenyamanan Maksimal untuk Aktivitas Anda
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            Didesain khusus untuk mahasiswa dan pekerja yang membutuhkan hunian kondusif, bersih, dan praktis.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((item, idx) => {
            const Icon = item.icon
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl border border-border bg-card shadow-xs hover:shadow-md transition-all space-y-3"
              >
                <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-base text-foreground">
                  {item.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {item.desc}
                </p>
              </div>
            )
          })}
        </div>

      </div>
    </section>
  )
}
