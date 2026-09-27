import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { verifyPassword } from "@/src/lib/tenant-auth"

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const tenant = await prisma.tenant.findFirst({
      where: { email: { equals: "dascreation7878@gmail.com", mode: "insensitive" } }
    })

    if (!tenant || !tenant.password) {
      return NextResponse.json({ error: "Tenant not found or has no password" })
    }

    const testPasswords = ["123456", "kost11222", "password", "dimas123", "kost123", "admin123", "12345678", "dascreation", "12345"]
    const matches: string[] = []

    for (const p of testPasswords) {
      if (verifyPassword(p, tenant.password)) {
        matches.push(p)
      }
    }

    return NextResponse.json({
      name: tenant.name,
      email: tenant.email,
      matchedPassword: matches.length > 0 ? matches[0] : "custom_password"
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
