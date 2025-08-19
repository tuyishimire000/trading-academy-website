import type React from "react"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth/server"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()
  if (!user || !user.is_admin) {
    redirect("/dashboard")
  }
  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          <div className="container mx-auto px-6 py-8">{children}</div>
        </main>
      </div>
    </div>
  )
}
