import { NextResponse } from "next/server"

export const runtime = "nodejs"

export async function POST() {
  const headers = new Headers()
  headers.append("Set-Cookie", "auth_token=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax")
  return new NextResponse(JSON.stringify({ message: "signed out" }), { status: 200, headers })
}





