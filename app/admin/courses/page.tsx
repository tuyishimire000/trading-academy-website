import { CoursesManagement } from "@/components/admin/courses-management"

export default function AdminCoursesPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Courses Management</h1>
        <p className="text-gray-600">Create, edit, and manage your trading courses</p>
      </div>

      <CoursesManagement />
    </div>
  )
}
