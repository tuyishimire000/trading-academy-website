import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "./database.types"

export const createServerClient = async () => {
  const cookieStore = await cookies()
  return createServerComponentClient<Database>({
    cookies: () => cookieStore,
  })
}
