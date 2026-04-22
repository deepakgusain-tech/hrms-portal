import z from "zod"
import {
  moduleSchema,
  roleSchema, 
  userSchema,
  workLocationSchema,
} from "@/lib/validators"

export type Role = z.infer<typeof roleSchema>
export type Module = z.infer<typeof moduleSchema>
export type User = z.infer<typeof userSchema>
export type WorkLocation = z.infer<typeof workLocationSchema>
