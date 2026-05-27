import { combine } from "zustand/middleware"
import { createStore } from "zustand/vanilla"
import { hoist } from "zustand-hoist"
import { databaseSchema } from "./schema"

export const createDatabase = () => {
  return hoist(createStore(initializer))
}

export type DbClient = ReturnType<typeof createDatabase>

const initializer = combine(databaseSchema.parse({}), (set) => ({
  reset: () => {
    set(databaseSchema.parse({}))
  },
}))
