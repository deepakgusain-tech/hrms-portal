import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

const adapter = new PrismaPg(pool)

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  return new PrismaClient({
    adapter,
    log: ["error"],
  })
}

function hasEmployeeDocumentReviewFields(client: PrismaClient) {
  const fields = (client as PrismaClient & {
    _runtimeDataModel?: {
      models?: {
        EmployeeDocument?: {
          fields?: Array<{ name: string }>
        }
      }
    }
  })._runtimeDataModel?.models?.EmployeeDocument?.fields

  return Array.isArray(fields) && fields.some((field) => field.name === "reviewStatus")
}

function hasEodReportingFields(client: PrismaClient) {
  const models = (client as PrismaClient & {
    _runtimeDataModel?: {
      models?: {
        EodReport?: {
          fields?: Array<{ name: string }>
        }
        MonthlyEodReview?: {
          fields?: Array<{ name: string }>
        }
      }
    }
  })._runtimeDataModel?.models

  const eodReportFields = models?.EodReport?.fields
  const monthlyReviewFields = models?.MonthlyEodReview?.fields

  return (
    Array.isArray(eodReportFields) &&
    eodReportFields.some((field) => field.name === "linkedTaskIds") &&
    Array.isArray(monthlyReviewFields)
  )
}

export const prisma = (() => {
  const cached = globalForPrisma.prisma

  if (
    cached &&
    hasEmployeeDocumentReviewFields(cached) &&
    hasEodReportingFields(cached)
  ) {
    return cached
  }

  const client = createPrismaClient()
  globalForPrisma.prisma = client
  return client
})()

if (process.env.NODE_ENV !== "production")
  globalForPrisma.prisma = prisma
