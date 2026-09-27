"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

interface RevenueChartProps {
  data: { name: string; total: number }[]
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis
          dataKey="name"
          stroke="currentColor"
          className="text-muted-foreground"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tick={{ fill: 'currentColor' }}
        />
        <YAxis
          stroke="currentColor"
          className="text-muted-foreground"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `Rp${value / 1000}k`}
          tick={{ fill: 'currentColor' }}
        />
        <Tooltip 
          cursor={{ fill: 'rgba(0,0,0,0.1)' }}
          contentStyle={{
            backgroundColor: 'var(--card)',
            color: 'var(--card-foreground)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)'
          }}
          formatter={(value: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(value)}
        />
        <Bar dataKey="total" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-primary" />
      </BarChart>
    </ResponsiveContainer>
  )
}
