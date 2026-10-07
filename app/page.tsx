import type { Metadata } from "next"
import prisma from "@/lib/prisma"
import { LandingNavbar } from "@/components/landing/LandingNavbar"
import { LandingHero } from "@/components/landing/LandingHero"
import { RoomCatalog } from "@/components/landing/RoomCatalog"
import { ReservationGuide } from "@/components/landing/ReservationGuide"
import { FacilityHighlights } from "@/components/landing/FacilityHighlights"
import { LocationSection } from "@/components/landing/LocationSection"
import { LandingFooter } from "@/components/landing/LandingFooter"

export const metadata: Metadata = {
  title: "Kost Bu Wati — Hunian Kost Bersih, Nyaman & Strategis",
  description:
    "Katalog ketersediaan kamar kost siap huni di Kost Bu Wati. Cek kamar kosong, foto interior, fasilitas AC & kamar mandi dalam, tarif sewa bulanan, dan cara reservasi mudah.",
}

// Revalidate data periodically or on demand
export const revalidate = 60

export default async function HomePage() {
  const rooms = await prisma.room.findMany({
    include: {
      facilities: {
        select: {
          id: true,
          name: true,
          icon: true
        }
      },
      tenants: {
        where: { status: "AKTIF" },
        select: { id: true, name: true }
      }
    },
    orderBy: { number: "asc" }
  })

  // Format data kamar untuk komponen katalog
  const formattedRooms = rooms.map((r) => ({
    id: r.id,
    number: r.number,
    floor: r.floor,
    price: r.price,
    status: r.status,
    size: r.size,
    description: r.description,
    photos: r.photos || [],
    facilities: r.facilities || []
  }))

  const totalRooms = formattedRooms.length
  const availableRooms = formattedRooms.filter((r) => r.status === "KOSONG").length
  const minPrice = formattedRooms.length > 0
    ? Math.min(...formattedRooms.map((r) => r.price))
    : 500000

  // Nomor kontak default WhatsApp pengelola
  const adminPhone = "6281234567890"

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900 dark:selection:bg-emerald-900/60 dark:selection:text-emerald-100">
      <LandingNavbar />
      
      <main className="flex-1">
        <LandingHero
          totalRooms={totalRooms}
          availableRooms={availableRooms}
          minPrice={minPrice}
        />

        <RoomCatalog
          rooms={formattedRooms}
          adminPhone={adminPhone}
        />

        <ReservationGuide />

        <FacilityHighlights />

        <LocationSection
          adminPhone={adminPhone}
        />
      </main>

      <LandingFooter />
    </div>
  )
}
