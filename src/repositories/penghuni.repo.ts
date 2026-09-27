import prisma from "@/lib/prisma"

export async function getAllTenants(statusFilter?: "AKTIF" | "TIDAK_AKTIF") {
  return await prisma.tenant.findMany({
    where: statusFilter ? { status: statusFilter } : undefined,
    include: {
      room: true,
      payments: {
        orderBy: { createdAt: "desc" },
        take: 10
      }
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function getAvailableRooms() {
  // 1. Auto-sinkronisasi: jika ada kamar yang berstatus TERISI tapi tidak memiliki penghuni berstatus AKTIF,
  // ubah kembali statusnya menjadi KOSONG
  try {
    const staleRooms = await prisma.room.findMany({
      where: {
        status: "TERISI",
        tenants: {
          none: {
            status: "AKTIF"
          }
        }
      },
      select: { id: true }
    })

    if (staleRooms.length > 0) {
      await prisma.room.updateMany({
        where: {
          id: { in: staleRooms.map(r => r.id) }
        },
        data: {
          status: "KOSONG"
        }
      })
    }
  } catch (err) {
    console.error("Gagal sinkronisasi status kamar:", err)
  }

  // 2. Ambil semua kamar yang statusnya KOSONG atau tidak memiliki penghuni aktif (kecuali MAINTENANCE)
  return await prisma.room.findMany({
    where: {
      AND: [
        { status: { not: "MAINTENANCE" } },
        {
          OR: [
            { status: "KOSONG" },
            {
              tenants: {
                none: {
                  status: "AKTIF"
                }
              }
            }
          ]
        }
      ]
    },
    include: { facilities: true },
    orderBy: { number: "asc" },
  })
}

