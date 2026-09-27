import { Loader2 } from "lucide-react"

export default function TenantDashboardLoading() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in-50 duration-300 py-4 px-4 sm:px-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between pb-4 border-b">
        <div className="space-y-2">
          <div className="h-7 w-48 bg-muted animate-pulse rounded-md" />
          <div className="h-4 w-64 bg-muted/60 animate-pulse rounded-md" />
        </div>
        <div className="h-9 w-9 rounded-full bg-muted/80 animate-pulse" />
      </div>

      {/* Bill Card Skeleton */}
      <div className="p-6 rounded-2xl border bg-card/80 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="h-5 w-32 bg-muted animate-pulse rounded" />
          <div className="h-6 w-20 bg-muted animate-pulse rounded-full" />
        </div>
        <div className="h-10 w-48 bg-muted animate-pulse rounded" />
        <div className="h-12 w-full bg-muted/60 animate-pulse rounded-xl" />
      </div>

      {/* History Skeleton */}
      <div className="p-6 rounded-2xl border bg-card/60 space-y-3 shadow-xs">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span className="text-sm font-medium text-muted-foreground">Memuat riwayat pembayaran...</span>
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-14 bg-muted/40 animate-pulse rounded-xl" />
        ))}
      </div>
    </div>
  )
}
