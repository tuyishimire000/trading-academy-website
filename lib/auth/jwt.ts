import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me"
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d"

export function signJwt(payload: object): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

export function verifyJwt<T = any>(token: string): T | null {
  try {
    return jwt.verify(token, JWT_SECRET) as T
  } catch {
    return null
  }
}

export interface AuthTokenPayload {
  sub: string
  email: string
  is_admin?: boolean
}

export function setAuthCookie(headers: Headers, token: string): void {
  const cookie = `auth_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`
  headers.append("Set-Cookie", cookie)
}



