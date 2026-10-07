import "dotenv/config"
import prisma from "../lib/prisma"

const NEW_ROOMS = [
  {
    number: "04",
    floor: 1,
    price: 650000,
    size: "3x3.5 meter",
    description: "Kamar nyaman di lantai 1 dengan pencahayaan alami yang baik, dekat akses ruang santai dan dapur bersama.",
    status: "KOSONG" as const,
    photos: [
      "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80"
    ],
    facilityNames: ["Kasur Springbed", "Lemari Pakaian", "Kipas Angin", "Meja & Kursi Belajar", "WiFi Cepat"]
  },
  {
    number: "05",
    floor: 1,
    price: 950000,
    size: "3.5x4 meter",
    description: "Kamar luas tipe Deluxe di lantai 1 dengan kamar mandi dalam, ventilasi udara segar, dan perabot kayu minimalis.",
    status: "KOSONG" as const,
    photos: [
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80"
    ],
    facilityNames: ["Kamar Mandi Dalam", "Kasur Springbed", "Lemari Pakaian", "AC", "WiFi Cepat", "Cermin Dinding"]
  },
  {
    number: "06",
    floor: 2,
    price: 700000,
    size: "3x3.5 meter",
    description: "Kamar lantai 2 yang tenang dan sejuk dengan jendela menghadap pemandangan luar, sangat cocok untuk belajar dan istirahat.",
    status: "KOSONG" as const,
    photos: [
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80"
    ],
    facilityNames: ["Kasur Springbed", "Lemari Pakaian", "Kipas Angin", "Meja & Kursi Belajar", "WiFi Cepat", "Sprei & Bantal"]
  },
  {
    number: "07",
    floor: 2,
    price: 750000,
    size: "3x4 meter",
    description: "Kamar lantai 2 bernuansa hangat dengan meja kerja ergonomis, sirkulasi udara optimal, dan lingkungan yang tenang.",
    status: "KOSONG" as const,
    photos: [
      "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=800&q=80"
    ],
    facilityNames: ["Kasur Springbed", "Lemari Pakaian", "Kipas Angin", "Meja & Kursi Belajar", "WiFi Cepat", "Cermin Dinding"]
  },
  {
    number: "08",
    floor: 2,
    price: 1100000,
    size: "3.5x4 meter",
    description: "Kamar Executive lantai 2 ber-AC dan kamar mandi dalam, dilengkapi kasur premium springbed dan perabot modern.",
    status: "KOSONG" as const,
    photos: [
      "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=800&q=80"
    ],
    facilityNames: ["AC", "Kamar Mandi Dalam", "Kasur Springbed", "Lemari Pakaian", "Meja & Kursi Belajar", "WiFi Cepat", "Sprei & Bantal"]
  },
  {
    number: "09",
    floor: 2,
    price: 1150000,
    size: "4x4 meter",
    description: "Kamar Suite terluas di lantai 2 dengan sirkulasi udara maksimal, AC dingin, kamar mandi dalam, dan perabotan lengkap.",
    status: "KOSONG" as const,
    photos: [
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80"
    ],
    facilityNames: ["AC", "Kamar Mandi Dalam", "Kasur Springbed", "Lemari Pakaian", "Meja & Kursi Belajar", "WiFi Cepat", "Cermin Dinding"]
  },
  {
    number: "10",
    floor: 2,
    price: 800000,
    size: "3.5x3.5 meter",
    description: "Kamar sudut lantai 2 dengan dua sisi jendela, udara sangat segar dan pencahayaan alami melimpah sepanjang hari.",
    status: "KOSONG" as const,
    photos: [
      "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80"
    ],
    facilityNames: ["Kasur Springbed", "Lemari Pakaian", "Kipas Angin", "Meja & Kursi Belajar", "WiFi Cepat", "Sprei & Bantal"]
  }
]

