import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Search,
  MessageCircle,
  CreditCard,
  KeyRound,
  CheckCircle2,
  HelpCircle,
  ArrowRight
} from "lucide-react"

export function ReservationGuide() {
  const steps = [
    {
      step: "01",
      title: "Pilih Kamar & Cek Ketersediaan",
      desc: "Lihat katalog kamar kosong di atas. Periksa fasilitas, foto interior, ukuran kamar, serta tarif sewa bulanan yang sesuai kebutuhan Anda.",
      icon: Search,
    },
    {
      step: "02",
      title: "Ajukan Reservasi & Jadwalkan Survey",
      desc: "Klik tombol 'Reservasi Kamar' pada unit pilihan Anda. Anda dapat langsung mengirim pesan WhatsApp ke pengelola untuk survey kamar secara langsung.",
      icon: MessageCircle,
    },
    {
      step: "03",
      title: "Konfirmasi & Pembayaran Sewa Awal",
      desc: "Setelah cocok, lakukan pembayaran sewa awal. Sistem KOST BU WATI mencatat pembayaran secara resmi dan menerbitkan kuitansi digital otomatis.",
      icon: CreditCard,
    },
    {
      step: "04",
      title: "Serah Terima Kunci & Check-in",
      desc: "Akun Portal Penghuni Anda akan aktif, kunci kamar diserahkan, dan Anda siap langsung menempati kamar kost yang bersih dan nyaman.",
      icon: KeyRound,
    },
  ]

  const faqs = [
    {
      q: "Apakah survey lokasi dikenakan biaya?",
      a: "Survey lokasi 100% GRATIS dan tanpa ikatan. Anda bebas melihat kondisi fisik kamar, sirkulasi udara, serta lingkungan sekitar sebelum memutuskan sewa.",
    },
    {
      q: "Bagaimana sistem periode pembayaran sewa?",
      a: "Sewa dihitung per bulan dari tanggal Anda mulai masuk (check-in). Anda bebas membayar 1 bulan, 3 bulan, 6 bulan, atau sekaligus 1 tahun.",
    },
    {
      q: "Apakah ada akses gerbang 24 jam?",
      a: "Ya, penghuni kost diberikan kunci akses mandiri dengan pantauan kamera CCTV 24 jam demi keamanan bersama.",
    },
    {
      q: "Metode pembayaran apa saja yang diterima?",
      a: "Kami menerima transfer bank resmi, QRIS / e-wallet, pembayaran online otomatis, maupun tunai kepada pengelola di lokasi.",
    },
  ]

  return (
    <section id="cara-reservasi" className="py-16 sm:py-20 lg:py-24 border-t border-border bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <Badge
            variant="outline"
            className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40"
          >
            Alur Booking Transparan
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Cara Mudah Reservasi Kamar
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            Hanya butuh 4 langkah sederhana dari memilih kamar hingga siap menempati kamar baru Anda.
          </p>
        </div>

        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {steps.map((item, idx) => {
            const Icon = item.icon
            return (
              <div
                key={idx}
                className="relative p-6 rounded-2xl border border-border bg-card shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="h-11 w-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-2xs">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-2xl font-black text-muted/80 tracking-tighter font-mono">
                      {item.step}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-foreground leading-snug">
                    {item.title}
                  </h3>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-2 border-t border-border/50 text-[11px] font-medium text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  Langkah {idx + 1} Selesai
                </div>
              </div>
            )
          })}
        </div>

        {/* Call to Action Banner */}
        <div className="p-6 sm:p-8 rounded-2xl bg-linear-to-r from-emerald-600 to-teal-700 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center sm:text-left">
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
              Sudah Menemukan Kamar yang Cocok?
            </h3>
            <p className="text-emerald-50 text-xs sm:text-sm max-w-xl">
              Cek katalog kamar di atas dan segera kunci unit pilihan Anda sebelum didahului calon penghuni lain.
            </p>
          </div>

          <a href="#katalog-kamar" className="shrink-0">
            <Button
              size="lg"
              className="h-11 px-6 rounded-xl bg-white text-emerald-800 hover:bg-emerald-50 font-bold text-xs sm:text-sm shadow-md gap-2"
            >
              Lihat Kamar Kosong Sekarang
              <ArrowRight className="h-4 w-4 text-emerald-700" />
            </Button>
          </a>
        </div>

        {/* FAQ Section */}
        <div className="pt-6 border-t border-border space-y-8">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-emerald-600" />
            <h3 className="text-xl font-bold text-foreground tracking-tight">
              Pertanyaan Seputar Reservasi & Sewa
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="p-5 rounded-xl border border-border bg-card/60 space-y-2 text-xs sm:text-sm"
              >
                <h4 className="font-bold text-foreground">
                  {faq.q}
                </h4>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}
