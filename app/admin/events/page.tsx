import { EventsManagement } from "@/components/admin/events-management"

export default function AdminEventsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Events Management</h1>
        <p className="text-gray-600">Schedule and manage live sessions, webinars, and workshops</p>
      </div>

      <EventsManagement />
    </div>
  )
}
