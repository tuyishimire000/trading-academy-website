const main = async () => {
  try {
    const { ensureDatabaseConnection } = await import("@/lib/sequelize/index")
    const { User } = await import("@/lib/sequelize/models")
    const { hashPassword } = await import("@/lib/auth/password")

    await ensureDatabaseConnection()

    const usersToCreate = [
      { email: "demo@primeaura.com", password: "demo123", first_name: "Demo", last_name: "User", is_admin: false },
      { email: "admin@primeaura.com", password: "admin123", first_name: "Admin", last_name: "User", is_admin: true },
    ]

    for (const u of usersToCreate) {
      const existing = await User.findOne({ where: { email: u.email } })
      if (existing) {
        // eslint-disable-next-line no-console
        console.log(`User already exists: ${u.email}`)
        continue
      }
      const password_hash = await hashPassword(u.password)
      await User.create({
        email: u.email,
        password_hash,
        first_name: u.first_name,
        last_name: u.last_name,
        is_admin: u.is_admin,
      })
      // eslint-disable-next-line no-console
      console.log(`Created user: ${u.email}`)
    }

    process.exit(0)
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("create-demo-users error:", err)
    process.exit(1)
  }
}

main()





