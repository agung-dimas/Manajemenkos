"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createExpense, deleteExpense } from "@/src/repositories/pengeluaran.repo"

export async function addExpense(formData: FormData) {
  const title = formData.get("title") as string
  const amount = parseFloat(formData.get("amount") as string)
  const category = formData.get("category") as string
  const dateStr = formData.get("date") as string
  const description = formData.get("description") as string

  await createExpense({
    title,
    amount,
    category,
    date: new Date(dateStr),
    description,
  })

  revalidatePath("/dashboard/pengeluaran")
  revalidatePath("/dashboard")
  redirect("/dashboard/pengeluaran")
}

export async function removeExpense(id: string) {
  await deleteExpense(id)
  revalidatePath("/dashboard/pengeluaran")
  revalidatePath("/dashboard")
}
