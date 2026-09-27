"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { signTenantSession } from "@/src/lib/tenant-auth"

export async function loginTenant(formData: FormData) {
  const email = formData.get("email") as string
  const name = formData.get("name") as string

  if (!email || !name) {
    return { error: "Email dan Nama wajib diisi." }
  }

  // Cari penghuni berdasarkan email dan nama, 
  // dan pastikan statusnya masih aktif
  let tenant;
  try {
    tenant = await prisma.tenant.findFirst({
      where: {
        email: {
          equals: email.trim(),
          mode: "insensitive"
        },
        name: {
          equals: name.trim(),
          mode: "insensitive"
        },
        status: "AKTIF"
      }
    })
  } catch (err: any) {
    console.error("Prisma Error:", err)
    return { error: `Database Error: ${err.message || 'Unknown'}` }
  }

  if (!tenant) {
    return { error: "Kombinasi Email dan Nama tidak cocok atau akun tidak aktif." }
  }

  // Sukses login: Buat session cookie
  try {
    const cookieValue = signTenantSession(tenant.id)
    const cookieStore = await cookies()
    // Set cookie (berlaku 30 hari)
    cookieStore.set({
      name: "tenant_session",
      value: cookieValue,
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    })
  } catch (err: any) {
    console.error("Cookie/Session Error:", err)
    return { error: `Session Error: ${err.message || 'Unknown'}` }
  }

  redirect("/tenant/dashboard")
}

export async function logoutTenant() {
  const cookieStore = await cookies()
  cookieStore.delete("tenant_session")
  redirect("/tenant/login")
}
