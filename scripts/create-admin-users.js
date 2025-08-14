import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase environment variables")
  console.log("Make sure you have:")
  console.log("- NEXT_PUBLIC_SUPABASE_URL")
  console.log("- SUPABASE_SERVICE_ROLE_KEY")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function createAdminUsers() {
  console.log("🚀 Starting admin user creation...")

  try {
    // Step 1: Create admin roles if they don't exist
    console.log("📝 Creating admin roles...")

    const roles = [
      {
        name: "super_admin",
        display_name: "Super Administrator",
        description: "Full access to all admin features and settings",
        permissions: [
          "users:read",
          "users:write",
          "users:delete",
          "courses:read",
          "courses:write",
          "courses:delete",
          "events:read",
          "events:write",
          "events:delete",
          "analytics:read",
          "subscriptions:read",
          "subscriptions:write",
          "community:read",
          "community:write",
          "settings:read",
          "settings:write",
          "admin:manage",
        ],
      },
      {
        name: "content_manager",
        display_name: "Content Manager",
        description: "Can manage courses and events, view analytics",
        permissions: [
          "courses:read",
          "courses:write",
          "courses:delete",
          "events:read",
          "events:write",
          "events:delete",
          "analytics:read",
        ],
      },
      {
        name: "user_manager",
        display_name: "User Manager",
        description: "Can manage users and subscriptions, view analytics",
        permissions: ["users:read", "users:write", "subscriptions:read", "subscriptions:write", "analytics:read"],
      },
    ]

    for (const role of roles) {
      const { error } = await supabase.from("admin_roles").upsert(role, { onConflict: "name" })

      if (error) {
        console.error(`❌ Error creating role ${role.name}:`, error)
      } else {
        console.log(`✅ Created/updated role: ${role.display_name}`)
      }
    }

    // Step 2: Get subscription plan ID
    console.log("📋 Getting subscription plan...")
    const { data: plans, error: plansError } = await supabase.from("subscription_plans").select("id").limit(1)

    if (plansError || !plans || plans.length === 0) {
      console.error("❌ No subscription plans found. Please create subscription plans first.")
      return
    }

    const planId = plans[0].id

    // Step 3: Create admin users
    console.log("👥 Creating admin users...")

    const adminUsers = [
      {
        email: "superadmin@primeaura.com",
        password: "SuperAdmin123!",
        full_name: "Super Admin",
        first_name: "Super",
        last_name: "Admin",
        role: "super_admin",
      },
      {
        email: "contentmanager@primeaura.com",
        password: "ContentManager123!",
        full_name: "Content Manager",
        first_name: "Content",
        last_name: "Manager",
        role: "content_manager",
      },
      {
        email: "usermanager@primeaura.com",
        password: "UserManager123!",
        full_name: "User Manager",
        first_name: "User",
        last_name: "Manager",
        role: "user_manager",
      },
    ]

    for (const user of adminUsers) {
      // Create auth user
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: {
          first_name: user.first_name,
          last_name: user.last_name,
          full_name: user.full_name,
        },
      })

      if (authError) {
        console.error(`❌ Error creating auth user ${user.email}:`, authError)
        continue
      }

      console.log(`✅ Created auth user: ${user.email}`)

      // Create profile
      const { error: profileError } = await supabase.from("profiles").upsert(
        {
          id: authUser.user.id,
          email: user.email,
          full_name: user.full_name,
          first_name: user.first_name,
          last_name: user.last_name,
          avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.role}`,
          subscription_plan_id: planId,
          is_admin: true,
          admin_role: user.role,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" },
      )

      if (profileError) {
        console.error(`❌ Error creating profile for ${user.email}:`, profileError)
        continue
      }

      console.log(`✅ Created profile: ${user.full_name}`)

      // Get role ID and assign role
      const { data: roleData, error: roleError } = await supabase
        .from("admin_roles")
        .select("id")
        .eq("name", user.role)
        .single()

      if (roleError || !roleData) {
        console.error(`❌ Error getting role ${user.role}:`, roleError)
        continue
      }

      // Assign admin role
      const { error: assignError } = await supabase.from("user_admin_roles").upsert(
        {
          user_id: authUser.user.id,
          role_id: roleData.id,
          assigned_by: authUser.user.id,
          assigned_at: new Date().toISOString(),
        },
        { onConflict: "user_id,role_id" },
      )

      if (assignError) {
        console.error(`❌ Error assigning role to ${user.email}:`, assignError)
        continue
      }

      console.log(`✅ Assigned ${user.role} role to ${user.email}`)
    }

    // Step 4: Create some test users for analytics
    console.log("📊 Creating test users for analytics...")

    for (let i = 1; i <= 10; i++) {
      const testEmail = `testuser${i}@primeaura.com`

      const { data: testAuthUser, error: testAuthError } = await supabase.auth.admin.createUser({
        email: testEmail,
        password: "TestUser123!",
        email_confirm: true,
        user_metadata: {
          first_name: "Test",
          last_name: `User ${i}`,
          full_name: `Test User ${i}`,
        },
      })

      if (testAuthError) {
        console.error(`❌ Error creating test user ${testEmail}:`, testAuthError)
        continue
      }

      // Create test user profile
      const { error: testProfileError } = await supabase.from("profiles").upsert(
        {
          id: testAuthUser.user.id,
          email: testEmail,
          full_name: `Test User ${i}`,
          first_name: "Test",
          last_name: `User ${i}`,
          avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=testuser${i}`,
          subscription_plan_id: planId,
          is_admin: false,
          admin_role: null,
          created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" },
      )

      if (testProfileError) {
        console.error(`❌ Error creating test profile ${i}:`, testProfileError)
        continue
      }

      if (i <= 5) {
        console.log(`✅ Created test user: ${testEmail}`)
      }
    }

    console.log("✅ Created 10 test users for analytics")

    // Step 5: Display results
    console.log("\n🎉 Admin user creation completed!")
    console.log("\n📋 Login Credentials:")
    console.log("┌─────────────────────────────────────┬──────────────────────┬─────────────────┐")
    console.log("│ Email                               │ Password             │ Role            │")
    console.log("├─────────────────────────────────────┼──────────────────────┼─────────────────┤")
    console.log("│ superadmin@primeaura.com            │ SuperAdmin123!       │ Super Admin     │")
    console.log("│ contentmanager@primeaura.com        │ ContentManager123!   │ Content Manager │")
    console.log("│ usermanager@primeaura.com           │ UserManager123!      │ User Manager    │")
    console.log("└─────────────────────────────────────┴──────────────────────┴─────────────────┘")

    console.log("\n🔐 Role Permissions:")
    console.log("• Super Admin: Full access to all features")
    console.log("• Content Manager: Courses, events, analytics only")
    console.log("• User Manager: Users, subscriptions, analytics only")

    console.log("\n🚀 Next Steps:")
    console.log("1. Go to your app login page")
    console.log("2. Login with any of the admin accounts above")
    console.log("3. Navigate to /admin to test the admin dashboard")
    console.log("4. Verify role-based access control is working")
  } catch (error) {
    console.error("❌ Unexpected error:", error)
  }
}

// Run the script
createAdminUsers()
