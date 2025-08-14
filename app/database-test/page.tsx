import { DatabaseCheck } from "@/components/database-check"

export default function DatabaseTestPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Database Connection Test</h1>
          <p className="text-gray-600">Verify your Supabase database is properly configured</p>
        </div>
        <DatabaseCheck />
      </div>
    </div>
  )
}
