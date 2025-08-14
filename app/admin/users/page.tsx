import { UsersTable } from "@/components/admin/users-table"

export default function AdminUsersPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Users Management</h1>
        <p className="text-gray-600">Manage registered users and their subscriptions</p>
      </div>

      <UsersTable />
    </div>
  )
}
