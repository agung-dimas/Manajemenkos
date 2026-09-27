import { Header } from "@/src/components/layout/header"
import { Sidebar } from "@/src/components/layout/sidebar"

export const dynamic = "force-dynamic"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[260px_1fr]">
      {/* Desktop Sidebar */}
      <div className="hidden border-r bg-muted/40 md:block sticky top-0 h-screen">
        <div className="flex h-full flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-16 lg:px-6">
            <span className="font-bold text-lg">KOST BUWATI</span>
          </div>
          <div className="flex-1 overflow-auto py-2">
            <Sidebar />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col">
        <Header />
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
