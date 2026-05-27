import { expect, test } from "bun:test"
import { getTestServer } from "./fixtures/getTestServer"

test("serves the winterspec health endpoint", async () => {
  const { ky } = await getTestServer()

  const response = await ky.get("health")

  expect(response.status).toBe(200)
  expect(await response.json<{ ok: boolean }>()).toEqual({ ok: true })
})
