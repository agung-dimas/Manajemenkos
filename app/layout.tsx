import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/src/components/theme-provider"

import { Suspense } from "react"
import { NavigationProgressBar } from "@/components/layout/NavigationProgressBar"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Manajemen Kost Bu Wati",
  description: "Aplikasi SaaS Manajemen Kost Modern",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Suspense fallback={null}>
            <NavigationProgressBar />
          </Suspense>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
