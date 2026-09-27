import prisma from "@/lib/prisma"
import { Room, Prisma } from "@prisma/client"

export async function getAllRooms() {
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
