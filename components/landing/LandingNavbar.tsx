"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Building2, Menu, X, ArrowUpRight, LogIn } from "lucide-react"

export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        scrolled
          ? "bg-background/90 backdrop-blur-md border-b border-border shadow-2xs py-3"
          : "bg-transparent py-4 sm:py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="h-10 w-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs group-hover:bg-emerald-700 transition-colors">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-foreground">
                  KOST BU WATI
                </span>
                <Badge
                  variant="outline"
                  className="hidden sm:inline-flex text-[10px] text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40"
                >
                  Hunian Nyaman
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground hidden sm:block">
                Sewa Bulanan • Bersih & Strategis
              </p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-muted-foreground">
            <a
              href="#katalog-kamar"
              className="hover:text-foreground transition-colors hover:underline underline-offset-4"
            >
              Katalog Kamar
            </a>
            <a
              href="#fasilitas"
              className="hover:text-foreground transition-colors hover:underline underline-offset-4"
            >
              Fasilitas
            </a>
            <a
              href="#cara-reservasi"
              className="hover:text-foreground transition-colors hover:underline underline-offset-4"
            >
              Cara Reservasi
            </a>
            <a
              href="#lokasi"
              className="hover:text-foreground transition-colors hover:underline underline-offset-4"
            >
              Lokasi & Kontak
            </a>
          </nav>

          {/* Action Buttons */}
          <div className="hidden sm:flex items-center gap-2.5">
            <Link href="/tenant/login">
              <Button
                variant="outline"
                size="sm"
                className="h-9 text-xs rounded-xl gap-1.5 border-border hover:bg-muted"
              >
                <LogIn className="h-3.5 w-3.5 text-muted-foreground" />
                Portal Penghuni
              </Button>
            </Link>

            <a href="#katalog-kamar">
              <Button
                size="sm"
                className="h-9 text-xs rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 shadow-xs font-medium"
              >
                Pilih Kamar
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Button>
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg border border-border text-foreground hover:bg-muted"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-3 p-4 rounded-2xl bg-card border border-border shadow-lg space-y-3">
            <nav className="flex flex-col space-y-2.5 text-sm font-medium">
              <a
                href="#katalog-kamar"
                onClick={() => setMobileMenuOpen(false)}
                className="px-2 py-1.5 rounded-lg hover:bg-muted text-foreground"
              >
                Katalog Kamar
              </a>
              <a
                href="#fasilitas"
                onClick={() => setMobileMenuOpen(false)}
                className="px-2 py-1.5 rounded-lg hover:bg-muted text-foreground"
              >
                Fasilitas
              </a>
              <a
                href="#cara-reservasi"
                onClick={() => setMobileMenuOpen(false)}
                className="px-2 py-1.5 rounded-lg hover:bg-muted text-foreground"
              >
                Cara Reservasi
              </a>
              <a
                href="#lokasi"
                onClick={() => setMobileMenuOpen(false)}
                className="px-2 py-1.5 rounded-lg hover:bg-muted text-foreground"
              >
                Lokasi & Kontak
              </a>
            </nav>

            <div className="pt-2 border-t border-border flex flex-col gap-2">
              <Link href="/tenant/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" size="sm" className="w-full text-xs rounded-xl justify-center gap-1.5">
                  <LogIn className="h-3.5 w-3.5" />
                  Portal Penghuni
                </Button>
              </Link>
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" size="sm" className="w-full text-xs rounded-xl justify-center text-muted-foreground">
                  Login Pengelola Kost
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
