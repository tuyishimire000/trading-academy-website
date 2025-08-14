const { createClient } = require("@supabase/supabase-js")
require("dotenv").config({ path: ".env.local" })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase environment variables")
  console.log("Make sure you have NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env.local file")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// The specific user ID you mentioned
const ADMIN_USER_ID = "f087dc60-018d-46e3-a3ae-508d9fa78f5f"

// Admin roles configuration
const adminRoles = [
  {
    name: "super_admin",
    display_name: "Super Administrator",
    description: "Full administrative access to all features",
    permissions: {
      users: ["read", "create", "update", "delete"],
      courses: ["read", "create", "update", "delete"],
      events: ["read", "create", "update", "delete"],
      analytics: ["read"],
      subscriptions: ["read", "update"],
      community: ["read", "update"],
      settings: ["read", "update"],
      admin: ["read", "create", "update", "delete"],
    },
  },
  {
    name: "content_manager",
    display_name: "Content Manager",
    description: "Can manage courses and events, view analytics",
    permissions: {
      courses: ["read", "create", "update", "delete"],
      events: ["read", "create", "update", "delete"],
      analytics: ["read"],
    },
  },
  {
    name: "user_manager",
    display_name: "User Manager",
    description: "Can manage users and subscriptions, view analytics",
    permissions: {
      users: ["read", "create", "update", "delete"],
      subscriptions: ["read", "update"],
      analytics: ["read"],
    },
  },
]

async function createAdminRoles() {
  console.log("🔧 Creating/updating admin roles...")

  for (const role of adminRoles) {
    const { data: existingRole, error: checkError } = await supabase
      .from("admin_roles")
      .select("id, name")
      .eq("name", role.name)
      .single()

    if (checkError && checkError.code !== "PGRST116") {
      console.error(`❌ Error checking role ${role.name}:`, checkError.message)
      continue
    }

    if (!existingRole) {
      const { error: insertError } = await supabase.from("admin_roles").insert([role])

      if (insertError) {
        console.error(`❌ Error creating role ${role.name}:`, insertError.message)
      } else {
        console.log(`✅ Created role: ${role.display_name}`)
      }
    } else {
      // Update existing role with latest permissions
      const { error: updateError } = await supabase
        .from("admin_roles")
        .update({
          display_name: role.display_name,
          description: role.description,
          permissions: role.permissions,
        })
        .eq("name", role.name)

      if (updateError) {
        console.error(`❌ Error updating role ${role.name}:`, updateError.message)
      } else {
        console.log(`✅ Updated role: ${role.display_name}`)
      }
    }
  }
}

async function assignSuperAdminRole() {
  console.log(`\n👤 Assigning super_admin role to user: ${ADMIN_USER_ID}`)

  try {
    // First, verify the user exists and is marked as admin
    const { data: user, error: userError } = await supabase
      .from("profiles")
      .select("id, first_name, last_name, is_admin")
      .eq("id", ADMIN_USER_ID)
      .single()

    if (userError || !user) {
      console.error(`❌ User not found: ${ADMIN_USER_ID}`)
      return false
    }

    console.log(`📋 User found: ${user.first_name} ${user.last_name}`)
    console.log(`🔐 Is admin: ${user.is_admin}`)

    if (!user.is_admin) {
      console.log("⚠️  User is not marked as admin, updating...")
      const { error: updateError } = await supabase.from("profiles").update({ is_admin: true }).eq("id", ADMIN_USER_ID)

      if (updateError) {
        console.error("❌ Error updating user admin status:", updateError.message)
        return false
      }
      console.log("✅ User marked as admin")
    }

    // Get the super_admin role
    const { data: adminRole, error: roleError } = await supabase
      .from("admin_roles")
      .select("id, name, display_name")
      .eq("name", "super_admin")
      .single()

    if (roleError || !adminRole) {
      console.error("❌ Super admin role not found")
      return false
    }

    console.log(`🎭 Role found: ${adminRole.display_name}`)

    // Check if user already has this role
    const { data: existingAssignment, error: checkError } = await supabase
      .from("user_admin_roles")
      .select("id")
      .eq("user_id", ADMIN_USER_ID)
      .eq("role_id", adminRole.id)
      .single()

    if (checkError && checkError.code !== "PGRST116") {
      console.error("❌ Error checking existing role assignment:", checkError.message)
      return false
    }

    if (existingAssignment) {
      console.log("ℹ️  User already has super_admin role assigned")
      return true
    }

    // Assign the super_admin role
    const { error: assignError } = await supabase.from("user_admin_roles").insert([
      {
        user_id: ADMIN_USER_ID,
        role_id: adminRole.id,
        assigned_at: new Date().toISOString(),
      },
    ])

    if (assignError) {
      console.error("❌ Error assigning super_admin role:", assignError.message)
      return false
    }

    console.log("✅ Successfully assigned super_admin role!")
    return true
  } catch (error) {
    console.error("❌ Unexpected error:", error.message)
    return false
  }
}

async function verifyAssignment() {
  console.log("\n🔍 Verifying role assignment...")

  const { data: userRoles, error } = await supabase
    .from("user_admin_roles")
    .select(`
      user_id,
      admin_roles (
        name,
        display_name,
        description
      )
    `)
    .eq("user_id", ADMIN_USER_ID)

  if (error) {
    console.error("❌ Error verifying assignment:", error.message)
    return
  }

  if (userRoles && userRoles.length > 0) {
    console.log("✅ Role assignment verified!")
    userRoles.forEach((assignment) => {
      console.log(`   - ${assignment.admin_roles.display_name}: ${assignment.admin_roles.description}`)
    })
  } else {
    console.log("❌ No roles found for user")
  }
}

async function main() {
  console.log("🚀 Assigning super_admin role to existing admin user...\n")

  try {
    // Create/update admin roles
    await createAdminRoles()

    // Assign super_admin role to the specific user
    const success = await assignSuperAdminRole()

    if (success) {
      // Verify the assignment
      await verifyAssignment()

      console.log("\n🎉 Process completed successfully!")
      console.log("\n🔐 Admin Dashboard Access:")
      console.log("1. Login with the admin user account")
      console.log("2. Navigate to: /admin")
      console.log("3. You should have full super admin access to all sections")
    } else {
      console.log("\n❌ Failed to assign admin role")
    }
  } catch (error) {
    console.error("❌ Fatal error:", error.message)
    process.exit(1)
  }
}

main()
