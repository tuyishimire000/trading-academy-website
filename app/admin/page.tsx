import { Suspense } from "react"
import { AdminDashboardOverview } from "@/components/admin/dashboard-overview"

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your trading academy platform and market insights
        </p>
      </div>
      
      <Suspense fallback={<div>Loading dashboard...</div>}>
        <AdminDashboardOverview />
      </Suspense>
    </div>
  )
}
