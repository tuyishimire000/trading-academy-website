import { CoursesManagement } from "@/components/admin/courses-management"

export default function AdminCoursesPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Course Management</h1>
        <p className="text-muted-foreground">
          Create, edit, and manage all courses in the platform. Monitor enrollments and course performance.
        </p>
      </div>
      
      <CoursesManagement />
    </div>
  )
}
