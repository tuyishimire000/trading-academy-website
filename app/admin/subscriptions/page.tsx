import { SubscriptionsManagement } from "@/components/admin/subscriptions-management"

export default function SubscriptionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Subscriptions</h1>
        <p className="text-muted-foreground">Manage user subscriptions and billing</p>
      </div>
      <SubscriptionsManagement />
    </div>
  )
}