// Juga lengkapi data kamar 01, 02, 03 jika deskripsi atau fotonya masih kosong agar landing page tampil prima
const EXISTING_ROOM_UPDATES = [
  {
    number: "01",
    size: "3.5x4 meter",
    description: "Kamar Deluxe lantai 1 ber-AC dengan fasilitas lengkap, kamar mandi dalam, dan akses langsung ke teras depan.",
    photos: ["https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80"]
  },
  {
    number: "02",
    size: "3x3 meter",
    description: "Kamar tipe Standar lantai 1 ekonomis dan nyaman, cocok untuk mahasiswa/pekerja dengan mobilitas harian tinggi.",
    photos: ["https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80"],
    facilityNames: ["Kasur Springbed", "Lemari Pakaian", "Kipas Angin", "WiFi Cepat"]
  },
  {
    number: "03",
    size: "3x3.5 meter",
    description: "Kamar Standar Plus lantai 1 dengan lemari pakaian besar dan sirkulasi udara lancar ke arah taman dalam.",
    photos: ["https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=800&q=80"],
    facilityNames: ["Kasur Springbed", "Lemari Pakaian", "Kipas Angin", "Meja & Kursi Belajar", "WiFi Cepat"]
  }
]

async function main() {
  console.log("=== MEMULAI PENAMBAHAN 7 DATA KAMAR KE DATABASE ===")

  // 1. Dapatkan semua fasilitas yang tersedia di DB
  const allFacilities = await prisma.facility.findMany()
  const facilityMap = new Map(allFacilities.map(f => [f.name.toLowerCase().trim(), f.id]))

  // 2. Tambahkan 7 kamar baru (Kamar 04 s/d 10)
  for (const r of NEW_ROOMS) {
    const existing = await prisma.room.findUnique({
      where: { number: r.number }
    })

    const facilityConnect = r.facilityNames
      .map(name => facilityMap.get(name.toLowerCase().trim()))
      .filter((id): id is string => Boolean(id))
      .map(id => ({ id }))

    if (existing) {
      console.log(`Kamar ${r.number} sudah ada, memperbarui data...`)
      await prisma.room.update({
        where: { id: existing.id },
        data: {
          floor: r.floor,
          price: r.price,
          size: r.size,
          description: r.description,
          photos: r.photos,
          facilities: {
            set: facilityConnect
          }
        }
      })
      console.log(`✓ Kamar ${r.number} berhasil diperbarui.`)
    } else {
      await prisma.room.create({
        data: {
          number: r.number,
          floor: r.floor,
          price: r.price,
          status: r.status,
          size: r.size,
          description: r.description,
          photos: r.photos,
          facilities: {
            connect: facilityConnect
          }
        }
      })
      console.log(`✓ Kamar ${r.number} berhasil dibuat (Lantai ${r.floor}, Rp ${r.price.toLocaleString("id-ID")}).`)
    }
  }

  // 3. Lengkapi foto & deskripsi kamar 01, 02, 03 jika masih kosong
  for (const upd of EXISTING_ROOM_UPDATES) {
    const existing = await prisma.room.findUnique({
      where: { number: upd.number },
      include: { facilities: true }
    })

    if (existing) {
      const updateData: any = {}
      if (!existing.size || existing.size === "") updateData.size = upd.size
      if (!existing.description || existing.description === "") updateData.description = upd.description
      if (!existing.photos || existing.photos.length === 0) updateData.photos = upd.photos

      if (upd.facilityNames && existing.facilities.length === 0) {
        const facilityConnect = upd.facilityNames
          .map(name => facilityMap.get(name.toLowerCase().trim()))
          .filter((id): id is string => Boolean(id))
          .map(id => ({ id }))
        updateData.facilities = { connect: facilityConnect }
      }

      if (Object.keys(updateData).length > 0) {
        await prisma.room.update({
          where: { id: existing.id },
          data: updateData
        })
        console.log(`✓ Kamar ${upd.number} dilengkapi foto & deskripsi.`)
      }
    }
  }

  // 4. Hitung dan tampilkan total kamar sekarang
  const total = await prisma.room.count()
  console.log(`\n=== SUKSES! Total kamar di database sekarang: ${total} kamar ===`)
}

main()
  .catch(err => {
    console.error("Error seeding rooms:", err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
