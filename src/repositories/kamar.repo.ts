import prisma from "@/lib/prisma"
import { Room, Prisma } from "@prisma/client"

export async function getAllRooms() {
  // Auto-sinkronisasi status kamar jika ada kamar TERISI yang tidak lagi memiliki penghuni AKTIF
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
        where: { id: { in: staleRooms.map(r => r.id) } },
        data: { status: "KOSONG" }
      })
    }
  } catch (err) {
    console.error("Gagal sinkronisasi status kamar:", err)
  }

  return await prisma.room.findMany({
    include: { facilities: true },
    orderBy: { createdAt: "desc" },
  })
}

export async function createRoom(data: Prisma.RoomCreateInput) {
  return await prisma.room.create({
    data,
    include: { facilities: true },
  })
}

export async function deleteRoom(id: string) {
  return await prisma.room.delete({
    where: { id },
  })
}

export async function getRoomById(id: string) {
  return await prisma.room.findUnique({
    where: { id },
    include: { facilities: true },
  })
}

export async function getRoomDetail(id: string) {
  return await prisma.room.findUnique({
    where: { id },
    include: {
      facilities: true,
      tenants: {
        orderBy: { createdAt: "desc" },
        include: {
          payments: {
            orderBy: { createdAt: "desc" },
            take: 5
          }
        }
      }
    },
  })
}

export async function updateRoom(id: string, data: Prisma.RoomUpdateInput) {
  return await prisma.room.update({
    where: { id },
    data,
  })
}
