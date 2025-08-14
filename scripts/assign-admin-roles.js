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

// Configure which existing users should get admin roles
// Replace these emails with actual user emails from your database
const adminAssignments = [
  { email: "user1@example.com", role: "super_admin" },
  { email: "user2@example.com", role: "content_manager" },
  { email: "user3@example.com", role: "user_manager" },
]

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
  console.log("🔧 Creating admin roles...")

  for (const role of adminRoles) {
    const { data: existingRole, error: checkError } = await supabase
      .from("admin_roles")
      .select("id")
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
      console.log(`ℹ️  Role already exists: ${role.display_name}`)
    }
  }
}

async function assignAdminRoles() {
  console.log("\n👥 Assigning admin roles to existing users...")

  const results = []

  for (const assignment of adminAssignments) {
    try {
      // Find the user by email
      const { data: user, error: userError } = await supabase
        .from("profiles")
        .select("id, email, first_name, last_name")
        .eq("email", assignment.email)
        .single()

      if (userError || !user) {
        console.log(`❌ User not found: ${assignment.email}`)
        results.push({
          email: assignment.email,
          status: "User not found",
          role: assignment.role,
        })
        continue
      }

      // Get the admin role
      const { data: adminRole, error: roleError } = await supabase
        .from("admin_roles")
        .select("id, name")
        .eq("name", assignment.role)
        .single()

      if (roleError || !adminRole) {
        console.log(`❌ Admin role not found: ${assignment.role}`)
        results.push({
          email: assignment.email,
          status: "Role not found",
          role: assignment.role,
        })
        continue
      }

      // Update user profile to mark as admin
      const { error: profileError } = await supabase.from("profiles").update({ is_admin: true }).eq("id", user.id)

      if (profileError) {
        console.log(`❌ Error updating profile for ${assignment.email}:`, profileError.message)
        results.push({
          email: assignment.email,
          status: "Profile update failed",
          role: assignment.role,
        })
        continue
      }

      // Check if user already has this role
      const { data: existingAssignment, error: checkError } = await supabase
        .from("user_admin_roles")
        .select("id")
        .eq("user_id", user.id)
        .eq("role_id", adminRole.id)
        .single()

      if (checkError && checkError.code !== "PGRST116") {
        console.log(`❌ Error checking existing role for ${assignment.email}:`, checkError.message)
        continue
      }

      if (!existingAssignment) {
        // Assign the admin role
        const { error: assignError } = await supabase.from("user_admin_roles").insert([
          {
            user_id: user.id,
            role_id: adminRole.id,
            assigned_at: new Date().toISOString(),
          },
        ])

        if (assignError) {
          console.log(`❌ Error assigning role to ${assignment.email}:`, assignError.message)
          results.push({
            email: assignment.email,
            status: "Role assignment failed",
            role: assignment.role,
          })
        } else {
          console.log(`✅ Assigned ${assignment.role} to ${assignment.email}`)
          results.push({
            email: assignment.email,
            status: "Success",
            role: assignment.role,
            name: `${user.first_name} ${user.last_name}`,
          })
        }
      } else {
        console.log(`ℹ️  ${assignment.email} already has ${assignment.role} role`)
        results.push({
          email: assignment.email,
          status: "Already assigned",
          role: assignment.role,
          name: `${user.first_name} ${user.last_name}`,
        })
      }
    } catch (error) {
      console.error(`❌ Unexpected error for ${assignment.email}:`, error.message)
      results.push({
        email: assignment.email,
        status: "Unexpected error",
        role: assignment.role,
      })
    }
  }

  return results
}

async function main() {
  console.log("🚀 Starting admin role assignment process...\n")

  try {
    // Create admin roles
    await createAdminRoles()

    // Assign roles to users
    const results = await assignAdminRoles()

    // Display results
    console.log("\n📊 Assignment Results:")
    console.log("┌─────────────────────────────────┬─────────────────────┬─────────────────┐")
    console.log("│ Email                           │ Status              │ Role            │")
    console.log("├─────────────────────────────────┼─────────────────────┼─────────────────┤")

    results.forEach((result) => {
      const email = result.email.padEnd(31)
      const status = result.status.padEnd(19)
      const role = result.role.padEnd(15)
      console.log(`│ ${email} │ ${status} │ ${role} │`)
    })

    console.log("└─────────────────────────────────┴─────────────────────┴─────────────────┘")

    const successCount = results.filter((r) => r.status === "Success").length
    console.log(`\n✅ Successfully assigned admin roles to ${successCount} users`)

    if (successCount > 0) {
      console.log("\n🔐 Admin Dashboard Access:")
      console.log("1. Login with any of the assigned admin accounts")
      console.log("2. Navigate to: /admin")
      console.log("3. Each role will see different sections based on their permissions")
    }
  } catch (error) {
    console.error("❌ Fatal error:", error.message)
    process.exit(1)
  }
}

main()
