const main = async () => {
  try {
    const { ensureDatabaseConnection } = await import("@/lib/sequelize/index")
    const { SubscriptionPlan, Course, CourseCategory } = await import("@/lib/sequelize/models")
    await ensureDatabaseConnection()
    const plans = await SubscriptionPlan.findAll({ limit: 3 })
    console.log("plans:", plans.map((p: any) => ({ id: p.id, name: p.name, price: p.price })))
    const courses = await Course.findAll({
      limit: 3,
      include: [{ model: CourseCategory, as: "course_categories", attributes: ["name"] }],
    })
    console.log(
      "courses:",
      courses.map((c: any) => ({ id: c.id, title: c.title, category: c.course_categories?.name }))
    )
    process.exit(0)
  } catch (err) {
    console.error("test-sequelize error:", err)
    process.exit(1)
  }
}

main()






