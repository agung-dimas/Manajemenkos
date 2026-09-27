"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { Menu, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { TenantSidebar } from "./tenant-sidebar"
import { ThemeToggle } from "../theme-toggle"
import { logoutTenant } from "@/src/actions/tenant-auth.action"

export function TenantHeader() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  // Tutup sidebar otomatis ketika pindah halaman
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:h-16 sm:px-6 shadow-sm">
      {/* Mobile Sidebar Trigger */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button size="icon" variant="outline" className="md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="sm:max-w-xs p-0">
          <SheetTitle className="sr-only">Menu Navigasi</SheetTitle>
          <div className="flex h-16 items-center px-6 border-b">
            <span className="font-bold text-lg text-primary">Portal Penghuni</span>
          </div>
          <TenantSidebar />
        </SheetContent>
      </Sheet>

      {/* Breadcrumb / Title */}
      <div className="flex-1 text-sm font-medium text-muted-foreground">
        <span className="hidden sm:inline">Selamat datang di </span>Portal Penghuni
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <form action={logoutTenant}>
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-red-600">
            <LogOut className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Keluar</span>
          </Button>
        </form>
      </div>
    </header>
  )
}
