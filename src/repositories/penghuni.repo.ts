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
  return await prisma.room.findMany({
    where: { status: "KOSONG" },
    include: { facilities: true },
    orderBy: { number: "asc" },
  })
}
