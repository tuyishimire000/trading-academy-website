import { User } from "@/lib/sequelize/models"
import { verifyAuth } from "./server"

export async function checkAdminAccess(request: Request) {
  try {
    const user = await verifyAuth(request)
    
    if (!user) {
      return { isAdmin: false, user: null, error: "Unauthorized" }
    }

    // Check if user is admin
    if (!user.is_admin) {
      return { isAdmin: false, user, error: "Admin access required" }
    }

    return { isAdmin: true, user, error: null }
  } catch (error) {
    return { isAdmin: false, user: null, error: "Authentication failed" }
  }
}

export async function checkAdminPermission(request: Request, permission: string, action: string) {
  const { isAdmin, user, error } = await checkAdminAccess(request)

  if (!isAdmin || error) {
    return { hasPermission: false, error }
  }

  // For now, all admins have full permissions
  // In the future, you can implement role-based permissions here
  return { hasPermission: true, error: null }
}
