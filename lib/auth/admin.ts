import { createServerClient } from "@/lib/supabase/server"

export async function checkAdminAccess() {
  const supabase = await createServerClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { isAdmin: false, user: null, error: "Unauthorized" }
  }

  // Check if user is admin
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single()

  if (profileError || !profile?.is_admin) {
    return { isAdmin: false, user, error: "Admin access required" }
  }

  return { isAdmin: true, user, error: null }
}

export async function checkAdminPermission(permission: string, action: string) {
  const { isAdmin, user, error } = await checkAdminAccess()

  if (!isAdmin || error) {
    return { hasPermission: false, error }
  }

  const supabase = await createServerClient()

  // Get user's admin roles and permissions
  const { data: userRoles, error: rolesError } = await supabase
    .from("user_admin_roles")
    .select(`
      admin_roles (
        name,
        permissions
      )
    `)
    .eq("user_id", user.id)

  if (rolesError) {
    return { hasPermission: false, error: rolesError.message }
  }

  // Check if user has the required permission
  const hasPermission = userRoles?.some((userRole: any) => {
    const permissions = userRole.admin_roles?.permissions
    return permissions?.[permission]?.includes(action)
  })

  return { hasPermission: hasPermission || false, error: null }
}
