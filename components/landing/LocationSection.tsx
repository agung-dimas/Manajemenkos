import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Compass,
  Building,
  CheckCircle2,
  ExternalLink
} from "lucide-react"

interface LocationSectionProps {
  adminPhone?: string
}

export function LocationSection({ adminPhone = "6281234567890" }: LocationSectionProps) {
  const cleanPhone = adminPhone.replace(/[^0-9]/g, "").replace(/^0/, "62")

  return (
    <section id="lokasi" className="py-16 sm:py-20 lg:py-24 border-t border-border bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <Badge
            variant="outline"
            className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40"
          >
            Lokasi & Kunjungan
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Akses Mudah & Strategis
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            Terletak di kawasan yang tenang namun sangat dekat dengan fasilitas publik dan jalan raya utama.
          </p>
        </div>

        {/* Content Box */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Contact & Hours Card */}
          <div className="lg:col-span-5 p-6 sm:p-8 rounded-2xl border border-border bg-card shadow-xs flex flex-col justify-between space-y-6">
            <div className="space-y-6">
              <div className="space-y-1.5">
                <h3 className="text-xl font-bold text-foreground">
                  Kost Bu Wati
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Hunian kost harian, bulanan, dan tahunan yang nyaman, asri, dan terpercaya.
                </p>
              </div>

              <div className="space-y-4 text-xs sm:text-sm">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 shrink-0">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-foreground block">Alamat Lokasi:</span>
                    <span className="text-muted-foreground text-xs leading-relaxed">
                      Jl. Anggrek No. 12, Kelurahan Sukajadi, Kota Bandung, Jawa Barat (Dekat Kampus & Perkantoran)
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 shrink-0">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-foreground block">Jam Pelayanan Survey:</span>
                    <span className="text-muted-foreground text-xs">
                      Senin – Minggu: 08:00 – 20:00 WIB (Mohon konfirmasi sebelum datang)
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 shrink-0">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-foreground block">Kontak WhatsApp Pengelola:</span>
                    <span className="text-muted-foreground text-xs font-mono">
                      +{cleanPhone} (Ibu Wati)
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 shrink-0">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-foreground block">Email Resmi:</span>
                    <span className="text-muted-foreground text-xs">
                      admin@kost.com / billing@koswati.web.id
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <a
                href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent("Halo Bu Wati, saya ingin bertanya tentang ketersediaan kamar kost dan jadwal survey lokasi. Terima kasih!")}`}
                target="_blank"
                rel="noreferrer"
                className="w-full block"
              >
                <Button className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs gap-2 shadow-xs">
                  <Phone className="h-4 w-4" />
                  Chat WhatsApp Bu Wati Sekarang
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              </a>
            </div>
          </div>

          {/* Location Accessibility & Surroundings */}
          <div className="lg:col-span-7 p-6 sm:p-8 rounded-2xl border border-border bg-card shadow-xs flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Compass className="h-5 w-5 text-emerald-600" />
                Akses & Lingkungan Sekitar Kost
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Lokasi kost sangat strategis dengan berbagai akses penting yang dapat dijangkau hanya dalam hitungan menit:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                {[
                  "3 Menit ke Minimarket (Indomaret & Alfamart)",
                  "5 Menit ke Halte Transportasi Umum & Angkutan",
                  "7 Menit ke Kampus & Pusat Pendidikan",
                  "10 Menit ke Rumah Sakit & Fasilitas Kesehatan",
                  "Banyak Pilihan Tempat Makan & Laundry Kiloan",
                  "Jalan Masuk Lebar & Lingkungan Bebas Banjir",
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2.5 p-3 rounded-xl border border-border/80 bg-muted/20"
                  >
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span className="text-muted-foreground font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-muted/40 border border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
              <div className="space-y-0.5 text-center sm:text-left">
                <span className="font-semibold text-foreground">Ingin Survey Langsung ke Lokasi?</span>
                <p className="text-muted-foreground text-[11px]">
                  Beri tahu kami jadwal survey Anda agar pengelola dapat menyambut dan mendampingi Anda di kost.
                </p>
              </div>

              <a href="#katalog-kamar" className="shrink-0">
                <Button variant="outline" size="sm" className="h-9 text-xs rounded-xl">
                  Pilih Kamar Dulu
                </Button>
              </a>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
