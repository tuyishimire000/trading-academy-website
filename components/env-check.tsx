"use client"

import { useEffect, useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, CheckCircle } from "lucide-react"

export function EnvCheck() {
  const [envStatus, setEnvStatus] = useState<{
    supabaseUrl: boolean
    supabaseKey: boolean
    hasErrors: boolean
    errors: string[]
  }>({
    supabaseUrl: false,
    supabaseKey: false,
    hasErrors: false,
    errors: [],
  })

  useEffect(() => {
    const errors: string[] = []
    const backend = process.env.NEXT_PUBLIC_DATA_BACKEND || process.env.DATA_BACKEND || "supabase"

    // If using MySQL backend, skip Supabase checks
    if (backend === "mysql") {
      setEnvStatus({ supabaseUrl: true, supabaseKey: true, hasErrors: false, errors: [] })
      return
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    let supabaseUrlValid = false
    let supabaseKeyValid = false

    // Check Supabase URL
    if (!supabaseUrl) {
      errors.push("NEXT_PUBLIC_SUPABASE_URL is missing")
    } else if (!supabaseUrl.startsWith("https://") || !supabaseUrl.includes(".supabase.co")) {
      errors.push("NEXT_PUBLIC_SUPABASE_URL format is invalid (should be https://your-project.supabase.co)")
    } else {
      supabaseUrlValid = true
    }

    // Check Supabase Key
    if (!supabaseKey) {
      errors.push("NEXT_PUBLIC_SUPABASE_ANON_KEY is missing")
    } else if (supabaseKey.length < 100) {
      errors.push("NEXT_PUBLIC_SUPABASE_ANON_KEY appears to be invalid (too short)")
    } else {
      supabaseKeyValid = true
    }

    setEnvStatus({
      supabaseUrl: supabaseUrlValid,
      supabaseKey: supabaseKeyValid,
      hasErrors: errors.length > 0,
      errors,
    })
  }, [])

  // Only show in development
  if (process.env.NODE_ENV === "production") {
    return null
  }

  if (!envStatus.hasErrors) {
    return null
  }

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Environment Configuration Issues</AlertTitle>
      <AlertDescription>
        <div className="mt-2">
          <p className="font-medium mb-2">Please fix the following issues:</p>
          <ul className="list-disc list-inside space-y-1">
            {envStatus.errors.map((error, index) => (
              <li key={index} className="text-sm">
                {error}
              </li>
            ))}
          </ul>
          <div className="mt-3 p-3 bg-gray-100 rounded text-sm">
            <p className="font-medium mb-1">To fix these issues:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>
                Create a Supabase project at{" "}
                <a href="https://supabase.com" className="underline" target="_blank" rel="noopener noreferrer">
                  supabase.com
                </a>
              </li>
              <li>Copy your project URL and anon key from Settings → API</li>
              <li>Update your .env.local file with the correct values</li>
              <li>Restart your development server</li>
            </ol>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  )
}
