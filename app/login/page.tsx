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

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      })

      const data = await response.json()

      if (!response.ok) {
        // Provide user-friendly error messages
        let errorMessage = "Failed to sign in"
        if (data.error === "Invalid credentials") {
          errorMessage = "Invalid email or password. Please check your credentials and try again."
        } else if (response.status === 429) {
          errorMessage = "Too many login attempts. Please wait a moment before trying again."
        } else if (response.status === 500) {
          errorMessage = "Server error. Please try again later."
        } else if (data.error) {
          errorMessage = data.error
        }
        throw new Error(errorMessage)
      }

      toast({
        title: "Welcome back! 🎉",
        description: "Successfully signed in to your account",
      })

      setTimeout(() => {
        if (data?.user?.is_admin) {
          router.push("/admin")
        } else {
          router.push("/dashboard")
        }
        router.refresh()
      }, 500)
    } catch (error) {
      console.error("Login exception:", error)
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "Failed to sign in",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
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
                <Link href="/forgot-password" className="text-sm text-amber-500 hover:underline">
                  Forgot password?
                </Link>
              </div>

              <Button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 h-10 sm:h-11" disabled={loading}>
                {loading ? "Signing In..." : "Sign In"}
              </Button>
            </form>

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
