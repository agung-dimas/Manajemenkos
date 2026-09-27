"use client"

import { useEffect, useState } from "react"
import { usePathname, useSearchParams } from "next/navigation"

export function NavigationProgressBar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)

  // Listen for clicks on links
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a")
      if (!target) return

      const href = target.getAttribute("href")
      const targetAttr = target.getAttribute("target")

      // Skip non-internal links or modified clicks
      if (
        !href ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        targetAttr === "_blank" ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return
      }

      // Check if it's the exact same URL
      const currentUrl = window.location.pathname + window.location.search
      if (href === currentUrl) return

      // Start progress bar
      setLoading(true)
      setProgress(25)

      const timer1 = setTimeout(() => setProgress(65), 150)
      const timer2 = setTimeout(() => setProgress(85), 350)

      return () => {
        clearTimeout(timer1)
        clearTimeout(timer2)
      }
    }

    document.addEventListener("click", handleAnchorClick, true)
    return () => {
      document.removeEventListener("click", handleAnchorClick, true)
    }
  }, [])

  // When pathname or searchParams finish updating, complete progress bar
  useEffect(() => {
    if (loading) {
      setProgress(100)
      const timeout = setTimeout(() => {
        setLoading(false)
        setProgress(0)
      }, 300)
      return () => clearTimeout(timeout)
    }
  }, [pathname, searchParams])

  if (!loading && progress === 0) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-transparent pointer-events-none">
      <div
        className="h-full bg-linear-to-r from-primary via-indigo-500 to-amber-500 transition-all duration-300 ease-out shadow-xs shadow-primary/50"
        style={{
          width: `${progress}%`,
          opacity: loading || progress === 100 ? 1 : 0,
        }}
      />
    </div>
  )
}
