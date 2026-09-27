"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Bed, Users, CreditCard, FileText, Settings, Receipt } from "lucide-react"
import { cn } from "@/lib/utils"

const navGroups = [
  {
    label: "Utama",
    items: [
      { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    ]
  },
  {
    label: "Manajemen",
    items: [
      { title: "Kamar", href: "/dashboard/kamar", icon: Bed },
      { title: "Penghuni", href: "/dashboard/penghuni", icon: Users },
      { title: "Pembayaran", href: "/dashboard/pembayaran", icon: CreditCard },
      { title: "Pengeluaran", href: "/dashboard/pengeluaran", icon: Receipt },
    ]
  },
  {
    label: "Sistem & Laporan",
    items: [
      { title: "Laporan", href: "/dashboard/laporan", icon: FileText },
      { title: "Pengaturan", href: "/dashboard/pengaturan", icon: Settings },
    ]
  }
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <nav className="grid items-start p-4 gap-4">
      {navGroups.map((group, index) => (
        <div key={group.label} className="space-y-1.5">
          {index > 0 && (
            <div className="my-2 border-t border-border/50" />
          )}
          <h2 className="px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
            {group.label}
          </h2>
          <div className="grid gap-1">
            {group.items.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 hover:bg-accent/60 hover:text-accent-foreground hover:translate-x-0.5",
                    isActive 
                      ? "bg-accent text-accent-foreground font-semibold" 
                      : "text-muted-foreground"
                  )}
                >
                  {/* Left Side Active Indicator Bar */}
                  {isActive && (
                    <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r bg-primary" />
                  )}
                  <item.icon className={cn(
                    "h-4 w-4 transition-transform duration-200 group-hover:scale-110",
                    isActive ? "text-primary" : "text-muted-foreground/70 group-hover:text-foreground"
                  )} />
                  <span>{item.title}</span>
                </Link>
              )
            })}
          </div>
        </div>
      ))}
    </nav>
  )
}
