import { AnalyticsDashboard } from "@/components/admin/analytics-dashboard"

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">Monitor your platform's performance and user engagement</p>
      </div>
      <AnalyticsDashboard />
    </div>
  )
}
