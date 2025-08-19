import { Sequelize } from "sequelize"
import mysql from "mysql2/promise"

function cleanEnv(value: string | undefined, fallback: string): string {
  if (!value) return fallback
  // Remove surrounding quotes and trailing semicolons/whitespace
  const trimmed = value.trim().replace(/^['"]|['"]$/g, "")
  return trimmed.replace(/;$/g, "") || fallback
}

const databaseUrl = process.env.DATABASE_URL

let sequelize: Sequelize

function buildSequelize(dbName: string): Sequelize {
  return new Sequelize(
    cleanEnv(dbName, "trading_academy"),
    cleanEnv(process.env.MYSQL_USER, "root"),
    cleanEnv(process.env.MYSQL_PASSWORD, ""),
    {
      host: cleanEnv(process.env.MYSQL_HOST, "127.0.0.1"),
      port: Number(cleanEnv(process.env.MYSQL_PORT, "3306")),
      dialect: "mysql",
      logging: false,
    }
  )
}

if (databaseUrl) {
  sequelize = new Sequelize(databaseUrl, { dialect: "mysql", logging: false })
} else {
  sequelize = buildSequelize(cleanEnv(process.env.MYSQL_DB, "trading_academy"))
}

export async function ensureDatabaseConnection(): Promise<void> {
  try {
    await sequelize.authenticate()
  } catch (err: any) {
    // Auto-create database if it doesn't exist
    if (err && err.code === "ER_BAD_DB_ERROR") {
      const host = cleanEnv(process.env.MYSQL_HOST, "127.0.0.1")
      const port = Number(cleanEnv(process.env.MYSQL_PORT, "3306"))
      const user = cleanEnv(process.env.MYSQL_USER, "root")
      const password = cleanEnv(process.env.MYSQL_PASSWORD, "")
      const db = cleanEnv(process.env.MYSQL_DB, "trading_academy")

      const connection = await mysql.createConnection({ host, port, user, password })
      await connection.query(`CREATE DATABASE IF NOT EXISTS \`${db}\``)
      await connection.end()

      sequelize = buildSequelize(db)
      await sequelize.authenticate()
    } else {
      throw err
    }
  }
}

export { sequelize }



