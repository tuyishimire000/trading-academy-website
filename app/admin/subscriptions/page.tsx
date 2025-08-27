import { SubscriptionsManagement } from "@/components/admin/subscriptions-management"
import { PlansManagement } from "@/components/admin/plans-management"

export const dynamic = 'force-dynamic'

export default function SubscriptionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Subscriptions</h1>
        <p className="text-muted-foreground">Manage user subscriptions and billing</p>
      </div>
      <SubscriptionsManagement />
      <PlansManagement />
    </div>
  )
}
