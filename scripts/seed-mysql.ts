import { seedDatabase } from "../lib/sequelize/seed.ts"

async function main() {
  try {
    await seedDatabase()
    // eslint-disable-next-line no-console
    console.log("MySQL seed complete")
    process.exit(0)
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("MySQL seed failed", err)
    process.exit(1)
  }
}

main()


