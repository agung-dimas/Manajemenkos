'use server'

import { createClient } from '../lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import prisma from '@/lib/prisma'
import { verifyPassword, signTenantSession } from '@/src/lib/tenant-auth'

export async function login(formData: FormData) {
    const email = (formData.get('email') as string)?.trim()
    const password = (formData.get('password') as string)?.trim()

    if (!email || !password) {
        return { error: 'Email dan password wajib diisi.' }
    }

    // 1. Cek apakah ini akun Penghuni (Tenant) aktif
    try {
        const tenant = await prisma.tenant.findFirst({
            where: {
                email: { equals: email, mode: 'insensitive' },
                status: 'AKTIF'
            }
        })

        if (tenant && tenant.password) {
            const isPasswordValid = verifyPassword(password, tenant.password)
            if (isPasswordValid) {
                // Berhasil login sebagai Penghuni -> Set session cookie khusus tenant
                const cookieValue = signTenantSession(tenant.id)
                const cookieStore = await cookies()
                cookieStore.set({
                    name: 'tenant_session',
                    value: cookieValue,
                    httpOnly: true,
                    secure: true,
                    sameSite: 'lax',
                    path: '/',
                    maxAge: 60 * 60 * 24 * 7 // 7 hari
                })

                revalidatePath('/tenant/dashboard')
                redirect('/tenant/dashboard')
            }
        }
    } catch (err: any) {
        // Jika redirect NEXT_REDIRECT terpanggil, biarkan lewat
        if (err?.message?.includes('NEXT_REDIRECT') || err?.digest?.includes('NEXT_REDIRECT')) {
            throw err
        }
        console.error('Error saat verifikasi tenant login:', err)
    }

    // 2. Jika bukan penghuni atau password penghuni tidak cocok, coba login via Supabase Auth (Admin / Petugas)
    const supabase = await createClient()
    const { data: authData, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return { error: 'Email atau password yang Anda masukkan salah.' }
    }

    // Pastikan user tercatat di database lokal dengan rolenya
    if (authData.user) {
        let dbUser = await prisma.user.findUnique({
            where: { id: authData.user.id }
        })

        if (!dbUser) {
            const defaultName = authData.user.email === 'wati@gmail.com'
                ? 'Bu Wati'
                : (authData.user.user_metadata?.name || authData.user.email!.split('@')[0])

            dbUser = await prisma.user.create({
                data: {
                    id: authData.user.id,
                    email: authData.user.email!,
                    name: defaultName,
                    role: 'ADMIN'
                }
            })
        }
    }

    revalidatePath('/dashboard')
    redirect('/dashboard')
}

export async function logout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
}

export async function getCurrentUser() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return null
    }

    // Ambil detail user dari database menggunakan prisma
    let dbUser = await prisma.user.findUnique({
        where: { id: user.id }
    })

    // Jika user belum terdaftar di database lokal, buat recordnya otomatis
    if (!dbUser) {
        const defaultName = user.email === 'wati@gmail.com'
            ? 'Bu Wati'
            : (user.user_metadata?.name || user.email!.split('@')[0])

        dbUser = await prisma.user.create({
            data: {
                id: user.id,
                email: user.email!,
                name: defaultName,
                role: 'ADMIN' // Default role admin
            }
        })
    } else if (dbUser.email === 'wati@gmail.com' && (dbUser.name !== 'Bu Wati' || dbUser.role !== 'ADMIN')) {
        dbUser = await prisma.user.update({
            where: { id: dbUser.id },
            data: { name: 'Bu Wati', role: 'ADMIN' }
        })
    }

    return dbUser
}

export async function updateUserProfile(name: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Sesi login tidak ditemukan. Harap masuk kembali.' }
    }

    try {
        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: { name }
        })

        // Opsional: perbarui juga metadata nama di Supabase Auth
        await supabase.auth.updateUser({
            data: { name }
        })

        revalidatePath('/dashboard/pengaturan')
        return { success: true, user: updatedUser }
    } catch (err: any) {
        console.error('Error updating user profile:', err)
        return { error: err.message || 'Gagal menyimpan perubahan profil.' }
    }
}