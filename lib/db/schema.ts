import { z } from "zod"

export const databaseSchema = z.object({})

export type DatabaseSchema = z.infer<typeof databaseSchema>
