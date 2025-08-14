import { CommunityManagement } from "@/components/admin/community-management"

export default function CommunityPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Community</h1>
        <p className="text-muted-foreground">Monitor community engagement and Discord activity</p>
      </div>
      <CommunityManagement />
    </div>
  )
}
