import { cookies } from "next/headers"
import { verifyJwt } from "@/lib/auth/jwt"
import { User } from "@/lib/sequelize/models"

export interface ServerUser {
  id: string
  email: string
  is_admin: boolean
}

export async function getCurrentUser(): Promise<ServerUser | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth_token")?.value
  if (!token) return null
  const payload = verifyJwt<{ sub: string; email: string; is_admin?: boolean }>(token)
  if (!payload) return null
  return { id: payload.sub, email: payload.email, is_admin: Boolean(payload.is_admin) }
}

export async function verifyAuth(request: Request): Promise<ServerUser | null> {
  const cookieHeader = request.headers.get('cookie')
  if (!cookieHeader) return null
  
  const cookies = Object.fromEntries(
    cookieHeader.split(';').map(cookie => {
      const [name, value] = cookie.trim().split('=')
      return [name, value]
    })
  )
  
  const token = cookies.auth_token
  if (!token) return null
  
  const payload = verifyJwt<{ sub: string; email: string; is_admin?: boolean }>(token)
  if (!payload) return null
  
  // Verify user exists in database
  const user = await User.findByPk(payload.sub)
  if (!user) return null
  
  return { id: payload.sub, email: payload.email, is_admin: Boolean(payload.is_admin) }
}





