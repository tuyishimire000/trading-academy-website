import { UsersTable } from "@/components/admin/users-table"

export default function AdminUsersPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground">
          Manage all users in the system, including their roles, subscriptions, and account details.
        </p>
      </div>
      
      <UsersTable />
    </div>
  )
}
