"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Mail, Smartphone } from "lucide-react"

function VerifyResetCodePageContent() {
  const [code, setCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const email = searchParams.get("email")
  const phoneNumber = searchParams.get("phone")
  const method = searchParams.get("method") || "email"

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!code.trim()) {
      toast({
        title: "Error",
        description: "Please enter the verification code",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/verify-reset-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
          email,
          phoneNumber,
          method,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: "Code verified successfully! Redirecting to password reset...",
        })
        
        // Redirect to password reset page with the token
        router.push(`/reset-password?token=${data.token}`)
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to verify code",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendCode = async () => {
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          phoneNumber,
          method,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: `New verification code sent to your ${method === "email" ? "email" : "phone"}`,
        })
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to resend code",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const goBack = () => {
    router.push("/forgot-password")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            {method === "email" ? (
              <Mail className="h-8 w-8 text-blue-600" />
            ) : (
              <Smartphone className="h-8 w-8 text-blue-600" />
            )}
          </div>
          <CardTitle className="text-2xl font-bold">Verify Code</CardTitle>
          <CardDescription>
            Enter the verification code sent to your {method === "email" ? "email" : "phone"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="code" className="text-sm font-medium">
                Verification Code
              </label>
              <Input
                id="code"
                type="text"
                placeholder="Enter 6-digit code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                maxLength={6}
                className="text-center text-lg tracking-widest"
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !code.trim()}
            >
              {isLoading ? "Verifying..." : "Verify Code"}
            </Button>

            <div className="text-center space-y-2">
              <Button
                type="button"
                variant="ghost"
                onClick={handleResendCode}
                disabled={isLoading}
                className="text-sm"
              >
                Resend Code
              </Button>
              
              <div>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={goBack}
                  disabled={isLoading}
                  className="text-sm"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back to Forgot Password
                </Button>
              </div>
            </div>
          </form>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Code sent to:</strong><br />
              {method === "email" ? email : phoneNumber}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function VerifyResetCodePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600">Loading...</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading...</h2>
        </div>
      </div>
    }>
      <VerifyResetCodePageContent />
    </Suspense>
  )
}
