export const runtime = "nodejs"
export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyJwt } from "@/lib/auth/jwt"
import { ensureDatabaseConnection } from "@/lib/sequelize/index"
import { User } from "@/lib/sequelize/models"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth_token")?.value
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const payload = verifyJwt<{ sub: string; email: string; is_admin?: boolean }>(token)
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    await ensureDatabaseConnection()
    const dbUser = await User.findByPk(payload.sub)

    return NextResponse.json({
      user: {
        id: payload.sub,
        email: payload.email,
        is_admin: Boolean(payload.is_admin),
        first_name: dbUser?.getDataValue("first_name") || null,
        last_name: dbUser?.getDataValue("last_name") || null,
      },
    })
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}


