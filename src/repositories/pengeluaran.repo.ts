import prisma from "@/lib/prisma"
import { Expense, Prisma } from "@prisma/client"

export async function getAllExpenses() {
  return await prisma.expense.findMany({
    orderBy: { date: "desc" },
  })
}

export async function createExpense(data: Prisma.ExpenseCreateInput) {
  return await prisma.expense.create({
    data,
  })
}

export async function deleteExpense(id: string) {
  return await prisma.expense.delete({
    where: { id },
  })
}
