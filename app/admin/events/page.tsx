import { EventsManagement } from "@/components/admin/events-management"

export const dynamic = 'force-dynamic'

export default function AdminEventsPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Event Management</h1>
        <p className="text-muted-foreground">
          Schedule and manage live events, webinars, and workshops for your users.
        </p>
      </div>
      
      <EventsManagement />
    </div>
  )
}
