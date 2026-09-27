import { TenantHeader } from "@/src/components/layout/tenant-header"
import { TenantSidebar } from "@/src/components/layout/tenant-sidebar"
import { Home } from "lucide-react"

export default function TenantDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[260px_1fr]">
      {/* Desktop Sidebar */}
      <div className="hidden border-r bg-muted/40 md:block sticky top-0 h-screen">
        <div className="flex h-full flex-col gap-2">
          <div className="flex h-14 items-center gap-2 border-b px-4 lg:h-16 lg:px-6">
            <Home className="h-5 w-5 text-primary" />
            <span className="font-bold text-lg text-primary">Portal Penghuni</span>
          </div>
          <div className="flex-1 overflow-auto py-2">
            <TenantSidebar />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col">
        <TenantHeader />
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-4xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
