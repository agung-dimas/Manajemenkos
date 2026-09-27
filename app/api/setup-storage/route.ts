import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    // 1. Buat bucket 'payments' jika belum ada dan pastikan public
    await prisma.$executeRawUnsafe(`
      INSERT INTO storage.buckets (id, name, public) 
      VALUES ('payments', 'payments', true) 
      ON CONFLICT (id) DO UPDATE SET public = true;
    `)

    // 2. Beri izin akses Penuh (Insert, Select, Update, Delete) ke bucket 'payments'
    // Menggunakan DO block untuk menghindari error jika policy sudah ada
    await prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
          IF NOT EXISTS (
              SELECT 1 FROM pg_policies 
              WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public Access for Payments'
          ) THEN
              CREATE POLICY "Public Access for Payments" 
              ON storage.objects FOR ALL 
              USING (bucket_id = 'payments') 
              WITH CHECK (bucket_id = 'payments');
          END IF;
      END
      $$;
    `)

    return NextResponse.json({
      success: true,
      message: "Storage Supabase berhasil dihubungkan dan dikonfigurasi! Bucket 'payments' siap digunakan."
    })
  } catch (err: any) {
    console.error("Gagal mengatur storage:", err)
    return NextResponse.json({
      success: false,
      error: err.message
    }, { status: 500 })
  }
}
