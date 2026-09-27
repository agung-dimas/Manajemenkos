"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { Sidebar } from "./sidebar"
import { ThemeToggle } from "../theme-toggle"
import { logout } from "@/src/actions/auth"

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  // Tutup sidebar otomatis ketika pindah halaman (pathname berubah)
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:h-16 sm:px-6">
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
            <span className="font-bold text-lg">KOST BUWATI</span>
          </div>
          <Sidebar />
        </SheetContent>
      </Sheet>

      {/* Breadcrumb / Title */}
      <div className="flex-1 text-sm font-medium">
        Manajemen Kost Bu Wati
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <form action={logout}>
          <Button variant="outline" size="sm">Logout</Button>
        </form>
      </div>
    </header>
  )
}
