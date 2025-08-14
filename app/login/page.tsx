"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      console.log("Attempting login with:", formData.email)

      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      console.log("Login response:", { data, error })

      if (error) {
        console.error("Login error:", error)
        throw new Error(error.message)
      }

      if (data.user && data.session) {
        console.log("Login successful, user:", data.user.id)

        toast({
          title: "Success!",
          description: "Signed in successfully",
        })

        // Wait a moment for the session to be set, then redirect
        setTimeout(() => {
          console.log("Redirecting to dashboard...")
          router.push("/dashboard")
          router.refresh()
        }, 500)
      } else {
        throw new Error("No user or session returned from login")
      }
    } catch (error) {
      console.error("Login exception:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to sign in",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDemoLogin = () => {
    setFormData({
      email: "demo@primeaura.com",
      password: "demo123",
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 sm:space-y-8">
        <div className="text-center">
          <Link href="/" className="flex items-center justify-center mb-4 sm:mb-6">
            <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
              Prime Aura Trading Academy
            </span>
          </Link>
        </div>

        <Card className="w-full">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl sm:text-2xl text-center">Welcome Back</CardTitle>
            <CardDescription className="text-center text-sm sm:text-base">
              Sign in to access your trading dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="h-10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  className="h-10"
                />
              </div>

              <div className="flex items-center justify-between">
                <Link href="#" className="text-sm text-amber-500 hover:underline">
                  Forgot password?
                </Link>
              </div>

              <Button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 h-10 sm:h-11" disabled={loading}>
                {loading ? "Signing In..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-6 p-3 sm:p-4 bg-blue-50 rounded-lg">
              <h3 className="text-sm font-semibold text-blue-800 mb-2">Demo Credentials</h3>
              <p className="text-xs text-blue-600 mb-3">Use these credentials to test the platform:</p>
              <div className="space-y-2 text-xs">
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                  <span className="font-medium">Email:</span>
                  <span className="font-mono bg-white px-2 py-1 rounded text-xs break-all">demo@primeaura.com</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                  <span className="font-medium">Password:</span>
                  <span className="font-mono bg-white px-2 py-1 rounded text-xs">demo123</span>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full mt-3 bg-transparent h-8"
                onClick={handleDemoLogin}
              >
                Use Demo Credentials
              </Button>
            </div>

            <div className="mt-6 text-center text-sm">
              {"Don't have an account? "}
              <Link href="/signup" className="text-amber-500 hover:underline">
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
